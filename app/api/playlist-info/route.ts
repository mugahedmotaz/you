import { type NextRequest, NextResponse } from "next/server"
import { extractPlaylistId, getPlaylistInfo } from "../../../lib/youtube-api"

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Extract playlist ID from URL
    const playlistId = extractPlaylistId(url)
    if (!playlistId) {
      return NextResponse.json({ error: "Invalid YouTube playlist URL" }, { status: 400 })
    }

    // Get playlist info using YouTube API
    const apiKey = process.env.YOUTUBE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "YouTube API key is required for playlist support" }, { status: 400 })
    }

    const playlistData = await getPlaylistInfo(playlistId, apiKey)

    return NextResponse.json(playlistData)
  } catch (error) {
    console.error("Error fetching playlist info:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch playlist information",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
