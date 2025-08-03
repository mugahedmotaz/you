"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { History, Trash2, Music, Video } from "lucide-react"

interface HistoryItem {
  id: string
  title: string
  type: "video" | "audio"
  quality?: string
  downloadedAt: string
  url: string
}

export function DownloadHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    // تحميل التاريخ من localStorage
    const savedHistory = localStorage.getItem("download-history")
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [])

  const addToHistory = (item: Omit<HistoryItem, "downloadedAt">) => {
    const newItem: HistoryItem = {
      ...item,
      downloadedAt: new Date().toISOString(),
    }

    const updatedHistory = [newItem, ...history.slice(0, 19)] // الاحتفاظ بآخر 20 عنصر
    setHistory(updatedHistory)
    localStorage.setItem("download-history", JSON.stringify(updatedHistory))
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem("download-history")
  }

  const removeItem = (id: string) => {
    const updatedHistory = history.filter((item) => item.id !== id)
    setHistory(updatedHistory)
    localStorage.setItem("download-history", JSON.stringify(updatedHistory))
  }

  if (history.length === 0) {
    return null
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            سجل التحميلات
          </CardTitle>
          <Button variant="outline" size="sm" onClick={clearHistory}>
            <Trash2 className="w-4 h-4 mr-1" />
            مسح الكل
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {history.map((item) => (
            <div
              key={`${item.id}-${item.downloadedAt}`}
              className="flex items-center justify-between p-3 border rounded"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {item.type === "video" ? (
                  <Video className="w-4 h-4 text-blue-500 flex-shrink-0" />
                ) : (
                  <Music className="w-4 h-4 text-green-500 flex-shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {item.type === "video" ? item.quality : "MP3"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.downloadedAt).toLocaleDateString("ar-SA")}
                    </span>
                  </div>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => removeItem(item.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
