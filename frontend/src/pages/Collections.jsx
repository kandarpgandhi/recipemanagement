import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { Link } from "react-router-dom";

export default function Collections() {
    const [collections, setCollections] = useState([]);
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");

    useEffect(() => {
        loadCollections();
    }, []);

    const loadCollections = async () => {
        try {
            const res = await api.get("/collections");
            setCollections(res.data.items || []);
        } catch (err) {
            console.error("loadCollections error:", err);
        }
    };

    const createCollection = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return alert("Enter collection name");

        try {
            await api.post("/collections", {
                name: newName,
                description: newDesc,
            });

            setNewName("");
            setNewDesc("");

            loadCollections();
        } catch (err) {
            console.error(err);
            alert("Failed to create collection");
        }
    };

    const deleteCollection = async (id) => {
        if (!confirm("Delete collection?")) return;

        try {
            await api.delete(`/collections/${id}`);
            loadCollections();
        } catch (err) {
            console.error(err);
            alert("Delete failed");
        }
    };

    return (
        <div className="content">
            <h2>Your Collections</h2>

            <div className="card" style={{ maxWidth: 500 }}>
                <form onSubmit={createCollection}>
                    <h3>Create New Collection</h3>

                    <label>Name</label>
                    <input
                        className="input"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                    />

                    <label>Description</label>
                    <textarea
                        className="input"
                        rows="2"
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                    />

                    <button className="btn-primary" style={{ marginTop: 10 }}>
                        Create
                    </button>
                </form>
            </div>

            <div className="grid" style={{ marginTop: 20 }}>
                {collections.map((c) => (
                    <div key={c.id} className="card">
                        <h3>{c.name}</h3>
                        <p className="small">{c.description}</p>

                        <div style={{ marginTop: 10 }}>
                            <Link to={`/collections/${c.id}`}>
                                <button className="btn">View</button>
                            </Link>

                            <button
                                className="btn-danger"
                                style={{ marginLeft: 8 }}
                                onClick={() => deleteCollection(c.id)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
