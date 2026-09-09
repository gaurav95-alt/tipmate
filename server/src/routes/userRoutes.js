const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { updateProfile, searchUsers } = require('../controllers/userController');

const router = express.Router();

router.use(authMiddleware);
router.put('/profile', updateProfile);
router.get('/search', searchUsers);

module.exports = router;
