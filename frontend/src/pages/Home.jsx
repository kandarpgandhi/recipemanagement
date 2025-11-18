import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { Link } from "react-router-dom";

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search fields
  const [q, setQ] = useState("");
  const [ingredient, setIngredient] = useState("");
  const [category, setCategory] = useState("");
  const [foodType, setFoodType] = useState("");
  const [dietaryTags, setDietaryTags] = useState([]);

  const [showFilters, setShowFilters] = useState(false);

  const categories = ["Breakfast", "Lunch", "Dinner", "Dessert", "Fast Food"];
  const foodTypes = ["Veg", "Non-Veg", "Vegan", "Gluten-Free"];
  const availableTags = ["Keto", "Healthy", "Protein", "Snack"];

  const toggleTag = (tag) => {
    setDietaryTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const fetchRecipes = async () => {
    setLoading(true);

    try {
      const params = {};
      if (q) params.q = q;
      if (ingredient) params.ingredient = ingredient;
      if (category) params.category = category;
      if (foodType) params.foodType = foodType;
      if (dietaryTags.length > 0) params.dietaryTags = dietaryTags;

      const res = await api.get("/recipes", { params });
      setRecipes(res.data.items);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  return (
    <div className="content">

      {/* MAIN SEARCH BAR */}
      <div className="card" style={{ display: "flex", gap: 10 }}>
        <input
          className="input"
          placeholder="Search recipes..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="btn" onClick={fetchRecipes}>Search</button>
        <button
          className="btn-secondary"
          style={{ marginLeft: "auto" }}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filters ⬇
        </button>
      </div>

      {/* FILTER DROPDOWN */}
      {showFilters && (
        <div className="card" style={{ marginBottom: 15 }}>
          {/* Ingredient */}
          <label>Ingredient</label>
          <input
            className="input"
            value={ingredient}
            placeholder="e.g. Tomato"
            onChange={(e) => setIngredient(e.target.value)}
          />

          {/* Category */}
          <label style={{ marginTop: 10 }}>Category</label>
          <select
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          {/* Food Type */}
          <label style={{ marginTop: 10 }}>Food Type</label>
          <select
            className="input"
            value={foodType}
            onChange={(e) => setFoodType(e.target.value)}
          >
            <option value="">All</option>
            {foodTypes.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>

          {/* Dietary Tags */}
          <label style={{ marginTop: 10 }}>Dietary Tags</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {availableTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className="btn"
                style={{
                  background: dietaryTags.includes(tag) ? "green" : "#ddd",
                  color: dietaryTags.includes(tag) ? "white" : "black"
                }}
              >
                {tag}
              </button>
            ))}
          </div>

          <button className="btn-primary" style={{ marginTop: 12 }} onClick={fetchRecipes}>
            Apply Filters
          </button>
        </div>
      )}

      {/* RESULTS */}
      {loading && <div className="card">Loading...</div>}

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
        {recipes.map((r) => (
          <Link to={`/recipes/${r.id}`} key={r.id} className="card" style={{ padding: 0 }}>
            <img
              src={r.coverImageUrl || "https://via.placeholder.com/400x200?text=No+Image"}
              style={{ width: "100%", height: 180, objectFit: "cover" }}
            />

            <div style={{ padding: 10 }}>
              <b>{r.title}</b>
              <p className="small">
                By {r.User?.displayName || r.User?.username}
              </p>
              <p style={{ marginTop: 8 }}>
                {r.description?.slice(0, 120)}...
              </p>
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}
