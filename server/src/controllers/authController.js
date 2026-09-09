const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

const TRIAL_DAYS = 7;

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured.');
  return process.env.JWT_SECRET;
};

const createToken = (userId) => jwt.sign({ userId }, getJwtSecret(), {
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
});

const getTrialEnd = (start = new Date()) => {
  const end = new Date(start);
  end.setDate(end.getDate() + TRIAL_DAYS);
  return end;
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, age, location, interests, travelPreferences, emergencyContacts } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const trialStartedAt = new Date();
    const trialEndsAt = getTrialEnd(trialStartedAt);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      age,
      location,
      interests,
      travelPreferences,
      emergencyContacts,
      trialEndsAt,
      lastActiveAt: trialStartedAt,
    });

    await Subscription.create({
      user: user._id,
      plan: 'free',
      status: 'trialing',
      trialStartedAt,
      trialEndsAt,
      currency: 'INR',
    });

    const token = createToken(user._id.toString());
    return res.status(201).json({
      success: true,
      message: 'Registration successful. Your 7-day free trial has started.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        verificationStatus: user.verificationStatus,
        trialEndsAt: user.trialEndsAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'This account has been deactivated.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    user.lastActiveAt = new Date();
    await user.save();

    const token = createToken(user._id.toString());
    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        verificationStatus: user.verificationStatus,
        trialEndsAt: user.trialEndsAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login };
