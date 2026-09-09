const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  getUsers,
  deleteUser,
  getReports,
  updateReport,
  getAnalytics,
} = require('../controllers/adminController');

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.get('/reports', getReports);
router.put('/reports/:id', updateReport);
router.get('/analytics', getAnalytics);

module.exports = router;
