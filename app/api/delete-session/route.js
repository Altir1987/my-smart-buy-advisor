import pool from '@/db';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import * as yup from 'yup';

const schema = yup.object().shape({
    sessionId: yup.number().integer().positive().required(),
});

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
        const body = await req.json();

        try {
            await schema.validate(body, { abortEarly: false });
        } catch (validationError) {
            return new Response(JSON.stringify({
                message: 'Validation failed',
                errors: validationError.errors,
            }), { status: 400 });
        }

        const { sessionId } = body;

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
