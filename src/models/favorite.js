const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('Favorite', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    userId: { type: DataTypes.UUID, allowNull: false },
    recipeId: { type: DataTypes.UUID, allowNull: false }
  }, { tableName: 'favorites', timestamps: true });
};
