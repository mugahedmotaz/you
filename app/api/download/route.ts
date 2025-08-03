import { type NextRequest, NextResponse } from "next/server"
import { downloadVideo, sanitizeFilename } from "@/lib/youtube-downloader"

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
    // Expose headers so the browser can read them
    headers.set("Access-Control-Expose-Headers", "Content-Disposition, Content-Length")
    headers.set("Cache-Control", "no-cache")
    headers.set("Access-Control-Allow-Origin", "*")

    // تحويل stream إلى Response
    return new Response(downloadStream as any, { headers });
  } catch (error) {
    console.error("Download error:", error)

    return NextResponse.json(
      {
        error: "Download failed",
        details: error instanceof Error ? error.message : "Unknown error",
        suggestion: "Make sure yt-dlp is installed: pip install yt-dlp",
      },
      { status: 500 },
    )
  }
}
