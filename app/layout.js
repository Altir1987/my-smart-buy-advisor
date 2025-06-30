'use client';

import './globals.css';
import { usePathname } from 'next/navigation';
import { UserProvider } from '@/app/context/UseContext';
import SidebarLayout from '@/app/layouts/SideBarLayouts';

export default function RootLayout({ children }) {
    const pathname = usePathname();

    const isAuthPage = pathname === '/login';

    return (
        <html lang="en">
        <body>
        <UserProvider>
            {isAuthPage ? (
                children
            ) : (
                <SidebarLayout>{children}</SidebarLayout>
            )}
        </UserProvider>
        </body>
        </html>
    );
}