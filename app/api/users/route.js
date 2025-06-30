import pool from '@/db';
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
        if (decoded.email !== 'kiseof@gmail.com') {
            return new Response(JSON.stringify({ message: 'Forbidden' }), {
                status: 403,
            });
        }

        const [users] = await pool.query(
            'SELECT id, name, email, created_at FROM users ORDER BY id DESC'
        );

        return new Response(JSON.stringify({ users }), {
            status: 200,
        });
    } catch (err) {
        console.error('User list error:', err);
        return new Response(JSON.stringify({ message: 'Invalid token' }), {
            status: 401,
        });
    }
}
