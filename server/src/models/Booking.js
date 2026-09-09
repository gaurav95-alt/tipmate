const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    provider: { type: String, trim: true, maxlength: 80 },
    externalBookingId: { type: String, trim: true, maxlength: 150 },
    bookingType: { type: String, trim: true, maxlength: 50, default: 'travel' },
    destination: { type: String, trim: true, maxlength: 150 },
    amount: { type: Number, min: 0, required: true },
    currency: { type: String, uppercase: true, trim: true, maxlength: 3, default: 'INR' },
    commissionRate: { type: Number, min: 0, max: 100, default: 0 },
    commissionAmount: { type: Number, min: 0, default: 0 },
    status: {
      type: String,
      enum: ['initiated', 'confirmed', 'completed', 'cancelled', 'refunded', 'failed'],
      default: 'initiated',
      index: true,
    },
    paymentGateway: { type: String, trim: true, maxlength: 50 },
    paymentReference: { type: String, trim: true, maxlength: 150 },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ provider: 1, externalBookingId: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
