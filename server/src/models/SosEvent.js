const mongoose = require('mongoose');

const sosEventSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    location: {
      latitude: { type: Number, required: true, min: -90, max: 90 },
      longitude: { type: Number, required: true, min: -180, max: 180 },
      accuracy: { type: Number, min: 0 },
    },
    message: { type: String, trim: true, maxlength: 500 },
    emergencyContacts: [
      {
        name: { type: String, trim: true, maxlength: 100 },
        phone: { type: String, trim: true, maxlength: 30 },
      },
    ],
    status: {
      type: String,
      enum: ['triggered', 'acknowledged', 'resolved'],
      default: 'triggered',
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SosEvent', sosEventSchema);
