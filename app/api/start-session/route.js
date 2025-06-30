import pool from '@/db';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export async function POST(req) {
    const cookies = cookie.parse(req.headers.get('cookie') || '');
    const token = cookies.token;

    if (!token) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), {
            status: 401,
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [result] = await pool.query('INSERT INTO sessions (user_id) VALUES (?)', [decoded.id]);

        return new Response(JSON.stringify({ sessionId: result.insertId }), {
            status: 200,
        });
    } catch (err) {
        console.error('Start session error:', err);
        return new Response(JSON.stringify({ message: 'Invalid token' }), {
            status: 401,
        });
    }
}
