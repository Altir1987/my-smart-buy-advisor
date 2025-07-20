import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import Spinner from '@/components/spinner/Spinner';
import styles from '@/app/chat/chatPage.module.css';
import Skeleton from '@/components/skeleton/Skeleton';
import useSpeechRecognition from '@/app/hooks/useSpeechRecognition';
import { useChatSession } from "@/app/hooks/useChatSession";
import { renderWithLinks } from '@/app/utils/renderWithLinks';

export default function ChatPage() {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const [language, setLanguage] = useState(() => localStorage.getItem('chatLanguage') || 'en-US');
    const { isRecording, toggleRecognition } = useSpeechRecognition((transcript) => {
        setInput(prev => prev + ' ' + transcript);
    }, language);

    useEffect(() => {
        localStorage.setItem('chatLanguage', language);
    }, [language]);

    const { chat, skeletonLoading, sendMessage } = useChatSession(searchParams);


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
                                    : renderWithLinks(msg.content,styles.link)
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
                                onKeyDown={e => { if (e.key === 'Enter') sendMessage(input, chat, setInput, setLoading); }}
                                disabled={loading}
                            />
                            <button
                                className={styles.iconBtn}
                                onClick={() => sendMessage(input, chat, setInput, setLoading)}
                                disabled={loading}
                            >➤</button>
                        </div>
                        <div className={styles.record}>
                            <button
                                className={`${styles.iconBtn} ${isRecording ? styles.recording : ''}`}
                                onClick={toggleRecognition}
                                disabled={loading}
                            >🎤</button>
                            {!isRecording && (
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
                            )}
                            {isRecording && <span className={styles.recordingText}>🎙️ speak...</span>}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
