const { User, Recipe, Favorite } = require('../models');


// -----------------------------------------
// Get profile (my profile or another user's)
// -----------------------------------------
exports.getProfile = async (req, res, next) => {
  try {
    const targetId = req.params.id || req.user.id;  // Use param ID if available

    const user = await User.findByPk(targetId, {
      attributes: ['id', 'username', 'email', 'displayName', 'bio', 'avatarUrl', 'isAdmin']
    });

    if (!user) return res.status(404).json({ message: 'Not found' });

    const recipes = await Recipe.findAll({
      where: { userId: targetId },
      limit: 20
    });

    const favorites = await Favorite.findAll({
      where: { userId: targetId },
      include: [{ model: Recipe }],
      limit: 50
    });

    res.json({ user, recipes, favorites });
  } catch (err) {
    next(err);
  }
};


// -----------------------------------------
// Update my profile
// -----------------------------------------
exports.updateProfile = async (req, res, next) => {
  try {
    const user = req.user;
    const { displayName, bio, avatarUrl } = req.body;

    user.displayName = displayName || user.displayName;
    user.bio = bio || user.bio;
    user.avatarUrl = avatarUrl || user.avatarUrl;

    await user.save();

    res.json({
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (err) {
    next(err);
  }
};


// -----------------------------------------
// List all public users
// -----------------------------------------
exports.listPublicUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "username", "displayName", "avatarUrl"]
    });

    res.json({ items: users });
  } catch (err) {
    next(err);
  }
};
