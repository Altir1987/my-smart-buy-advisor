import { verifyTokenFromCookie } from '@/lib/authMiddleware';
import pool from '@/db';

const apiKey = process.env.MISTRAL_API_KEY;

export async function POST(req) {
    const user = verifyTokenFromCookie(req);
    if (!user) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }
    const detectLanguage = (text) => {
        if (/[\u0400-\u04FF]/.test(text)) {
            if (/ї|є|ґ|і/.test(text.toLowerCase())) return 'Ukrainian';
            return 'Russian';
        }
        return 'English';
    };

    const { messages = [], sessionId } = await req.json();
    const lastUserMsg = messages.at(-1);
    const language = lastUserMsg?.content ? detectLanguage(lastUserMsg.content) : 'English';

    if (!sessionId) {
        return new Response(JSON.stringify({ message: 'Missing sessionId' }), { status: 400 });
    }
    if (lastUserMsg?.role === 'user') {
        await pool.query(
            'INSERT INTO messages (user_id, session_id, role, content) VALUES (?, ?, ?, ?)',
            [user.id, sessionId, 'user', lastUserMsg.content]
        );
    }
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'mistral-small',
            messages: [
                {
                    role: 'system',
                    content: `
You are a sales consultant who helps people choose a laptop.

You only respond in the same language the user used — without translations or duplicates.

Use Cyrillic letters when replying in Russian or Ukrainian.

Do not add English translations if the user's message was not in English.

If the user writes in Russian, respond only in Russian using Cyrillic.

If the user writes in Ukrainian, respond only in Ukrainian using Cyrillic.

If the user writes in English, respond in English.

Be polite and brief. Do not repeat the same message in multiple languages.
`.trim()
                },
                ...messages,
            ],
        }),
    });

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message;
    if (assistantMessage) {
        await pool.query(
            'INSERT INTO messages (user_id, session_id, role, content) VALUES (?, ?, ?, ?)',
            [user.id, sessionId, 'assistant', assistantMessage.content]
        );
    }

    return Response.json(data);
}
