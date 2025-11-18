// frontend/src/pages/RecipeDetails.jsx
import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { useParams } from "react-router-dom";

export default function RecipeDetails() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  // collections UI
  const [collections, setCollections] = useState([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [collectionsModalOpen, setCollectionsModalOpen] = useState(false);

  // create collection form inside modal
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDesc, setNewCollectionDesc] = useState("");
  const [creatingCollection, setCreatingCollection] = useState(false);

  ///////////////////////////////////////////////////////////////////////
  // Reviews
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);


  const loadReviews = async () => {
    try {
      const res = await api.get(`/recipes/${id}/reviews`);
      const items = res.data.items || [];

      setReviews(items);

      // detect if logged user has already reviewed
      const me = JSON.parse(localStorage.getItem("user"));
      if (me) {
        const mine = items.find((r) => r.userId === me.id);
        setMyReview(mine || null);

        if (mine) {
          setRating(mine.rating);
          setComment(mine.comment);
        }
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    }
  };

  const submitReview = async () => {
    if (!rating) {
      alert("Please select a rating");
      return;
    }

    setReviewLoading(true);
    try {
      await api.post(`/recipes/${id}/reviews`, {
        rating,
        comment
      });

      await loadReviews();
      await loadRecipe(); // refresh averageRating
      alert("Review saved!");
    } catch (err) {
      console.error(err);
      alert("Failed to submit review");
    } finally {
      setReviewLoading(false);
    }
  };

  const deleteMyReview = async () => {
    if (!myReview) return;
    if (!window.confirm("Delete your review?")) return;

    try {
      await api.delete(`/recipes/reviews/${myReview.id}`);
      setRating(0);
      setComment("");
      setMyReview(null);
      await loadReviews();
      await loadRecipe();
    } catch (err) {
      console.error(err);
      alert("Failed to delete review");
    }
  };

  ///////////////////////////////////////////////////////////////////////


















  // load single recipe
  const loadRecipe = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/recipes/${id}`);
      setRecipe(res.data.recipe);

      // check favorites (if backend requires auth this will succeed only when logged)
      try {
        const favs = await api.get("/recipes/favorites/list");
        const exists = favs.data.items.some((f) => f.recipeId === id);
        setIsFavorite(Boolean(exists));
      } catch (err) {
        // ignore fav load errors (user might be anonymous)
        setIsFavorite(false);
      }
    } catch (err) {
      console.error("Failed to load recipe:", err);
      setRecipe(null);
    } finally {
      setLoading(false);
    }
  };

  // load user's collections (includes recipes in each collection)
  const loadCollections = async () => {
    setCollectionsLoading(true);
    try {
      const res = await api.get("/collections");
      // server returns { items: [...] }
      const items = res.data.items || [];
      setCollections(items);
    } catch (err) {
      console.error("Failed to load collections:", err);
      setCollections([]);
    } finally {
      setCollectionsLoading(false);
    }
  };

  useEffect(() => {
    loadRecipe();
    // also load collections so modal is ready (if user is logged in)
    loadCollections();
    // eslint-disable-next-line react-hooks/exhaustive-deps

    /////////////////////////////////////////////////////////
    loadReviews();
    /////////////////////////////////////////////////////////
  }, [id]);

  const toggleFavorite = async () => {
    try {
      const res = await api.post(`/recipes/${id}/favorite`);
      alert(res.data.message);
      setIsFavorite((prev) => !prev);
    } catch (err) {
      console.error(err);
      alert("Failed to update favorite");
    }
  };

  // Open collections modal (refresh collections when opening)
  const openCollectionsModal = async () => {
    await loadCollections();
    setCollectionsModalOpen(true);
  };

  const closeCollectionsModal = () => {
    setCollectionsModalOpen(false);
    setNewCollectionName("");
    setNewCollectionDesc("");
  };

  // helper: check if recipe exists in a collection
  const isInCollection = (collection) => {
    if (!collection || !collection.Recipes) return false;
    return collection.Recipes.some((r) => r.id === id);
  };

  // add recipe to collection
  const addRecipeToCollection = async (collectionId) => {
    try {
      await api.post(`/collections/${collectionId}/recipes/${id}`);
      // refresh collections so UI reflects change
      await loadCollections();
    } catch (err) {
      console.error("Add to collection failed:", err);
      alert(err?.response?.data?.message || "Failed to add to collection");
    }
  };

  // remove recipe from collection
  const removeRecipeFromCollection = async (collectionId) => {
    try {
      await api.delete(`/collections/${collectionId}/recipes/${id}`);
      // refresh collections
      await loadCollections();
    } catch (err) {
      console.error("Remove from collection failed:", err);
      alert(err?.response?.data?.message || "Failed to remove from collection");
    }
  };

  // toggle (add/remove) when clicking a collection row/button
  const toggleCollectionMembership = async (collection) => {
    if (!collection) return;
    const inColl = isInCollection(collection);
    if (inColl) {
      await removeRecipeFromCollection(collection.id);
    } else {
      await addRecipeToCollection(collection.id);
    }
  };

  // create new collection (then add recipe to it optionally or leave to user)
  const createCollection = async (e) => {
    e && e.preventDefault();
    if (!newCollectionName || newCollectionName.trim() === "") {
      alert("Collection name required");
      return;
    }
    setCreatingCollection(true);
    try {
      const payload = {
        name: newCollectionName.trim(),
        description: newCollectionDesc?.trim() || null,
      };
      const res = await api.post("/collections", payload);
      // push created collection locally (server returns created collection)
      // fetch full collections to include Recipes array
      await loadCollections();
      setNewCollectionName("");
      setNewCollectionDesc("");
      alert("Collection created");
    } catch (err) {
      console.error("Create collection failed:", err);
      alert(err?.response?.data?.message || "Failed to create collection");
    } finally {
      setCreatingCollection(false);
    }
  };

  if (loading) return <div className="content">Loading...</div>;
  if (!recipe) return <div className="content">Recipe not found</div>;

  return (
    <div className="content">
      <div className="card" style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Title */}
        <h2>{recipe.title}</h2>

        {/* Author */}
        <p style={{ marginTop: -6, color: "#555" }}>
          By <b>{recipe.User?.displayName || recipe.User?.username || "Unknown"}</b>
        </p>

        {/* Cover Image */}
        {recipe.coverImageUrl && (
          <img
            src={recipe.coverImageUrl}
            alt={recipe.title}
            style={{
              width: "100%",
              maxHeight: "380px",
              borderRadius: 8,
              objectFit: "cover",
              marginBottom: 16,
            }}
          />
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
          <button
            className="btn"
            onClick={toggleFavorite}
            style={{ backgroundColor: isFavorite ? "red" : "#007bff" }}
          >
            {isFavorite ? "❤️ Remove from Favorites" : "♡ Add to Favorites"}
          </button>

          <button className="btn-secondary" onClick={openCollectionsModal}>
            Add to collections
          </button>

          {/* show type/category succinctly */}
          <div style={{ marginLeft: "auto", color: "#333" }}>
            <span style={{ marginRight: 12 }}>
              <b>Type:</b> {recipe.foodType || "N/A"}
            </span>
            <span>
              <b>Category:</b> {recipe.category || "N/A"}
            </span>
          </div>
        </div>

        {/* Dietary tags */}
        {recipe.dietaryTags?.length > 0 && (
          <>
            <h4>Dietary Tags</h4>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              {recipe.dietaryTags.map((tag) => (
                <span key={tag} style={{ background: "#eee", padding: "6px 10px", borderRadius: 6 }}>
                  {tag}
                </span>
              ))}
            </div>
          </>
        )}

        {/* Recipe Info */}
        <h3>Recipe Info</h3>
        <p><b>Servings:</b> {recipe.servings ?? "N/A"}</p>
        <p><b>Prep Time:</b> {recipe.prepTimeMinutes ?? 0} minutes</p>
        <p><b>Cook Time:</b> {recipe.cookTimeMinutes ?? 0} minutes</p>
        <p><b>Total Time:</b> {(recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0)} minutes</p>

        {/* Description */}
        <h3>Description</h3>
        <p>{recipe.description}</p>

        {/* Ingredients */}
        <h3>Ingredients</h3>
        <ul>
          {recipe.Ingredients?.map((ing) => (
            <li key={ing.id}>{ing.text}</li>
          )) || <li>No ingredients listed</li>}
        </ul>

        {/* Steps */}
        <h3>Steps</h3>
        <ol>
          {recipe.Steps?.map((step) => (
            <li key={step.id}>{step.text}</li>
          )) || <li>No steps listed</li>}
        </ol>



        {/* Ratings Summary */}
        <div className="card" style={{ maxWidth: 900, margin: "20px auto" }}>
          <h3>Ratings</h3>

          <div style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
            ⭐ {recipe.averageRating?.toFixed(1) || 0} / 5
            <span style={{ fontSize: 16 }}> ({recipe.totalReviews} reviews)</span>
          </div>

          {/* My review form */}
          <h4>{myReview ? "Edit Your Review" : "Write a Review"}</h4>

          {/* Star input */}
          <div style={{ display: "flex", gap: 5, fontSize: 28, cursor: "pointer" }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setRating(star)}
                style={{ color: rating >= star ? "#ffb700" : "#ccc" }}
              >
                ★
              </span>
            ))}
          </div>

          <textarea
            className="input"
            rows="3"
            placeholder="Write your comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{ marginTop: 10 }}
          />

          <button
            className="btn-primary"
            onClick={submitReview}
            disabled={reviewLoading}
            style={{ marginTop: 10 }}
          >
            {reviewLoading ? "Saving..." : "Submit Review"}
          </button>

          {myReview && (
            <button
              className="btn-danger"
              onClick={deleteMyReview}
              style={{ marginLeft: 10 }}
            >
              Delete Review
            </button>
          )}

          {/* All reviews */}
          <h4 style={{ marginTop: 25 }}>Reviews</h4>
          {reviews.length === 0 && <p>No reviews yet</p>}

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {reviews.map((r) => (
              <div key={r.id} style={{ border: "1px solid #eee", padding: 12, borderRadius: 8 }}>
                <div style={{ fontWeight: "bold" }}>
                  {r.User?.displayName || r.User?.username}
                </div>

                <div style={{ color: "#ffb700", margin: "6px 0" }}>
                  {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                </div>

                <p>{r.comment || ""}</p>

                <div style={{ fontSize: 12, color: "#777" }}>
                  {new Date(r.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>








      </div>

      {/* Collections Modal */}
      {collectionsModalOpen && (
        <CollectionsModal
          onClose={closeCollectionsModal}
          collections={collections}
          loading={collectionsLoading}
          isInCollection={isInCollection}
          toggleCollectionMembership={toggleCollectionMembership}
          // create collection props
          newCollectionName={newCollectionName}
          setNewCollectionName={setNewCollectionName}
          newCollectionDesc={newCollectionDesc}
          setNewCollectionDesc={setNewCollectionDesc}
          createCollection={createCollection}
          creatingCollection={creatingCollection}
        />
      )}
    </div>
  );
}

/* ---------------------
   Collections Modal
   ---------------------*/
function CollectionsModal({
  onClose,
  collections,
  loading,
  isInCollection,
  toggleCollectionMembership,
  newCollectionName,
  setNewCollectionName,
  newCollectionDesc,
  setNewCollectionDesc,
  createCollection,
  creatingCollection
}) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose && onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 3000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0,0,0,0.5)",
      padding: 12
    }}>
      <div style={{
        width: "100%",
        maxWidth: 820,
        maxHeight: "90vh",
        overflowY: "auto",
        background: "#fff",
        borderRadius: 10,
        padding: 18
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>Manage Collections</h3>
          <div>
            <button className="btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <p className="small">Select collections to add or remove this recipe. Create a new collection below.</p>
        </div>

        {/* Collections list */}
        <div style={{ marginTop: 12 }}>
          {loading ? <div className="small">Loading collections...</div> : null}

          {collections.length === 0 && !loading && (
            <div className="small" style={{ marginTop: 6 }}>You have no collections yet.</div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
            {collections.map((c) => {
              const inColl = isInCollection(c);
              return (
                <div key={c.id} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: "1px solid #eee",
                  padding: 10,
                  borderRadius: 8
                }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                    {c.description ? <div className="small" style={{ color: "#666" }}>{c.description}</div> : null}
                    <div className="small" style={{ marginTop: 6 }}>{c.Recipes?.length || 0} recipes</div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className={inColl ? "btn-danger" : "btn-primary"}
                      onClick={() => toggleCollectionMembership(c)}
                    >
                      {inColl ? "Remove" : "Add"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Create collection */}
        <div style={{ marginTop: 18, borderTop: "1px solid #f0f0f0", paddingTop: 14 }}>
          <h4 style={{ marginTop: 0 }}>Create New Collection</h4>
          <form onSubmit={createCollection}>
            <label>Name</label>
            <input className="input" value={newCollectionName} onChange={(e) => setNewCollectionName(e.target.value)} />

            <label style={{ marginTop: 8 }}>Description (optional)</label>
            <textarea className="input" rows="3" value={newCollectionDesc} onChange={(e) => setNewCollectionDesc(e.target.value)} />

            <div style={{ marginTop: 12 }}>
              <button className="btn-primary" type="submit" disabled={creatingCollection}>
                {creatingCollection ? "Creating..." : "Create Collection"}
              </button>
            </div>
          </form>
        </div>

        <div style={{ marginTop: 12, textAlign: "right" }}>
          <small className="small">Collections are private to your account.</small>
        </div>
      </div>
    </div>
  );
}
