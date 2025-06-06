import pool from '../../db';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ message: 'No sessionId provided' });
        }

        await pool.query('UPDATE sessions SET is_closed = TRUE WHERE id = ?', [sessionId]);
        return res.status(200).json({ message: 'Session closed' });
    } catch (error) {
        console.error('error', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
