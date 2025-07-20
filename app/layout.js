'use client';

import './globals.css';
import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';
import { UserProvider } from '@/app/context/useContext';
import {StoreProvider} from '@/app/context/storeContext'
import SidebarLayout from '@/app/layouts/SideBarLayouts';

export default function RootLayout({ children }) {
    const pathname = usePathname();

    const isAuthPage = pathname === '/login';

    return (
        <html lang="en">
        <body>
        <Toaster richColors position="top-center" />
        <UserProvider>
            <StoreProvider>
            {isAuthPage ? (
                children
            ) : (
                <SidebarLayout>{children}</SidebarLayout>
            )}
            </StoreProvider>
        </UserProvider>
        </body>
        </html>
    );
}