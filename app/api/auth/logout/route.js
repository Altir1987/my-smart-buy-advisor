import cookie from 'cookie';

export async function POST() {
    const expiredCookie = cookie.serialize('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(0),
        path: '/',
    });

    return new Response(JSON.stringify({ message: 'Logged out successfully' }), {
        status: 200,
        headers: {
            'Set-Cookie': expiredCookie,
            'Content-Type': 'application/json',
        },
    });
}
