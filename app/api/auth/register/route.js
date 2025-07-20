import pool from '@/db';
import bcrypt from 'bcryptjs';
import * as yup from 'yup';

const registerSchema = yup.object().shape({
    name: yup.string().min(2).required(),
    email: yup.string().email().required(),
    password: yup.string().min(6).required(),
});

export async function POST(req) {
    try {
        const body = await req.json();

        try {
            await registerSchema.validate(body, { abortEarly: false });
        } catch (validationError) {
            return new Response(JSON.stringify({
                message: 'Validation failed',
                errors: validationError.errors,
            }), { status: 400 });
        }

        const { name, email, password } = body;

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
