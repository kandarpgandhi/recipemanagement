const bcrypt = require('bcrypt');
const { User } = require('../models');
const { signToken } = require('../services/jwtService');
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, displayName } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: 'Missing fields' });
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: 'Email in use' });
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const user = await User.create({ username, email, passwordHash, displayName });
    const token = signToken(user);
    res.json({ user: { id: user.id, username: user.username, email: user.email, displayName: user.displayName, isAdmin: user.isAdmin }, token });
  } catch (err) { next(err); }
};
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing fields' });
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
    const token = signToken(user);
    res.json({ user: { id: user.id, username: user.username, email: user.email, isAdmin: user.isAdmin }, token });
  } catch (err) { next(err); }
};
exports.me = async (req, res, next) => {
  try {
    const user = req.user;
    res.json({ id: user.id, username: user.username, email: user.email, displayName: user.displayName, bio: user.bio, avatarUrl: user.avatarUrl, isAdmin: user.isAdmin });
  } catch (err) { next(err); }
};
