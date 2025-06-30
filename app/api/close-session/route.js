import pool from '@/db';

export async function POST(req) {
    try {
        const { sessionId } = await req.json();

        if (!sessionId) {
            return new Response(JSON.stringify({ message: 'No sessionId provided' }), {
                status: 400,
            });
        }

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
