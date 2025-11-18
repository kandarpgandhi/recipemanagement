import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { Link } from "react-router-dom";

export default function Users() {
    const [users, setUsers] = useState([]);
    const [following, setFollowing] = useState([]);

    useEffect(() => {
        loadUsers();
        loadFollowing();
    }, []);

    // Load all users
    const loadUsers = async () => {
        const res = await api.get("/users/list");
        setUsers(res.data.items || []);
    };

    // Load list of users THIS USER follows
    const loadFollowing = async () => {
        const me = JSON.parse(localStorage.getItem("user"));
        if (!me) return;

        const res = await api.get(`/social/following/${me.id}`);
        const ids = res.data.items.map((f) => f.followeeId);
        setFollowing(ids);
    };

    const toggleFollow = async (targetId) => {
        if (following.includes(targetId)) {
            await api.delete(`/social/follow/${targetId}`);
        } else {
            await api.post(`/social/follow/${targetId}`);
        }
        loadFollowing();
    };

    const me = JSON.parse(localStorage.getItem("user"));

    return (
        <div className="content">
            <h2>Find People</h2>

            {users.map((u) => (
                <div
                    key={u.id}
                    className="card"
                    style={{
                        padding: 12,
                        marginBottom: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {/* Avatar */}
                        {u.avatarUrl ? (
                            <img
                                src={u.avatarUrl}
                                alt="avatar"
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: "50%"
                                }}
                            />
                        ) : (
                            <div
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: "50%",
                                    background: "#ddd",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    fontWeight: "bold"
                                }}
                            >
                                {u.username[0].toUpperCase()}
                            </div>
                        )}

                        <div>
                            <Link to={`/profile/${u.id}`} style={{ fontWeight: 600 }}>
                                {u.displayName || u.username}
                            </Link>
                        </div>
                    </div>

                    {me?.id !== u.id && (
                        <button
                            className="btn"
                            style={{
                                background: following.includes(u.id) ? "red" : "#4caf50",
                                color: "white"
                            }}
                            onClick={() => toggleFollow(u.id)}
                        >
                            {following.includes(u.id) ? "Unfollow" : "Follow"}
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}
