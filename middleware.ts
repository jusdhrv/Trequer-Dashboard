import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    const {
        data: { session },
    } = await supabase.auth.getSession()

    // TODO: Come back here and fix authentication
    // // If there's no session and the user is trying to access a protected route
    // if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    //     const redirectUrl = req.nextUrl.clone()
    //     redirectUrl.pathname = '/login'
    //     return NextResponse.redirect(redirectUrl)
    // }

    // // If there's a session and the user is on the login page
    // if (session && req.nextUrl.pathname === '/login') {
    //     const redirectUrl = req.nextUrl.clone()
    //     redirectUrl.pathname = '/dashboard'
    //     return NextResponse.redirect(redirectUrl)
    // }

    return res
}

export const config = {
    matcher: ['/dashboard/:path*', '/login']
}