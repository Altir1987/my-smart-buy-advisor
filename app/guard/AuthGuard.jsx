'use client';
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "/app/context/UseContext";

export default function AuthGuard({ children }) {
    const { user, loading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/login");
        }
    }, [loading, user, router]);
    return children;
}