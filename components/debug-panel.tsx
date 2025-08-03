"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bug, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { useState } from "react"

export function DebugPanel() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runDiagnostics = async () => {
    setLoading(true)
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: [],
    }

    try {
      // Test 1: Check API status
      try {
        const apiResponse = await fetch("/api/check-api-status")
        console.log("Debug: API response status:", apiResponse.status)

        let apiData
        if (apiResponse.ok) {
          const contentType = apiResponse.headers.get("content-type")
          if (contentType && contentType.includes("application/json")) {
            apiData = await apiResponse.json()
          } else {
            const text = await apiResponse.text()
            apiData = { error: "Non-JSON response", response: text.substring(0, 200) }
          }
        } else {
          apiData = { error: `HTTP ${apiResponse.status}` }
        }

        results.tests.push({
          name: "API Status Check",
          status: apiResponse.ok && apiData.hasApiKey !== undefined ? "pass" : "fail",
          data: apiData,
        })
      } catch (error) {
        results.tests.push({
          name: "API Status Check",
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }

      // Test 2: Check yt-dlp
      try {
        const ytdlpResponse = await fetch("/api/check-ytdlp")
        console.log("Debug: yt-dlp response status:", ytdlpResponse.status)

        let ytdlpData
        if (ytdlpResponse.ok) {
          const contentType = ytdlpResponse.headers.get("content-type")
          if (contentType && contentType.includes("application/json")) {
            ytdlpData = await ytdlpResponse.json()
          } else {
            const text = await ytdlpResponse.text()
            ytdlpData = { error: "Non-JSON response", response: text.substring(0, 200) }
          }
        } else {
          ytdlpData = { error: `HTTP ${ytdlpResponse.status}` }
        }

        results.tests.push({
          name: "yt-dlp Check",
          status: ytdlpResponse.ok && ytdlpData.installed !== undefined ? "pass" : "fail",
          data: ytdlpData,
        })
      } catch (error) {
        results.tests.push({
          name: "yt-dlp Check",
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }

      // Test 3: Test video info with a known video
      try {
        const testUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        const videoResponse = await fetch("/api/video-info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: testUrl }),
        })

        let videoData
        if (videoResponse.ok) {
          const contentType = videoResponse.headers.get("content-type")
          if (contentType && contentType.includes("application/json")) {
            videoData = await videoResponse.json()
          } else {
            const text = await videoResponse.text()
            videoData = { error: "Non-JSON response", response: text.substring(0, 200) }
          }
        } else {
          videoData = { error: `HTTP ${videoResponse.status}` }
        }

        results.tests.push({
          name: "Video Info Test",
          status: videoResponse.ok && videoData.id ? "pass" : "fail",
          data: videoData,
        })
      } catch (error) {
        results.tests.push({
          name: "Video Info Test",
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }

      // Test 4: Environment check
      results.tests.push({
        name: "Environment Check",
        status: "info",
        data: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        },
      })
    } catch (error) {
      results.error = error instanceof Error ? error.message : "Unknown error"
    }

    setDebugInfo(results)
    setLoading(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "fail":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pass":
        return "bg-green-100 text-green-800"
      case "fail":
        return "bg-red-100 text-red-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200 text-sm">
          <Bug className="w-4 h-4" />
          لوحة التشخيص
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runDiagnostics} disabled={loading} size="sm">
          {loading ? "جاري الفحص..." : "تشغيل التشخيص"}
        </Button>

        {debugInfo && (
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">
              آخر فحص: {new Date(debugInfo.timestamp).toLocaleString("ar-SA")}
            </div>

            {debugInfo.tests.map((test: any, index: number) => (
              <div key={index} className="border rounded p-3 space-y-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(test.status)}
                  <span className="font-medium text-sm">{test.name}</span>
                  <Badge className={getStatusColor(test.status)}>{test.status}</Badge>
                </div>

                {test.error && <div className="text-xs text-red-600 bg-red-50 p-2 rounded">خطأ: {test.error}</div>}

                {test.data && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground">عرض التفاصيل</summary>
                    <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-auto max-h-40">
                      {JSON.stringify(test.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
