import { NextResponse } from "next/server"

export async function GET() {
  try {
    const hasApiKey = !!process.env.YOUTUBE_API_KEY

    console.log("API Key check:", hasApiKey ? "Found" : "Not found")

    const response = {
      hasApiKey,
      message: hasApiKey ? "YouTube API key is configured" : "No YouTube API key found",
      timestamp: new Date().toISOString(),
    }

    console.log("Returning API status:", response)

    return NextResponse.json(response, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.error("Error in check-api-status API:", error)

    const errorResponse = {
      hasApiKey: false,
      message: "Error checking API status",
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
