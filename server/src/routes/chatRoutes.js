const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { createOrGetRoom, getMessages } = require('../controllers/chatController');

const router = express.Router();

router.use(authMiddleware);
router.post('/rooms', createOrGetRoom);
router.get('/rooms/:roomId/messages', getMessages);

module.exports = router;
