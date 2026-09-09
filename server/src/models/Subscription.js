const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    plan: { type: String, enum: ['free', 'premium'], default: 'free', index: true },
    status: {
      type: String,
      enum: ['trialing', 'active', 'cancelled', 'expired'],
      default: 'trialing',
      index: true,
    },
    billingCycle: { type: String, enum: ['monthly', 'yearly'] },
    amount: { type: Number, min: 0 },
    currency: { type: String, uppercase: true, trim: true, maxlength: 3, default: 'INR' },
    trialStartedAt: { type: Date },
    trialEndsAt: { type: Date, index: true },
    gateway: { type: String, trim: true, maxlength: 50 },
    gatewayCustomerId: { type: String, trim: true, maxlength: 150 },
    gatewaySubscriptionId: { type: String, trim: true, maxlength: 150 },
    currentPeriodStart: { type: Date },
    currentPeriodEnd: { type: Date },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    lastPaymentId: { type: String, trim: true, maxlength: 150 },
  },
  { timestamps: true }
);

subscriptionSchema.index({ plan: 1, status: 1 });
subscriptionSchema.index({ billingCycle: 1, status: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
