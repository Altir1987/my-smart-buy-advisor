import pool from '../../db';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export default async function handler(req, res) {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.email !== 'kiseof@gmail.com') return res.status(403).json({ message: 'Forbidden' });

        const [users] = await pool.query('SELECT id, name, email, created_at FROM users ORDER BY id DESC');
        return res.status(200).json({ users });
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}
