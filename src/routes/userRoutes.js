// const express = require('express');
// const router = express.Router();
// const userController = require('../controllers/userController');
// const authMiddleware = require('../middleware/authMiddleware');

// router.get('/me', authMiddleware, userController.getProfile);

// router.get('/list', authMiddleware, userController.listUsers);



// router.get('/:id', userController.getProfile);
// router.put('/me', authMiddleware, userController.updateProfile);

// module.exports = router;

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

// My profile
router.get('/me', auth, userController.getProfile);

// Public users list (no auth required)
router.get('/list', userController.listPublicUsers);

// Public profile
router.get('/:id', userController.getProfile);

// Update my profile
router.put('/me', auth, userController.updateProfile);

module.exports = router;
