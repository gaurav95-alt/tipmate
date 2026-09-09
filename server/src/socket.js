const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const ChatRoom = require('./models/ChatRoom');
const Message = require('./models/Message');

const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, '');
    if (!token || !process.env.JWT_SECRET) return next(new Error('Authentication required.'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = String(decoded.userId);
    next();
  } catch (error) {
    next(new Error('Invalid or expired authentication token.'));
  }
};

const setupSocket = (httpServer, corsOrigin) => {
  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigin === '*' ? true : corsOrigin,
      credentials: corsOrigin !== '*',
    },
  });

  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    socket.on('join_room', async ({ roomId } = {}, callback = () => {}) => {
      try {
        const normalizedRoomId = String(roomId || '').trim();
        if (!normalizedRoomId) return callback({ success: false, message: 'roomId is required.' });

        const room = await ChatRoom.findOne({ roomId: normalizedRoomId, participants: socket.userId });
        if (!room) return callback({ success: false, message: 'You do not have access to this chat room.' });

        await socket.join(normalizedRoomId);
        callback({ success: true, roomId: normalizedRoomId });
      } catch (error) {
        callback({ success: false, message: 'Unable to join chat room.' });
      }
    });

    socket.on('send_message', async ({ roomId, text } = {}, callback = () => {}) => {
      try {
        const normalizedRoomId = String(roomId || '').trim();
        const normalizedText = String(text || '').trim();
        if (!normalizedRoomId || !normalizedText) {
          return callback({ success: false, message: 'roomId and text are required.' });
        }
        if (normalizedText.length > 2000) {
          return callback({ success: false, message: 'Message cannot exceed 2000 characters.' });
        }

        const room = await ChatRoom.findOne({ roomId: normalizedRoomId, participants: socket.userId });
        if (!room) return callback({ success: false, message: 'You do not have access to this chat room.' });

        const message = await Message.create({ roomId: normalizedRoomId, sender: socket.userId, text: normalizedText });
        room.lastMessageAt = message.createdAt;
        await room.save();

        const payload = {
          id: message._id,
          roomId: message.roomId,
          senderId: socket.userId,
          text: message.text,
          createdAt: message.createdAt,
        };

        io.to(normalizedRoomId).emit('receive_message', payload);
        callback({ success: true, message: payload });
      } catch (error) {
        callback({ success: false, message: 'Unable to send message.' });
      }
    });

    socket.on('leave_room', async ({ roomId } = {}) => {
      const normalizedRoomId = String(roomId || '').trim();
      if (normalizedRoomId) await socket.leave(normalizedRoomId);
    });
  });

  return io;
};

module.exports = setupSocket;
