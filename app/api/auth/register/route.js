import pool from '@/db';
import bcrypt from 'bcryptjs';

export async function POST(req) {
    try {
        const body = await req.json();
        const { name, email, password } = body;

        if (!name || !email || !password) {
            return new Response(JSON.stringify({ message: 'Missing fields' }), {
                status: 400,
            });
        }

        const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (rows.length > 0) {
            return new Response(JSON.stringify({ message: 'Email already in use' }), {
                status: 400,
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );

        return new Response(JSON.stringify({ message: 'User registered successfully' }), {
            status: 201,
        });
    } catch (err) {
        console.error('Registration error:', err);
        return new Response(JSON.stringify({ message: 'Server error' }), {
            status: 500,
        });
    }
}
