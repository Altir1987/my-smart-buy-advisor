import { useUsers } from "@/app/hooks/useUsers";

export default function UsersPage() {
    const { users, loading } = useUsers();

    return (
        <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
            <h1>Registered Users</h1>
            {loading && <p>Loading users...</p>}
            {!loading && users.length === 0 && <p>No users found or you are not authorized.</p>}
            {!loading && users.length > 0 && (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Registered At</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{new Date(user.created_at).toLocaleString()}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
