const Subscription = require('../models/Subscription');

const getSubscription = async (req, res, next) => {
  try {
    let subscription = await Subscription.findOne({ user: req.userId }).lean();
    if (!subscription) {
      subscription = await Subscription.create({ user: req.userId, plan: 'free', status: 'active' });
      subscription = subscription.toObject();
    }
    return res.json({ success: true, subscription });
  } catch (error) {
    next(error);
  }
};

const createCheckout = async (req, res, next) => {
  try {
    const { gateway = 'pending', plan = 'premium' } = req.body;
    if (plan !== 'premium') {
      return res.status(400).json({ success: false, message: 'Only premium checkout is supported.' });
    }

    let subscription = await Subscription.findOne({ user: req.userId });
    if (!subscription) subscription = new Subscription({ user: req.userId });

    subscription.plan = 'premium';
    subscription.status = 'pending';
    subscription.gateway = String(gateway).trim().slice(0, 50);
    await subscription.save();

    return res.status(201).json({
      success: true,
      message: 'Checkout initialized. Connect the payment gateway to complete payment.',
      subscription,
      payment: {
        gateway: subscription.gateway,
        status: 'pending',
        integrationRequired: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

const handlePaymentWebhook = async (req, res, next) => {
  try {
    const { userId, gateway, gatewaySubscriptionId, paymentId, status, periodStart, periodEnd } = req.body;
    if (!userId || !status) {
      return res.status(400).json({ success: false, message: 'userId and status are required.' });
    }

    const allowedStatuses = ['active', 'inactive', 'pending', 'cancelled', 'expired'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid subscription status.' });
    }

    const subscription = await Subscription.findOneAndUpdate(
      { user: userId },
      {
        $set: {
          plan: status === 'active' ? 'premium' : 'free',
          status,
          gateway,
          gatewaySubscriptionId,
          lastPaymentId: paymentId,
          currentPeriodStart: periodStart ? new Date(periodStart) : undefined,
          currentPeriodEnd: periodEnd ? new Date(periodEnd) : undefined,
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    return res.json({ success: true, message: 'Payment webhook processed.', subscriptionId: subscription._id });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSubscription, createCheckout, handlePaymentWebhook };
