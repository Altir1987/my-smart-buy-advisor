import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req) {
    const token = req.cookies.get('token')?.value;

    const url = req.nextUrl.clone();

    const publicPaths = ['/login'];

    const isPublic = publicPaths.some((path) => url.pathname.startsWith(path));

    if (!token && !isPublic) {
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    if (token) {
        try {
            await jwtVerify(token, secret);
            return NextResponse.next();
        } catch (err) {
            console.log('JWT verification failed:', err);
            url.pathname = '/login';
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|api/auth/login|api/auth/register|login).*)',
    ],
};
