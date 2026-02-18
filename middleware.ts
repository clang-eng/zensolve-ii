import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, type NextRequest } from 'next/server';

const publicRoutes = new Set(['/', '/login', '/report', '/unauthorized']);

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    const pathname = req.nextUrl.pathname;

    if (publicRoutes.has(pathname) || pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/favicon')) {
        return res;
    }

    if (!pathname.startsWith('/admin')) {
        return res;
    }

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.id) {
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = '/login';
        loginUrl.searchParams.set('redirectedFrom', pathname);
        return NextResponse.redirect(loginUrl);
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

    if (profile?.role !== 'admin') {
        const unauthorizedUrl = req.nextUrl.clone();
        unauthorizedUrl.pathname = '/unauthorized';
        return NextResponse.redirect(unauthorizedUrl);
    }

    return res;
}

export const config = {
    matcher: ['/admin/:path*'],
};
