"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Download, X, CheckCircle, AlertCircle, Clock, Music, Video, RefreshCw } from "lucide-react"

interface DownloadQueueProps {
  downloads: Array<{
    id: string
    title: string
    status: "pending" | "downloading" | "completed" | "failed"
    progress: number
    type: "video" | "audio"
    quality?: string
  }>
  onRemove: (id: string) => void
  onRetry?: (id: string) => void
}

export function DownloadQueue({ downloads, onRemove, onRetry }: DownloadQueueProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "downloading":
        return <Download className="w-4 h-4 text-blue-500 animate-pulse" />
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "downloading":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return ""
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "في الانتظار"
      case "downloading":
        return "جاري التحميل"
      case "completed":
        return "مكتمل"
      case "failed":
        return "فشل"
      default:
        return status
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          طابور التحميل ({downloads.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {downloads.map((download) => (
          <div key={download.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {download.type === "video" ? (
                    <Video className="w-4 h-4 text-blue-500" />
                  ) : (
                    <Music className="w-4 h-4 text-green-500" />
                  )}
                  <h4 className="font-medium text-sm line-clamp-1">{download.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {download.type === "video" ? download.quality : "MP3"}
                  </Badge>
                  <Badge className={`text-xs ${getStatusColor(download.status)}`}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(download.status)}
                      {getStatusText(download.status)}
                    </span>
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {download.status === "failed" && onRetry && (
                  <Button size="sm" variant="ghost" onClick={() => onRetry(download.id)} title="إعادة المحاولة">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => onRemove(download.id)} title="إزالة">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {download.status === "downloading" && <Progress value={download.progress} className="h-2" />}

            {download.status === "failed" && (
              <div className="text-xs text-red-600 dark:text-red-400">
                فشل في التحميل. تحقق من الاتصال بالإنترنت وحاول مرة أخرى.
              </div>
            )}
          </div>
        ))}

        {downloads.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Download className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>لا توجد تحميلات في الطابور</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
