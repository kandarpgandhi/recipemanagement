const sequelize = require('../config/db');
const User = require('./user')(sequelize);
const Recipe = require('./recipe')(sequelize);
const Ingredient = require('./ingredient')(sequelize);
const Step = require('./step')(sequelize);
const Review = require('./review')(sequelize);
const Favorite = require('./favorite')(sequelize);
const Collection = require('./collection')(sequelize);
const Follow = require('./follow')(sequelize);
const Activity = require('./activity')(sequelize);

const CollectionRecipe = require("./collectionRecipe")(sequelize);


// Associations
User.hasMany(Recipe, { foreignKey: 'userId' });
Recipe.belongsTo(User, { foreignKey: 'userId' });



Recipe.hasMany(Ingredient, { foreignKey: "recipeId", as: "Ingredients", onDelete: "CASCADE" });
Ingredient.belongsTo(Recipe, { foreignKey: "recipeId", as: "Recipe" });


Recipe.hasMany(Step, { foreignKey: 'recipeId', onDelete: 'CASCADE' });
Step.belongsTo(Recipe, { foreignKey: 'recipeId' });

Recipe.hasMany(Review, { foreignKey: 'recipeId', onDelete: 'CASCADE' });
Review.belongsTo(Recipe, { foreignKey: 'recipeId' });

User.hasMany(Review, { foreignKey: 'userId' });
Review.belongsTo(User, { foreignKey: 'userId' });

User.belongsToMany(Recipe, { through: Favorite, as: 'Favorites', foreignKey: 'userId' });
Recipe.belongsToMany(User, { through: Favorite, as: 'FavBy', foreignKey: 'recipeId' });


Favorite.belongsTo(Recipe, { foreignKey: 'recipeId' });
Recipe.hasMany(Favorite, { foreignKey: 'recipeId' });

Favorite.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Favorite, { foreignKey: 'userId' });


User.hasMany(Collection, { foreignKey: 'userId' });
Collection.belongsTo(User, { foreignKey: 'userId' });


Collection.belongsToMany(Recipe, {
    through: CollectionRecipe,
    foreignKey: "collectionId",
    as: "Recipes",
});

Recipe.belongsToMany(Collection, {
    through: CollectionRecipe,
    foreignKey: "recipeId",
    as: "Collections",
});


// Activity belongs to a User (actor)
Activity.belongsTo(User, { foreignKey: "actorId", as: "Actor" });
User.hasMany(Activity, { foreignKey: "actorId" });

// follows: simple table without complex composite PK
module.exports = { sequelize, User, Recipe, Ingredient, Step, Review, Favorite, Collection, Follow, Activity, CollectionRecipe };
