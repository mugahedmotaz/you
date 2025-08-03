import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { rateLimiter } from "./lib/rate-limiter"

export function middleware(request: NextRequest) {
  // تطبيق تحديد معدل الطلبات على API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const ip = request.ip || request.headers.get("x-forwarded-for") || "anonymous"

    if (!rateLimiter.isAllowed(ip)) {
      return NextResponse.json(
        {
          error: "Too many requests. Please wait before trying again.",
          remainingRequests: rateLimiter.getRemainingRequests(ip),
        },
        { status: 429 },
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/api/:path*",
}
