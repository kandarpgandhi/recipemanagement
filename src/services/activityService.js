const { Activity } = require('../models');
async function pushActivity(actorId, type, payload) {
  return Activity.create({ actorId, type, payload });
}
module.exports = { pushActivity };
