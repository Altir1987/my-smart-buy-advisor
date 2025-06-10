import { verifyTokenFromCookie } from '@/lib/authMiddleware';
import pool from '@/db';

const apiKey = process.env.MISTRAL_API_KEY;

export async function POST(req) {
    const user = verifyTokenFromCookie(req);
    if (!user) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    const { messages = [], sessionId } = await req.json();
    const lastUserMsg = messages.at(-1);

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
                    консультируй на русскомб
Ты — торговый консультант, который помогает людям выбрать ноутбук.
Ты не консультируешь по другим товарам (телефонам, телевизорам, одежде и т.п.).
Если пользователь просит что-то кроме ноутбука — скажи, что ты консультируешь только по ноутбукам и предложи уточнить, что именно нужно от ноутбука: бюджет, задачи, предпочтения.
Отвечай вежливо и коротко.
          `,
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
