"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, Download, Terminal, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"

export function YtdlpStatus() {
  const [isInstalled, setIsInstalled] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkYtdlpStatus = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/check-ytdlp")

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      setIsInstalled(data.installed)
      console.log("yt-dlp Status:", data)
    } catch (error) {
      console.error("Error checking yt-dlp status:", error)
      setError(error instanceof Error ? error.message : "Unknown error")
      setIsInstalled(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkYtdlpStatus()
  }, [])

  if (loading) {
    return (
      <Card className="mb-6 border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
            <span className="text-sm">جاري فحص حالة yt-dlp...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={`mb-6 ${
        isInstalled
          ? "border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:border-green-800 dark:from-green-950 dark:to-emerald-950"
          : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
      }`}
    >
      <CardHeader>
        <CardTitle
          className={`flex items-center gap-2 text-sm ${
            isInstalled ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"
          }`}
        >
          {isInstalled ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <Terminal className="w-4 h-4" />
          حالة yt-dlp (التحميل الحقيقي)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge
              variant={isInstalled ? "default" : "destructive"}
              className={isInstalled ? "bg-green-500" : "bg-red-500"}
            >
              {isInstalled ? "مثبت ✓" : "غير مثبت ✗"}
            </Badge>
            <span className="text-sm">
              {isInstalled ? "yt-dlp مثبت - التحميل الحقيقي مفعل!" : "yt-dlp غير مثبت - التحميل الحقيقي معطل"}
            </span>
          </div>

          {error && <div className="text-sm text-red-600 dark:text-red-400">خطأ: {error}</div>}

          {isInstalled ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">🎉 التحميل الحقيقي مفعل!</span>
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">
                ✅ تحميل فيديوهات حقيقية ✅ جودات متعددة ✅ استخراج صوت MP3 ✅ دعم قوائم التشغيل
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-red-700 dark:text-red-300">لتفعيل التحميل الحقيقي، قم بتثبيت yt-dlp:</div>
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono text-sm">
                <div className="text-green-600">pip install yt-dlp</div>
                <div className="text-gray-500 mt-1"># أو</div>
                <div className="text-green-600">npm run setup</div>
              </div>
              <div className="text-xs text-red-600 dark:text-red-400">
                بدون yt-dlp، ستحصل على معلومات الفيديو فقط وروابط YouTube مباشرة
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={checkYtdlpStatus} disabled={loading}>
              <RefreshCw className="w-4 h-4 mr-1" />
              إعادة فحص
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
