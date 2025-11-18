

const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const col = require("../controllers/collectionController");

// Create collection
router.post("/", auth, col.create);

// Get my collections
router.get("/", auth, col.list);

// Full collection details + recipes inside
router.get("/:id", auth, col.get);

// Add recipe to collection
router.post("/:id/recipes/:recipeId", auth, col.addRecipe);

// Remove recipe from collection
router.delete("/:id/recipes/:recipeId", auth, col.removeRecipe);

// Delete a collection
router.delete("/:id", auth, col.remove);

module.exports = router;
