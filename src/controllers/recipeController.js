const { Recipe, Ingredient, Step, User, Review, Favorite } = require('../models');
const { createPresignedUploadUrl } = require('../services/s3Service');
const { Op } = require('sequelize');
const { pushActivity } = require('../services/activityService') || require('../services/activityService');

exports.presign = async (req, res, next) => {
  try {
    const { fileName, contentType } = req.query;

    if (!fileName || !contentType) {
      return res.status(400).json({ message: "fileName and contentType required" });
    }

    const urls = await createPresignedUploadUrl(fileName, contentType);

    return res.json(urls);
  } catch (err) {
    console.error("Presign Error:", err);
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const user = req.user;
    const {
      title,
      description,
      servings,
      prepTimeMinutes,
      cookTimeMinutes,
      difficulty,
      dietaryTags,
      ingredients,
      steps,
      coverImageUrl,
      // NEW
      foodType,
      category
    } = req.body;

    if (!title) return res.status(400).json({ message: 'Title required' });

    const recipe = await Recipe.create({
      userId: user.id,
      title,
      description,
      servings,
      prepTimeMinutes,
      cookTimeMinutes,
      difficulty,
      dietaryTags,
      coverImageUrl,
      foodType,
      category
    });

    if (Array.isArray(ingredients)) {
      const items = ingredients.map((text, i) => ({ recipeId: recipe.id, text, position: i }));
      await Ingredient.bulkCreate(items);
    }
    if (Array.isArray(steps)) {
      const s = steps.map((text, i) => ({ recipeId: recipe.id, text, position: i }));
      await Step.bulkCreate(s);
    }

    // push activity
    try { await require('../services/activityService').pushActivity(user.id, 'new_recipe', { recipeId: recipe.id, title: recipe.title }); } catch (e) {/*noop*/ }

    res.status(201).json({ recipe });
  } catch (err) { next(err); }
};



exports.list = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      q,
      ingredient,
      category,
      foodType,
      dietaryTags
    } = req.query;

    const where = {};

    console.log("QUERY FILTERS:", { q, ingredient, category, foodType, dietaryTags });

    // Full text search
    if (q) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } }
      ];
    }

    // Case-insensitive category filter
    if (category) {
      where.category = { [Op.iLike]: category.toLowerCase() };
    }

    // Case-insensitive food type filter
    if (foodType) {
      where.foodType = { [Op.iLike]: foodType.toLowerCase() };
    }

    // Dietary tags — match any tag inside array (case-insensitive)
    if (dietaryTags) {
      const tags = Array.isArray(dietaryTags)
        ? dietaryTags.map(t => t.toLowerCase())
        : [dietaryTags.toLowerCase()];

      where.dietaryTags = { [Op.overlap]: tags };
    }

    // Ingredient filter
    let ingredientFilter = undefined;
    if (ingredient) {
      ingredientFilter = {
        model: Ingredient,
        as: "Ingredients",
        required: true,
        where: {
          text: { [Op.iLike]: `%${ingredient}%` }
        }
      };
    }

    const recipes = await Recipe.findAndCountAll({
      where,
      include: [
        { model: User, attributes: ["id", "username", "displayName"] },
        ingredientFilter
      ].filter(Boolean),
      limit: Number(limit),
      offset: (page - 1) * limit,
      order: [["createdAt", "DESC"]]
    });

    res.json({
      total: recipes.count,
      items: recipes.rows
    });

  } catch (err) {
    console.error("Search error:", err);
    next(err);
  }
};


