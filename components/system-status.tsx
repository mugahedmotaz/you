"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, Youtube, Terminal, RefreshCw, Settings } from "lucide-react"
import { useEffect, useState } from "react"

interface SystemStatus {
  ytdlp: {
    installed: boolean
    message: string
  }
  api: {
    hasApiKey: boolean
    message: string
  }
}

export function SystemStatus() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkSystemStatus = async () => {
    try {
      setLoading(true)
      setError(null)

      // فحص yt-dlp
      let ytdlpData = { installed: false, message: "Failed to check yt-dlp" }
      try {
        const ytdlpResponse = await fetch("/api/check-ytdlp")
        console.log("yt-dlp response status:", ytdlpResponse.status)

        if (ytdlpResponse.ok) {
          const contentType = ytdlpResponse.headers.get("content-type")
          if (contentType && contentType.includes("application/json")) {
            ytdlpData = await ytdlpResponse.json()
          } else {
            const text = await ytdlpResponse.text()
            console.error("yt-dlp non-JSON response:", text)
            ytdlpData = { installed: false, message: "Server returned non-JSON response" }
          }
        } else {
          ytdlpData = { installed: false, message: `HTTP ${ytdlpResponse.status}` }
        }
      } catch (ytdlpError) {
        console.error("yt-dlp check error:", ytdlpError)
        ytdlpData = { installed: false, message: "Failed to connect to server" }
      }

      // فحص API
      let apiData = { hasApiKey: false, message: "Failed to check API" }
      try {
        const apiResponse = await fetch("/api/check-api-status")
        console.log("API response status:", apiResponse.status)

        if (apiResponse.ok) {
          const contentType = apiResponse.headers.get("content-type")
          if (contentType && contentType.includes("application/json")) {
            apiData = await apiResponse.json()
          } else {
            const text = await apiResponse.text()
            console.error("API non-JSON response:", text)
            apiData = { hasApiKey: false, message: "Server returned non-JSON response" }
          }
        } else {
          apiData = { hasApiKey: false, message: `HTTP ${apiResponse.status}` }
        }
      } catch (apiError) {
        console.error("API check error:", apiError)
        apiData = { hasApiKey: false, message: "Failed to connect to server" }
      }

      setStatus({
        ytdlp: {
          installed: ytdlpData.installed,
          message: ytdlpData.message,
        },
        api: {
          hasApiKey: apiData.hasApiKey,
          message: apiData.message,
        },
      })

      console.log("System status updated:", { ytdlpData, apiData })
    } catch (error) {
      console.error("Error checking system status:", error)
      setError(error instanceof Error ? error.message : "Unknown error")

      // Set fallback status
      setStatus({
        ytdlp: { installed: false, message: "Check failed" },
        api: { hasApiKey: false, message: "Check failed" },
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkSystemStatus()
  }, [])

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
            <span className="text-sm">جاري فحص حالة النظام...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error && !status) {
    return (
      <Card className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm text-red-800 dark:text-red-200">
            <AlertCircle className="w-4 h-4" />
            خطأ في فحص النظام
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-sm text-red-700 dark:text-red-300">فشل في فحص حالة النظام: {error}</div>
            <Button size="sm" variant="outline" onClick={checkSystemStatus}>
              <RefreshCw className="w-4 h-4 mr-1" />
              إعادة المحاولة
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!status) {
    return null
  }

  const allGood = status.ytdlp.installed && status.api.hasApiKey
  const partialGood = status.ytdlp.installed || status.api.hasApiKey

  return (
    <Card
      className={`mb-6 ${
        allGood
          ? "border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:border-green-800 dark:from-green-950 dark:to-emerald-950"
          : partialGood
            ? "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950"
            : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
      }`}
    >
      <CardHeader>
        <CardTitle
          className={`flex items-center gap-2 text-sm ${
            allGood
              ? "text-green-800 dark:text-green-200"
              : partialGood
                ? "text-yellow-800 dark:text-yellow-200"
                : "text-red-800 dark:text-red-200"
          }`}
        >
          <Settings className="w-4 h-4" />
          حالة النظام
          {allGood ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-yellow-500" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* yt-dlp Status */}
        <div className="flex items-center justify-between p-3 border rounded">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            <span className="font-medium text-sm">yt-dlp (التحميل الحقيقي)</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={status.ytdlp.installed ? "default" : "destructive"}>
              {status.ytdlp.installed ? "مثبت" : "غير مثبت"}
            </Badge>
            {status.ytdlp.installed ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
          </div>
        </div>

        {/* API Status */}
        <div className="flex items-center justify-between p-3 border rounded">
          <div className="flex items-center gap-2">
            <Youtube className="w-4 h-4 text-red-500" />
            <span className="font-medium text-sm">YouTube API</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={status.api.hasApiKey ? "default" : "secondary"}>
              {status.api.hasApiKey ? "مفعل" : "غير مفعل"}
            </Badge>
            {status.api.hasApiKey ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-yellow-500" />
            )}
          </div>
        </div>

        {/* Status Summary */}
        <div className="pt-2 border-t">
          {allGood ? (
            <div className="text-green-700 dark:text-green-300 text-sm">
              🎉 <strong>النظام جاهز بالكامل!</strong> يمكنك تحميل الفيديوهات الحقيقية والحصول على معلومات دقيقة.
            </div>
          ) : status.ytdlp.installed ? (
            <div className="text-yellow-700 dark:text-yellow-300 text-sm">
              ⚡ <strong>التحميل الحقيقي مفعل!</strong> أضف مفتاح YouTube API للحصول على معلومات أكثر دقة.
            </div>
          ) : status.api.hasApiKey ? (
            <div className="text-yellow-700 dark:text-yellow-300 text-sm">
              📊 <strong>معلومات حقيقية متاحة!</strong> ثبت yt-dlp لتفعيل التحميل الحقيقي.
            </div>
          ) : (
            <div className="text-red-700 dark:text-red-300 text-sm">
              ⚠️ <strong>وضع تجريبي:</strong> ثبت yt-dlp وأضف مفتاح API للاستفادة الكاملة.
            </div>
          )}
        </div>

        {/* Installation Instructions */}
        {!status.ytdlp.installed && (
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm">
            <div className="font-medium mb-2">لتثبيت yt-dlp:</div>
            <div className="font-mono text-green-600">pip install yt-dlp</div>
            <div className="text-gray-500 mt-1">أو استخدم: npm run setup</div>
          </div>
        )}

        {/* Debug Information */}
        {error && (
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer">معلومات التشخيص</summary>
            <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
              <div>خطأ: {error}</div>
              <div>yt-dlp: {status.ytdlp.message}</div>
              <div>API: {status.api.message}</div>
            </div>
          </details>
        )}

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={checkSystemStatus} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-1" />
            إعادة فحص
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
