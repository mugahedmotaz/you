import { spawn } from "child_process"
import type { Readable } from "stream"
import { getYtdlpPath } from "./ytdlp-path"

export interface DownloadOptions {
  videoId: string
  quality: string
  format: "mp4" | "mp3"
  title: string
}

export interface VideoFormat {
  quality: string
  format: string
  url: string
  itag?: number
  hasAudio: boolean
  hasVideo: boolean
  container: string
  qualityLabel?: string
}

export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== "string") {
    return "download"
  }

  return (
    filename
      .replace(/[<>:"/\\|?*]/g, "") // إزالة الأحرف غير المسموحة في أسماء الملفات
      .replace(/[^\x00-\x7F]/g, "_") // استبدال الأحرف غير ASCII بـ _
      .replace(/\s+/g, "_") // استبدال المسافات بـ _
      .replace(/_+/g, "_") // تقليل الشرطات السفلية المتعددة
      .trim()
      .substring(0, 100) // تحديد طول الاسم
      .replace(/^_+|_+$/g, "") || // إزالة الشرطات السفلية من البداية والنهاية
    "download"
  ) // fallback إذا كان الاسم فارغ بعد التنظيف
}

// Get video formats using yt-dlp
export async function getVideoFormats(videoId: string): Promise<VideoFormat[]> {
  return new Promise((resolve, reject) => {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

    const ytdlpPath = process.env.YTDLP_PATH || "yt-dlp";
    const ytdlp = spawn(ytdlpPath, [
      "--list-formats",
      "--no-warnings",
      "--print",
      "%(format_id)s|%(ext)s|%(resolution)s|%(acodec)s|%(vcodec)s|%(format_note)s",
      videoUrl,
    ]);

    let output = ""
    let errorOutput = ""

    ytdlp.stdout.on("data", (data) => {
      output += data.toString()
    })

    ytdlp.stderr.on("data", (data) => {
      errorOutput += data.toString()
    })

    ytdlp.on("close", (code) => {
      if (code !== 0) {
        console.error("yt-dlp error:", errorOutput)
        reject(new Error(`yt-dlp failed with code ${code}: ${errorOutput}`))
        return
      }

      try {
        const formats: VideoFormat[] = []
        const lines = output.trim().split("\n")

        for (const line of lines) {
          if (line.includes("|")) {
            const [formatId, ext, resolution, acodec, vcodec, formatNote] = line.split("|")

            const hasAudio = acodec && acodec !== "none"
            const hasVideo = vcodec && vcodec !== "none"

            if (hasVideo && hasAudio) {
              formats.push({
                quality: resolution || "unknown",
                format: "mp4",
                url: videoId,
                itag: Number.parseInt(formatId),
                hasAudio: true,
                hasVideo: true,
                container: ext || "mp4",
                qualityLabel: resolution,
              })
            }
          }
        }

        // إضافة تنسيق الصوت
        formats.push({
          quality: "audio",
          format: "mp3",
          url: videoId,
          hasAudio: true,
          hasVideo: false,
          container: "mp3",
        })

        resolve(formats)
      } catch (error) {
        reject(new Error("Failed to parse yt-dlp output"))
      }
    })

    ytdlp.on("error", (error) => {
      reject(new Error(`Failed to spawn yt-dlp: ${error.message}`))
    })
  })
}

// Download video using yt-dlp
export function downloadVideo(options: DownloadOptions): Promise<{ stream: Readable; size: number }> {
  return new Promise((resolve, reject) => {
    const { videoId, quality, format } = options
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

    let ytdlpArgs: string[]

    if (format === "mp3") {
      // تحميل الصوت فقط
      ytdlpArgs = [
        "--extract-audio",
        "--audio-format",
        "mp3",
        "--audio-quality",
        "0", // أفضل جودة
        "--output",
        "-",
        "--no-warnings",
        "--no-check-certificate",
        videoUrl,
      ]
    } else {
      // تحميل الفيديو
      let formatSelector = "best[ext=mp4]"
      if (quality === "1080p") {
        formatSelector = "best[height<=1080][ext=mp4]"
      } else if (quality === "720p") {
        formatSelector = "best[height<=720][ext=mp4]"
      } else if (quality === "480p") {
        formatSelector = "best[height<=480][ext=mp4]"
      } else if (quality === "360p") {
        formatSelector = "best[height<=360][ext=mp4]"
      }

      ytdlpArgs = [
        "--format", 
        formatSelector, 
        "--output", 
        "-", 
        "--no-warnings",
        "--no-check-certificate",
        "--socket-timeout",
        "30",
        "--retries",
        "3",
        "--fragment-retries",
        "3",
        videoUrl
      ]
    }

    console.log("Starting yt-dlp with args:", ytdlpArgs);

    const ytdlpPath = getYtdlpPath();
    console.log("Using yt-dlp path:", ytdlpPath);
    
    const ytdlp = spawn(ytdlpPath, ytdlpArgs, {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let hasResolved = false;
    let errorOutput = "";

    ytdlp.on("error", (error) => {
      console.error("yt-dlp spawn error:", error)
      if (!hasResolved) {
        hasResolved = true;
        reject(new Error(`Failed to start yt-dlp: ${error.message}. Make sure yt-dlp is installed and accessible at: ${ytdlpPath}`))
      }
    })

    ytdlp.stderr.on("data", (data) => {
      const errorText = data.toString();
      console.error("yt-dlp stderr:", errorText);
      errorOutput += errorText;
    })

    ytdlp.on("close", (code) => {
      if (!hasResolved && code !== 0) {
        hasResolved = true;
        reject(new Error(`yt-dlp exited with code ${code}. Error: ${errorOutput}`))
      }
    })

    // Set a timeout for the entire operation
    const timeoutId = setTimeout(() => {
      if (!hasResolved) {
        hasResolved = true;
        ytdlp.kill('SIGKILL');
        reject(new Error('Download timeout - the video might be too long or the connection is slow'));
      }
    }, 300000); // 5 minutes timeout

    // Check if stdout has data immediately
    ytdlp.stdout.once('data', () => {
      if (!hasResolved) {
        hasResolved = true;
        clearTimeout(timeoutId);
        // Return stream without trying to calculate size
        resolve({ stream: ytdlp.stdout, size: 0 });
      }
    });

    // Fallback: if no data comes within 10 seconds, something is wrong
    setTimeout(() => {
      if (!hasResolved) {
        hasResolved = true;
        clearTimeout(timeoutId);
        ytdlp.kill('SIGKILL');
        reject(new Error('No data received from yt-dlp within 10 seconds. Check if yt-dlp is working properly.'));
      }
    }, 10000);
  });
}

// Get video info using yt-dlp
export async function getVideoInfoWithYtdlp(videoId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

    const ytdlpPath = process.env.YTDLP_PATH || "yt-dlp";
    const ytdlp = spawn(ytdlpPath, ["--dump-json", "--no-warnings", videoUrl]);

    let output = ""
    let errorOutput = ""

    ytdlp.stdout.on("data", (data) => {
      output += data.toString()
    })

    ytdlp.stderr.on("data", (data) => {
      errorOutput += data.toString()
    })

    ytdlp.on("close", (code) => {
      if (code !== 0) {
        console.error("yt-dlp error:", errorOutput)
        reject(new Error(`yt-dlp failed with code ${code}: ${errorOutput}`))
        return
      }

      try {
        const videoInfo = JSON.parse(output)
        resolve(videoInfo)
      } catch (error) {
        reject(new Error("Failed to parse yt-dlp JSON output"))
      }
    })

    ytdlp.on("error", (error) => {
      reject(new Error(`Failed to spawn yt-dlp: ${error.message}`))
    })
  })
}

// Check if yt-dlp is installed
export async function checkYtdlpInstallation(): Promise<boolean> {
  return new Promise((resolve) => {
    const ytdlpPath = process.env.YTDLP_PATH || "yt-dlp";
    console.log("Checking yt-dlp at path:", ytdlpPath);
    
    const ytdlp = spawn(ytdlpPath, ["--version"], {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let output = "";
    let errorOutput = "";

    ytdlp.stdout.on("data", (data) => {
      output += data.toString();
    });

    ytdlp.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    ytdlp.on("close", (code) => {
      console.log("yt-dlp version check result:", { code, output, errorOutput });
      resolve(code === 0 && output.trim().length > 0)
    })

    ytdlp.on("error", (error) => {
      console.error("yt-dlp version check error:", error);
      resolve(false)
    })

    // Timeout after 5 seconds
    setTimeout(() => {
      ytdlp.kill('SIGKILL');
      resolve(false);
    }, 5000);
  })
}
