'use client';
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "/app/context/UseContext";
import Spinner from "@/components/spinner/Spinner";

export default function AuthGuard({ children }) {
    const { user, loading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/login");
        }
    }, [loading, user, router]);

    if (loading) return <Spinner message="loading..." />;
    if (!user) return <Spinner message="redirecting..." />

    return children;
}