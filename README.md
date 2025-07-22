# Arleen Credit Repair - Real-time Chat System

A comprehensive real-time chat system built with Next.js, Express.js, Socket.IO, and MongoDB for connecting customers with credit repair agents.

## 🚀 Features

### Customer Features
- Real-time messaging with agents
- Plan selection integration
- Typing indicators
- Connection status indicators
- Message history persistence
- Mobile-responsive design

### Agent Features
- Agent dashboard with all active chats
- Real-time message notifications
- Typing indicators
- Chat management (minimize, close)
- Customer information display
- Plan information integration
- Online/offline status management

### Technical Features
- Socket.IO for real-time communication
- MongoDB for message persistence
- JWT authentication for agents
- Responsive design with Tailwind CSS
- TypeScript support

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB database
- npm or yarn package manager

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd arleen-credit-main/acr
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
SESSION_SECRET=your_session_secret
NODE_ENV=development
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```

### 4. Start the Applications

**Backend (Terminal 1):**
```bash
cd backend
npm run dev
```

**Frontend (Terminal 2):**
```bash
cd client
npm run dev
```

## 🎯 Usage

### Customer Flow
1. Visit the main application at `http://localhost:3000`
2. Navigate to Plans page
3. Select a plan
4. Click on any plan to start chatting
5. Real-time chat interface opens with selected plan information

### Agent Flow
1. Visit `http://localhost:3000/agent/login`
2. Use demo credentials:
   - Username: `admin`
   - Password: `agent123`
3. Access the agent dashboard
4. View active chats in the sidebar
5. Click on any chat to start responding
6. Real-time messaging with typing indicators

## 🏗️ System Architecture

### Backend Structure
```
backend/
├── controllers/
│   ├── authController.js      # User authentication
│   ├── agentController.js     # Agent authentication
│   └── chatController.js      # Chat management
├── models/
│   ├── User.js               # User model
│   └── Chat.js               # Chat and message models
├── routes/
│   ├── authRoute.js          # Authentication routes
│   ├── agentRoute.js         # Agent routes
│   └── chatRoute.js          # Chat API routes
└── server.js                 # Main server file with Socket.IO
```

### Frontend Structure
```
client/
├── app/
│   ├── agent/
│   │   ├── login/page.tsx    # Agent login
│   │   └── dashboard/page.tsx # Agent dashboard
│   ├── chat/page.tsx         # Customer chat interface
│   └── plans/page.tsx        # Plan selection
├── lib/
│   └── socket.ts             # Socket.IO client service
└── components/ui/            # Reusable UI components
```

## 📡 Socket.IO Events

### Client to Server
- `join_chat` - Join a specific chat room
- `send_message` - Send a message
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator
- `leave_chat` - Leave a chat room

### Server to Client
- `receive_message` - Receive new messages
- `user_typing` - Typing indicator updates
- `agent_status` - Agent online/offline status
- `new_message_notification` - New message notifications for agents

## 🔗 API Endpoints

### Chat Endpoints
- `POST /chat/create` - Create or get existing chat
- `GET /chat/history/:chatId` - Get chat message history
- `GET /chat/active` - Get all active chats (agent only)
- `POST /chat/message` - Send a message
- `PUT /chat/status/:chatId` - Update chat status

### Agent Endpoints
- `POST /agent/login` - Agent authentication
- `GET /agent/info` - Get agent information

## 🎨 Design Features

- **Dark Theme**: Modern dark gradient background
- **Glass Morphism**: Backdrop blur effects for cards
- **Responsive Design**: Mobile-first approach
- **Real-time Indicators**: Connection status and typing indicators
- **Smooth Animations**: Typing indicators with staggered animations

## 🔧 Configuration Options

### Backend Configuration
- **Port**: Default 5000, configurable via PORT environment variable
- **CORS Origins**: Configure allowed origins in server.js
- **Socket.IO Options**: Customize transport methods and connection options

### Frontend Configuration
- **Backend URL**: Update BACKEND_URL in `lib/socket.ts` for production
- **Socket Transport**: Configure transport methods for different environments

## 🚦 Environment Setup

### Development
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`
- Auto-reconnection enabled
- Debug logging enabled

### Production
- Update BACKEND_URL in socket.ts
- Set NODE_ENV=production
- Configure proper CORS origins
- Use secure connections (HTTPS/WSS)

## 📱 Mobile Support

- Responsive design for all screen sizes
- Touch-friendly interface
- Optimized for mobile browsers
- PWA-ready architecture

## 🔒 Security Features

- JWT authentication for agents
- Input validation and sanitization
- CORS protection
- Session management with secure cookies
- Message persistence with MongoDB

## 🧪 Testing

### Manual Testing Steps
1. Start both backend and frontend servers
2. Open multiple browser tabs
3. Test customer chat interface
4. Test agent dashboard
5. Verify real-time messaging
6. Test typing indicators
7. Test connection status

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the issue tracker
- Review the documentation
- Test with demo credentials

---

**Demo Credentials:**
- Agent Username: `admin`
- Agent Password: `agent123`
