'use client';
import { useState } from "react";
import { safeFetch } from "@/app/hooks/useSafeFetch";

export function useRegister(setUser) {
    const [loading, setLoading] = useState(false);

    const register = async (name, email, password) => {
        setLoading(true);
        try {
            await safeFetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });
            const loginData = await safeFetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            setUser(loginData.user);
            return true;
        } catch {
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { register, loading };
}
