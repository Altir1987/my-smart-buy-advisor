import pool   from '@/db';
import jwt    from 'jsonwebtoken';
import cookie from 'cookie';

export async function GET(req) {
    const { token = '' } = cookie.parse(req.headers.get('cookie') || '');
    if (!token) {
        return new Response(JSON.stringify({ message: 'Unauthorized: no token' }), { status: 401 });
    }
    const url    = new URL(req.url);
    const limit  = parseInt(url.searchParams.get('limit'))  || 5;
    const offset = parseInt(url.searchParams.get('offset')) || 0;

    try {
        const { id: userId } = jwt.verify(token, process.env.JWT_SECRET);
        const [rows] = await pool.query(
            `
                SELECT
                    s.id           AS session_id,
                    s.started_at,
                    s.is_closed,
                    m.role,
                    m.content,
                    m.created_at
                FROM (
                         SELECT s.id, s.started_at, s.is_closed
                         FROM sessions s
                         WHERE s.user_id = ?
                           AND EXISTS (SELECT 1 FROM messages m2 WHERE m2.session_id = s.id)
                         ORDER BY s.started_at DESC
                             LIMIT ? OFFSET ?
                     ) AS s
                         JOIN messages m ON m.session_id = s.id
                ORDER BY s.started_at DESC, m.created_at ASC
            `,
            [userId, limit, offset]
        );
        const map = new Map();
        for (const r of rows) {
            if (!map.has(r.session_id)) {
                map.set(r.session_id, {
                    session_id : r.session_id,
                    started_at : r.started_at,
                    is_closed  : r.is_closed,
                    messages   : [],
                });
            }
            map.get(r.session_id).messages.push({
                role       : r.role,
                content    : r.content,
                created_at : r.created_at,
            });
        }

        const sessions = Array.from(map.values());

        return new Response(JSON.stringify({ sessions }), { status: 200 });
    } catch (e) {
        console.error('JWT error:', e.message);
        return new Response(JSON.stringify({ message: 'Invalid token' }), { status: 401 });
    }
}
