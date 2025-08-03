import { spawn } from "child_process"
import type { Readable } from "stream"

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
  return new Promise(async (resolve, reject) => {
    try {
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
        videoUrl,
      ]
    } else {
      // تحميل الفيديو
      let formatSelector = "best"

      if (quality === "1080p") {
        formatSelector = "best[height<=1080]"
      } else if (quality === "720p") {
        formatSelector = "best[height<=720]"
      } else if (quality === "480p") {
        formatSelector = "best[height<=480]"
      } else if (quality === "360p") {
        formatSelector = "best[height<=360]"
      }

      ytdlpArgs = ["--format", formatSelector, "--output", "-", "--no-warnings", videoUrl]
    }

    // Step 1: Get video metadata to find file size
    const infoPath = process.env.YTDLP_PATH || "yt-dlp";
    const infoProcess = spawn(infoPath, ["--dump-json", "--no-warnings", videoUrl]);

    let jsonOutput = "";
    for await (const chunk of infoProcess.stdout) {
      jsonOutput += chunk;
    }

    const videoInfo = JSON.parse(jsonOutput);

    let bestFormat: any = null;
    if (format === "mp3") {
      bestFormat = videoInfo.formats.find((f: any) => f.acodec !== 'none' && f.vcodec === 'none');
    } else {
      // A simple logic to find a format that is mp4 and has both video and audio
      const qualityNum = parseInt(quality, 10);
      bestFormat = videoInfo.formats
        .filter((f: any) => f.vcodec !== 'none' && f.acodec !== 'none' && f.ext === 'mp4' && f.height <= qualityNum)
        .sort((a: any, b: any) => b.height - a.height)[0];
    }

    if (!bestFormat) {
      throw new Error("Could not find a suitable format to download.");
    }

    const size = bestFormat.filesize || bestFormat.filesize_approx || 0;
    ytdlpArgs = ["--format", bestFormat.format_id, "--output", "-", "--no-warnings", videoUrl];

    console.log("Starting yt-dlp with args:", ytdlpArgs);

    const ytdlpPath = process.env.YTDLP_PATH || "yt-dlp";
    const ytdlp = spawn(ytdlpPath, ytdlpArgs);

    ytdlp.on("error", (error) => {
      console.error("yt-dlp spawn error:", error)
      reject(new Error(`Failed to start yt-dlp: ${error.message}`))
    })

    ytdlp.stderr.on("data", (data) => {
      console.error("yt-dlp stderr:", data.toString())
    })

    ytdlp.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`yt-dlp exited with code ${code}`))
      }
    })

    // Return both stream and size
    resolve({ stream: ytdlp.stdout, size });
    } catch (error) {
      reject(error);
    }
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
    const ytdlp = spawn(ytdlpPath, ["--version"]);

    ytdlp.on("close", (code) => {
      resolve(code === 0)
    })

    ytdlp.on("error", () => {
      resolve(false)
    })
  })
}
