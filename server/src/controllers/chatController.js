const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');

const normalizeRoomId = (value) => String(value || '').trim();

const ensureRoomAccess = async (roomId, userId) => {
  const room = await ChatRoom.findOne({ roomId, participants: userId });
  return room;
};

const createOrGetRoom = async (req, res, next) => {
  try {
    const { roomId, participantIds = [] } = req.body;
    const normalizedRoomId = normalizeRoomId(roomId);

    if (!normalizedRoomId) {
      return res.status(400).json({ success: false, message: 'roomId is required.' });
    }

    if (!Array.isArray(participantIds)) {
      return res.status(400).json({ success: false, message: 'participantIds must be an array.' });
    }

    const participants = [...new Set([req.userId, ...participantIds.map(String)])];
    if (participants.length < 2) {
      return res.status(400).json({ success: false, message: 'A chat room requires at least two participants.' });
    }

    let room = await ChatRoom.findOne({ roomId: normalizedRoomId });
    if (room) {
      const isParticipant = room.participants.some((id) => id.toString() === req.userId);
      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'You are not a participant in this chat room.' });
      }
    } else {
      room = await ChatRoom.create({ roomId: normalizedRoomId, participants });
    }

    return res.status(200).json({ success: true, room });
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const roomId = normalizeRoomId(req.params.roomId);
    const room = await ensureRoomAccess(roomId, req.userId);

    if (!room) {
      return res.status(403).json({ success: false, message: 'You do not have access to this chat room.' });
    }

    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
    const messages = await Message.find({ roomId })
      .populate('sender', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return res.json({ success: true, roomId, messages: messages.reverse() });
  } catch (error) {
    next(error);
  }
};

module.exports = { ensureRoomAccess, createOrGetRoom, getMessages };
