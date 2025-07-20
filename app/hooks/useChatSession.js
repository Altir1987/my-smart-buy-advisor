'use client';
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { safeFetch } from "@/app/hooks/useSafeFetch";

export function useChatSession(searchParams) {
    const [chat, setChat] = useState([]);
    const [skeletonLoading, setSkeletonLoading] = useState(true);
    const [sessionId, setSessionId] = useState(null);

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

    const sendMessage = useCallback(async (input, chat, setInput, setLoading) => {
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
    }, [sessionId, setChat]);

    return { chat, setChat, skeletonLoading, sessionId, sendMessage };
}
