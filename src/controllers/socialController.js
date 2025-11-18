const { Follow, Activity, User } = require('../models');
exports.follow = async (req, res, next) => {
  try {
    const user = req.user;
    const { id } = req.params; // followee id
    if (user.id === id) return res.status(400).json({ message: 'Cannot follow yourself' });
    await Follow.create({ followerId: user.id, followeeId: id });
    await Activity.create({ actorId: user.id, type: 'follow', payload: { followeeId: id } });
    res.json({ message: 'Followed' });
  } catch (err) { next(err); }
};
exports.unfollow = async (req, res, next) => {
  try {
    const user = req.user;
    const { id } = req.params;
    await Follow.destroy({ where: { followerId: user.id, followeeId: id } });
    res.json({ message: 'Unfollowed' });
  } catch (err) { next(err); }
};
exports.getFollowers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rows = await Follow.findAll({ where: { followeeId: id } });
    res.json({ items: rows });
  } catch (err) { next(err); }
};
exports.getFollowing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rows = await Follow.findAll({ where: { followerId: id } });
    res.json({ items: rows });
  } catch (err) { next(err); }
};


exports.feed = async (req, res, next) => {
  try {
    const user = req.user;

    const follows = await Follow.findAll({
      where: { followerId: user.id },
      attributes: ["followeeId"]
    });

    const ids = follows.map(f => f.followeeId);

    if (ids.length === 0) {
      return res.json({ items: [] });
    }

    const activities = await Activity.findAll({
      where: { actorId: ids },
      include: [
        {
          model: User,
          as: "Actor",
          attributes: ["id", "username", "displayName", "avatarUrl"]
        }
      ],
      order: [["createdAt", "DESC"]],
      limit: 50
    });

    res.json({ items: activities });
  } catch (err) {
    next(err);
  }
};
