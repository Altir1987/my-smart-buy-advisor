'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/spinner/Spinner';

export default function AdminGuard({ children }) {
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function checkAdmin() {
            try {
                const res = await fetch('/api/auth/currentUser');
                if (res.ok) {
                    const data = await res.json();
                    if (data.user?.is_admin) {
                        setAuthorized(true);
                    } else {
                        router.replace('/chat');
                    }
                } else {
                    router.replace('/login');
                }
            } catch (err) {
                console.error('Admin check failed:', err);
                router.replace('/login');
            } finally {
                setLoading(false);
            }
        }

        checkAdmin();
    }, [router]);

    if (loading) return <Spinner message="Проверка прав администратора..." />;
    return authorized ? children : null;
}
