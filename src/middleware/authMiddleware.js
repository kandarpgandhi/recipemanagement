const jwt = require('jsonwebtoken');
const { User } = require('../models');
module.exports = async function authMiddleware(req, res, next) {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: 'No token' });
    const token = auth.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(payload.sub);
    if (!user) return res.status(401).json({ message: 'Invalid token (user not found)' });
    if (user.isBanned) return res.status(403).json({ message: 'Account banned' });
    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Invalid token' });
  }
};
