const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getSubscription,
  getSubscriptionAccess,
  createCheckout,
  handlePaymentWebhook,
} = require('../controllers/subscriptionController');

const router = express.Router();

router.get('/', authMiddleware, getSubscription);
router.get('/access', authMiddleware, getSubscriptionAccess);
router.post('/checkout', authMiddleware, createCheckout);

// Provider-specific signature verification must be added before accepting production webhooks.
// The webhook is the trust boundary: only a verified provider event should activate premium access.
router.post('/webhook', handlePaymentWebhook);

module.exports = router;
