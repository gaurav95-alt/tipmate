const User = require('../models/User');

const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'name',
      'age',
      'location',
      'interests',
      'travelPreferences',
      'emergencyContacts',
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({ success: true, message: 'Profile updated successfully.', user });
  } catch (error) {
    next(error);
  }
};

const searchUsers = async (req, res, next) => {
  try {
    const { destination, budget } = req.query;
    const filters = { _id: { $ne: req.userId } };

    if (destination) {
      filters['travelPreferences.destinations'] = {
        $regex: destination.trim(),
        $options: 'i',
      };
    }

    if (budget) {
      filters['travelPreferences.budget'] = {
        $regex: `^${budget.trim()}$`,
        $options: 'i',
      };
    }

    const users = await User.find(filters)
      .select('-password')
      .limit(50)
      .sort({ verificationStatus: -1, createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      count: users.length,
      filters: { destination: destination || null, budget: budget || null },
      users,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { updateProfile, searchUsers };
