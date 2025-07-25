const Chat = require("../models/Chat");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Generate cryptographically secure chat ID
const generateChatId = () => {
  return "chat_" + Date.now() + "_" + crypto.randomBytes(16).toString("hex");
};

// Verify JWT token and extract user info
const verifyToken = (req) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    throw new Error("No token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error("Invalid token");
  }
};

// Create or get existing chat
const createOrGetChat = async (req, res) => {
  try {
    const { id, email, name } = verifyToken(req);

    if (!email || !name) {
      return res.status(401).json({
        msg: "Authentication error: Missing user information in token. Please login again.",
      });
    }

    let existingChat = await Chat.findOne({ userEmail: email });

    if (existingChat) {
      return res.status(200).json(existingChat);
    }

    const newChat = new Chat({
      chatId: generateChatId(),
      userEmail: email,
      userName: name,
      messages: [],
    });

    await newChat.save();
    res.status(201).json(newChat);
  } catch (err) {
    console.error("Error creating or fetching chat:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get chat history
const getChatHistory = async (req, res) => {
  try {
    const { chatId } = req.params;

    // Verify user authentication
    const userInfo = verifyToken(req);

    // Find chat and verify ownership
    const chat = await Chat.findOne({
      chatId,
      userId: userInfo.id, // Ensure user can only access their own chats
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found or access denied",
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
        userEmail: chat.userEmail,
      },
    });
  } catch (error) {
    console.error("Error getting chat history:", error);
    res.status(500).json({
      success: false,
      message:
        error.message === "No token provided" ||
        error.message === "Invalid token"
          ? "Authentication required"
          : "Error retrieving chat history",
    });
  }
};

// Get all active chats for agent dashboard
const getActiveChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      status: "active",
    }).sort({ lastActivity: -1 });

    const chatsList = chats.map((chat) => ({
      chatId: chat.chatId,
      userName: chat.userName,
      userEmail: chat.userEmail,
      selectedPlan: chat.selectedPlan,
      lastActivity: chat.lastActivity,
      messageCount: chat.messages.length,
      lastMessage:
        chat.messages.length > 0
          ? chat.messages[chat.messages.length - 1]
          : null,
      isAgentOnline: chat.isAgentOnline,
      agentTyping: chat.agentTyping,
    }));

    res.json({
      success: true,
      chats: chatsList,
    });
  } catch (error) {
    console.error("Error getting active chats:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving chats",
    });
  }
};

// Get chat history for agents (agents can access any chat)
const getAgentChatHistory = async (req, res) => {
  try {
    const { chatId } = req.params;

    // Note: In a production app, you'd verify agent token here
    // const agentInfo = verifyAgentToken(req);

    const chat = await Chat.findOne({ chatId });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
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
        userEmail: chat.userEmail,
      },
    });
  } catch (error) {
    console.error("Error getting agent chat history:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving chat history",
    });
  }
};

// Send message
const sendMessage = async (req, res) => {
  try {
    const { chatId, text, sender } = req.body;

    // Verify user authentication for regular users
    if (sender === "user") {
      const userInfo = verifyToken(req);

      // Find chat and verify ownership
      const chat = await Chat.findOne({
        chatId,
        userId: userInfo.id, // Ensure user can only send messages to their own chats
      });

      if (!chat) {
        return res.status(404).json({
          success: false,
          message: "Chat not found or access denied",
        });
      }

      const message = {
        text,
        sender,
        timestamp: new Date(),
      };

      await chat.addMessage(message);

      res.json({
        success: true,
        message,
      });
    } else {
      // For agent messages, verify agent token (implement agent auth)
      const chat = await Chat.findOne({ chatId });
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: "Chat not found",
        });
      }

      const message = {
        text,
        sender,
        timestamp: new Date(),
      };

      await chat.addMessage(message);

      res.json({
        success: true,
        message,
      });
    }
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message:
        error.message === "No token provided" ||
        error.message === "Invalid token"
          ? "Authentication required"
          : "Error sending message",
    });
  }
};

// Update chat status
const updateChatStatus = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { status } = req.body;

    // Verify user authentication
    const userInfo = verifyToken(req);

    // Find chat and verify ownership
    const chat = await Chat.findOneAndUpdate(
      { chatId, userId: userInfo.id }, // Ensure user can only update their own chats
      { status, lastActivity: new Date() },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found or access denied",
      });
    }

    res.json({
      success: true,
      chat: {
        chatId: chat.chatId,
        status: chat.status,
      },
    });
  } catch (error) {
    console.error("Error updating chat status:", error);
    res.status(500).json({
      success: false,
      message:
        error.message === "No token provided" ||
        error.message === "Invalid token"
          ? "Authentication required"
          : "Error updating chat status",
    });
  }
};

// Get user's own chats
const getUserChats = async (req, res) => {
  try {
    // Verify user authentication
    const userInfo = verifyToken(req);

    const chats = await Chat.find({
      userId: userInfo.id, // Only return user's own chats
    }).sort({ lastActivity: -1 });

    const chatsList = chats.map((chat) => ({
      chatId: chat.chatId,
      selectedPlan: chat.selectedPlan,
      lastActivity: chat.lastActivity,
      messageCount: chat.messages.length,
      lastMessage:
        chat.messages.length > 0
          ? chat.messages[chat.messages.length - 1]
          : null,
      status: chat.status,
    }));

    res.json({
      success: true,
      chats: chatsList,
    });
  } catch (error) {
    console.error("Error getting user chats:", error);
    res.status(500).json({
      success: false,
      message:
        error.message === "No token provided" ||
        error.message === "Invalid token"
          ? "Authentication required"
          : "Error retrieving chats",
    });
  }
};

module.exports = {
  createOrGetChat,
  getChatHistory,
  getActiveChats,
  getAgentChatHistory,
  sendMessage,
  updateChatStatus,
  getUserChats,
};
