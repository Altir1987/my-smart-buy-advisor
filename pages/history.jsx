import History from "@/page/history/History";
import SidebarLayout from "@/app/layouts/SideBarLayouts";
import AuthGuard from "@/components/AuthGuard";

export default function ChatPage() {
    return (
        <SidebarLayout>
           <AuthGuard>
               <History />
           </AuthGuard>
       </SidebarLayout>

    );
}