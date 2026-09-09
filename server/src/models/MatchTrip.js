const mongoose = require('mongoose');

const matchTripSchema = new mongoose.Schema(
  {
    destination: { type: String, required: true, trim: true, maxlength: 150, index: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    budget: { type: String, required: true, trim: true, maxlength: 50 },
    matchedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
  },
  { timestamps: true }
);

matchTripSchema.index({ destination: 1, startDate: 1, endDate: 1 });

matchTripSchema.pre('validate', function (next) {
  if (this.endDate < this.startDate) {
    return next(new Error('End date must be on or after start date.'));
  }
  next();
});

module.exports = mongoose.model('MatchTrip', matchTripSchema);
