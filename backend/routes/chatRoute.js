const express = require('express');
const router = express.Router();
const {
  createOrGetChat,
  getChatHistory,
  getActiveChats,
  sendMessage,
  updateChatStatus
} = require('../controllers/chatController');

// Create or get existing chat
router.post('/create', createOrGetChat);

// Get chat history
router.get('/history/:chatId', getChatHistory);

// Get all active chats (for agent dashboard)
router.get('/active', getActiveChats);

// Send message
router.post('/message', sendMessage);

// Update chat status
router.put('/status/:chatId', updateChatStatus);

module.exports = router;
