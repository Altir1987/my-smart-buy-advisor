import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import Spinner from '@/components/spinner/Spinner';
import styles from '@/app/chat/chatPage.module.css';
import Skeleton from '@/components/skeleton/Skeleton';
import useSpeechRecognition from '@/app/hooks/useSpeechRecognition';
import { safeFetch } from '@/app/hooks/useSafeFetch';


export default function ChatPage() {
    const [input, setInput]           = useState('');
    const [chat, setChat]             = useState([]);
    const [skeletonLoading, setSkeletonLoading] = useState(true);
    const [loading, setLoading]       = useState(false);
    const [sessionId, setSessionId]   = useState(null);
    const searchParams                = useSearchParams();
    const [language, setLanguage] = useState(() => localStorage.getItem('chatLanguage') || 'en-US');
    const { isRecording, toggleRecognition } = useSpeechRecognition((transcript) => {
        setInput(prev => prev + ' ' + transcript);
    }, language);
    useEffect(() => {
        localStorage.setItem('chatLanguage', language);
    }, [language])

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
        (async () => {
            try {
                if (resumeSessionId) {
                    setSessionId(resumeSessionId);
                    const [data] = await Promise.all([
                        safeFetch(`/api/session-messages?sessionId=${resumeSessionId}`),
                        minTime,
                    ]);
                    setChat(data.messages || []);
                } else {
                    const [data] = await Promise.all([
                        safeFetch('/api/start-session', { method: 'POST' }),
                        minTime,
                    ]);
                    setSessionId(data.sessionId);
                }
            } catch (err) {
                setChat([]);
            } finally {
                setSkeletonLoading(false);
            }
        })();

        return () => {
            if (!resumeSessionId && sessionId) {
                safeFetch('/api/close-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId }),
                }).catch(() => {});
            }
        };
    }, [searchParams]);
    const sendMessage = async () => {
        if (!input.trim()) return toast.error('write something 😊');
        const userMessage = { role: 'user', content: input };
        const newChat = [...chat, userMessage];
        setChat(newChat);
        setInput('');
        setLoading(true);

        try {
            const cleanMessages = newChat.map(({ role, content }) => ({ role, content }));
            const data = await safeFetch('/api/ask-mistral', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: cleanMessages, sessionId }),
            });
            const assistantMessage = data.choices?.[0]?.message;
            if (assistantMessage) setChat([...newChat, assistantMessage]);
        } catch {}
        setLoading(false);
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
                                {msg.role === 'assistant'
                                    ? <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    : renderWithLinks(msg.content)
                                }
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
                            {
                                !isRecording &&
                                <div className={styles.languageSelect}>
                                    <select
                                        id="lang"
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                    >
                                        <option value="en-US">Eng</option>
                                        <option value="uk-UA">Ua</option>
                                        <option value="ru-RU">Ru</option>
                                    </select>
                                </div>
                            }

                            {isRecording && <span className={styles.recordingText}>🎙️ speak...</span>}
                        </div>

                    </div>
                </>
            )}
        </div>
    );
}
