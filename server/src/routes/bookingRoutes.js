const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { createBooking, getBookings, updateBookingStatus } = require('../controllers/bookingController');

const router = express.Router();

router.use(authMiddleware);
router.post('/', createBooking);
router.get('/', getBookings);
router.put('/:id/status', updateBookingStatus);

module.exports = router;
