'use client';
import { toast } from 'sonner';

export async function safeFetch(url, options = {}) {
    try {
        const res = await fetch(url, options);
        let data;
        try {
            data = await res.json();
        } catch {
            data = { message: await res.text() };
        }
        if (!res.ok) {
            toast.error(data.message || `request error (code ${res.status})`);
            throw new Error(data.message || `request error (code ${res.status})`);
        }
        return data;
    } catch (err) {
        toast.error(err.message || 'Network/server error!');
        throw err;
    }
}
