require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');
const MongoStore = require('connect-mongo');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://arleen-credits.vercel.app", "http://localhost:3000"],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: ["https://arleen-credits.vercel.app", "http://localhost:3000"],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Routes
app.use('/auth', require('./routes/authRoute'));
app.use('/chat', require('./routes/chatRoute'));
app.use('/agent', require('./routes/agentRoute'));

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Import Chat model for socket operations
const Chat = require('./models/Chat');

// Import JWT for socket authentication
const jwt = require('jsonwebtoken');

// Socket authentication middleware
const socketAuth = (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication required'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Use the correct field names from JWT payload
    socket.userId = decoded.id || decoded.userId;
    socket.userEmail = decoded.email || decoded.userEmail || (decoded.username + '@system');
    socket.userName = decoded.userName || decoded.name;
    socket.isAgent = decoded.role === 'agent' || decoded.type === 'agent';
    
    console.log('Socket auth - decoded JWT:', {
      id: decoded.id,
      userId: decoded.userId,
      email: decoded.email,
      userEmail: decoded.userEmail,
      userName: decoded.userName,
      name: decoded.name,
      role: decoded.role,
      type: decoded.type
    });
    
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Invalid token'));
  }
};

// Apply authentication middleware
io.use(socketAuth);

// Socket.io enhanced chat functionality with authentication
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}, userId: ${socket.userId}`);

  // Join a specific chat room with ownership verification
  socket.on('join_chat', async (data) => {
    try {
      const { chatId, userType } = data; // userType: 'user' or 'agent'
      
      // Verify chat ownership for regular users
      if (userType === 'user') {
        const chat = await Chat.findOne({ 
          chatId, 
          userId: socket.userId  // Verify user owns this chat
        });
        
        if (!chat) {
          socket.emit('error', { message: 'Chat not found or access denied' });
          return;
        }
      }
      
      socket.join(chatId);
      console.log(`${userType} (${socket.userId}) joined chat: ${chatId}`);
      
      // Update agent online status if agent joins
      if (userType === 'agent') {
        Chat.findOneAndUpdate(
          { chatId },
          { isAgentOnline: true },
          { new: true }
        ).then(() => {
          socket.to(chatId).emit('agent_status', { isOnline: true });
        });
      }
    } catch (error) {
      console.error('Error joining chat:', error);
      socket.emit('error', { message: 'Failed to join chat' });
    }
  });

  // Handle real-time messages with ownership verification
  socket.on('send_message', async (data) => {
    try {
      const { chatId, text, sender, senderName } = data;
      
      // Verify message sending permissions
      if (sender === 'user') {
        // Regular users can only send messages to their own chats
        const chat = await Chat.findOne({ 
          chatId, 
          userId: socket.userId  // Verify user owns this chat
        });
        
        if (!chat) {
          socket.emit('message_error', { error: 'Chat not found or access denied' });
          return;
        }
        
        const message = {
          text,
          sender,
          timestamp: new Date()
        };
        
        await chat.addMessage(message);
        
        // Emit to all users in the chat room
        io.to(chatId).emit('receive_message', {
          ...message,
          senderName,
          chatId
        });
        
        // Update agent dashboard with new message notification
        io.emit('new_message_notification', {
          chatId,
          userName: chat.userName,
          userEmail: chat.userEmail,
          lastMessage: message,
          sender
        });
      } else if (sender === 'agent' && socket.isAgent) {
        // Agents can send messages to any chat
        const chat = await Chat.findOne({ chatId });
        if (chat) {
          const message = {
            text,
            sender,
            timestamp: new Date()
          };
          
          await chat.addMessage(message);
          
          // Emit to all users in the chat room
          io.to(chatId).emit('receive_message', {
            ...message,
            senderName,
            chatId
          });
          
          // Update agent dashboard with new message notification
          io.emit('new_message_notification', {
            chatId,
            userName: chat.userName,
            userEmail: chat.userEmail,
            lastMessage: message,
            sender
          });
        }
      } else {
        socket.emit('message_error', { error: 'Unauthorized to send message' });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  });

  // Handle typing indicators with ownership verification
  socket.on('typing_start', async (data) => {
    try {
      const { chatId, userType } = data;
      
      // Verify user can access this chat
      if (userType === 'user') {
        const chat = await Chat.findOne({ 
          chatId, 
          userId: socket.userId 
        });
        if (!chat) return;
      }
      
      socket.to(chatId).emit('user_typing', { userType, isTyping: true });
      
      if (userType === 'agent') {
        Chat.findOneAndUpdate(
          { chatId },
          { agentTyping: true }
        ).exec();
      }
    } catch (error) {
      console.error('Error handling typing start:', error);
    }
  });

  socket.on('typing_stop', async (data) => {
    try {
      const { chatId, userType } = data;
      
      // Verify user can access this chat
      if (userType === 'user') {
        const chat = await Chat.findOne({ 
          chatId, 
          userId: socket.userId 
        });
        if (!chat) return;
      }
      
      socket.to(chatId).emit('user_typing', { userType, isTyping: false });
      
      if (userType === 'agent') {
        Chat.findOneAndUpdate(
          { chatId },
          { agentTyping: false }
        ).exec();
      }
    } catch (error) {
      console.error('Error handling typing stop:', error);
    }
  });

  // Handle leaving chat with ownership verification
  socket.on('leave_chat', async (data) => {
    try {
      const { chatId, userType } = data;
      
      // Verify user can access this chat
      if (userType === 'user') {
        const chat = await Chat.findOne({ 
          chatId, 
          userId: socket.userId 
        });
        if (!chat) return;
      }
      
      if (userType === 'agent') {
        Chat.findOneAndUpdate(
          { chatId },
          { isAgentOnline: false, agentTyping: false }
        ).then(() => {
          socket.to(chatId).emit('agent_status', { isOnline: false });
        });
      }
      
      socket.leave(chatId);
    } catch (error) {
      console.error('Error leaving chat:', error);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Note: In a production app, you'd want to track which chats the user was in
    // and update their online status accordingly
  });
});

// Server start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
