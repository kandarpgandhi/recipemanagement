

const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('Recipe', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    userId: { type: DataTypes.UUID, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    servings: { type: DataTypes.INTEGER },
    prepTimeMinutes: { type: DataTypes.INTEGER },
    cookTimeMinutes: { type: DataTypes.INTEGER },
    difficulty: { type: DataTypes.SMALLINT },
    dietaryTags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },

    // NEW: classification fields
    foodType: { type: DataTypes.STRING },   // e.g. "veg", "non-veg", "vegan", "gluten-free"
    category: { type: DataTypes.STRING },   // e.g. "breakfast", "dessert", "fast-food"

    coverImageUrl: { type: DataTypes.TEXT },
    avgRating: { type: DataTypes.FLOAT, defaultValue: 0 }
  }, { tableName: 'recipes', timestamps: true });
};
