'use client';
import { useState } from "react";
import { safeFetch } from "@/app/hooks/useSafeFetch";

export function useLogin(setUser) {
    const [loading, setLoading] = useState(false);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const data = await safeFetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            setUser(data.user);
            return true;
        } catch {
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { login, loading };
}
