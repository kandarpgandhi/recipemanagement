const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('Review', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    recipeId: { type: DataTypes.UUID, allowNull: false },
    userId: { type: DataTypes.UUID },
    rating: { type: DataTypes.SMALLINT, allowNull: false },
    comment: { type: DataTypes.TEXT }
  }, { tableName: 'reviews', timestamps: true });
};
