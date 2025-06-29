'use client';
import { useState, useEffect } from 'react';
import Spinner from '@/components/spinner/Spinner';
import { useSearchParams } from 'next/navigation';
import styles from './chatPage.module.css';
import Skeleton from "@/components/skeleton/Skeleton";
import useSpeechRecognition from "@/app/hooks/useSpeechRecognition";

export default function ChatPage() {
    const [input, setInput]           = useState('');
    const [chat, setChat]             = useState([]);
    const [skeletonLoading, setSkeletonLoading] = useState(true);
    const [loading, setLoading]       = useState(false);
    const [sessionId, setSessionId]   = useState(null);
    const searchParams                = useSearchParams();
    const { isRecording, toggleRecognition } = useSpeechRecognition((transcript) => {
        setInput(prev => prev + ' ' + transcript);
    });

    const renderWithLinks = (text) => {
        const urlRegex = /<?(https?:\/\/[^\s<>\"]+)>?/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = urlRegex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push(text.substring(lastIndex, match.index));
            }
            const url = match[1];
            parts.push(
                <a
                    key={url + match.index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                >
                    {url}
                </a>
            );
            lastIndex = match.index + match[0].length;
        }
        if (lastIndex < text.length) {
            parts.push(text.substring(lastIndex));
        }
        return parts;
    }

    useEffect(() => {
        setSkeletonLoading(true);
        const resumeSessionId = searchParams.get('resume');
        const minTime = new Promise(resolve => setTimeout(resolve, 500));
        if (resumeSessionId) {
            setSessionId(resumeSessionId);
            Promise.all([
                fetch(`/api/session-messages?sessionId=${resumeSessionId}`)
                    .then(res => res.json())
                    .then(data => setChat(data.messages || []))
                    .catch(() => setChat([])),
                minTime,
            ]).finally(() => setSkeletonLoading(false));
        } else {
            Promise.all([
                fetch('/api/start-session', { method: 'POST' })
                    .then(res => res.json())
                    .then(data => setSessionId(data.sessionId))
                    .catch(() => alert('something went wrong')),
                minTime,
            ]).finally(() => setSkeletonLoading(false));
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
        if (!input.trim()) return alert('write something 😊');
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
            let data, isJson = false;
            try {
                data = await res.clone().json();
                isJson = true;
            } catch {
                data = await res.text();
            }

            if (!res.ok) {
                alert((isJson && data?.message) ? data.message : data || 'Ошибка запроса');
                return;
            }

            const assistantMessage = isJson ? data.choices?.[0]?.message : null;
            if (assistantMessage) setChat([...newChat, assistantMessage]);
        } catch (err) {
            console.error(err);
            alert(err.message || 'Ошибка');
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className={styles.chatPage}>
            {skeletonLoading && <Skeleton type="chat" />}
            {!skeletonLoading && (
                <>
                    {chat.length === 0 && <h1 className={styles.header}>How may I assist you?</h1>}
                    <div className={styles.messages}>
                        {chat.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`${styles.bubble} ${msg.role === 'user' ? styles.user : styles.assistant}`}
                            >
                                {renderWithLinks(msg.content)}
                            </div>
                        ))}
                        {loading && <Spinner message="thinking…" />}
                    </div>
                    <div className={styles.inputArea}>
                        <div className={styles.inputWrapper}>
                            <input
                                className={styles.inputField}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Feel free to ask anything"
                                onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
                            />
                            <button className={styles.iconBtn} onClick={sendMessage}>➤</button>

                        </div>
                        <div className={styles.record}>
                            <button  className={`${styles.iconBtn} ${isRecording ? styles.recording : ''}`}
                                 onClick={toggleRecognition}>
                                🎤
                             </button>
                            {isRecording && <span className={styles.recordingText}>🎙️ speak...</span>}
                        </div>

                    </div>
                </>
            )}
        </div>
    );
}
