"use client"

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  MessageCircle, 
  Users, 
  Send, 
  LogOut, 
  Wifi, 
  WifiOff, 
  User, 
  Bot,
  Clock,
  X,
  Minimize2
} from 'lucide-react'
import SocketService from '@/lib/socket'

interface Message {
  _id?: string
  text: string
  sender: 'user' | 'agent'
  timestamp: Date
}

interface ChatInfo {
  chatId: string
  userName: string
  userEmail: string
  selectedPlan?: any
  lastActivity: Date
  messageCount: number
  lastMessage: Message | null
  isAgentOnline: boolean
  agentTyping: boolean
}

interface ActiveChat {
  chatId: string
  messages: Message[]
  userName: string
  userEmail: string
  selectedPlan?: any
  status: string
}

export default function AgentDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [agentName, setAgentName] = useState('')
  const [chats, setChats] = useState<ChatInfo[]>([])
  const [selectedChat, setSelectedChat] = useState<ActiveChat | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [userTyping, setUserTyping] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const socketService = SocketService.getInstance()
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('agentToken')
    const name = localStorage.getItem('agentName')
    
    if (!token) {
      router.push('/agent/login')
      return
    }
    
    setIsAuthenticated(true)
    setAgentName(name || 'Agent')
    
    // Initialize socket connection and load chats
    initializeDashboard(token)
  }, [])

  const initializeDashboard = async (token: string) => {
    try {
      // Connect to Socket.IO
      const socket = socketService.connect()
      
      socket.on('connect', () => {
        setIsConnected(true)
        console.log('Agent connected to server')
      })
      
      socket.on('disconnect', () => {
        setIsConnected(false)
        console.log('Agent disconnected from server')
      })
      
      // Listen for new message notifications
      socket.on('new_message_notification', (data) => {
        // Update chats list
        loadActiveChats()
        
        // If this is the selected chat, load its messages
        if (selectedChat && selectedChat.chatId === data.chatId) {
          loadChatHistory(data.chatId)
        }
      })
      
      socket.on('receive_message', (message) => {
        if (selectedChat && selectedChat.chatId === message.chatId) {
          setSelectedChat(prev => prev ? {
            ...prev,
            messages: [...prev.messages, {
              ...message,
              timestamp: new Date(message.timestamp)
            }]
          } : null)
        }
      })
      
      socket.on('user_typing', (data) => {
        if (data.userType === 'user' && selectedChat && selectedChat.chatId === data.chatId) {
          setUserTyping(data.isTyping)
        }
      })
      
      // Load active chats
      await loadActiveChats()
      
    } catch (error) {
      console.error('Error initializing dashboard:', error)
    }
  }
  
  const loadActiveChats = async () => {
    try {
      const response = await fetch('http://localhost:5000/chat/active', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('agentToken')}`
        }
      })
      
      const data = await response.json()
      if (data.success) {
        setChats(data.chats.map((chat: any) => ({
          ...chat,
          lastActivity: new Date(chat.lastActivity),
          lastMessage: chat.lastMessage ? {
            ...chat.lastMessage,
            timestamp: new Date(chat.lastMessage.timestamp)
          } : null
        })))
      }
    } catch (error) {
      console.error('Error loading chats:', error)
    }
  }
  
  const loadChatHistory = async (chatId: string) => {
    try {
      const response = await fetch(`https://arleen-credit-repair-backend.onrender.com/chat/history${chatId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('agentToken')}`
        }
      })
      
      const data = await response.json()
      if (data.success) {
        const chat = data.chat
        setSelectedChat({
          chatId: chat.chatId,
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })),
          userName: chat.userName,
          userEmail: chat.userEmail,
          selectedPlan: chat.selectedPlan,
          status: chat.status
        })
        
        // Join the chat room
        socketService.joinChat(chatId, 'agent')
      }
    } catch (error) {
      console.error('Error loading chat history:', error)
    }
  }
  
  const selectChat = async (chat: ChatInfo) => {
    // Leave previous chat if any
    if (selectedChat) {
      socketService.leaveChat(selectedChat.chatId, 'agent')
    }
    
    await loadChatHistory(chat.chatId)
  }
  
  const sendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return
    
    const messageText = newMessage
    setNewMessage('')
    
    // Stop typing indicator
    socketService.stopTyping(selectedChat.chatId, 'agent')
    
    // Send message via Socket.IO
    socketService.sendMessage({
      chatId: selectedChat.chatId,
      text: messageText,
      sender: 'agent',
      senderName: agentName
    })
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
    
    if (selectedChat && e.target.value.trim()) {
      // Start typing indicator
      socketService.startTyping(selectedChat.chatId, 'agent')
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      // Stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socketService.stopTyping(selectedChat.chatId, 'agent')
      }, 3000)
    } else if (selectedChat) {
      socketService.stopTyping(selectedChat.chatId, 'agent')
    }
  }
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }
  
  const handleLogout = () => {
    localStorage.removeItem('agentToken')
    localStorage.removeItem('agentName')
    socketService.disconnect()
    router.push('/agent/login')
  }
  
  const closeChat = () => {
    if (selectedChat) {
      socketService.leaveChat(selectedChat.chatId, 'agent')
      setSelectedChat(null)
    }
  }
  
  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedChat?.messages])
  
  if (!isAuthenticated) {
    return <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center text-white">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-md border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <MessageCircle className="h-6 w-6 text-white" />
            <h1 className="text-xl font-bold text-white">Agent Dashboard</h1>
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <><Wifi className="h-4 w-4 text-green-400" /><span className="text-green-400 text-sm">Connected</span></>
              ) : (
                <><WifiOff className="h-4 w-4 text-red-400" /><span className="text-red-400 text-sm">Disconnected</span></>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-white">Welcome, {agentName}</span>
            <Button 
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="text-white border-white/20 hover:bg-white/10 bg-transparent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex h-[calc(100vh-80px)]">
        {/* Chat List Sidebar */}
        <div className="w-80 bg-white/5 backdrop-blur-md border-r border-white/10">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Active Chats</h2>
              <Badge variant="secondary" className="bg-white/10 text-white">
                {chats.length}
              </Badge>
            </div>
            <Button 
              onClick={loadActiveChats}
              size="sm"
              className="w-full bg-white/10 hover:bg-white/20 text-white"
            >
              Refresh
            </Button>
          </div>
          
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="p-2">
              {chats.map((chat) => (
                <Card 
                  key={chat.chatId}
                  className={`mb-2 cursor-pointer transition-colors ${
                    selectedChat?.chatId === chat.chatId 
                      ? 'bg-white/20 border-white/30' 
                      : 'bg-white/5 hover:bg-white/10 border-white/10'
                  }`}
                  onClick={() => selectChat(chat)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-medium text-sm">{chat.userName}</h3>
                        <p className="text-gray-300 text-xs">{chat.userEmail}</p>
                        {chat.selectedPlan && (
                          <p className="text-gray-400 text-xs mt-1">{chat.selectedPlan.title}</p>
                        )}
                        {chat.lastMessage && (
                          <p className="text-gray-300 text-xs mt-2 truncate">
                            {chat.lastMessage.sender === 'agent' ? 'You: ' : ''}
                            {chat.lastMessage.text}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge 
                          variant={chat.isAgentOnline ? 'default' : 'secondary'}
                          className={`text-xs ${
                            chat.isAgentOnline 
                              ? 'bg-green-600 text-white' 
                              : 'bg-gray-600 text-gray-200'
                          }`}
                        >
                          {chat.isAgentOnline ? 'Online' : 'Offline'}
                        </Badge>
                        <div className="flex items-center space-x-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          <span>{chat.lastActivity.toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {chats.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active chats</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        
        {/* Chat Interface */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="bg-white/5 backdrop-blur-md border-b border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <User className="h-8 w-8 text-white bg-white/10 rounded-full p-1" />
                    <div>
                      <h3 className="text-white font-semibold">{selectedChat.userName}</h3>
                      <p className="text-gray-300 text-sm">{selectedChat.userEmail}</p>
                      {selectedChat.selectedPlan && (
                        <p className="text-gray-400 text-xs">Plan: {selectedChat.selectedPlan.title}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => setIsMinimized(!isMinimized)}
                      variant="outline"
                      size="sm"
                      className="text-white border-white/20 hover:bg-white/10 bg-transparent"
                    >
                      <Minimize2 className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={closeChat}
                      variant="outline"
                      size="sm"
                      className="text-white border-white/20 hover:bg-white/10 bg-transparent"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {!isMinimized && (
                <>
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {selectedChat.messages.map((message, index) => (
                        <div 
                          key={index}
                          className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] p-3 rounded-lg ${
                            message.sender === 'agent' 
                              ? 'bg-white/20 text-white' 
                              : 'bg-gray-700 text-white'
                          }`}>
                            <div className="flex items-start space-x-2">
                              {message.sender === 'user' && <User className="h-4 w-4 mt-1 flex-shrink-0" />}
                              {message.sender === 'agent' && <Bot className="h-4 w-4 mt-1 flex-shrink-0" />}
                              <div className="min-w-0">
                                <p className="text-sm break-words">{message.text}</p>
                                <p className="text-xs opacity-70 mt-1">
                                  {message.timestamp.toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {userTyping && (
                        <div className="flex justify-start">
                          <div className="bg-gray-700 text-white p-3 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4" />
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                  
                  {/* Message Input */}
                  <div className="border-t border-white/10 p-4 bg-white/5">
                    <div className="flex space-x-2">
                      <Input
                        value={newMessage}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                      />
                      <Button
                        onClick={sendMessage}
                        className="bg-gradient-to-r from-white to-gray-200 hover:from-gray-100 hover:to-gray-300 text-black px-4 font-semibold"
                        disabled={!newMessage.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            /* No Chat Selected */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Select a chat to start</h3>
                <p>Choose a conversation from the sidebar to begin chatting with customers</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
