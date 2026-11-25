import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Everything except the admin panel, Payload API, Next internals and files.
  matcher: ['/((?!api|admin|_next|_vercel|brand|media|.*\\..*).*)'],
}
