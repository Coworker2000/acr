const express = require('express');
const router = express.Router();
const {
  createOrGetChat,
  getChatHistory,
  getActiveChats,
  getAgentChatHistory,
  sendMessage,
  updateChatStatus,
  getUserChats
} = require('../controllers/chatController');
const verifyToken = require('../middleware/verifyToken');

// Create or get existing chat (requires authentication)
router.post('/create', createOrGetChat);

// Get chat history (requires authentication)
router.get('/history/:chatId', verifyToken, getChatHistory);

// Get user's own chats (requires authentication)
router.get('/user/chats', verifyToken, getUserChats);

// Get all active chats (for agent dashboard - agents only)
router.get('/active', getActiveChats);

// Get chat history for agents (agents can access any chat)
router.get('/agent/history/:chatId', getAgentChatHistory);

// Send message (requires authentication)
router.post('/message', verifyToken, sendMessage);

// Update chat status (requires authentication)
router.put('/status/:chatId', verifyToken, updateChatStatus);

module.exports = router;
