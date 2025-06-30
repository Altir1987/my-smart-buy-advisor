import pool from '@/db';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export async function POST(req) {
    try {
        const cookies = cookie.parse(req.headers.get('cookie') || '');
        const token = cookies.token;

        if (!token) {
            return new Response(JSON.stringify({ message: 'Unauthorized' }), {
                status: 401,
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { sessionId } = await req.json();

        if (!sessionId) {
            return new Response(JSON.stringify({ message: 'No sessionId provided' }), {
                status: 400,
            });
        }

        const [sessionCheck] = await pool.query(
            'SELECT id FROM sessions WHERE id = ? AND user_id = ?',
            [sessionId, decoded.id]
        );

        if (sessionCheck.length === 0) {
            return new Response(JSON.stringify({ message: 'Forbidden' }), {
                status: 403,
            });
        }

        await pool.query('DELETE FROM messages WHERE session_id = ?', [sessionId]);
        await pool.query('DELETE FROM sessions WHERE id = ?', [sessionId]);

        return new Response(JSON.stringify({ message: 'Session deleted' }), {
            status: 200,
        });
    } catch (err) {
        console.error('🧹 Error deleting session:', err);
        return new Response(JSON.stringify({ message: 'Internal server error' }), {
            status: 500,
        });
    }
}
