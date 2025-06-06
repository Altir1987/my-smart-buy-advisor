import Users from 'page/users/UsersListAdmin'
import SidebarLayout from "@/app/layouts/SideBarLayouts";
import AuthGuard from "@/components/AuthGuard";
import AdminGuard from "@/components/AdminGuard";

export default function UsersPage () {
    return (
        <AuthGuard>
            <AdminGuard>
                <SidebarLayout>
                   <Users />
                </SidebarLayout>
            </AdminGuard>
        </AuthGuard>
    )
}