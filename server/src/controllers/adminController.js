const mongoose = require('mongoose');
const User = require('../models/User');
const Report = require('../models/Report');
const MatchTrip = require('../models/MatchTrip');
const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');

const safeUserProjection = 'name email role isActive age location interests travelPreferences verificationStatus lastActiveAt createdAt updatedAt';

const getUsers = async (req, res, next) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 25, 1), 100);
    const skip = (page - 1) * limit;
    const search = String(req.query.search || '').trim();
    const role = String(req.query.role || '').trim();
    const isActive = req.query.isActive;

    const filters = {};
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filters.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
      ];
    }
    if (['user', 'admin'].includes(role)) filters.role = role;
    if (isActive === 'true' || isActive === 'false') filters.isActive = isActive === 'true';

    const [users, total] = await Promise.all([
      User.find(filters).select(safeUserProjection).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filters),
    ]);

    return res.json({
      success: true,
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user id.' });
    }
    if (id === req.userId) {
      return res.status(400).json({ success: false, message: 'An admin cannot delete their own account.' });
    }

    const user = await User.findById(id).select('_id');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    await Promise.all([
      User.deleteOne({ _id: id }),
      Report.deleteMany({ $or: [{ reporter: id }, { reportedUser: id }, { reviewedBy: id }] }),
      Message.deleteMany({ sender: id }),
      ChatRoom.deleteMany({ participants: id }),
    ]);

    return res.json({ success: true, message: 'User deleted successfully.', userId: id });
  } catch (error) {
    next(error);
  }
};

const getReports = async (req, res, next) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 25, 1), 100);
    const skip = (page - 1) * limit;
    const status = String(req.query.status || '').trim();
    const filters = {};

    if (status) {
      if (!['pending', 'reviewed', 'resolved', 'dismissed'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid report status.' });
      }
      filters.status = status;
    }

    const [reports, total] = await Promise.all([
      Report.find(filters)
        .populate('reporter', 'name email')
        .populate('reportedUser', 'name email role isActive')
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Report.countDocuments(filters),
    ]);

    return res.json({
      success: true,
      reports,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

const updateReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, moderatorNote } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid report id.' });
    }
    if (!['pending', 'reviewed', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'A valid status is required.' });
    }
    if (moderatorNote !== undefined && typeof moderatorNote !== 'string') {
      return res.status(400).json({ success: false, message: 'moderatorNote must be a string.' });
    }

    const report = await Report.findByIdAndUpdate(
      id,
      {
        $set: {
          status,
          ...(moderatorNote !== undefined ? { moderatorNote: moderatorNote.trim() } : {}),
          reviewedBy: req.userId,
          reviewedAt: new Date(),
        },
      },
      { new: true, runValidators: true }
    )
      .populate('reporter', 'name email')
      .populate('reportedUser', 'name email role isActive')
      .populate('reviewedBy', 'name email');

    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
    return res.json({ success: true, message: 'Report updated successfully.', report });
  } catch (error) {
    next(error);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const [totalUsers, activeUsers, totalAdmins, totalMatches, totalMatchedUsers, pendingReports, totalChatRooms, totalMessages] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'admin' }),
      MatchTrip.countDocuments(),
      MatchTrip.aggregate([
        { $project: { matchedCount: { $size: { $ifNull: ['$matchedUsers', []] } } } },
        { $group: { _id: null, count: { $sum: '$matchedCount' } } },
      ]),
      Report.countDocuments({ status: 'pending' }),
      ChatRoom.countDocuments(),
      Message.countDocuments(),
    ]);

    return res.json({
      success: true,
      analytics: {
        totalUsers,
        activeUsers,
        totalAdmins,
        totalMatches,
        totalMatchedUsers: totalMatchedUsers[0]?.count || 0,
        pendingReports,
        totalChatRooms,
        totalMessages,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, deleteUser, getReports, updateReport, getAnalytics };
