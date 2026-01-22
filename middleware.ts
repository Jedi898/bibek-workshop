import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // Define the valid credentials from environment variables
  const authUser = process.env.AUTH_USER
  const authPass = process.env.AUTH_PASS

  // If credentials are not set in env, allow access (useful for local dev if needed)
  if (!authUser || !authPass) {
    return NextResponse.next()
  }

  const basicAuth = req.headers.get('authorization')

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1]
    const [user, pwd] = atob(authValue).split(':')

    if (user === authUser && pwd === authPass) {
      return NextResponse.next()
    }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  })
}

export const config = {
  matcher: [
    // Protect all routes except static files, images, favicon, and the API route
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}