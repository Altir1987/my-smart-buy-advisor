'use client';
import { useState, useEffect } from 'react';
import Spinner from '@/components/spinner/Spinner';
import { useSearchParams } from 'next/navigation';
import styles from './ChatPage.module.css';      // ⬅️ главное нововведение

export default function ChatPage() {
    const [input, setInput]           = useState('');
    const [chat, setChat]             = useState([]);
    const [loading, setLoading]       = useState(false);
    const [sessionId, setSessionId]   = useState(null);
    const searchParams                = useSearchParams();
    useEffect(() => {
        const resumeSessionId = searchParams.get('resume');

        if (resumeSessionId) {
            setSessionId(resumeSessionId);
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
        if (!input.trim()) return alert('Напишите что-нибудь 😊');

        const userMessage = { role: 'user', content: input };
        const newChat     = [...chat, userMessage];
        setChat(newChat);
        setInput('');
        setLoading(true);

        try {
            const cleanMessages = newChat.map(({ role, content }) => ({ role, content }));
            const res  = await fetch('/api/ask-mistral', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ messages: cleanMessages, sessionId }),
            });
            const data = await res.json();
            const assistantMessage = data.choices?.[0]?.message;
            if (assistantMessage) setChat([...newChat, assistantMessage]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.chatPage}>
            {chat.length === 0 && <h1 className={styles.header}>How may I assist you?</h1>}
            <div className={styles.messages}>
                {chat.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`${styles.bubble} ${msg.role === 'user' ? styles.user : styles.assistant}`}
                    >
                        {msg.content}
                    </div>
                ))}
                {loading && <Spinner message="thinking…" />}
            </div>

            <div className={styles.inputArea}>
                <input
                    className={styles.inputField}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Feel free to ask anything"
                    onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
                />
                <button className={styles.iconBtn} onClick={sendMessage}>➤</button>
            </div>
        </div>
    );
}
