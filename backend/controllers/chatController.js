const Chat = require('../models/Chat');
const jwt = require('jsonwebtoken');

// Generate unique chat ID
const generateChatId = () => {
  return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Create or get existing chat
const createOrGetChat = async (req, res) => {
  try {
    const { userEmail, userName, selectedPlan } = req.body;
    
    // Check if user already has an active chat
    let chat = await Chat.findOne({ 
      userEmail, 
      status: 'active' 
    }).sort({ lastActivity: -1 });
    
    if (!chat) {
      // Create new chat
      chat = new Chat({
        chatId: generateChatId(),
        userEmail,
        userName,
        selectedPlan: selectedPlan || null,
        messages: []
      });
      
      // Add welcome message
      const welcomeMessage = {
        text: selectedPlan
          ? `Hello ${userName}! I see you're interested in our ${selectedPlan.title}${selectedPlan.price ? ` for ${selectedPlan.price}` : ""}. I'm here to help you with pricing, payment options, and answer any questions you might have about this program. How can I assist you today?`
          : `Hello ${userName}! Welcome to The Arleen Credit Repair Program. I'm here to help you choose the right plan and answer any questions about our services. How can I assist you today?`,
        sender: 'agent',
        timestamp: new Date()
      };
      
      chat.messages.push(welcomeMessage);
      await chat.save();
    }
    
    res.json({
      success: true,
      chat: {
        chatId: chat.chatId,
        messages: chat.messages,
        selectedPlan: chat.selectedPlan,
        status: chat.status
      }
    });
  } catch (error) {
    console.error('Error creating/getting chat:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating chat'
    });
  }
};

// Get chat history
const getChatHistory = async (req, res) => {
  try {
    const { chatId } = req.params;
    
    const chat = await Chat.findOne({ chatId });
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    
    res.json({
      success: true,
      chat: {
        chatId: chat.chatId,
        messages: chat.messages,
        selectedPlan: chat.selectedPlan,
        status: chat.status,
        userName: chat.userName,
        userEmail: chat.userEmail
      }
    });
  } catch (error) {
    console.error('Error getting chat history:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving chat history'
    });
  }
};

// Get all active chats for agent dashboard
const getActiveChats = async (req, res) => {
  try {
    const chats = await Chat.find({ 
      status: 'active'
    }).sort({ lastActivity: -1 });
    
    const chatsList = chats.map(chat => ({
      chatId: chat.chatId,
      userName: chat.userName,
      userEmail: chat.userEmail,
      selectedPlan: chat.selectedPlan,
      lastActivity: chat.lastActivity,
      messageCount: chat.messages.length,
      lastMessage: chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null,
      isAgentOnline: chat.isAgentOnline,
      agentTyping: chat.agentTyping
    }));
    
    res.json({
      success: true,
      chats: chatsList
    });
  } catch (error) {
    console.error('Error getting active chats:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving chats'
    });
  }
};

// Send message
const sendMessage = async (req, res) => {
  try {
    const { chatId, text, sender } = req.body;
    
    const chat = await Chat.findOne({ chatId });
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    
    const message = {
      text,
      sender,
      timestamp: new Date()
    };
    
    await chat.addMessage(message);
    
    res.json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message'
    });
  }
};

// Update chat status
const updateChatStatus = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { status } = req.body;
    
    const chat = await Chat.findOneAndUpdate(
      { chatId },
      { status, lastActivity: new Date() },
      { new: true }
    );
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    
    res.json({
      success: true,
      chat: {
        chatId: chat.chatId,
        status: chat.status
      }
    });
  } catch (error) {
    console.error('Error updating chat status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating chat status'
    });
  }
};

module.exports = {
  createOrGetChat,
  getChatHistory,
  getActiveChats,
  sendMessage,
  updateChatStatus
};
