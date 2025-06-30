
import styles from '@/components/mobileHeader/mobileHeader.module.css'
import {useState} from "react";
import Link from "next/link";
import IconSvgChat from "@/components/Icons/IconSvgChat";
import IconSvgHistory from "@/components/Icons/IconSvgHistory";
import IconSvgUsers from "@/components/Icons/IconSvgUsers";
import IconSvgVector from "@/components/Icons/IconSvgVector";
import IconSvgLogout from "@/components/Icons/IconSvgLogout";
import {useEffect} from "react";
import { useRef } from "react";


export default function MobileHeader({user,pathname, handleLogout}) {
    const [isModal,setModal] = useState(false);
    const toggleModal = () => {
        setModal(!isModal);
    }
    const modalRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setModal(false);
            }
        };

        if (isModal) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isModal]);
    const routeTitles = {
        '/chat': 'Chat',
        '/history': 'History',
        '/users': 'Users',
    };
    const pageName = routeTitles[pathname] || '';
    return (
        <header className={styles.header}>
            <span className={styles.pageName}>
                {pageName}
            </span>
            <button type={"button"} onClick={toggleModal} className={styles.buttonModal}>
                <IconSvgVector/>
            </button>
            {isModal && (
                <div className={styles.modal} ref={modalRef}>
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
                        <div className={styles.buttonWrapper}>
                            <button onClick={handleLogout} className={styles.logoutButton}>
                                <IconSvgLogout />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}