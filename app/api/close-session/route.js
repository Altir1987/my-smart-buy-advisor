import pool from '@/db';
import * as yup from 'yup';

const schema = yup.object().shape({
    sessionId: yup.number().integer().positive().required(),
});

export async function POST(req) {
    try {
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

        await pool.query('UPDATE sessions SET is_closed = TRUE WHERE id = ?', [sessionId]);

        return new Response(JSON.stringify({ message: 'Session closed' }), {
            status: 200,
        });
    } catch (error) {
        console.error('Close session error:', error);
        return new Response(JSON.stringify({ message: 'Internal server error' }), {
            status: 500,
        });
    }
}
