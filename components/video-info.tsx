"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Music, Video, Clock, User, Eye } from "lucide-react"
import Image from "next/image"

interface VideoInfoProps {
  video: {
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
  onDownload: (item: {
    id: string
    title: string
    type: "video" | "audio"
    quality?: string
    url: string
  }) => void
}

export function VideoInfo({ video, onDownload }: VideoInfoProps) {
  const videoFormats = video.formats.filter((f) => f.format === "mp4")
  const hasAudio = video.formats.some((f) => f.format === "mp3" || f.quality === "audio")

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5" />
          معلومات الفيديو
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <Image
                src={video.thumbnail || "/placeholder.svg?height=360&width=640&text=Video+Thumbnail"}
                alt={video.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{video.duration}</span>
              </div>
              {video.author && (
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{video.author}</span>
                </div>
              )}
              {video.viewCount && (
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{video.viewCount}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold line-clamp-3">{video.title}</h3>

            <div className="space-y-3">
              {videoFormats.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    تحميل الفيديو
                  </h4>
                  <div className="grid gap-2">
                    {videoFormats.map((format) => (
                      <div
                        key={`${format.quality}-${format.itag}`}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{format.quality}</Badge>
                          <span className="text-sm">MP4</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() =>
                            onDownload({
                              id: video.id,
                              title: video.title,
                              type: "video",
                              quality: format.quality,
                              url: format.url,
                            })
                          }
                        >
                          <Download className="w-4 h-4 mr-1" />
                          تحميل
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {hasAudio && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    تحميل الصوت
                  </h4>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">صوت فقط</Badge>
                      <span className="text-sm">MP3</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() =>
                        onDownload({
                          id: video.id,
                          title: video.title,
                          type: "audio",
                          url: video.formats[0]?.url || "",
                        })
                      }
                    >
                      <Download className="w-4 h-4 mr-1" />
                      تحميل
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
