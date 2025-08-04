import { type NextRequest, NextResponse } from "next/server"
import { getVideoInfoWithYtdlp, checkYtdlpInstallation } from "../../../lib/youtube-downloader"

// Extract video ID from YouTube URL
function extractVideoId(url: string): string | null {
  const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/, /youtube\.com\/embed\/([^&\n?#]+)/]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

// Format duration from seconds to MM:SS or HH:MM:SS
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`
}

// Parse ISO 8601 duration (PT4M13S) to seconds
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0

  const hours = Number.parseInt(match[1] || "0")
  const minutes = Number.parseInt(match[2] || "0")
  const seconds = Number.parseInt(match[3] || "0")

  return hours * 3600 + minutes * 60 + seconds
}

// Format view count to Arabic locale
function formatViewCount(count: string): string {
  const num = Number.parseInt(count)
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)} مليون`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)} ألف`
  }
  return num.toLocaleString("ar-SA")
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Extract video ID from URL
    const videoId = extractVideoId(url)
    if (!videoId) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 })
    }

    console.log("Fetching video info for:", videoId)

    // محاولة استخدام yt-dlp أولاً
    const ytdlpInstalled = await checkYtdlpInstallation()
    console.log("yt-dlp installed:", ytdlpInstalled)

    if (ytdlpInstalled) {
      try {
        console.log("Trying yt-dlp for video info...")
        const ytdlpInfo = await getVideoInfoWithYtdlp(videoId)

        const videoData = {
          id: videoId,
          title: ytdlpInfo.title || `فيديو ${videoId}`,
          thumbnail: ytdlpInfo.thumbnail || `/placeholder.svg?height=360&width=640&text=Video+${videoId}`,
          duration: ytdlpInfo.duration_string || formatDuration(ytdlpInfo.duration || 0),
          author: ytdlpInfo.uploader || ytdlpInfo.channel || "غير معروف",
          viewCount: ytdlpInfo.view_count ? formatViewCount(ytdlpInfo.view_count.toString()) : "غير متاح",
          formats: [
            { quality: "1080p", format: "mp4", url: `https://www.youtube.com/watch?v=${videoId}` },
            { quality: "720p", format: "mp4", url: `https://www.youtube.com/watch?v=${videoId}` },
            { quality: "480p", format: "mp4", url: `https://www.youtube.com/watch?v=${videoId}` },
            { quality: "360p", format: "mp4", url: `https://www.youtube.com/watch?v=${videoId}` },
            { quality: "audio", format: "mp3", url: `https://www.youtube.com/watch?v=${videoId}` },
          ],
        }

        console.log("yt-dlp info retrieved successfully")
        return NextResponse.json(videoData)
      } catch (ytdlpError) {
        console.log("yt-dlp failed, falling back to YouTube API:", ytdlpError)
      }
    }

    // التراجع إلى YouTube API
    const apiKey = process.env.YOUTUBE_API_KEY

    if (!apiKey) {
      // Return mock data if no API key and yt-dlp failed
      return NextResponse.json({
        id: videoId,
        title: `فيديو ${videoId} - أضف مفتاح API أو ثبت yt-dlp للبيانات الحقيقية`,
        thumbnail: `/placeholder.svg?height=360&width=640&text=Video+${videoId}`,
        duration: "3:45",
        author: "قناة تجريبية",
        viewCount: "1,234,567",
        formats: [
          { quality: "1080p", format: "mp4", url: `https://www.youtube.com/watch?v=${videoId}` },
          { quality: "720p", format: "mp4", url: `https://www.youtube.com/watch?v=${videoId}` },
          { quality: "480p", format: "mp4", url: `https://www.youtube.com/watch?v=${videoId}` },
          { quality: "360p", format: "mp4", url: `https://www.youtube.com/watch?v=${videoId}` },
          { quality: "audio", format: "mp3", url: `https://www.youtube.com/watch?v=${videoId}` },
        ],
      })
    }

    // Fetch from YouTube API
    console.log("Using YouTube API...")
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${apiKey}`,
    )

    if (!response.ok) {
      console.error("YouTube API error:", response.status, response.statusText)
      throw new Error(`YouTube API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    const video = data.items[0]
    const snippet = video.snippet
    const contentDetails = video.contentDetails
    const statistics = video.statistics

    const videoData = {
      id: videoId,
      title: snippet.title,
      thumbnail: snippet.thumbnails.high?.url || snippet.thumbnails.default?.url || "",
      duration: formatDuration(parseDuration(contentDetails.duration)),
      author: snippet.channelTitle,
      viewCount: formatViewCount(statistics.viewCount || "0"),
      formats: [
        { quality: "1080p", format: "mp4", url: `https://www.youtube.com/watch?v=${videoId}` },
        { quality: "720p", format: "mp4", url: `https://www.youtube.com/watch?v=${videoId}` },
        { quality: "480p", format: "mp4", url: `https://www.youtube.com/watch?v=${videoId}` },
        { quality: "360p", format: "mp4", url: `https://www.youtube.com/watch?v=${videoId}` },
        { quality: "audio", format: "mp3", url: `https://www.youtube.com/watch?v=${videoId}` },
      ],
    }

    console.log("YouTube API info retrieved successfully")
    return NextResponse.json(videoData)
  } catch (error) {
    console.error("Error fetching video info:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch video information",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
