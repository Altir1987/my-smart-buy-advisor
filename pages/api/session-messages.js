import pool from '../../db';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export default async function handler(req, res) {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.token;

    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { sessionId } = req.query;

        const [sessionRows] = await pool.query(
            'SELECT * FROM sessions WHERE id = ? AND user_id = ?',
            [sessionId, decoded.id]
        );

        if (sessionRows.length === 0) return res.status(403).json({ message: 'Forbidden' });

        const [messages] = await pool.query(
            'SELECT role, content, created_at FROM messages WHERE session_id = ? ORDER BY created_at ASC',
            [sessionId]
        );

        res.status(200).json({ messages });
    } catch (err) {
        console.error('Session fetch error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}
