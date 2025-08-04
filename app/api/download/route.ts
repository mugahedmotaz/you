import { type NextRequest, NextResponse } from "next/server"
import { downloadVideo, sanitizeFilename } from "../../../lib/youtube-downloader"

// Increase timeout for long video downloads
export const maxDuration = 300; // 5 minutes

export async function POST(request: NextRequest) {
  try {
    const { videoId, title, type, quality, url } = await request.json()

    if (!videoId || !type) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    console.log("Starting download:", { videoId, title, type, quality })

    // تنظيف اسم الملف
    const safeTitle = sanitizeFilename(title || `video_${videoId}`)
    const extension = type === "audio" ? "mp3" : "mp4"
    const filename = `${safeTitle}.${extension}`

    console.log("Safe filename:", filename)

    // بدء التحميل باستخدام yt-dlp
    const { stream: downloadStream, size } = await downloadVideo({
      videoId,
      quality: quality || "720p",
      format: type === "audio" ? "mp3" : "mp4",
      title: safeTitle,
    })

    console.log(`Download stream created successfully with size: ${size}`)

    // إعداد headers للتحميل
    const headers = new Headers()
    headers.set("Content-Type", type === "audio" ? "audio/mpeg" : "video/mp4")
    headers.set("Content-Disposition", `attachment; filename="${filename}"`)
    if (size > 0) {
      headers.set("Content-Length", size.toString())
    }
    // Headers for better streaming support
    headers.set("Accept-Ranges", "bytes")
    headers.set("Transfer-Encoding", "chunked")
    headers.set("Access-Control-Expose-Headers", "Content-Disposition, Content-Length, Accept-Ranges")
    headers.set("Cache-Control", "no-cache")
    headers.set("Access-Control-Allow-Origin", "*")
    headers.set("Connection", "keep-alive")

    // تحويل stream إلى Response
    // Create a ReadableStream from the Node.js stream
    const readableStream = new ReadableStream({
      start(controller) {
        downloadStream.on('data', (chunk: Buffer) => {
          controller.enqueue(new Uint8Array(chunk));
        });
        
        downloadStream.on('end', () => {
          controller.close();
        });
        
        downloadStream.on('error', (error: Error) => {
          controller.error(error);
        });
      },
      
      cancel() {
        downloadStream.destroy();
      }
    });

    return new Response(readableStream, { headers });
  } catch (error) {
    console.error("Download error:", error)

    // Provide more specific error messages
    let errorMessage = "Download failed";
    let suggestion = "Make sure yt-dlp is installed: pip install yt-dlp";
    
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        errorMessage = "Download timeout";
        suggestion = "The video is too long or your connection is slow. Try a shorter video or lower quality.";
      } else if (error.message.includes('format')) {
        errorMessage = "Video format not available";
        suggestion = "This video format is not available. Try a different quality setting.";
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.message : "Unknown error",
        suggestion: suggestion,
      },
      { status: 500 },
    )
  }
}
