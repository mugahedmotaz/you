"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Youtube, Music, Video, List, AlertTriangle, Globe } from "lucide-react"
import { VideoInfo } from "@/components/video-info"
import { PlaylistInfo } from "@/components/playlist-info"
import { DownloadQueue } from "@/components/download-queue"
import { DownloadHistory } from "@/components/download-history"
import { ThemeToggle } from "@/components/theme-toggle"
import { SuccessMessage } from "@/components/success-message"
import { DownloadStatus } from "@/components/download-status"
import Footer from "../components/footer"
// استبدل هذا السطر:
// import { RealApiStatus } from "@/components/real-api-status"
// بهذا:
import { SystemStatus } from "@/components/system-status"
import { BrowserDownloadNotice } from "@/components/browser-download-notice"
import { DebugPanel } from "@/components/debug-panel"
import { DownloadInstructions } from "@/components/download-instructions"

interface VideoData {
  id: string
  title: string
  thumbnail: string
  duration: string
  author?: string
  viewCount?: string
  formats: Array<{
    quality: string
    format: string
    url: string
    itag?: number
  }>
}

interface PlaylistData {
  id: string
  title: string
  videos: VideoData[]
}

export default function HomePage() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [videoData, setVideoData] = useState<VideoData | null>(null)
  const [playlistData, setPlaylistData] = useState<PlaylistData | null>(null)
  const [error, setError] = useState("")
  const [language, setLanguage] = useState<"ar" | "en">("ar")
  const [downloads, setDownloads] = useState<
    Array<{
      id: string
      title: string
      status: "pending" | "downloading" | "completed" | "failed"
      progress: number
      type: "video" | "audio"
      quality?: string
      originalItem?: any
    }>
  >([])

  // أضف state لحالة API
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null)

  // أضف useEffect للتحقق من حالة API
  useEffect(() => {
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

  const isValidYouTubeUrl = (url: string) => {
    const patterns = [
      /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/,
      /^https?:\/\/(www\.)?youtube\.com\/watch\?v=.+/,
      /^https?:\/\/(www\.)?youtube\.com\/playlist\?list=.+/,
      /^https?:\/\/youtu\.be\/.+/,
    ]
    return patterns.some((pattern) => pattern.test(url))
  }

  const isPlaylistUrl = (url: string) => {
    return url.includes("playlist?list=") || url.includes("&list=")
  }

  const fetchVideoInfo = async () => {
    if (!url.trim()) {
      setError(language === "ar" ? "يرجى إدخال رابط YouTube" : "Please enter a YouTube URL")
      return
    }

    if (!isValidYouTubeUrl(url)) {
      setError(language === "ar" ? "يرجى إدخال رابط YouTube صحيح" : "Please enter a valid YouTube URL")
      return
    }

    setLoading(true)
    setError("")
    setVideoData(null)
    setPlaylistData(null)

    try {
      console.log("Fetching info for URL:", url)

      const endpoint = isPlaylistUrl(url) ? "/api/playlist-info" : "/api/video-info"
      console.log("Using endpoint:", endpoint)

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      console.log("Response status:", response.status)

      // Check if response is JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("Non-JSON response:", text)
        throw new Error("Server returned non-JSON response")
      }

      const data = await response.json()
      console.log("Response data:", data)

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      if (isPlaylistUrl(url)) {
        setPlaylistData(data)
      } else {
        setVideoData(data)
      }
    } catch (err: any) {
      console.error("Error fetching video info:", err)
      setError(
        language === "ar"
          ? `فشل في جلب معلومات الفيديو: ${err.message}`
          : `Failed to fetch video information: ${err.message}`,
      )
    } finally {
      setLoading(false)
    }
  }

  const addToDownloadQueue = (item: {
    id: string
    title: string
    type: "video" | "audio"
    quality?: string
    url: string
  }) => {
    const newDownload = {
      id: `${item.id}-${Date.now()}`,
      title: item.title,
      status: "pending" as const,
      progress: 0,
      type: item.type,
      quality: item.quality,
      originalItem: item,
    }

    setDownloads((prev) => [...prev, newDownload])

    // بدء التحميل
    startDownload(newDownload.id, item)
  }

  const startDownload = async (downloadId: string, item: any) => {
    setDownloads((prev) => prev.map((d) => (d.id === downloadId ? { ...d, status: "downloading" } : d)))

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: item.url,
          type: item.type === "audio" ? "mp3" : "mp4",
          quality: item.quality,
          videoId: item.id,
          title: item.title,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        // Create a more detailed error message
        let errorMessage = errorData.error || "Download failed";
        if (errorData.suggestion) {
          errorMessage += ` - ${errorData.suggestion}`;
        }
        if (errorData.details && errorData.details !== errorData.error) {
          errorMessage += ` (${errorData.details})`;
        }
        throw new Error(errorMessage);
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }

      const reader = response.body.getReader();
      const contentLength = +(response.headers.get('Content-Length') || 0);
      let receivedLength = 0;
      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        chunks.push(value);
        receivedLength += value.length;

        if (contentLength > 0) {
          const progress = Math.round((receivedLength / contentLength) * 100);
          setDownloads((prev) =>
            prev.map((d) => (d.id === downloadId ? { ...d, progress } : d))
          );
        }
      }

      // إنشاء رابط التحميل
      const blob = new Blob(chunks);
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = downloadUrl

      // إنشاء اسم ملف آمن (ASCII only)
      // إنشاء اسم ملف آمن (ASCII only)
      const sanitizedTitle = item.title
        .replace(/[<>:"/\\|?*]/g, "_") // Replace invalid file chars
        .replace(/\s+/g, "_")       // Replace spaces with underscores
        .substring(0, 100)      // Limit length to avoid issues

      const fileExtension = item.type === "audio" ? "mp3" : "mp4"
      a.download = `${sanitizedTitle}.${fileExtension}`

      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(downloadUrl)

      setDownloads((prev) => prev.map((d) => (d.id === downloadId ? { ...d, status: "completed", progress: 100 } : d)))

      // إضافة إلى السجل
      const historyItem = {
        id: item.id,
        title: item.title,
        type: item.type,
        quality: item.quality,
        url: item.url,
      }

      // حفظ في localStorage
      const savedHistory = localStorage.getItem("download-history")
      const history = savedHistory ? JSON.parse(savedHistory) : []
      const newHistory = [{ ...historyItem, downloadedAt: new Date().toISOString() }, ...history.slice(0, 19)]
      localStorage.setItem("download-history", JSON.stringify(newHistory))
    } catch (err: any) {
      setDownloads((prev) => prev.map((d) => (d.id === downloadId ? { ...d, status: "failed" } : d)))
      console.error("Download error:", err)
    }
  }

  const removeFromQueue = (downloadId: string) => {
    setDownloads((prev) => prev.filter((d) => d.id !== downloadId))
  }

  const retryDownload = (downloadId: string) => {
    const download = downloads.find((d) => d.id === downloadId)
    if (download && download.originalItem) {
      setDownloads((prev) => prev.map((d) => (d.id === downloadId ? { ...d, status: "pending", progress: 0 } : d)))
      startDownload(downloadId, download.originalItem)
    }
  }

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "ar" ? "en" : "ar"))
  }

  const texts = {
    ar: {
      title: "محمل فيديوهات يوتيوب",
      description: "محمل حديث لفيديوهات وقوائم التشغيل من يوتيوب. احصل على معلومات حقيقية وروابط مباشرة.",
      warning:
        "يرجى التأكد من حصولك على إذن لتحميل المحتوى والامتثال لشروط خدمة يوتيوب والقوانين المعمول بها لحقوق الطبع والنشر.",
      cardTitle: "معلومات فيديوهات وقوائم تشغيل يوتيوب",
      placeholder: "الصق رابط يوتيوب هنا (فيديو أو قائمة تشغيل)...",
      fetchButton: "جلب المعلومات",
      fetching: "جاري الجلب...",
      videoDownloads: "معلومات الفيديوهات",
      audioExtraction: "روابط مباشرة",
      playlistSupport: "دعم قوائم التشغيل",
    },
    en: {
      title: "YouTube Info Viewer",
      description: "Modern YouTube video and playlist information viewer. Get real data and direct links.",
      warning:
        "Please ensure you have permission to download the content and comply with YouTube's Terms of Service and applicable copyright laws.",
      cardTitle: "YouTube Videos & Playlists Info",
      placeholder: "Paste YouTube URL here (video or playlist)...",
      fetchButton: "Fetch Info",
      fetching: "Fetching...",
      videoDownloads: "Video Information",
      audioExtraction: "Direct Links",
      playlistSupport: "Playlist Support",
    },
  }

  const t = texts[language]

  return (
    <div className="min-h-screen bg-background" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Youtube className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold">{t.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={toggleLanguage}>
              <Globe className="w-4 h-4 mr-1" />
              {language === "ar" ? "EN" : "عربي"}
            </Button>
            <ThemeToggle />
          </div>
        </div>






        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              {t.cardTitle}
            </CardTitle>
            <CardDescription>{t.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder={t.placeholder}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && fetchVideoInfo()}
                className="flex-1"
              />
              <Button onClick={fetchVideoInfo} disabled={loading}>
                {loading ? t.fetching : t.fetchButton}
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}


          </CardContent>
        </Card>

        {videoData && <VideoInfo video={videoData} onDownload={addToDownloadQueue} />}

        {playlistData && <PlaylistInfo playlist={playlistData} onDownload={addToDownloadQueue} />}



        {downloads.length > 0 && <DownloadStatus downloads={downloads} />}
        {downloads.length > 0 && (
          <DownloadQueue downloads={downloads} onRemove={removeFromQueue} onRetry={retryDownload} />
        )}
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}
