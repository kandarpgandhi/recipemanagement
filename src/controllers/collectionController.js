const { Collection, CollectionRecipe, Recipe } = require("../models");

exports.create = async (req, res, next) => {
  try {
    const user = req.user;
    const { name, description } = req.body;

    if (!name) return res.status(400).json({ message: "Name required" });

    const collection = await Collection.create({
      userId: user.id,
      name,
      description,
    });

    res.status(201).json({ collection });
  } catch (err) {
    next(err);
  }
};

// List all user's collections
exports.list = async (req, res, next) => {
  try {
    const user = req.user;
    const items = await Collection.findAll({
      where: { userId: user.id },
      include: [
        {
          model: Recipe,
          as: "Recipes",
        },
      ],
    });

    res.json({ items });
  } catch (err) {
    next(err);
  }
};

// Add recipe to collection
exports.addRecipe = async (req, res, next) => {
  try {
    const { id, recipeId } = req.params;
    const user = req.user;

    const collection = await Collection.findByPk(id);
    if (!collection) return res.status(404).json({ message: "Not found" });

    if (collection.userId !== user.id)
      return res.status(403).json({ message: "Forbidden" });

    const exists = await CollectionRecipe.findOne({
      where: { collectionId: id, recipeId },
    });

    if (exists)
      return res.json({ message: "Recipe already in collection" });

    await CollectionRecipe.create({ collectionId: id, recipeId });

    res.json({ message: "Recipe added" });
  } catch (err) {
    next(err);
  }
};

// Remove recipe from collection
exports.removeRecipe = async (req, res, next) => {
  try {
    const { id, recipeId } = req.params;
    const user = req.user;

    const collection = await Collection.findByPk(id);
    if (!collection) return res.status(404).json({ message: "Not found" });

    if (collection.userId !== user.id)
      return res.status(403).json({ message: "Forbidden" });

    await CollectionRecipe.destroy({
      where: { collectionId: id, recipeId },
    });

    res.json({ message: "Removed" });
  } catch (err) {
    next(err);
  }
};

// Get full collection details with recipes
exports.get = async (req, res, next) => {
  try {
    const { id } = req.params;

    const collection = await Collection.findByPk(id, {
      include: [
        {
          model: Recipe,
          as: "Recipes",
        },
      ],
    });

    if (!collection) return res.status(404).json({ message: "Not found" });

    res.json({ collection });
  } catch (err) {
    next(err);
  }
};

// Delete collection
exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const c = await Collection.findByPk(id);
    if (!c) return res.status(404).json({ message: "Not found" });
    if (c.userId !== user.id) return res.status(403).json({ message: "Forbidden" });

    await c.destroy();

    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
};
