// YouTube API helper functions with real implementation
export interface VideoFormat {
  quality: string
  format: string
  url: string
  itag?: number
}

export interface VideoInfo {
  id: string
  title: string
  thumbnail: string
  duration: string
  author?: string
  viewCount?: string
  formats: VideoFormat[]
}

export interface PlaylistInfo {
  id: string
  title: string
  videos: VideoInfo[]
}

// Extract video ID from YouTube URL
export function extractVideoId(url: string): string | null {
  const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/, /youtube\.com\/embed\/([^&\n?#]+)/]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

// Extract playlist ID from YouTube URL
export function extractPlaylistId(url: string): string | null {
  const match = url.match(/[?&]list=([^&]+)/)
  return match ? match[1] : null
}

// Format duration from seconds to MM:SS or HH:MM:SS
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`
}

// Parse ISO 8601 duration (PT4M13S) to seconds
export function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0

  const hours = Number.parseInt(match[1] || "0")
  const minutes = Number.parseInt(match[2] || "0")
  const seconds = Number.parseInt(match[3] || "0")

  return hours * 3600 + minutes * 60 + seconds
}

// Format view count to Arabic locale
export function formatViewCount(count: string): string {
  const num = Number.parseInt(count)
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)} مليون`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)} ألف`
  }
  return num.toLocaleString("ar-SA")
}

// Get video info using YouTube API v3
/**
 * getVideoInfo will use process.env.YOUTUBE_API_KEY by default if apiKey is not passed.
 * Add YOUTUBE_API_KEY to your .env.local file at the project root.
 */
export async function getVideoInfo(videoId: string, apiKey?: string): Promise<VideoInfo> {
  if (!apiKey) {
    apiKey = process.env.YOUTUBE_API_KEY;
  }
  if (!apiKey) {
    // Return enhanced mock data if no API key
    return {
      id: videoId,
      title: `فيديو ${videoId} - أضف مفتاح API للبيانات الحقيقية`,
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
    }
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${apiKey}`,
    )

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      throw new Error("Video not found")
    }

    const video = data.items[0]
    const snippet = video.snippet
    const contentDetails = video.contentDetails
    const statistics = video.statistics

    return {
      id: videoId,
      title: snippet.title,
      thumbnail: snippet.thumbnails.high?.url || snippet.thumbnails.default?.url || "",
      duration: formatDuration(parseDuration(contentDetails.duration)),
      author: snippet.channelTitle,
      viewCount: formatViewCount(statistics.viewCount),
      formats: [
        { quality: "1080p", format: "mp4", url: `https://www.youtube.com/watch?v=${videoId}` },
        { quality: "720p", format: "mp4", url: `https://www.youtube.com/watch?v=${videoId}` },
        { quality: "480p", format: "mp4", url: `https://www.youtube.com/watch?v=${videoId}` },
        { quality: "360p", format: "mp4", url: `https://www.youtube.com/watch?v=${videoId}` },
        { quality: "audio", format: "mp3", url: `https://www.youtube.com/watch?v=${videoId}` },
      ],
    }
  } catch (error) {
    console.error("Error fetching video info from YouTube API:", error)
    throw error
  }
}

// Get playlist info using YouTube API v3
export async function getPlaylistInfo(playlistId: string, apiKey?: string): Promise<PlaylistInfo> {
  if (!apiKey) {
    throw new Error("YouTube API key is required for playlist support")
  }

  try {
    // Get playlist details
    const playlistResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`,
    )

    if (!playlistResponse.ok) {
      throw new Error(`YouTube API error: ${playlistResponse.status}`)
    }

    const playlistData = await playlistResponse.json()

    if (!playlistData.items || playlistData.items.length === 0) {
      throw new Error("Playlist not found")
    }

    const playlist = playlistData.items[0]

    // Get playlist items (up to 50 videos)
    const itemsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}`,
    )

    if (!itemsResponse.ok) {
      throw new Error(`YouTube API error: ${itemsResponse.status}`)
    }

    const itemsData = await itemsResponse.json()

    // Get detailed info for each video
    const videoIds = itemsData.items.map((item: any) => item.snippet.resourceId.videoId).join(",")

    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${apiKey}`,
    )

    if (!videosResponse.ok) {
      throw new Error(`YouTube API error: ${videosResponse.status}`)
    }

    const videosData = await videosResponse.json()

    const videos: VideoInfo[] = videosData.items.map((video: any) => ({
      id: video.id,
      title: video.snippet.title,
      thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url || "",
      duration: formatDuration(parseDuration(video.contentDetails.duration)),
      author: video.snippet.channelTitle,
      viewCount: formatViewCount(video.statistics.viewCount),
      formats: [
        { quality: "1080p", format: "mp4", url: `https://www.youtube.com/watch?v=${video.id}` },
        { quality: "720p", format: "mp4", url: `https://www.youtube.com/watch?v=${video.id}` },
        { quality: "480p", format: "mp4", url: `https://www.youtube.com/watch?v=${video.id}` },
        { quality: "360p", format: "mp4", url: `https://www.youtube.com/watch?v=${video.id}` },
        { quality: "audio", format: "mp3", url: `https://www.youtube.com/watch?v=${video.id}` },
      ],
    }))

    return {
      id: playlistId,
      title: playlist.snippet.title,
      videos: videos,
    }
  } catch (error) {
    console.error("Error fetching playlist info from YouTube API:", error)
    throw error
  }
}
