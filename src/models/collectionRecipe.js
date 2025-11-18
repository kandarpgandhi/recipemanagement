const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define(
        "CollectionRecipe",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            collectionId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            recipeId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
        },
        {
            tableName: "collection_recipes",
            timestamps: true,
        }
    );
};
