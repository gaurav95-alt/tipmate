const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { triggerSos } = require('../controllers/safetyController');

const router = express.Router();

router.post('/sos', authMiddleware, triggerSos);

module.exports = router;
