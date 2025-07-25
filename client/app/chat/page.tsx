"use client";

import type React from "react";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Send, ArrowLeft, User, Bot, Wifi, WifiOff } from "lucide-react";
import Link from "next/link";
import SocketService from "@/lib/socket";
import { jwtDecode } from "jwt-decode";
import { validateToken } from "@/lib/auth-utils";

interface Message {
  _id?: string;
  text: string;
  sender: "user" | "agent";
  timestamp: Date;
}

interface ChatData {
  chatId: string;
  messages: Message[];
  selectedPlan?: any;
  status: string;
}

interface DecodedToken {
  id: string;
  email: string;
  name: string;
}


export default function ChatPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [agentTyping, setAgentTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [agentOnline, setAgentOnline] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const socketService = SocketService.getInstance();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize chat and Socket.IO connection
  useEffect(() => {
    const initChat = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      setIsAuthenticated(true);

      try {
        console.log("Raw token from localStorage:", token);

        const decoded: DecodedToken = jwtDecode<DecodedToken>(token);

        // Debug logging to check JWT contents
        console.log("JWT Token decoded - FULL OBJECT:", decoded);
        console.log("JWT Token keys:", Object.keys(decoded));
        console.log("JWT Token values:", Object.values(decoded));

        // Use improved validation with fallback support
        const validation = validateToken(token);
        
        if (!validation.isValid) {
          console.error("Token validation failed:", {
            error: validation.error,
            debugInfo: validation.debugInfo
          });
          
          // Show user-friendly error message
          const errorMessage = validation.error || 'Authentication failed';
          alert(errorMessage);
          
          // Clear invalid token and redirect
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push("/login");
          return;
        }
        
        // Extract validated email and userName
        const email = validation.email!;
        const userName = validation.userName!;
        
        // Log if we used fallback data
        if (validation.debugInfo?.usedFallback) {
          console.warn('Authentication using fallback data from localStorage');
        }

        // Set email and username
        setUserEmail(email);
        setUserName(userName);

        const plan = localStorage.getItem("selectedPlan");
        if (plan) {
          setSelectedPlan(JSON.parse(plan));
        }

        const socket = socketService.connect(token);

        socket.on("connect", () => {
          setIsConnected(true);
          console.log("Connected to chat server");
        });

        socket.on("disconnect", () => {
          setIsConnected(false);
          setAgentOnline(false);
          console.log("Disconnected from chat server");
        });

        socket.on("connect_error", (error) => {
          console.error("Socket connection error:", error);
          if (
            error.message === "Authentication required" ||
            error.message === "Invalid token"
          ) {
            router.push("/login");
          }
        });

        const requestBody = {
          userEmail: email,
          userName: userName,
          selectedPlan: plan ? JSON.parse(plan) : null,
        };

        console.log("Chat API request body:", requestBody);

        const response = await fetch(
          "https://arleen-credit-repair-backend.onrender.com/chat/create",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
          }
        );

        const data = await response.json();
        console.log("Chat API response:", { status: response.status, data });

        if (data.success) {
          const chat = data.chat;
          setChatId(chat.chatId);
          setMessages(
            chat.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            }))
          );

          socketService.joinChat(chat.chatId, "user");
        } else {
          const errorMessage =
            data.message || data.msg || data.error || "Unknown error";
          console.error("Failed to create/get chat:", errorMessage);
          if (errorMessage === "Authentication required") {
            router.push("/login");
          }
        }

        socket.on("receive_message", (message) => {
          setMessages((prev) => [
            ...prev,
            {
              ...message,
              timestamp: new Date(message.timestamp),
            },
          ]);
        });

        socket.on("user_typing", (data) => {
          if (data.userType === "agent") {
            setAgentTyping(data.isTyping);
          }
        });

        socket.on("agent_status", (data) => {
          setAgentOnline(data.isOnline);
        });
      } catch (error) {
        console.error("Error decoding token or initializing chat:", error);
        router.push("/login");
      }
    };

    initChat();
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatId) return;

    const messageText = newMessage;
    setNewMessage("");

    // Stop typing indicator
    socketService.stopTyping(chatId, "user");

    // Send message via Socket.IO
    socketService.sendMessage({
      chatId,
      text: messageText,
      sender: "user",
      senderName: userName,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (chatId && e.target.value.trim()) {
      // Start typing indicator
      socketService.startTyping(chatId, "user");

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socketService.stopTyping(chatId, "user");
      }, 3000);
    } else if (chatId) {
      socketService.stopTyping(chatId, "user");
    }
  };

  const generateAgentResponse = (userMessage: string, plan: any) => {
    const message = userMessage.toLowerCase();

    if (
      message.includes("price") ||
      message.includes("cost") ||
      message.includes("payment")
    ) {
      if (plan) {
        if (plan.isPaymentPlan) {
          return `Great! You've selected our ${plan.title}. This payment plan option allows you to spread the ${plan.price} cost over several months, making it more manageable. We typically offer 3, 6, or 12-month payment plans. Would you like me to break down the monthly payment options for you?`;
        }
        return `Perfect! The ${plan.title} is priced at ${plan.price}${
          plan.originalPrice
            ? ` (originally ${plan.originalPrice} - that's a huge savings!)`
            : ""
        }. This includes our comprehensive credit repair service with ${plan.subtitle.toLowerCase()}. We also offer payment plan options if you'd prefer to spread the cost. Would you like to proceed with this plan or hear about payment options?`;
      }
      return "Our pricing varies depending on the program you choose. Since you're here, I can provide specific details about any plan that interests you. Which program would you like to know more about?";
    }

    if (
      message.includes("how long") ||
      message.includes("time") ||
      message.includes("results")
    ) {
      if (plan && plan.subtitle.includes("7-15 days")) {
        return `Excellent choice! Our VIP Fast Track Program is our premium service that delivers results in as little as 7-15 days. This accelerated timeline is possible because we prioritize your case and work around the clock to dispute inaccuracies and optimize your credit profile. Most clients see significant improvements within the first two weeks!`;
      } else if (plan && plan.subtitle.includes("30-45 days")) {
        return `Great question! Our Super Sale program typically shows results in 30-45 days. While this takes a bit longer than our VIP program, it's still much faster than trying to repair credit on your own, and you get the same proven methods at a fantastic price point.`;
      }
      return "Our programs are designed for different timelines based on your needs and budget. Our VIP Fast Track shows results in 7-15 days, while our Super Sale program works within 30-45 days. Both use the same proven methods!";
    }

    if (
      message.includes("start") ||
      message.includes("begin") ||
      message.includes("proceed")
    ) {
      if (plan) {
        return `Fantastic! I'm excited to get you started with the ${plan.title}. Here's what happens next: 1) We'll process your enrollment, 2) Conduct a comprehensive credit analysis within 24 hours, 3) Create your personalized dispute strategy, and 4) Begin working on your credit immediately. Are you ready to move forward with enrollment?`;
      }
      return "I'm excited to help you get started! Once you select your preferred program, we can begin the enrollment process immediately. Which program interests you most?";
    }

    if (message.includes("difference") || message.includes("compare")) {
      return "Great question! The main differences are timeline and price: Our VIP Fast Track Program delivers results in 7-15 days for $897, while our Super Sale program works within 30-45 days for $297. Both use the same proven methods and include full credit analysis, dispute letters, and ongoing support. The VIP program just gets prioritized processing for faster results.";
    }

    return `Thank you for your interest in ${
      plan ? `our ${plan.title}` : "our credit repair services"
    }! I'm here to answer any questions about pricing, timelines, our process, or help you get started. What would you like to know more about?`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
      {/* Navigation */}
      <nav className="bg-white/5 backdrop-blur-md border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/plans">
              <Button
                variant="outline"
                size="sm"
                className="text-white border-white/20 hover:bg-white/10 bg-transparent text-xs sm:text-sm"
              >
                <ArrowLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Back to Plans</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>
            <h1 className="text-lg font-bold text-white">Chat with Agent</h1>
          </div>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Selected Plan Info */}
          {selectedPlan && (
            <div className="lg:col-span-1 order-2 lg:order-1">
              <Card className="bg-white/5 backdrop-blur-md border border-white/10 text-white">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">
                    Selected Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="font-bold mb-2 text-sm sm:text-base">
                    {selectedPlan.title}
                  </h3>
                  <p className="text-gray-300 text-xs sm:text-sm mb-2">
                    {selectedPlan.subtitle}
                  </p>
                  {selectedPlan.price && (
                    <div className="flex items-center space-x-2">
                      <span className="text-lg sm:text-xl font-bold text-white">
                        {selectedPlan.price}
                      </span>
                      {selectedPlan.originalPrice && (
                        <span className="text-xs sm:text-sm text-gray-400 line-through">
                          {selectedPlan.originalPrice}
                        </span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          {/* Chat Interface */}
          <div
            className={`${
              selectedPlan ? "lg:col-span-2" : "lg:col-span-3"
            } order-1 lg:order-2`}
          >
            <Card className="bg-white/5 backdrop-blur-md border border-white/10 text-white">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <Bot className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Credit Repair Agent
                </CardTitle>
              </CardHeader>
              {/* Fixed height container for chat */}
              <div className="h-[500px] sm:h-[600px] flex flex-col">
                {/* Messages area - takes up remaining space */}
                <div className="flex-1 px-6 overflow-hidden">
                  <div
                    ref={messagesContainerRef}
                    className="h-full overflow-y-auto space-y-3 sm:space-y-4 pr-2"
                    style={{
                      scrollbarWidth: "thin",
                      scrollbarColor: "rgba(255, 255, 255, 0.3) transparent",
                    }}
                  >
                    {messages.map((message, index) => (
                      <div
                        key={message._id || index}
                        className={`flex ${
                          message.sender === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[80%] p-2 sm:p-3 rounded-lg ${
                            message.sender === "user"
                              ? "bg-white/10 text-white"
                              : "bg-gray-700 text-white"
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            {message.sender === "agent" && (
                              <Bot className="h-3 w-3 sm:h-4 sm:w-4 mt-1 flex-shrink-0" />
                            )}
                            {message.sender === "user" && (
                              <User className="h-3 w-3 sm:h-4 sm:w-4 mt-1 flex-shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm break-words">
                                {message.text}
                              </p>
                              <p className="text-xs opacity-70 mt-1">
                                {message.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-700 text-white p-2 sm:p-3 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
                            <div className="flex space-x-1">
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div
                                className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                </div>
                {/* Fixed input area at bottom */}
                <div className="border-t border-white/10 p-4 bg-white/5">
                  <div className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your message..."
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 text-xs sm:text-sm"
                    />
                    <Button
                      onClick={handleSendMessage}
                      className="bg-gradient-to-r from-white to-gray-200 hover:from-gray-100 hover:to-gray-300 text-black px-3 sm:px-4 font-semibold"
                      disabled={!newMessage.trim()}
                    >
                      <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
