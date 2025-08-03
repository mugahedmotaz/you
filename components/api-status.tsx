"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"

export function ApiStatus() {
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null)

  useEffect(() => {
    // فحص حالة API Key
    const checkApiStatus = async () => {
      try {
        const response = await fetch("/api/check-api-status")
        const data = await response.json()
        setHasApiKey(data.hasApiKey)
      } catch (error) {
        setHasApiKey(false)
      }
    }

    checkApiStatus()
  }, [])

  if (hasApiKey === null) {
    return null
  }

  return (
    <Card
      className={`mb-6 ${hasApiKey ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950" : "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950"}`}
    >
      <CardHeader>
        <CardTitle
          className={`flex items-center gap-2 text-sm ${hasApiKey ? "text-green-800 dark:text-green-200" : "text-orange-800 dark:text-orange-200"}`}
        >
          {hasApiKey ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          حالة YouTube API
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Badge variant={hasApiKey ? "default" : "secondary"} className={hasApiKey ? "bg-green-500" : "bg-orange-500"}>
            {hasApiKey ? "متصل" : "غير متصل"}
          </Badge>
          <span className="text-sm">
            {hasApiKey
              ? "يتم الآن جلب البيانات الحقيقية من YouTube"
              : "يتم عرض بيانات تجريبية - أضف مفتاح API للبيانات الحقيقية"}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
