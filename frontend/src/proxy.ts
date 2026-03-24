import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PROTECTED_PREFIX = "/workspace"
const AUTH_PATHS = ["/login", "/register"]
const COOKIE_NAME = "auth-token"

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl
    const token = request.cookies.get(COOKIE_NAME)?.value

    const isProtected = pathname.startsWith(PROTECTED_PREFIX)
    const isAuthPath = AUTH_PATHS.some((p) => pathname.startsWith(p))

    // Redirect unauthenticated users away from protected routes — eliminates the
    // render flash that happened when the layout waited for Zustand hydration.
    if (isProtected && !token) {
        const url = request.nextUrl.clone()
        url.pathname = "/login"
        return NextResponse.redirect(url)
    }

    // Redirect already-authenticated users away from auth pages
    if (isAuthPath && token) {
        const url = request.nextUrl.clone()
        url.pathname = "/"
        return NextResponse.redirect(url)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all paths except:
         * - _next/static (static files)
         * - _next/image (image optimisation)
         * - favicon.ico
         * - api routes (let them pass through)
         */
        "/((?!_next/static|_next/image|favicon\\.ico|api/).*)",
    ],
}
