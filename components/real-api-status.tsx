"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Youtube, Sparkles, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export function RealApiStatus() {
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkApiStatus = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/check-api-status")

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      setHasApiKey(data.hasApiKey)
      console.log("API Status:", data)
    } catch (error) {
      console.error("Error checking API status:", error)
      setError(error instanceof Error ? error.message : "Unknown error")
      setHasApiKey(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkApiStatus()
  }, [])

  if (loading) {
    return (
      <Card className="mb-6 border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
            <span className="text-sm">جاري فحص حالة YouTube API...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={`mb-6 ${
        hasApiKey
          ? "border-green-200 bg-gradient-to-r from-green-50 to-blue-50 dark:border-green-800 dark:from-green-950 dark:to-blue-950"
          : "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950"
      }`}
    >
      <CardHeader>
        <CardTitle
          className={`flex items-center gap-2 text-sm ${
            hasApiKey ? "text-green-800 dark:text-green-200" : "text-orange-800 dark:text-orange-200"
          }`}
        >
          {hasApiKey ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <Youtube className="w-4 h-4 text-red-500" />
          حالة YouTube API
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge
              variant={hasApiKey ? "default" : "secondary"}
              className={hasApiKey ? "bg-green-500" : "bg-orange-500"}
            >
              {hasApiKey ? "مفعل ✓" : "غير مفعل ✗"}
            </Badge>
            <span className="text-sm">
              {hasApiKey
                ? "YouTube API مفعل - يتم جلب البيانات الحقيقية"
                : "YouTube API غير مفعل - يتم عرض بيانات تجريبية"}
            </span>
          </div>

          {error && <div className="text-sm text-red-600 dark:text-red-400">خطأ: {error}</div>}

          {hasApiKey && (
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">🎉 مبروك! الآن يمكنك جلب معلومات حقيقية من YouTube</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={checkApiStatus} disabled={loading}>
              <RefreshCw className="w-4 h-4 mr-1" />
              إعادة فحص
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            {hasApiKey
              ? "✅ العناوين الحقيقية ✅ الصور المصغرة ✅ عدد المشاهدات ✅ معلومات القنوات"
              : "للحصول على البيانات الحقيقية، تأكد من إضافة مفتاح YouTube API في .env.local"}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
