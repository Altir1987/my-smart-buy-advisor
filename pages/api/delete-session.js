
import pool from '../../db';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.token;

    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { sessionId } = req.body;

        if (!sessionId) return res.status(400).json({ message: 'No sessionId provided' });

        const [sessionCheck] = await pool.query(
            'SELECT id FROM sessions WHERE id = ? AND user_id = ?',
            [sessionId, decoded.id]
        );

        if (sessionCheck.length === 0) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        await pool.query('DELETE FROM messages WHERE session_id = ?', [sessionId]);
        await pool.query('DELETE FROM sessions WHERE id = ?', [sessionId]);

        res.status(200).json({ message: 'Session deleted' });
    } catch (err) {
        console.error('🧹 Error deleting session:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
}
