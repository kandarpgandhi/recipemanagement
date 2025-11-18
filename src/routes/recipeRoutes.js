


const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const authMiddleware = require('../middleware/authMiddleware');

// ---------------------
// SPECIFIC ROUTES FIRST
// ---------------------

router.get('/presign', authMiddleware, recipeController.presign);

router.get('/favorites/list', authMiddleware, recipeController.listFavorites);

router.post('/:id/favorite', authMiddleware, recipeController.favoriteToggle);

// Reviews
router.get('/:id/reviews', recipeController.listReviews);
router.post('/:id/reviews', authMiddleware, recipeController.createReview);
router.delete('/reviews/:id', authMiddleware, recipeController.deleteReview);

// ---------------------
// GENERAL ROUTES
// ---------------------
router.post('/', authMiddleware, recipeController.create);
router.get('/', recipeController.list);

// ---------------------
// DYNAMIC ROUTES LAST
// ---------------------
router.get('/:id', recipeController.get);
router.put('/:id', authMiddleware, recipeController.update);
router.delete('/:id', authMiddleware, recipeController.remove);

module.exports = router;
