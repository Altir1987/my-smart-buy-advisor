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
        const url = new URL(req.url);
        const sessionId = url.searchParams.get('sessionId');

        if (!sessionId) {
            return new Response(JSON.stringify({ message: 'Missing sessionId' }), {
                status: 400,
            });
        }

        const [sessionRows] = await pool.query(
            'SELECT * FROM sessions WHERE id = ? AND user_id = ?',
            [sessionId, decoded.id]
        );

        if (sessionRows.length === 0) {
            return new Response(JSON.stringify({ message: 'Forbidden' }), {
                status: 403,
            });
        }

        const [messages] = await pool.query(
            'SELECT role, content, created_at FROM messages WHERE session_id = ? ORDER BY created_at ASC',
            [sessionId]
        );

        return new Response(JSON.stringify({ messages }), {
            status: 200,
        });
    } catch (err) {
        console.error('Session fetch error:', err);
        return new Response(JSON.stringify({ message: 'Server error' }), {
            status: 500,
        });
    }
}
