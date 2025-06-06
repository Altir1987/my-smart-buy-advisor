'use client'
import { useState , useEffect} from 'react';
import Spinner from '@/components/spinner/Spinner';
import { useSearchParams } from 'next/navigation';

export default function ChatPage() {
    const [input, setInput] = useState('');
    const [chat, setChat] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const searchParams = useSearchParams();
    useEffect(() => {
        const resumeSessionId = searchParams.get('resume');

        if (resumeSessionId) {
            setSessionId(resumeSessionId);

            // ⬇️ подгружаем историю сообщений
            fetch(`/api/session-messages?sessionId=${resumeSessionId}`)
                .then(res => res.json())
                .then(data => setChat(data.messages || []))
                .catch(() => setChat([]));
        } else {
            fetch('/api/start-session', { method: 'POST' })
                .then(res => res.json())
                .then(data => setSessionId(data.sessionId))
                .catch(() => alert('Не удалось создать сессию'));
        }

        return () => {
            if (!resumeSessionId && sessionId) {
                fetch('/api/close-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId }),
                });
            }
        };
    }, [searchParams]);


    const sendMessage = async () => {
        if (!input.trim()) {
            alert('write something!');
            return;
        }
        const userMessage = { role: 'user', content: input };
        const newChat = [...chat, userMessage];
        setChat(newChat);
        setInput('');
        setLoading(true);
        try {
            const cleanMessages = newChat.map(({ role, content }) => ({ role, content }));
            const res = await fetch('/api/ask-mistral', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json',},
                body: JSON.stringify({ messages: cleanMessages ,sessionId}),
            });

            const data = await res.json();
            const assistantMessage = data.choices?.[0]?.message;
            if (assistantMessage) {
                setChat([...newChat, assistantMessage]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
            <div style={{ marginBottom: 20 }}>
                {chat.map((msg, idx) => (
                    <div key={idx} style={{ margin: '10px 0' }}>
                        <strong>{msg.role}:</strong> {msg.content}
                    </div>
                ))}
                {loading && (
                        <Spinner message="thinking..." />
                )
                }
            </div>

            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="write, what you want in your lap top..."
                style={{ width: '100%', padding: 10, marginBottom: 10 }}
            />

            <button onClick={sendMessage} style={{ padding: '10px 20px' }}>
                Отправить
            </button>
        </div>
    );
}
