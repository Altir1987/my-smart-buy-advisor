import pool from '@/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export async function POST(req) {
    try {
        const body = await req.json();
        const { email, password } = body;

        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return new Response(JSON.stringify({ message: 'Invalid credentials' }), {
                status: 401,
            });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name, is_admin: user.is_admin },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return new Response(JSON.stringify({ user: { id: user.id, name: user.name, email: user.email } }), {
            status: 200,
            headers: {
                'Set-Cookie': cookie.serialize('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 60 * 60 * 24 * 7,
                    path: '/',
                }),
                'Content-Type': 'application/json',
            },
        });
    } catch (err) {
        console.error('Login error:', err);
        return new Response(JSON.stringify({ message: 'Server error' }), {
            status: 500,
        });
    }
}
