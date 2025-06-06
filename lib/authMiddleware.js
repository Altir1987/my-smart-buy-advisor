import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export function verifyTokenFromCookie(req) {
    const cookies = cookie.parse(req.headers.get?.('cookie') || req.headers.cookie || '');
    const token = cookies.token;

    if (!token) return null;

    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        console.error('JWT verification failed:', err);
        return null;
    }
}
