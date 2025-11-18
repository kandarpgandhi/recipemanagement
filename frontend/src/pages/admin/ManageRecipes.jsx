import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';

export default function ManageRecipes() {
    const [recipes, setRecipes] = useState([]);
    useEffect(() => {
        (async () => {
            try {
                const res = await api.get('/admin/recipes');
                setRecipes(res.data.items || []);
            } catch (err) { console.error(err); }
        })();
    }, []);
    const remove = async (id) => {
        if (!confirm('Delete this recipe?')) return;
        try {
            await api.delete(`/recipes/${id}`);
            setRecipes(prev => prev.filter(r => r.id !== id));
        } catch (err) { console.error(err); }
    };
    return (
        <div>
            <h3>Recipes</h3>
            <div className="grid">
                {recipes.map(r => (
                    <div className="card" key={r.id}>
                        <div className="recipe-title">{r.title}</div>
                        <div className="small">By {r.userId}</div>
                        <div style={{ marginTop: 8 }}>
                            <button className="btn" onClick={() => remove(r.id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
