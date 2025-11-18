const jwt = require('jsonwebtoken');
function signToken(user) {
  const payload = { sub: user.id, role: user.isAdmin ? 'admin' : 'user' };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
}
module.exports = { signToken };
