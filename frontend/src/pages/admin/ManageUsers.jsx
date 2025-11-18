import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';

export default function ManageUsers() {
    const [users, setUsers] = useState([]);

    async function load() {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data.users || []);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => { load(); }, []);

    const toggleBan = async (u) => {
        try {
            await api.put(`/admin/users/${u.id}`, { isBanned: !u.isBanned });
            load();
        } catch (err) { console.error(err); }
    };

    return (
        <div>
            <h3>Users</h3>
            <div className="grid">
                {users.map(u => (
                    <div className="card" key={u.id}>
                        <div><strong>{u.username}</strong></div>
                        <div className="small">{u.email}</div>
                        <div style={{ marginTop: 8 }}>
                            <button className="btn" onClick={() => toggleBan(u)}>{u.isBanned ? 'Unban' : 'Ban'}</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
