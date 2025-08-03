"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, ExternalLink, Chrome, Smartphone, Monitor, Copy, CheckCircle } from "lucide-react"
import { useState } from "react"

interface DownloadInstructionsProps {
  videoUrl?: string
  videoTitle?: string
}

export function DownloadInstructions({ videoUrl, videoTitle }: DownloadInstructionsProps) {
  const [copied, setCopied] = useState(false)

  const copyUrl = () => {
    if (videoUrl) {
      navigator.clipboard.writeText(videoUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const downloadMethods = [
    {
      icon: <Chrome className="w-5 h-5 text-blue-600" />,
      title: "إضافات المتصفح",
      description: "الطريقة الأسهل والأسرع",
      methods: [
        "Video DownloadHelper - إضافة مجانية للمتصفح",
        "SaveFrom.net Helper - سهلة الاستخدام",
        "YouTube Video Downloader - متعددة الجودات",
      ],
      steps: [
        "ثبت الإضافة من متجر المتصفح",
        "اذهب إلى صفحة الفيديو على YouTube",
        "اضغط على أيقونة الإضافة",
        "اختر الجودة واضغط تحميل",
      ],
    },
    {
      icon: <ExternalLink className="w-5 h-5 text-green-600" />,
      title: "مواقع التحميل",
      description: "بدون تثبيت أي برامج",
      methods: [
        "y2mate.com - سريع وموثوق",
        "savefrom.net - يدعم جودات متعددة",
        "ytmp3.cc - للصوت فقط",
        "9convert.com - واجهة بسيطة",
      ],
      steps: [
        "انسخ رابط الفيديو من YouTube",
        "اذهب إلى أحد المواقع أعلاه",
        "الصق الرابط في الحقل المخصص",
        "اختر الجودة واضغط تحميل",
      ],
    },
    {
      icon: <Monitor className="w-5 h-5 text-purple-600" />,
      title: "برامج سطح المكتب",
      description: "للتحميل المتقدم والمجمع",
      methods: [
        "4K Video Downloader - مجاني ومتقدم",
        "yt-dlp - أداة سطر الأوامر القوية",
        "JDownloader - مدير تحميل شامل",
        "Freemake Video Downloader - واجهة سهلة",
      ],
      steps: [
        "حمل وثبت البرنامج المفضل",
        "انسخ رابط الفيديو",
        "الصق الرابط في البرنامج",
        "اختر المجلد والجودة وابدأ التحميل",
      ],
    },
    {
      icon: <Smartphone className="w-5 h-5 text-orange-600" />,
      title: "تطبيقات الهاتف",
      description: "للتحميل على الهاتف المحمول",
      methods: ["TubeMate - Android فقط", "Documents by Readdle - iOS", "Snaptube - Android", "VidMate - Android"],
      steps: [
        "حمل التطبيق من المتجر المناسب",
        "افتح التطبيق وابحث عن الفيديو",
        "أو الصق الرابط في التطبيق",
        "اختر الجودة وحمل على هاتفك",
      ],
    },
  ]

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Download className="w-5 h-5" />
          طرق تحميل الفيديوهات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {videoUrl && (
          <Alert className="border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">رابط الفيديو جاهز للتحميل:</p>
                <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded border">
                  <code className="flex-1 text-sm break-all">{videoUrl}</code>
                  <Button size="sm" variant="outline" onClick={copyUrl}>
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                {copied && <p className="text-green-600 text-sm">تم نسخ الرابط!</p>}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {downloadMethods.map((method, index) => (
            <Card key={index} className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  {method.icon}
                  {method.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{method.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">الأدوات المقترحة:</h4>
                  <ul className="space-y-1">
                    {method.methods.map((tool, toolIndex) => (
                      <li key={toolIndex} className="text-sm text-muted-foreground flex items-center gap-1">
                        <span className="w-1 h-1 bg-current rounded-full"></span>
                        {tool}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">خطوات التحميل:</h4>
                  <ol className="space-y-1">
                    {method.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="text-sm text-muted-foreground flex gap-2">
                        <span className="flex-shrink-0 w-4 h-4 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">
                          {stepIndex + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Alert>
          <AlertDescription className="text-sm">
            <strong>ملاحظة مهمة:</strong> تأكد من احترام حقوق الطبع والنشر واستخدم هذه الطرق للاستخدام الشخصي فقط. بعض
            الطرق قد تتطلب تثبيت برامج إضافية أو قد لا تعمل في جميع البلدان.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
