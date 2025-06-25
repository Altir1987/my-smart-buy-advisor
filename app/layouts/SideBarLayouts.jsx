'use client'
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from 'app/layouts/SideBarLayout.module.css';
import IconSvgChat from '/components/Icons/IconSvgChat';
import IconSvgHistory from '@/components/Icons/IconSvgHistory';
import IconSvgUsers from '@/components/Icons/IconSvgUsers';
import IconSvgLogout from '@/components/Icons/IconSvgLogout';
import { useUser } from '/app/context/UseContext';
import {useIsMobile} from "@/app/hook/useMobile";

export default function SidebarLayout({ children }) {
    const pathname = usePathname();
    const isMobile = useIsMobile(780)
    const { user } = useUser();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login';
    };

    const toggleMenu = () => setMenuOpen((open) => !open);

    return (
        <div className={styles.wrapper}>
            {isMobile && menuOpen && (
                <div className={styles.overlay} onClick={toggleMenu} />
            )}

            <aside className={`${styles.sidebar} ${isMobile ? styles.mobileSidebar : ''} ${isMobile && menuOpen ? styles.open : ''}`}>
                <nav>
                    {isMobile && (
                        <button className={styles.menuToggle} onClick={toggleMenu}>
                            ☰
                        </button>
                    )}
                    <div className={styles.linkList}>
                        <Link
                            href="/chat"
                            className={`${styles.link} ${pathname === '/chat' ? styles.active : ''}`}
                            onClick={() => isMobile && setMenuOpen(false)}
                        >
                            <IconSvgChat color={pathname === '/chat' ? '#4785F0' : 'black'} />
                            Chat
                        </Link>
                        <Link
                            href="/history"
                            className={`${styles.link} ${pathname === '/history' ? styles.active : ''}`}
                            onClick={() => isMobile && setMenuOpen(false)}
                        >
                            <IconSvgHistory color={pathname === '/history' ? '#4785F0' : 'black'} />
                            History
                        </Link>
                        {user?.is_admin === 1 && (
                            <Link
                                href="/users"
                                className={`${styles.link} ${pathname === '/users' ? styles.active : ''}`}
                                onClick={() => isMobile && setMenuOpen(false)}
                            >
                                <IconSvgUsers color={pathname === '/users' ? '#4785F0' : 'black'} />
                                Users
                            </Link>
                        )}
                    </div>
                </nav>
                {user && (
                    <div className={styles.userPanel}>
                        <p className={styles.username}>{user.name}</p>
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
