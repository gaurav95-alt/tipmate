const Subscription = require('../models/Subscription');

const PRICING = Object.freeze({
  monthly: { amount: 99, currency: 'INR', interval: 'month' },
  yearly: { amount: 649, currency: 'INR', interval: 'year' },
});

const resolveSubscriptionState = async (subscription) => {
  if (!subscription) return null;

  const now = new Date();
  if (subscription.status === 'trialing' && subscription.trialEndsAt && subscription.trialEndsAt <= now) {
    subscription.status = 'expired';
    await subscription.save();
  }

  if (subscription.status === 'active' && subscription.currentPeriodEnd && subscription.currentPeriodEnd <= now) {
    subscription.status = 'expired';
    await subscription.save();
  }

  return subscription;
};

const getSubscription = async (req, res, next) => {
  try {
    let subscription = await Subscription.findOne({ user: req.userId });
    if (!subscription) {
      const trialStartedAt = new Date();
      const trialEndsAt = new Date(trialStartedAt);
      trialEndsAt.setDate(trialEndsAt.getDate() + 7);
      subscription = await Subscription.create({
        user: req.userId,
        plan: 'free',
        status: 'trialing',
        trialStartedAt,
        trialEndsAt,
        currency: 'INR',
      });
    }

    subscription = await resolveSubscriptionState(subscription);
    return res.json({
      success: true,
      subscription,
      access: {
        allowed: ['trialing', 'active'].includes(subscription.status),
        reason: subscription.status === 'trialing' ? 'free_trial' : subscription.status === 'active' ? 'premium' : 'subscription_required',
      },
      pricing: PRICING,
    });
  } catch (error) {
    next(error);
  }
};

const getSubscriptionAccess = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ user: req.userId });
    if (!subscription) {
      return res.status(403).json({ success: false, access: false, message: 'Subscription or free trial is required.' });
    }

    await resolveSubscriptionState(subscription);
    const allowed = ['trialing', 'active'].includes(subscription.status);
    return res.status(allowed ? 200 : 403).json({
      success: allowed,
      access: allowed,
      status: subscription.status,
      billingCycle: subscription.billingCycle || null,
      trialEndsAt: subscription.trialEndsAt || null,
      currentPeriodEnd: subscription.currentPeriodEnd || null,
      message: allowed ? 'Subscription access is active.' : 'Your free trial or subscription has expired. Choose a paid plan to continue.',
    });
  } catch (error) {
    next(error);
  }
};

const createCheckout = async (req, res, next) => {
  try {
    const { gateway = 'pending', billingCycle = 'monthly' } = req.body;
    const pricing = PRICING[billingCycle];
    if (!pricing) {
      return res.status(400).json({
        success: false,
        message: 'Invalid billing cycle. Choose monthly or yearly.',
        pricing: PRICING,
      });
    }

    let subscription = await Subscription.findOne({ user: req.userId });
    if (!subscription) subscription = new Subscription({ user: req.userId });

    subscription.gateway = String(gateway).trim().slice(0, 50);
    subscription.billingCycle = billingCycle;
    subscription.amount = pricing.amount;
    subscription.currency = pricing.currency;

    // Never grant premium access at checkout time. The payment webhook must verify payment first.
    if (subscription.status !== 'active') {
      subscription.status = subscription.trialEndsAt && subscription.trialEndsAt > new Date() ? 'trialing' : 'expired';
    }
    await subscription.save();

    return res.status(201).json({
      success: true,
      message: 'Checkout initialized. Premium access starts only after a verified payment webhook.',
      subscription,
      payment: {
        gateway: subscription.gateway,
        status: 'pending',
        integrationRequired: true,
        amount: pricing.amount,
        currency: pricing.currency,
        billingCycle,
        interval: pricing.interval,
      },
      pricing: PRICING,
    });
  } catch (error) {
    next(error);
  }
};

const handlePaymentWebhook = async (req, res, next) => {
  try {
    const { userId, gateway, gatewaySubscriptionId, paymentId, status, billingCycle, periodStart, periodEnd } = req.body;
    if (!userId || !status) {
      return res.status(400).json({ success: false, message: 'userId and status are required.' });
    }

    const allowedStatuses = ['trialing', 'active', 'cancelled', 'expired'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid subscription status.' });
    }
    if (status === 'active' && !PRICING[billingCycle]) {
      return res.status(400).json({ success: false, message: 'A valid billingCycle is required for an active subscription.' });
    }

    const update = {
      status,
      gateway,
      gatewaySubscriptionId,
      lastPaymentId: paymentId,
    };

    if (status === 'active') {
      update.plan = 'premium';
      update.billingCycle = billingCycle;
      update.amount = PRICING[billingCycle].amount;
      update.currency = 'INR';
      update.currentPeriodStart = periodStart ? new Date(periodStart) : new Date();
      update.currentPeriodEnd = periodEnd ? new Date(periodEnd) : undefined;
    } else if (status === 'cancelled' || status === 'expired') {
      update.plan = 'free';
    }

    const subscription = await Subscription.findOneAndUpdate(
      { user: userId },
      { $set: update },
      { upsert: true, new: true, runValidators: true }
    );

    return res.json({ success: true, message: 'Verified payment webhook processed.', subscriptionId: subscription._id });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSubscription, getSubscriptionAccess, createCheckout, handlePaymentWebhook, PRICING };
