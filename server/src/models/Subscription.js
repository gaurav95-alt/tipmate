const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    plan: { type: String, enum: ['free', 'premium'], default: 'free', index: true },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending', 'cancelled', 'expired'],
      default: 'active',
      index: true,
    },
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

module.exports = mongoose.model('Subscription', subscriptionSchema);
