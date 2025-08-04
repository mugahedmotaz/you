"use client"

import { Heart } from "lucide-react"

export default function SimpleFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © {currentYear} Mugahed. جميع الحقوق محفوظة.
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>صُنع بـ</span>
            <Heart className="h-4 w-4 text-red-500 animate-pulse" />
            <span>في السعودية</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
