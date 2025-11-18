const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('Follow', {
    followerId: { type: DataTypes.UUID, allowNull: false, primaryKey: false },
    followeeId: { type: DataTypes.UUID, allowNull: false, primaryKey: false }
  }, { tableName: 'followers', timestamps: true });
};
