// =============================
//  Profile.jsx (FULL VERSION)
//  Supports:
//   - Own profile (/profile)
//   - Public profile (/profile/:id)
//   - Edit profile
//   - Recipes / favorites / collections
//   - Follow / Unfollow
//   - Followers & Following lists
// =============================

import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axiosConfig";
import { useNavigate, useParams } from "react-router-dom";

export default function Profile() {
  const nav = useNavigate();
  const { user } = useContext(AuthContext);
  const { id: routeId } = useParams();  // if viewing /profile/:id

  const viewingMyProfile = !routeId || routeId === user?.id;

  // -----------------------------
  // State
  // -----------------------------
  const [profile, setProfile] = useState(null);

  // Editing profile
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileEditData, setProfileEditData] = useState({ displayName: "", bio: "" });

  // Recipes
  const [recipes, setRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // Collections (private → only show for own profile)
  const [collections, setCollections] = useState([]);

  // Follow data
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [amIFollowing, setAmIFollowing] = useState(false);

  // Add-to-collection modal data
  const [addToCollectionOpen, setAddToCollectionOpen] = useState(false);
  const [selectedRecipeForCollection, setSelectedRecipeForCollection] = useState(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState("");

  // Create collection modal
  const [createCollectionOpen, setCreateCollectionOpen] = useState(false);
  const [newCollectionData, setNewCollectionData] = useState({ name: "", description: "" });

  // Recipe edit modal
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // -----------------------------
  // Load data on mount
  // -----------------------------
  useEffect(() => {
    if (!user) return;

    loadProfile();
    loadFollowers();
    loadFollowing();

    if (viewingMyProfile) {
      loadMyRecipes();
      loadFavorites();
      loadCollections();
    } else {
      loadUserRecipes();
    }
  }, [user, routeId]);

  // -----------------------------
  // API Loaders
  // -----------------------------
  const loadProfile = async () => {
    try {
      if (viewingMyProfile) {
        const res = await api.get("/users/me");
        setProfile(res.data.user);
        setProfileEditData({
          displayName: res.data.user.displayName || "",
          bio: res.data.user.bio || ""
        });
      } else {
        const res = await api.get(`/users/${routeId}`);
        setProfile(res.data.user);
      }
    } catch (err) {
      console.error("loadProfile", err);
    }
  };

  const loadMyRecipes = async () => {
    try {
      const res = await api.get("/users/me");
      setRecipes(res.data.recipes || []);
    } catch (err) { }
  };

  const loadUserRecipes = async () => {
    try {
      const res = await api.get(`/users/${routeId}/recipes`);
      setRecipes(res.data.items || []);
    } catch (err) { }
  };

  const loadFavorites = async () => {
    try {
      const res = await api.get("/recipes/favorites/list");
      const items = res.data.items.map((f) => f.Recipe).filter(Boolean);
      setFavorites(items);
    } catch (err) { }
  };

  const loadCollections = async () => {
    try {
      const res = await api.get("/collections");
      setCollections(res.data.items || []);
    } catch (err) { }
  };

  const loadFollowers = async () => {
    try {
      const res = await api.get(`/social/followers/${routeId || user.id}`);
      setFollowers(res.data.items);
      checkIfFollowing(res.data.items);
    } catch (err) { }
  };

  const loadFollowing = async () => {
    try {
      const res = await api.get(`/social/following/${routeId || user.id}`);
      setFollowing(res.data.items);
    } catch (err) { }
  };

  const checkIfFollowing = (followersList) => {
    if (!user || viewingMyProfile) {
      setAmIFollowing(false);
      return;
    }
    const found = followersList.some(f => f.followerId === user.id);
    setAmIFollowing(found);
  };

  // -----------------------------
  // Follow / Unfollow
  // -----------------------------
  const followUser = async () => {
    try {
      await api.post(`/social/follow/${routeId}`);
      loadFollowers();
      setAmIFollowing(true);
    } catch (e) {
      console.error(e);
    }
  };

  const unfollowUser = async () => {
    try {
      await api.delete(`/social/follow/${routeId}`);
      loadFollowers();
      setAmIFollowing(false);
    } catch (e) {
      console.error(e);
    }
  };

  // -----------------------------
  // Edit Profile
  // -----------------------------
  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put("/users/me", profileEditData);
      await loadProfile();
      setIsEditingProfile(false);
      alert("Profile updated");
    } catch (err) { }
  };

  // -----------------------------
  // Delete recipe
  // -----------------------------
  const deleteRecipe = async (id) => {
    if (!confirm("Delete recipe?")) return;
    try {
      await api.delete(`/recipes/${id}`);
      loadMyRecipes();
      loadCollections();
    } catch (err) { }
  };

  // -----------------------------
  // Add-to-collection
  // -----------------------------
  const openAddToCollection = (recipe) => {
    setSelectedRecipeForCollection(recipe);
    setAddToCollectionOpen(true);
  };

  const addRecipeToCollection = async () => {
    try {
      if (!selectedCollectionId) {
        alert("Select a collection");
        return;
      }
      await api.post(`/collections/${selectedCollectionId}/recipes/${selectedRecipeForCollection.id}`);
      alert("Added!");
      setAddToCollectionOpen(false);
      loadCollections();
    } catch (err) { }
  };

  const removeRecipeFromCollection = async (collectionId, recipeId) => {
    if (!confirm("Remove from collection?")) return;
    try {
      await api.delete(`/collections/${collectionId}/recipes/${recipeId}`);
      loadCollections();
    } catch (err) { }
  };

  const deleteCollection = async (id) => {
    if (!confirm("Delete collection?")) return;
    try {
      await api.delete(`/collections/${id}`);
      loadCollections();
    } catch (err) { }
  };

  // -----------------------------
  // UI
  // -----------------------------
  if (!profile) return <div className="content">Loading...</div>;

  return (
    <div className="content">
      {/* HEADER */}
      <div className="card" style={{ maxWidth: 720, marginBottom: 16 }}>

        {/* Username + follow/unfollow */}
        <h2>{profile.username}</h2>

        <p className="small">{profile.displayName}</p>
        <p className="small">{profile.email}</p>
        <p className="small">{profile.bio || "No bio"}</p>

        {/* FOLLOW / UNFOLLOW */}
        {!viewingMyProfile && (
          <button
            className={amIFollowing ? "btn-danger" : "btn-primary"}
            onClick={amIFollowing ? unfollowUser : followUser}
          >
            {amIFollowing ? "Unfollow" : "Follow"}
          </button>
        )}

        {/* Edit only if my profile */}
        {viewingMyProfile && (
          <div>
            <button className="btn-primary" onClick={() => setIsEditingProfile(true)}>Edit Profile</button>
          </div>
        )}

        {/* Followers / Following */}
        <div style={{ marginTop: 12 }}>
          <b>{followers.length}</b> Followers &nbsp;&nbsp;
          <b>{following.length}</b> Following
        </div>
      </div>

      {/* ---------------------- */}
      {/* EDIT PROFILE MODAL */}
      {/* ---------------------- */}
      {isEditingProfile && viewingMyProfile && (
        <Modal onClose={() => setIsEditingProfile(false)}>
          <form onSubmit={saveProfile} style={{ maxWidth: 650 }}>
            <h2>Edit Profile</h2>

            <label>Display Name</label>
            <input
              className="input"
              value={profileEditData.displayName}
              onChange={(e) => setProfileEditData({ ...profileEditData, displayName: e.target.value })}
            />

            <label>Bio</label>
            <textarea
              className="input"
              rows="3"
              value={profileEditData.bio}
              onChange={(e) => setProfileEditData({ ...profileEditData, bio: e.target.value })}
            />

            <div style={{ marginTop: 12 }}>
              <button className="btn-primary" type="submit">Save</button>
              <button className="btn-secondary" onClick={() => setIsEditingProfile(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ---------------------------------------- */}
      {/* USER RECIPES (My or Public) */}
      {/* ---------------------------------------- */}
      <div className="card">
        {/* <h3>{viewingMyProfile ? "Your Recipes" : "Recipes"}</h3>

        <div className="grid">
          {recipes.map((r) => (
            <div key={r.id} className="card">
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div className="recipe-title" onClick={() => nav(`/recipes/${r.id}`)} style={{ cursor: "pointer" }}>
                    {r.title}
                  </div>
                  <div className="small">{r.description?.slice(0, 120)}</div>

                  {viewingMyProfile && (
                    <div style={{ marginTop: 8 }}>
                      <button className="btn" onClick={() => openAddToCollection(r)}>Add to collection</button>
                      <button className="btn-danger" onClick={() => deleteRecipe(r.id)} style={{ marginLeft: 8 }}>
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {r.coverImageUrl && (
                  <img
                    src={r.coverImageUrl}
                    alt={r.title}
                    style={{ width: 110, height: 80, borderRadius: 6, objectFit: "cover" }}
                  />
                )}
              </div>
            </div>
          ))}
        </div> */}
        {/* ---------------------------------------- */}
        {/* USER RECIPES (My or Public) */}
        {/* ---------------------------------------- */}
        <div className="card">
          <h3>{viewingMyProfile ? "Your Recipes" : "Recipes"}</h3>

          <div className="grid">
            {recipes.map((r) => (
              <div key={r.id} className="card">
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div
                      className="recipe-title"
                      onClick={() => nav(`/recipes/${r.id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      {r.title}
                    </div>

                    <div className="small">{r.description?.slice(0, 120)}</div>

                    {viewingMyProfile && (
                      <div style={{ marginTop: 8 }}>

                        {/* Edit Button */}
                        <button
                          className="btn"
                          onClick={() => {
                            setEditingRecipe(r);
                            setModalOpen(true);
                          }}
                        >
                          Edit
                        </button>

                        <button
                          className="btn"
                          onClick={() => openAddToCollection(r)}
                          style={{ marginLeft: 8 }}
                        >
                          Add to Collection
                        </button>

                        <button
                          className="btn-danger"
                          onClick={() => deleteRecipe(r.id)}
                          style={{ marginLeft: 8 }}
                        >
                          Delete
                        </button>

                      </div>
                    )}
                  </div>

                  {r.coverImageUrl && (
                    <img
                      src={r.coverImageUrl}
                      alt={r.title}
                      style={{
                        width: 110,
                        height: 80,
                        borderRadius: 6,
                        objectFit: "cover",
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ------------------------------ */}
      {/* FAVORITES (only own profile) */}
      {/* ------------------------------ */}
      {viewingMyProfile && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Your Favorites</h3>

          <div className="grid">
            {favorites.map((r) => (
              <div key={r.id} className="card">
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div
                      className="recipe-title"
                      onClick={() => nav(`/recipes/${r.id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      {r.title}
                    </div>

                    <button className="btn" onClick={() => openAddToCollection(r)}>Add to collection</button>
                  </div>

                  {r.coverImageUrl && (
                    <img src={r.coverImageUrl} style={{ width: 110, height: 80, borderRadius: 6 }} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------ */}
      {/* COLLECTIONS (only own profile) */}
      {/* ------------------------------ */}
      {viewingMyProfile && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Your Collections</h3>

          <button className="btn" onClick={() => setCreateCollectionOpen(true)}>Create Collection</button>

          {collections.map((c) => (
            <div key={c.id} className="card" style={{ marginTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <b>{c.name}</b>
                  <div className="small">{c.description}</div>
                </div>
                <button className="btn-danger" onClick={() => deleteCollection(c.id)}>Delete</button>
              </div>

              {/* Recipes inside collection */}
              {(c.Recipes || []).map((r) => (
                <div key={r.id} style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                  <div className="clickable" onClick={() => nav(`/recipes/${r.id}`)}>
                    {r.title}
                  </div>
                  <button className="btn-danger" onClick={() => removeRecipeFromCollection(c.id, r.id)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* CREATE COLLECTION MODAL */}
      {createCollectionOpen && (
        <Modal onClose={() => setCreateCollectionOpen(false)}>
          <form onSubmit={(e) => { e.preventDefault(); createCollection(); }}>
            <h2>Create Collection</h2>

            <label>Name</label>
            <input
              className="input"
              value={newCollectionData.name}
              onChange={(e) => setNewCollectionData({ ...newCollectionData, name: e.target.value })}
            />

            <label>Description</label>
            <textarea
              className="input"
              rows={3}
              value={newCollectionData.description}
              onChange={(e) => setNewCollectionData({ ...newCollectionData, description: e.target.value })}
            />

            <button className="btn-primary" type="submit">Create</button>
          </form>
        </Modal>
      )}

      {/* ADD TO COLLECTION MODAL */}
      {addToCollectionOpen && selectedRecipeForCollection && (
        <Modal onClose={() => setAddToCollectionOpen(false)}>
          <h2>Add to Collection</h2>

          <label>Select collection</label>
          <select className="input" value={selectedCollectionId} onChange={(e) => setSelectedCollectionId(e.target.value)}>
            <option value="">-- choose --</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <button className="btn-primary" onClick={addRecipeToCollection}>Add</button>
        </Modal>
      )}

      {/* EDIT RECIPE MODAL */}
      {modalOpen && editingRecipe && (
        <Modal onClose={() => setModalOpen(false)}>
          <h2>Edit Recipe</h2>

          <label>Title</label>
          <input
            className="input"
            value={editingRecipe.title}
            onChange={(e) =>
              setEditingRecipe({ ...editingRecipe, title: e.target.value })
            }
          />

          <label>Description</label>
          <textarea
            className="input"
            rows={3}
            value={editingRecipe.description}
            onChange={(e) =>
              setEditingRecipe({ ...editingRecipe, description: e.target.value })
            }
          />

          <label>Cover Image URL</label>
          <input
            className="input"
            value={editingRecipe.coverImageUrl}
            onChange={(e) =>
              setEditingRecipe({ ...editingRecipe, coverImageUrl: e.target.value })
            }
          />

          <button
            className="btn-primary"
            onClick={async () => {
              try {
                await api.put(`/recipes/${editingRecipe.id}`, editingRecipe);
                setModalOpen(false);
                loadMyRecipes();
                alert("Recipe updated!");
              } catch (err) {
                console.error(err);
                alert("Error updating recipe");
              }
            }}
            style={{ marginTop: 10 }}
          >
            Save
          </button>
        </Modal>
      )}

    </div>
  );
}

/* --------------------------
   Modal Component
--------------------------- */
function Modal({ children, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2000
    }}>
      <div style={{
        background: "#fff",
        padding: 20,
        borderRadius: 10,
        width: "100%",
        maxWidth: 700
      }}>
        <div style={{ textAlign: "right" }}>
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}
