const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  sender: { type: String, enum: ['user', 'agent'], required: true },
  timestamp: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
  chatId: { type: String, unique: true, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userEmail: { type: String, required: true },
  userName: { type: String, required: true },
  selectedPlan: {
    id: String,
    title: String,
    subtitle: String,
    price: String,
    originalPrice: String
  },
  messages: [messageSchema],
  status: { 
    type: String, 
    enum: ['active', 'closed', 'pending'], 
    default: 'active' 
  },
  lastActivity: { type: Date, default: Date.now },
  isAgentOnline: { type: Boolean, default: false },
  agentTyping: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Update lastActivity on message push
chatSchema.methods.addMessage = function(message) {
  this.messages.push(message);
  this.lastActivity = new Date();
  return this.save();
};

module.exports = mongoose.model('Chat', chatSchema);
