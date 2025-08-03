"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, Download, ExternalLink, Chrome } from "lucide-react"

export function BrowserDownloadNotice() {
  const openYouTube = (url: string) => {
    window.open(url, "_blank")
  }

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200 text-sm">
          <Info className="w-4 h-4" />
          معلومات التحميل
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-blue-200 bg-blue-100 dark:border-blue-700 dark:bg-blue-900">
          <Download className="h-4 w-4" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <strong>ملاحظة:</strong> هذا التطبيق يعمل في المتصفح ويجلب معلومات حقيقية من YouTube API. للتحميل الفعلي،
            يمكنك استخدام الطرق التالية:
          </AlertDescription>
        </Alert>

        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <Chrome className="w-4 h-4 mt-0.5 text-blue-600" />
            <div>
              <strong>إضافات المتصفح:</strong>
              <p className="text-muted-foreground">استخدم إضافات مثل "Video DownloadHelper" أو "SaveFrom.net"</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <ExternalLink className="w-4 h-4 mt-0.5 text-blue-600" />
            <div>
              <strong>مواقع التحميل:</strong>
              <p className="text-muted-foreground">استخدم مواقع مثل y2mate.com أو savefrom.net</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Download className="w-4 h-4 mt-0.5 text-blue-600" />
            <div>
              <strong>تطبيقات سطح المكتب:</strong>
              <p className="text-muted-foreground">استخدم برامج مثل 4K Video Downloader أو yt-dlp</p>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-blue-200 dark:border-blue-700">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 <strong>نصيحة:</strong> اضغط على "تحميل" للحصول على رابط YouTube المباشر ومعلومات الفيديو
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
