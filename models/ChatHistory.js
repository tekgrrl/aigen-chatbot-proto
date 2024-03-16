const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  prompt: {
    type: String,
    required: true
  },
  response: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

chatHistorySchema.pre('save', function(next) {
  console.log(`Saving chat history for user ${this.userId}`);
  next();
});

chatHistorySchema.post('save', function(doc, next) {
  console.log(`Chat history saved for user ${doc.userId}`);
  next();
});

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);

module.exports = ChatHistory;