import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export async function GET(req) {
    const cookies = cookie.parse(req.headers.get('cookie') || '');
    const token = cookies.token;

    if (!token) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), {
            status: 401,
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return Response.json({
            user: {
                name: decoded.name,
                email: decoded.email,
                is_admin: decoded.is_admin,
                secondName: decoded.secondName,
            },
        });
    } catch (err) {
        return new Response(JSON.stringify({ message: 'Invalid token' }), {
            status: 401,
        });
    }
}
