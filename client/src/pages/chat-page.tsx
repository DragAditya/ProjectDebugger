import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Send, RefreshCw, Bot, User, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

// Interface for chat messages
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const messageVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      duration: 0.5,
      bounce: 0.3
    }
  }
};

export default function ChatPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [systemPrompt, setSystemPrompt] = useState(
    "You are CodeGenius, an AI programming assistant. You're helpful, friendly, and knowledgeable about coding, software development, and technology. Provide accurate, concise answers with code examples when relevant. Be supportive and encouraging, and avoid giving incorrect or misleading information."
  );
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "🔒 Authentication required",
        description: "Please sign in to access the chat",
        variant: "destructive",
      });
      setLocation("/auth");
    }
  }, [user, authLoading, setLocation, toast]);

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mutation for sending messages to the AI
  const chatMutation = useMutation({
    mutationFn: async (data: { messages: ChatMessage[]; systemPrompt?: string }) => {
      const response = await apiRequest("POST", "/api/chat", data);
      return (await response.json()) as ChatMessage;
    },
    onSuccess: (response) => {
      setMessages((prev) => [...prev, response]);
      toast({
        title: "✅ Response received",
        description: "AI has provided a response",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Error",
        description: `Failed to get AI response: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle sending a message
  const handleSendMessage = () => {
    if (!input.trim()) {
      toast({
        title: "⚠️ Empty message",
        description: "Please enter a message before sending",
        variant: "destructive",
      });
      return;
    }

    // Add user message to chat
    const userMessage: ChatMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Send messages to API
    chatMutation.mutate({
      messages: [...messages, userMessage],
      systemPrompt: systemPrompt || undefined,
    });
  };

  // Handle key press (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Clear chat history
  const handleClearChat = () => {
    setMessages([]);
    toast({
      title: "🗑️ Chat cleared",
      description: "Conversation history has been cleared",
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 container-fluid py-6 space-y-6">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Chat with CodeGenius</h1>
              <p className="text-sm text-muted-foreground">AI-powered programming assistant</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowSystemPrompt(!showSystemPrompt)}
              className="glass border-border/50 hover:border-primary/30"
            >
              <Settings className="mr-2 h-4 w-4" />
              {showSystemPrompt ? "Hide" : "Show"} System Prompt
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleClearChat}
              disabled={messages.length === 0 || chatMutation.isPending}
              className="glass border-border/50 hover:border-destructive/30 hover:text-destructive"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Clear Chat
            </Button>
          </div>
        </motion.div>

        {/* System Prompt Card */}
        <AnimatePresence>
          {showSystemPrompt && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="modern-card">
                <CardHeader>
                  <CardTitle className="text-lg">System Prompt</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <label htmlFor="systemPrompt" className="text-sm font-medium text-muted-foreground">
                      Instructions for the AI assistant
                    </label>
                    <Textarea
                      id="systemPrompt"
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      rows={4}
                      className="modern-input resize-none"
                      placeholder="Enter system instructions for the AI..."
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Container */}
        <motion.div 
          className="flex-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="modern-card h-[calc(100vh-300px)] flex flex-col">
            {/* Chat Messages */}
            <div className="flex-1 p-6 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Bot className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
                    <p className="text-muted-foreground text-sm max-w-md">
                      Ask me anything about programming, code debugging, or software development. 
                      I'm here to help!
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[
                      "How do I fix a memory leak?",
                      "Explain async/await in JavaScript",
                      "Best practices for API design",
                      "Help me optimize this algorithm"
                    ].map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        onClick={() => setInput(suggestion)}
                        className="text-xs glass border-border/30 hover:border-primary/30"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <AnimatePresence initial={false}>
                    {messages.map((message, index) => (
                      <motion.div
                        key={index}
                        variants={messageVariants}
                        initial="hidden"
                        animate="visible"
                        className={`flex ${
                          message.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div className={`flex items-start space-x-3 max-w-[80%] ${
                          message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                        }`}>
                          {/* Avatar */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.role === "user" 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-secondary text-secondary-foreground"
                          }`}>
                            {message.role === "user" ? (
                              <User className="h-4 w-4" />
                            ) : (
                              <Bot className="h-4 w-4" />
                            )}
                          </div>
                          
                          {/* Message Content */}
                          <div className={`rounded-xl p-4 ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary/50 text-secondary-foreground"
                          }`}>
                            <div className="prose dark:prose-invert max-w-none">
                              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                {message.content}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {/* Loading Message */}
                  {chatMutation.isPending && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="flex items-start space-x-3 max-w-[80%]">
                        <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="rounded-xl p-4 bg-secondary/50">
                          <div className="flex items-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            <span className="text-sm text-muted-foreground">CodeGenius is thinking...</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-border/50">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                    className="min-h-[60px] resize-none modern-input"
                    disabled={chatMutation.isPending}
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || chatMutation.isPending}
                  className="btn-primary self-end px-4"
                >
                  {chatMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}