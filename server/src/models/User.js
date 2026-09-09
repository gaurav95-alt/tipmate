const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
  },
  { _id: false }
);

const travelPreferencesSchema = new mongoose.Schema(
  {
    budget: { type: String, trim: true, maxlength: 50 },
    destinations: [{ type: String, trim: true, maxlength: 100 }],
    travelStyle: { type: String, trim: true, maxlength: 50 },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    // Store only a bcrypt/argon2 hash here; never persist a plaintext password.
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
    isActive: { type: Boolean, default: true, index: true },
    lastActiveAt: { type: Date, default: Date.now, index: true },
    age: { type: Number, min: 18, max: 120 },
    location: { type: String, trim: true, maxlength: 150 },
    interests: [{ type: String, trim: true, maxlength: 50 }],
    travelPreferences: { type: travelPreferencesSchema, default: () => ({}) },
    verificationStatus: { type: Boolean, default: false },
    emergencyContacts: { type: [emergencyContactSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
