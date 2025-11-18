const express = require('express');
const router = express.Router();
const social = require('../controllers/socialController');
const auth = require('../middleware/authMiddleware');

router.post('/follow/:id', auth, social.follow);
router.delete('/follow/:id', auth, social.unfollow);
router.get('/followers/:id', social.getFollowers);
router.get('/following/:id', social.getFollowing);
router.get('/feed', auth, social.feed);

module.exports = router;
