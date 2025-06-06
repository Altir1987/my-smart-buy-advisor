import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export default function handler(req, res) {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.token;

    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return res.status(200).json({ user: { name: decoded.name, email: decoded.email , is_admin: decoded.is_admin} });
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}