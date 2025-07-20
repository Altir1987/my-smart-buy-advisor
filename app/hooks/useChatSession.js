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
                    setChat([]);
                    setSessionId(null);
                }
            } catch (err) {
                setChat([]);
                setSessionId(null);
            } finally {
                setSkeletonLoading(false);
            }
        })();
        return () => {
        };
    }, [searchParams]);

    const sendMessage = useCallback(async (input, chat, setInput, setLoading) => {
        if (!input.trim()) return toast.error('write something 😊');
        setLoading(true);

        let actualSessionId = sessionId;
        if (!actualSessionId) {
            try {
                const data = await safeFetch('/api/start-session', { method: 'POST' });
                actualSessionId = data.sessionId;
                setSessionId(actualSessionId);
            } catch {
                setLoading(false);
                toast.error('error while sending session');
                return;
            }
        }

        const userMessage = { role: 'user', content: input };
        const newChat = [...chat, userMessage];
        setChat(newChat);
        setInput('');

        try {
            const cleanMessages = newChat.map(({ role, content }) => ({ role, content }));
            const data = await safeFetch('/api/ask-mistral', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: cleanMessages, sessionId: actualSessionId }),
            });
            const assistantMessage = data.choices?.[0]?.message;
            if (assistantMessage) setChat([...newChat, assistantMessage]);
        } catch {}
        setLoading(false);
    }, [sessionId, setChat, setSessionId]);

    return { chat, setChat, skeletonLoading, sessionId, sendMessage };
}
