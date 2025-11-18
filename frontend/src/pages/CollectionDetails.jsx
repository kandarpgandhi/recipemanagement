import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { Link, useParams } from "react-router-dom";

export default function CollectionDetails() {
    const { id } = useParams();
    const [collection, setCollection] = useState(null);

    useEffect(() => {
        loadDetails();
    }, []);

    const loadDetails = async () => {
        try {
            const res = await api.get(`/collections/${id}`);
            setCollection(res.data.collection);
        } catch (err) {
            console.error(err);
        }
    };

    if (!collection) return <div className="content">Loading...</div>;

    return (
        <div className="content">
            <h2>{collection.name}</h2>
            <p className="small">{collection.description}</p>

            <h3 style={{ marginTop: 20 }}>Recipes</h3>

            <div className="grid">
                {collection.Recipes.map((r) => (
                    <Link
                        key={r.id}
                        className="card"
                        to={`/recipes/${r.id}`}
                        style={{ padding: 0 }}
                    >
                        <img
                            src={
                                r.coverImageUrl ||
                                "https://via.placeholder.com/400x250?text=No+Image"
                            }
                            style={{ width: "100%", height: 160, objectFit: "cover" }}
                        />
                        <div style={{ padding: 12 }}>
                            <b>{r.title}</b>
                            <p className="small">{r.description?.slice(0, 120)}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
