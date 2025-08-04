import { NextResponse } from "next/server"
import { checkYtdlpInstallation } from "../../../lib/youtube-downloader"

export async function GET() {
  try {
    console.log("Checking yt-dlp installation...")
    const isInstalled = await checkYtdlpInstallation()
    console.log("yt-dlp check result:", isInstalled)

    const response = {
      installed: isInstalled,
      message: isInstalled ? "yt-dlp is installed and ready" : "yt-dlp is not installed. Run: pip install yt-dlp",
      timestamp: new Date().toISOString(),
    }

    console.log("Returning yt-dlp status:", response)

    return NextResponse.json(response, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.error("Error in check-ytdlp API:", error)

    const errorResponse = {
      installed: false,
      message: "Error checking yt-dlp installation",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(errorResponse, {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    })
  }
}
