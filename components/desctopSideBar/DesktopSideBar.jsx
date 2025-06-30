import styles from "@/components/desctopSideBar/decktopSideBar.module.css";
import Link from "next/link";
import IconSvgChat from "@/components/Icons/IconSvgChat";
import IconSvgHistory from "@/components/Icons/IconSvgHistory";
import IconSvgUsers from "@/components/Icons/IconSvgUsers";
import IconSvgLogout from "@/components/Icons/IconSvgLogout";

export default function DesktopSideBar ({user,pathname,handleLogout}) {
    return (
        <aside className={styles.sidebar}>
            <nav>
                <div className={styles.linkList}>
                    <Link
                        href="/chat"
                        className={`${styles.link} ${pathname === '/chat' ? styles.active : ''}`}
                    >
                        <IconSvgChat color={pathname === '/chat' ? '#4785F0' : 'black'}/>
                        Chat
                    </Link>
                    <Link
                        href="/history"
                        className={`${styles.link} ${pathname === '/history' ? styles.active : ''}`}
                    >
                        <IconSvgHistory color={pathname === '/history' ? '#4785F0' : 'black'} />
                        History
                    </Link>
                    {user?.user.is_admin === 1 && (
                        <Link
                            href="/users"
                            className={`${styles.link} ${pathname === '/users' ? styles.active : ''}`}
                        >
                            <IconSvgUsers color={pathname === '/users' ? '#4785F0' : 'black'} />
                            Users
                        </Link>
                    )}
                </div>
            </nav>
            {user && (
                <div className={styles.userPanel}>
                    <p className={styles.username}>{user.user.name}</p>
                    <button onClick={handleLogout} className={styles.logoutButton}>
                        <IconSvgLogout />
                        Logout
                    </button>
                </div>
            )}
        </aside>

    )
}