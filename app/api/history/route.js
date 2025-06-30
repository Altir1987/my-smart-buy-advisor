import pool from '@/db';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export async function GET(req) {
    const cookies = cookie.parse(req.headers.get('cookie') || '');
    const token = cookies.token;

    if (!token) {
        return new Response(JSON.stringify({ message: 'Unauthorized: no token' }), {
            status: 401,
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const [rows] = await pool.query(`
      SELECT
        s.id AS session_id,
        s.started_at,
        s.is_closed,
        m.role,
        m.content,
        m.created_at
      FROM sessions s
      JOIN messages m ON m.session_id = s.id
      WHERE s.user_id = ?
      ORDER BY s.started_at DESC, m.created_at ASC
    `, [decoded.id]);

        const sessionsMap = new Map();

        for (const row of rows) {
            const sessionId = row.session_id;
            if (!sessionsMap.has(sessionId)) {
                sessionsMap.set(sessionId, {
                    session_id: sessionId,
                    started_at: row.started_at,
                    is_closed: row.is_closed,
                    messages: [],
                });
            }

            sessionsMap.get(sessionId).messages.push({
                role: row.role,
                content: row.content,
                created_at: row.created_at,
            });
        }

        const sessions = Array.from(sessionsMap.values());

        return new Response(JSON.stringify({ sessions }), {
            status: 200,
        });
    } catch (err) {
        console.error('❌ JWT error:', err.message);
        return new Response(JSON.stringify({ message: 'Invalid token' }), {
            status: 401,
        });
    }
}
