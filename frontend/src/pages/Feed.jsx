import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { Link } from "react-router-dom";

export default function Feed() {
    const [feed, setFeed] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFeed();
    }, []);

    const loadFeed = async () => {
        try {
            const res = await api.get("/social/feed");
            setFeed(res.data.items || []);
        } catch (err) {
            console.error("Feed load failed:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="content">Loading feed...</div>;
    }

    return (
        <div className="content">
            <div className="card" style={{ maxWidth: 700, margin: "0 auto" }}>
                <h2>Activity Feed</h2>
                <p className="small">Updates from people you follow</p>

                {feed.length === 0 && (
                    <p style={{ marginTop: 20, fontStyle: "italic" }}>No recent activity.</p>
                )}

                <div style={{ marginTop: 16 }}>
                    {feed.map((a) => (
                        <FeedItem key={a.id} activity={a} />
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------
   Feed Item Component
------------------------------------------------------- */
function FeedItem({ activity }) {
    const actor = activity.Actor;

    const actorName = actor?.displayName || actor?.username || "Unknown User";

    return (
        <div
            className="card"
            style={{
                padding: 12,
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                gap: 12
            }}
        >
            {/* Avatar */}
            {actor?.avatarUrl ? (
                <img
                    src={actor.avatarUrl}
                    alt="avatar"
                    style={{
                        width: 45,
                        height: 45,
                        borderRadius: "50%",
                        objectFit: "cover"
                    }}
                />
            ) : (
                <div
                    style={{
                        width: 45,
                        height: 45,
                        borderRadius: "50%",
                        background: "#ddd",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: 18
                    }}
                >
                    {actorName.charAt(0).toUpperCase()}
                </div>
            )}

            {/* Activity Content */}
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15 }}>
                    <Link
                        to={`/profile/${actor?.id}`}
                        style={{ fontWeight: 600, color: "#333", textDecoration: "none" }}
                    >
                        {actorName}
                    </Link>{" "}
                    {renderActivity(activity)}
                </div>

                <div className="small" style={{ marginTop: 4, color: "#666" }}>
                    {new Date(activity.createdAt).toLocaleString()}
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------
   Render activity message based on type
------------------------------------------------------- */
function renderActivity(a) {
    if (!a.payload) return "did something";

    switch (a.type) {
        case "new_recipe":
            return (
                <>
                    posted a new recipe{" "}
                    <Link to={`/recipes/${a.payload.recipeId}`}>
                        "{a.payload.title}"
                    </Link>
                </>
            );

        case "new_review":
            return (
                <>
                    reviewed{" "}
                    <Link to={`/recipes/${a.payload.recipeId}`}>
                        a recipe
                    </Link>{" "}
                    (rating: {a.payload.rating})
                </>
            );

        case "follow":
            return (
                <>
                    followed{" "}
                    <Link to={`/profile/${a.payload.followeeId}`}>a user</Link>
                </>
            );

        default:
            return "did something";
    }
}
