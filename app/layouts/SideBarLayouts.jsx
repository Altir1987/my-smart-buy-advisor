'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from 'app/layouts/SideBarLayout.module.css'
import IconSvgChat from '/components/Icons/IconSvgChat'
import IconSvgHistory from "@/components/Icons/IconSvgHistory";
import IconSvgUsers from "@/components/Icons/IconSvgUsers";
import IconSvgLogout from "@/components/Icons/IconSvgLogout";
import { useUser } from "/app/context/UseContext"


export default function SidebarLayout({ children }) {
    const pathname = usePathname();
    const { user } = useUser();
    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login';
    };

    return (
        <div className={styles.wrapper}>
            <aside className={styles.sidebar}>
                <nav>
                    <Link
                        href="/chat"
                        className={`${styles.link} ${pathname === '/chat' ? styles.active : ''}`}
                    >
                        <IconSvgChat color={pathname === '/chat' ? '#4785F0' : 'black'} />
                        Chat
                    </Link>

                    <Link
                        href="/history"
                        className={`${styles.link} ${pathname === '/history' ? styles.active : ''}`}
                    >
                        <IconSvgHistory color={pathname === '/history' ? '#4785F0' : 'black'}/>
                        History
                    </Link>
                    {user?.is_admin && (
                        <Link
                            href="/users"
                            className={`${styles.link} ${pathname === '/users' ? styles.active : ''}`}
                        >
                            <IconSvgUsers color={pathname === '/users' ? '#4785F0' : 'black'}/>
                            Users
                        </Link>
                    )}
                </nav>

                {user && (
                    <div className={styles.userPanel}>
                        <p className={styles.username}> {user.name}</p>
                        <button onClick={handleLogout} className={styles.logoutButton}>
                            <IconSvgLogout />
                            Logout
                        </button>
                    </div>
                )}
            </aside>

            <main className={styles.main}>{children}</main>
        </div>
    );
}
