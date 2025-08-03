"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Music, Video, List, Clock } from "lucide-react"
import Image from "next/image"

interface PlaylistInfoProps {
  playlist: {
    id: string
    title: string
    videos: Array<{
      id: string
      title: string
      thumbnail: string
      duration: string
      formats: Array<{
        quality: string
        format: string
        url: string
      }>
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

export function PlaylistInfo({ playlist, onDownload }: PlaylistInfoProps) {
  const downloadAllVideos = (quality: string) => {
    playlist.videos.forEach((video) => {
      const format = video.formats.find((f) => f.quality === quality && f.format === "mp4")
      if (format) {
        onDownload({
          id: video.id,
          title: video.title,
          type: "video",
          quality: quality,
          url: format.url,
        })
      }
    })
  }

  const downloadAllAudio = () => {
    playlist.videos.forEach((video) => {
      if (video.formats.length > 0) {
        onDownload({
          id: video.id,
          title: video.title,
          type: "audio",
          url: video.formats[0].url,
        })
      }
    })
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <List className="w-5 h-5" />
          Playlist Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{playlist.title}</h3>
            <p className="text-sm text-muted-foreground">{playlist.videos.length} videos</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => downloadAllVideos("720p")} variant="outline">
              <Video className="w-4 h-4 mr-1" />
              Download All (720p)
            </Button>
            <Button onClick={downloadAllAudio} variant="outline">
              <Music className="w-4 h-4 mr-1" />
              Download All Audio
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {playlist.videos.map((video, index) => (
            <Card key={video.id} className="p-4">
              <div className="grid md:grid-cols-4 gap-4 items-center">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground font-mono">{String(index + 1).padStart(2, "0")}</span>
                  <div className="relative w-20 h-12 rounded overflow-hidden">
                    <Image
                      src={video.thumbnail || "/placeholder.svg"}
                      alt={video.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h4 className="font-medium line-clamp-2 text-sm">{video.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{video.duration}</span>
                  </div>
                </div>

                <div className="flex gap-1 justify-end">
                  {video.formats
                    .filter((f) => f.format === "mp4")
                    .slice(0, 2)
                    .map((format) => (
                      <Button
                        key={format.quality}
                        size="sm"
                        variant="outline"
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
                        {format.quality}
                      </Button>
                    ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      onDownload({
                        id: video.id,
                        title: video.title,
                        type: "audio",
                        url: video.formats[0]?.url || "",
                      })
                    }
                  >
                    <Music className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
