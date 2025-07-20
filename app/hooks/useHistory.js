'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { safeFetch } from '@/app/hooks/useSafeFetch';

const PAGE_SIZE = 5;

export function useHistory() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [loadingMore, setMore]  = useState(false);
    const [error, setError]       = useState('');
    const [offset, setOffset]     = useState(0);
    const [hasMore, setHasMore]   = useState(true);

    const loadingRef = useRef(false);
    useEffect(() => { loadPage(); }, []);

    const loadPage = async () => {
        if (!hasMore || loadingRef.current) return;
        loadingRef.current = true;

        const isFirst = offset === 0;
        isFirst ? setLoading(true) : setMore(true);

        try {
            const data = await safeFetch(`/api/history?limit=${PAGE_SIZE}&offset=${offset}`);
            setSessions(prev => {
                const ids   = new Set(prev.map(s => s.session_id));
                const uniq  = data.sessions.filter(s => !ids.has(s.session_id));
                return [...prev, ...uniq];
            });

            setOffset(prev => prev + data.sessions.length);
            if (data.sessions.length < PAGE_SIZE) setHasMore(false);
        } catch {
            setError('Unauthorized');
        } finally {
            loadingRef.current = false;
            isFirst ? setLoading(false) : setMore(false);
        }
    };

    const fetchMore = useCallback(() => {
        if (hasMore && !loadingRef.current) loadPage();
    }, [hasMore, loadPage]);

    const deleteSession = useCallback(async (sessionId) => {
        await safeFetch('/api/delete-session', {
            method : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body   : JSON.stringify({ sessionId }),
        });
        setSessions(prev => prev.filter(s => s.session_id !== sessionId));
    }, []);

    return { sessions, error, loading, loadingMore, hasMore, fetchMore, deleteSession };
}