exports.get = async (req, res, next) => {
  try {
    const { id } = req.params;

    const recipe = await Recipe.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ["id", "username", "displayName"]
        },
        {
          model: Ingredient,
          as: "Ingredients",  // NO alias
        },
        {
          model: Step,        // NO alias
        },
        {
          model: Review,
          include: [
            {
              model: User,
              attributes: ["id", "username", "displayName"]
            }
          ]
        }
      ]
    });

    if (!recipe) return res.status(404).json({ message: "Not found" });

    ////////////////////////////////////////////////////////////////////////
    // Calculate rating summary
    const averageRating = await Review.aggregate("rating", "avg", {
      where: { recipeId: id }
    });

    const totalReviews = await Review.count({
      where: { recipeId: id }
    });

    recipe.setDataValue("averageRating", parseFloat(averageRating || 0));
    recipe.setDataValue("totalReviews", totalReviews);

    ////////////////////////////////////////////////////////////////////////
    res.json({ recipe });

  } catch (err) {
    console.error("GET recipe error:", err);
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const {
      title,
      description,
      servings,
      prepTimeMinutes,
      cookTimeMinutes,
      difficulty,
      dietaryTags,
      ingredients,
      steps,
      coverImageUrl,
      // NEW
      foodType,
      category
    } = req.body;

    // const recipe = await Recipe.findByPk(id, {
    //   include: [Ingredient, Step]
    // });

    const recipe = await Recipe.findByPk(req.params.id, {
      include: [
        { model: Ingredient, as: "Ingredients" },
        { model: Step }
      ]
    });

    if (!recipe) return res.status(404).json({ message: "Not found" });

    if (recipe.userId !== user.id && !user.isAdmin)
      return res.status(403).json({ message: "Forbidden" });

    // Update main recipe fields (including new category fields)
    await recipe.update({
      title,
      description,
      servings,
      prepTimeMinutes,
      cookTimeMinutes,
      difficulty,
      dietaryTags,
      coverImageUrl,
      foodType,
      category
    });

    // Update ingredients (delete → recreate)
    if (Array.isArray(ingredients)) {
      await Ingredient.destroy({ where: { recipeId: id } });

      const ingList = ingredients.map((text, i) => ({
        recipeId: id,
        text,
        position: i
      }));

      await Ingredient.bulkCreate(ingList);
    }

    // Update steps (delete → recreate)
    if (Array.isArray(steps)) {
      await Step.destroy({ where: { recipeId: id } });

      const stepList = steps.map((text, i) => ({
        recipeId: id,
        text,
        position: i
      }));

      await Step.bulkCreate(stepList);
    }

    const updatedRecipe = await Recipe.findByPk(id, {
      // include: [Ingredient, Step]
      include: [
        { model: Ingredient, as: "Ingredients" },
        { model: Step }
      ]

    });

    res.json({
      message: "Recipe updated",
      recipe: updatedRecipe
    });

  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const recipe = await Recipe.findByPk(id);
    if (!recipe) return res.status(404).json({ message: 'Not found' });
    if (recipe.userId !== user.id && !user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
    await recipe.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

exports.favoriteToggle = async (req, res, next) => {
  try {
    const user = req.user;
    const { id } = req.params; // recipe id
    const fav = await Favorite.findOne({ where: { userId: user.id, recipeId: id } });
    if (fav) { await fav.destroy(); return res.json({ message: 'Removed from favorites' }); }
    await Favorite.create({ userId: user.id, recipeId: id });
    res.json({ message: 'Added to favorites' });
  } catch (err) { next(err); }
};

exports.listFavorites = async (req, res, next) => {
  try {
    const user = req.user;
    const favs = await Favorite.findAll({ where: { userId: user.id }, include: [{ model: Recipe }] });
    res.json({ items: favs });
  } catch (err) { next(err); }
};

exports.createReview = async (req, res, next) => {
  try {
    const user = req.user;
    const { id } = req.params; // recipe id
    const { rating, comment } = req.body;
    if (!rating) return res.status(400).json({ message: 'Rating required' });
    const existing = await Review.findOne({ where: { recipeId: id, userId: user.id } });
    if (existing) {
      existing.rating = rating; existing.comment = comment; await existing.save();
      return res.json({ review: existing });
    }
    const review = await Review.create({ recipeId: id, userId: user.id, rating, comment });

    // update average
    // const avg = await Review.aggregate('rating', 'avg', { where: { recipeId: id } });
    // await Recipe.update({ avgRating: parseFloat(avg || 0) }, { where: { id } });
    ////////////////////////////////////////////////////////////////////////////////
    // recalc and return new rating summary
    const avg = await Review.aggregate("rating", "avg", { where: { recipeId: id } });
    const count = await Review.count({ where: { recipeId: id } });

    await Recipe.update(
      { avgRating: parseFloat(avg || 0) },
      { where: { id } }
    );

    review.setDataValue("averageRating", parseFloat(avg || 0));
    review.setDataValue("totalReviews", count);

    ////////////////////////////////////////////////////////////////////////////////




    try { await require('../services/activityService').pushActivity(user.id, 'new_review', { recipeId: id, rating }); } catch (e) { }
    res.status(201).json({ review });
  } catch (err) { next(err); }
};

exports.listReviews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reviews = await Review.findAll({ where: { recipeId: id }, include: [{ model: User, attributes: ['id', 'username', 'displayName'] }], order: [['createdAt', 'DESC']] });
    res.json({ items: reviews });
  } catch (err) { next(err); }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const user = req.user;
    const { id } = req.params; // review id
    const review = await Review.findByPk(id);
    if (!review) return res.status(404).json({ message: 'Not found' });
    if (review.userId !== user.id && !user.isAdmin) return res.status(403).json({ message: 'Forbidden' });

    // await review.destroy();
    // res.json({ message: 'Deleted' });
    ////////////////////////////////////////////////////////
    await review.destroy();

    // recalc
    const avg = await Review.aggregate("rating", "avg", {
      where: { recipeId: review.recipeId }
    });
    const count = await Review.count({
      where: { recipeId: review.recipeId }
    });

    res.json({
      message: "Deleted",
      averageRating: parseFloat(avg || 0),
      totalReviews: count
    });

    /////////////////////////////////////////////////////////
  } catch (err) { next(err); }
};
