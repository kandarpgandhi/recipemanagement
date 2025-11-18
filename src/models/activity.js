const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('Activity', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    actorId: { type: DataTypes.UUID },
    type: { type: DataTypes.STRING }, // new_recipe, new_review, follow
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'activities', timestamps: true });
};
