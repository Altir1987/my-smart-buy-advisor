import History from "@/page/history/History";
import SidebarLayout from "@/app/layouts/SideBarLayouts";
import AuthGuard from "@/app/guard/AuthGuard";

export default function ChatPage() {
    return (
        <SidebarLayout>
           <AuthGuard>
               <History />
           </AuthGuard>
       </SidebarLayout>

    );
}