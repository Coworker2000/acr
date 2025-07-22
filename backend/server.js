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

// Socket.io enhanced chat functionality
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a specific chat room
  socket.on('join_chat', (data) => {
    const { chatId, userType } = data; // userType: 'user' or 'agent'
    socket.join(chatId);
    console.log(`${userType} joined chat: ${chatId}`);
    
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
  });

  // Handle real-time messages
  socket.on('send_message', async (data) => {
    try {
      const { chatId, text, sender, senderName } = data;
      
      // Save message to database
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
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing_start', (data) => {
    const { chatId, userType } = data;
    socket.to(chatId).emit('user_typing', { userType, isTyping: true });
    
    if (userType === 'agent') {
      Chat.findOneAndUpdate(
        { chatId },
        { agentTyping: true }
      ).exec();
    }
  });

  socket.on('typing_stop', (data) => {
    const { chatId, userType } = data;
    socket.to(chatId).emit('user_typing', { userType, isTyping: false });
    
    if (userType === 'agent') {
      Chat.findOneAndUpdate(
        { chatId },
        { agentTyping: false }
      ).exec();
    }
  });

  // Handle agent leaving chat
  socket.on('leave_chat', (data) => {
    const { chatId, userType } = data;
    
    if (userType === 'agent') {
      Chat.findOneAndUpdate(
        { chatId },
        { isAgentOnline: false, agentTyping: false }
      ).then(() => {
        socket.to(chatId).emit('agent_status', { isOnline: false });
      });
    }
    
    socket.leave(chatId);
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
