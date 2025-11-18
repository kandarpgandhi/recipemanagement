const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('Collection', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    userId: { type: DataTypes.UUID, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT }
  }, { tableName: 'collections', timestamps: true });
};
