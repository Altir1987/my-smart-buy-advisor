import Chat from '@/page/chat/ChatWithBoth';
import SidebarLayout from "@/app/layouts/SideBarLayouts";
import AuthGuard from "@/components/AuthGuard";

export default function ChatPage() {
    return (
        <SidebarLayout>
            <AuthGuard>
                <Chat />
            </AuthGuard>
        </SidebarLayout>
    );
}