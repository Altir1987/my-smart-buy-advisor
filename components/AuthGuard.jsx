'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/spinner/Spinner';

export default function AuthGuard({ children }) {
    const [checking, setChecking] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function check() {
            try {
                const res = await fetch('/api/auth/currentUser');
                if (res.ok) {
                    setAuthorized(true);
                } else {
                    router.replace('/login');
                }
            } catch {
                router.replace('/login');
            } finally {
                setChecking(false);
            }
        }

        check();
    }, [router]);

    if (checking) return <Spinner message="checking authorization..." />;

    return authorized ? children : null;
}
