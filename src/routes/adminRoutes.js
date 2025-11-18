const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/users', authMiddleware, adminMiddleware, adminController.listUsers);
router.put('/users/:id', authMiddleware, adminMiddleware, adminController.updateUser);
router.get('/recipes', authMiddleware, adminMiddleware, adminController.listRecipes);

module.exports = router;

