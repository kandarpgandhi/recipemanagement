import React, { useState } from 'react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

export default function CreateRecipe() {
  const nav = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [stepsText, setStepsText] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [servings, setServings] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [foodType, setFoodType] = useState('veg'); // default
  const [category, setCategory] = useState('breakfast'); // default
  const [loading, setLoading] = useState(false);

  // options — you can adjust these or move them to constants/config
  const FOOD_TYPES = [
    { value: 'veg', label: 'Veg' },
    { value: 'non-veg', label: 'Non-Veg' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'gluten-free', label: 'Gluten Free' },
    { value: 'dairy-free', label: 'Dairy Free' },
  ];

  const CATEGORIES = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'dessert', label: 'Dessert' },
    { value: 'fast-food', label: 'Fast Food' },
    { value: 'snack', label: 'Snack' },
    { value: 'drinks', label: 'Drinks' },
  ];

  const uploadToS3 = async (file) => {
    const res = await api.get("/recipes/presign", {
      params: { fileName: file.name, contentType: file.type },
    });

    const { uploadUrl, fileUrl } = res.data;

    await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });

    return fileUrl;
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = null;

      if (coverFile) {
        imageUrl = await uploadToS3(coverFile);
      }

      const recipe = {
        title,
        description,

        servings: Number(servings),
        prepTimeMinutes: Number(prepTime),
        cookTimeMinutes: Number(cookTime),

        // NEW fields
        foodType,
        category,

        ingredients: ingredientsText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),

        steps: stepsText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),

        coverImageUrl: imageUrl,
      };

      const res = await api.post("/recipes", recipe);
      nav(`/recipes/${res.data.recipe.id}`);

    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Create failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content">
      <div className="card form">
        <h2>Create Recipe</h2>

        <form onSubmit={submit}>
          <label>Title</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />

          <label>Description</label>
          <textarea className="input" rows="4" value={description} onChange={(e) => setDescription(e.target.value)} />

          <label>Cover image</label>
          <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])} />

          {/* NEW: Food type and category selects */}
          <label>Food Type</label>
          <select className="input" value={foodType} onChange={(e) => setFoodType(e.target.value)}>
            {FOOD_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <label>Category</label>
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {/* NEW FIELDS */}
          <label>Servings</label>
          <input
            type="number"
            className="input"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
          />

          <label>Prep Time (minutes)</label>
          <input
            type="number"
            className="input"
            value={prepTime}
            onChange={(e) => setPrepTime(e.target.value)}
          />

          <label>Cook Time (minutes)</label>
          <input
            type="number"
            className="input"
            value={cookTime}
            onChange={(e) => setCookTime(e.target.value)}
          />

          <label>Ingredients (one per line)</label>
          <textarea className="input" rows="5" value={ingredientsText} onChange={(e) => setIngredientsText(e.target.value)} />

          <label>Steps (one per line)</label>
          <textarea className="input" rows="6" value={stepsText} onChange={(e) => setStepsText(e.target.value)} />

          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create'}
          </button>
        </form>
      </div>
    </div>
  );
}
