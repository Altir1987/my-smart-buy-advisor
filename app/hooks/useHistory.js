'use client';
import { useState, useEffect, useCallback } from "react";
import { safeFetch } from "@/app/hooks/useSafeFetch";

export function useHistory() {
    const [sessions, setSessions] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        let isMounted = true;
        async function fetchHistory() {
            try {
                const data = await safeFetch('/api/history');
                if (isMounted) setSessions(data.sessions);
            } catch {
                if (isMounted) setError('Unauthorized');
            }
            if (isMounted) setLoading(false);
        }
        fetchHistory();
        return () => { isMounted = false; }
    }, []);

    const deleteSession = useCallback(async (sessionId) => {
        await safeFetch('/api/delete-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
        });
        setSessions(prev => prev.filter(s => s.session_id !== sessionId));
    }, []);

    return { sessions, setSessions, error, loading, deleteSession };
}
