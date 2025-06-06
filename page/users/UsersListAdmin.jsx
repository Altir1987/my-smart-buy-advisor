'use client';

import { useEffect, useState } from 'react';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchUsers() {
            const res = await fetch('/api/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users);
            } else {
                setError('You are not authorized to view this page');
            }
        }

        fetchUsers();
    }, []);

    return (
        <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
            <h1>Registered Users</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!error && users.length === 0 && <p>No users found.</p>}
            <table border="1" cellPadding={10} style={{ width: '100%', borderCollapse: 'collapse' }}>
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
        </div>
    );
}
