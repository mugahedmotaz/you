"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Youtube, Sparkles } from "lucide-react"

export function SuccessMessage() {
  return (
    <Card className="mb-6 border-green-200 bg-gradient-to-r from-green-50 to-blue-50 dark:border-green-800 dark:from-green-950 dark:to-blue-950">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <Youtube className="w-8 h-8 text-red-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              تم تفعيل YouTube API بنجاح!
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              يمكنك الآن جلب البيانات الحقيقية من YouTube. جرب لصق رابط أي فيديو أو قائمة تشغيل!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
