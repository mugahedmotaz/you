"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Clock, Download } from "lucide-react"

interface DownloadStatusProps {
  downloads: Array<{
    id: string
    title: string
    status: "pending" | "downloading" | "completed" | "failed"
    progress: number
    type: "video" | "audio"
    quality?: string
  }>
}

export function DownloadStatus({ downloads }: DownloadStatusProps) {
  const completedCount = downloads.filter((d) => d.status === "completed").length
  const failedCount = downloads.filter((d) => d.status === "failed").length
  const pendingCount = downloads.filter((d) => d.status === "pending").length
  const downloadingCount = downloads.filter((d) => d.status === "downloading").length

  if (downloads.length === 0) {
    return null
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Download className="w-4 h-4" />
          إحصائيات التحميل
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm">
          {completedCount > 0 && (
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                مكتمل: {completedCount}
              </Badge>
            </div>
          )}

          {downloadingCount > 0 && (
            <div className="flex items-center gap-1">
              <Download className="w-4 h-4 text-blue-500 animate-pulse" />
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                جاري التحميل: {downloadingCount}
              </Badge>
            </div>
          )}

          {pendingCount > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-yellow-500" />
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                في الانتظار: {pendingCount}
              </Badge>
            </div>
          )}

          {failedCount > 0 && (
            <div className="flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                فشل: {failedCount}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
