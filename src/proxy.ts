import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'

const intl = createMiddleware(routing)

export default function proxy(req: NextRequest) {
  if (req.nextUrl.pathname === '/admin' || req.nextUrl.pathname.startsWith('/admin/')) {
    // Payload picks the dashboard language from its `payload-lng` cookie, then the browser's
    // Accept-Language. Until someone chooses a language in their account, make it Arabic.
    if (req.cookies.has('payload-lng')) return NextResponse.next()
    const headers = new Headers(req.headers)
    headers.set('accept-language', 'ar')
    return NextResponse.next({ request: { headers } })
  }
  // Arabic by default: next-intl may follow a remembered choice (cookie), never the browser's language.
  const headers = new Headers(req.headers)
  headers.delete('accept-language')
  return intl(new NextRequest(req, { headers }))
}

export const config = {
  // The dashboard pages, plus everything except the Payload API, Next internals and files.
  matcher: ['/admin', '/admin/:path*', '/((?!api|admin|_next|_vercel|brand|media|.*\\..*).*)'],
}
