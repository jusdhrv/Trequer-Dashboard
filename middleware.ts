import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    const {
        data: { session },
    } = await supabase.auth.getSession()

    // console.log('Session:', session)
    // console.log('Request Path:', req.nextUrl.pathname)

    // // Allow access to the dashboard if the user is authenticated
    // if (session && req.nextUrl.pathname.startsWith('/dashboard')) {
    //     return res; // Allow access
    // }

    // // Redirect unauthenticated users trying to access protected routes
    // if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    //     const redirectUrl = req.nextUrl.clone()
    //     redirectUrl.pathname = '/login'
    //     // console.log('Redirecting to login for unauthenticated user')
    //     return NextResponse.redirect(redirectUrl)
    // }

    // // Redirect authenticated users trying to access the login page
    // if (session && req.nextUrl.pathname === '/login') {
    //     const redirectUrl = req.nextUrl.clone()
    //     redirectUrl.pathname = '/dashboard'
    //     // console.log('Redirecting to dashboard for authenticated user')
    //     return NextResponse.redirect(redirectUrl)
    // }

    return res
}

export const config = {
    matcher: ['/dashboard/:path*', '/login']
}