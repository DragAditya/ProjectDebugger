import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Send, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Interface for chat messages
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [systemPrompt, setSystemPrompt] = useState(
    "You are CodeGenius, an AI programming assistant. You're helpful, friendly, and knowledgeable about coding, software development, and technology. Provide accurate, concise answers with code examples when relevant. Be supportive and encouraging, and avoid giving incorrect or misleading information."
  );
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    },
    onError: (error: Error) => {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: `Failed to get AI response: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle sending a message
  const handleSendMessage = () => {
    if (!input.trim()) return;

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
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 container max-w-6xl py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Chat with CodeGenius</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowSystemPrompt(!showSystemPrompt)}
            >
              {showSystemPrompt ? "Hide" : "Show"} System Prompt
            </Button>
            <Button 
              variant="outline" 
              onClick={handleClearChat}
              disabled={messages.length === 0 || chatMutation.isPending}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Clear Chat
            </Button>
          </div>
        </div>

        {showSystemPrompt && (
          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <label htmlFor="systemPrompt" className="text-sm font-medium">
                  System Prompt (instructions for the AI)
                </label>
                <Textarea
                  id="systemPrompt"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={4}
                  className="resize-none"
                  placeholder="Enter system instructions for the AI..."
                />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="bg-card rounded-lg border shadow-sm min-h-[60vh] flex flex-col">
          {/* Chat messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <p>No messages yet. Start a conversation!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <div className="prose dark:prose-invert max-w-none">
                          <div className="whitespace-pre-wrap">{message.content}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {chatMutation.isPending && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="max-w-[80%] rounded-lg p-4 bg-muted">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="min-h-[60px] resize-none"
                disabled={chatMutation.isPending}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || chatMutation.isPending}
                className="self-end"
              >
                {chatMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}