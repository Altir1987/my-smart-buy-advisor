import Users from 'page/users/UsersListAdmin'
import SidebarLayout from "@/app/layouts/SideBarLayouts";
import AuthGuard from "@/components/AuthGuard";

export default function UsersPage () {
    return (
    <SidebarLayout>
        <AuthGuard>
            <Users />
        </AuthGuard>
    </SidebarLayout>
    )
}