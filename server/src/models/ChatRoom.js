const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true, trim: true, maxlength: 120, index: true },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessageAt: { type: Date },
  },
  { timestamps: true }
);

chatRoomSchema.index({ participants: 1 });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
