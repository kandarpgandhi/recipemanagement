const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('Step', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    recipeId: { type: DataTypes.UUID, allowNull: false },
    text: { type: DataTypes.TEXT, allowNull: false },
    position: { type: DataTypes.INTEGER, defaultValue: 0 }
  }, { tableName: 'recipe_steps', timestamps: false });
};
