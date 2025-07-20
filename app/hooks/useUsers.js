'use client';
import { useEffect, useState } from 'react';
import { safeFetch } from '@/app/hooks/useSafeFetch';

export function useUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const data = await safeFetch('/api/users');
                setUsers(data.users);
            } catch (err) {
                setUsers([]);
            } finally {
                setLoading(false);
            }
        }
        fetchUsers();
    }, []);

    return { users, loading };
}