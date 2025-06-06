import pool from '../../db';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export default async function handler(req, res) {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.token;

    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [result] = await pool.query('INSERT INTO sessions (user_id) VALUES (?)', [decoded.id]);

        res.status(200).json({ sessionId: result.insertId });
    } catch {
        res.status(401).json({ message: 'Invalid token' });
    }
}
