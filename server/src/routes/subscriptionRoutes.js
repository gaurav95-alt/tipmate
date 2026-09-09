const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getSubscription, createCheckout, handlePaymentWebhook } = require('../controllers/subscriptionController');

const router = express.Router();

router.get('/', authMiddleware, getSubscription);
router.post('/checkout', authMiddleware, createCheckout);

// Payment providers should call this endpoint after adding provider-specific
// signature verification in production.
router.post('/webhook', handlePaymentWebhook);

module.exports = router;
