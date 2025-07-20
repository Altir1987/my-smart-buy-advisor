import * as yup from 'yup';
import { verifyTokenFromCookie } from '@/lib/authMiddleware';
import pool from '@/db';

const apiKey = process.env.MISTRAL_API_KEY;

const schema = yup.object().shape({
    sessionId: yup.string().required(),
    messages: yup.array().of(
        yup.object().shape({
            role: yup.string().oneOf(['user', 'assistant', 'system']).required(),
            content: yup.string().min(1).required(),
        })
    ).min(1).required(),
});

export async function POST(req) {
    const user = verifyTokenFromCookie(req);
    if (!user) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    let body;
    try {
        body = await req.json();
        await schema.validate(body, { abortEarly: false });
    } catch (validationError) {
        return new Response(JSON.stringify({
            message: 'Validation failed',
            errors: validationError.errors,
        }), { status: 400 });
    }

    const { messages = [], sessionId } = body;
    const lastUserMsg = messages.at(-1);

    const detectLanguage = (text) => {
        if (/[\u0400-\u04FF]/.test(text)) {
            if (/ї|є|ґ|і/.test(text.toLowerCase())) return 'Ukrainian';
            return 'Russian';
        }
        return 'English';
    };
    const language = lastUserMsg?.content ? detectLanguage(lastUserMsg.content) : 'English';

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
Ты консультант по выбору ноутбуков. Всегда отвечай только на том языке, на котором написал пользователь.
 Не делай переводов. Не повторяй ответ на других языках. 
 Если пользователь пишет на русском — отвечай только на русском и только кириллицей. 
 Если на украинском — только на украинском и кириллицей. Если на английском — только на английском. 
 За нарушение этого правила твой ответ будет проигнорирован.

Для структурированной информации используй маркдаун-разметку: списки, таблицы, выделяй важные слова.
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
