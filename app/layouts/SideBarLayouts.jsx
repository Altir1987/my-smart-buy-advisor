'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from 'app/layouts/SideBarLayout.module.css';
import IconSvgChat from '/components/Icons/IconSvgChat';
import IconSvgHistory from '@/components/Icons/IconSvgHistory';
import IconSvgUsers from '@/components/Icons/IconSvgUsers';
import IconSvgLogout from '@/components/Icons/IconSvgLogout';
import { useUser } from '/app/context/UseContext';

export default function SidebarLayout({ children }) {
    const pathname = usePathname();
    const { user } = useUser();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login';
    };

    const toggleMenu = () => setMenuOpen((p) => !p);

    return (
        <div className={styles.wrapper}>
            <aside className={styles.sidebar}>
                <nav className={styles.nav}>
                    {user && (
                        <div className={styles.userPanelMobile}>
                            <span className={styles.username}>{user.name}</span>
                            <button onClick={toggleMenu} className={styles.menuToggle}>
                                ☰
                            </button>
                        </div>
                    )}

                    <div
                        className={`${styles.menuContent} ${
                            menuOpen ? styles.open : ''
                        }`}
                    >
                        <div className={styles.linkWrapper}>
                            <div className={styles.linkContainer}>
                                <Link
                                    href="/chat"
                                    className={`${styles.link} ${
                                        pathname === '/chat' ? styles.active : ''
                                    }`}
                                >
                                    <IconSvgChat
                                        color={pathname === '/chat' ? '#4785F0' : 'black'}
                                    />
                                    <span>Chat</span>
                                </Link>
                            </div>
                            <div className={styles.linkContainer}>
                                <Link
                                    href="/history"
                                    className={`${styles.link} ${
                                        pathname === '/history' ? styles.active : ''
                                    }`}
                                >
                                    <IconSvgHistory
                                        color={pathname === '/history' ? '#4785F0' : 'black'}
                                    />
                                    <span>History</span>
                                </Link>
                            </div>
                                {user?.is_admin === 1 && (
                                    <div className={styles.linkContainer}>
                                        <Link
                                        href="/users"
                                        className={`${styles.link} ${
                                            pathname === '/users' ? styles.active : ''
                                        }`}
                                    >
                                        <IconSvgUsers
                                            color={pathname === '/users' ? '#4785F0' : 'black'}
                                        />
                                        <span>Users</span>
                                    </Link>
                                    </div>

                            )}
                        </div>
                        <div className={styles.mobileLogOut}>
                            {user && (
                                <button onClick={handleLogout} className={styles.logoutButton}>
                                    <IconSvgLogout/>
                                    <span>Logout</span>
                                </button>
                            )}
                        </div>

                    </div>
                    {user && (
                        <div className={styles.userPanel}>
                            <span className={styles.username}>{user.name}</span>
                            <button onClick={handleLogout} className={styles.logoutButton}>
                                <IconSvgLogout />
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </nav>
            </aside>

            <main className={styles.main}>{children}</main>
        </div>
    );
}
