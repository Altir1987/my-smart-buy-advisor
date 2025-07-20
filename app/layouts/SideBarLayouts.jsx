import { usePathname } from 'next/navigation';
import styles from '@/app/layouts/sideBarLayout.module.css';
import {useUser} from '@/app/context/useContext';
import {useIsMobile} from '@/app/hooks/useMobile';
import DesktopSidebar from '@/components/desktopSidebar/DesktopSidebar';
import MobileHeader from '@/components/mobileHeader/MobileHeader';

export default function SidebarLayout({ children }) {
    const pathname = usePathname();
    const isMobile = useIsMobile(780)
    const { user } = useUser();
    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login';
    };
    if (isMobile === null) return null;

    return (
        <div className={styles.wrapper}>
            {!isMobile &&  <DesktopSidebar handleLogout={handleLogout} pathname={pathname} user={user}/> }
            {isMobile && <MobileHeader handleLogout={handleLogout} pathname={pathname} user={user} />}
            <main className={styles.main}>{children}</main>
        </div>
    );
}
