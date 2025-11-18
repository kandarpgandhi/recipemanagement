const { User, Recipe } = require('../models');
exports.listUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({ limit: 100, attributes: ['id','username','email','isAdmin','isBanned'] });
    res.json({ users });
  } catch (err) { next(err); }
};
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isBanned, isAdmin } = req.body;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Not found' });
    if (typeof isBanned === 'boolean') user.isBanned = isBanned;
    if (typeof isAdmin === 'boolean') user.isAdmin = isAdmin;
    await user.save();
    res.json({ user });
  } catch (err) { next(err); }
};
exports.listRecipes = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const recipes = await Recipe.findAndCountAll({ limit: parseInt(limit), offset: (page-1)*limit });
    res.json({ total: recipes.count, items: recipes.rows });
  } catch (err) { next(err); }
};
