const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('User', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    displayName: { type: DataTypes.STRING },
    bio: { type: DataTypes.TEXT },
    avatarUrl: { type: DataTypes.TEXT },
    isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false },
    isBanned: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, { tableName: 'users', timestamps: true });
};

// User.hasMany(Favorite, { foreignKey: 'userId' });
// Favorite.belongsTo(User, { foreignKey: 'userId' });
