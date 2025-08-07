import React, { useState, useRef, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { ScrollArea } from "../components/ui/scroll-area";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Send, Bot, User, Lightbulb } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  supabase,
  PresetQuestion,
  Conversation,
  Message,
} from "../lib/supabase";

interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  tokens_used?: number;
  words_count?: number;
}

export default function AIChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [presetQuestions, setPresetQuestions] = useState<PresetQuestion[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [error, setError] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "testing">("testing");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user) {
      testConnection();
    }
  }, [user]);

  const testConnection = async () => {
    setConnectionStatus("testing");
    try {
      const { data, error } = await supabase
        .from("preset_questions")
        .select("count", { count: "exact", head: true });

      if (error) throw error;

      setConnectionStatus("connected");
      setError("");
      await loadPresetQuestions();
      await initializeConversation();
    } catch (error: any) {
      console.error("Connection test failed:", error);
      setConnectionStatus("disconnected");
      setError("Unable to connect to the database. Using offline mode.");

      // Load demo preset questions for offline mode
      setPresetQuestions([
        {
          id: "demo-1",
          title: "Market Analysis",
          prompt: "Can you provide a comprehensive market analysis for my industry?",
          category: "Strategy",
          description: "Get insights on market trends and opportunities",
          is_active: true,
          usage_count: 0,
          created_by: user?.id || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "demo-2",
          title: "Competitive Strategy",
          prompt: "Help me develop a competitive strategy against my main competitors",
          category: "Competition",
          description: "Analyze competitive landscape and positioning",
          is_active: true,
          usage_count: 0,
          created_by: user?.id || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "demo-3",
          title: "Growth Planning",
          prompt: "What are the best growth strategies for my business?",
          category: "Growth",
          description: "Develop strategic growth initiatives",
          is_active: true,
          usage_count: 0,
          created_by: user?.id || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ]);

      // Initialize offline conversation
      const welcomeMessage: ChatMessage = {
        id: "offline-1",
        content: `Hello ${user?.name}! I'm your AI strategic assistant. I'm currently running in offline mode, but I can still help you with business strategy, market analysis, and competitive insights. How can I assist you today?`,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  };

  const loadPresetQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from("preset_questions")
        .select("*")
        .eq("is_active", true)
        .order("category", { ascending: true });

      if (error) {
        console.error("Error loading preset questions:", error);
        return;
      }

      setPresetQuestions(data || []);
    } catch (error) {
      console.error("Error in loadPresetQuestions:", error);
    }
  };

  const initializeConversation = async () => {
    if (!user) return;

    try {
      // Create a new conversation
      const { data: conversation, error } = await supabase
        .from("conversations")
        .insert({
          user_id: user.id,
          title: `Chat ${new Date().toLocaleDateString()}`,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating conversation:", error);
        return;
      }

      setCurrentConversation(conversation);

      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: "1",
        content: `Hello ${user.name}! I'm your AI strategic assistant. I'm here to help you with business strategy, market analysis, competitive insights, and more. How can I assist you today?`,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages([welcomeMessage]);

      // Save welcome message to database
      await supabase.from("messages").insert({
        conversation_id: conversation.id,
        sender: "ai",
        content: welcomeMessage.content,
        tokens_used: 0,
        words_count: welcomeMessage.content.split(" ").length,
      });
    } catch (error) {
      console.error("Error in initializeConversation:", error);
    }
  };

  const handleSendMessage = async (
    content: string,
    presetQuestionId?: string,
  ) => {
    if (!content.trim() || !user || !currentConversation) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Save user message to database
      const { data: userMessageData, error: userMessageError } = await supabase
        .from("messages")
        .insert({
          conversation_id: currentConversation.id,
          sender: "user",
          content: userMessage.content,
          tokens_used: Math.ceil(userMessage.content.length / 4), // Rough token estimation
          words_count: userMessage.content.split(" ").length,
          preset_question_id: presetQuestionId,
        })
        .select()
        .single();

      if (userMessageError) {
        console.error("Error saving user message:", userMessageError);
      }

      // Update preset question usage count if applicable
      if (presetQuestionId) {
        await supabase.rpc("increment_preset_question_usage", {
          question_id: presetQuestionId,
        });
      }

      // Simulate AI response (in real app, this would call OpenAI API)
      const aiResponse = generateAIResponse(content);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: "ai",
        timestamp: new Date(),
        tokens_used: Math.ceil(aiResponse.length / 4),
        words_count: aiResponse.split(" ").length,
      };

      // Add AI response after delay
      setTimeout(async () => {
        setMessages((prev) => [...prev, aiMessage]);
        setIsLoading(false);

        // Save AI message to database
        await supabase.from("messages").insert({
          conversation_id: currentConversation.id,
          sender: "ai",
          content: aiMessage.content,
          tokens_used: aiMessage.tokens_used || 0,
          words_count: aiMessage.words_count || 0,
        });

        // Update user usage stats
        if (user.profile?.id) {
          await supabase.rpc("update_user_usage", {
            user_uuid: user.profile.id,
            tokens:
              userMessage.content.length / 4 + (aiMessage.tokens_used || 0),
            words: aiMessage.words_count || 0,
          });
        }
      }, 1500);
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      setIsLoading(false);
    }
  };

  const generateAIResponse = (userInput: string): string => {
    // Mock AI responses based on keywords
    const input = userInput.toLowerCase();

    if (input.includes("market") || input.includes("trend")) {
      return "Based on current market data, I can see several key trends emerging in your industry. The market is shifting towards digital transformation, with a 23% increase in demand for AI-powered solutions. I recommend focusing on innovation and customer experience to stay competitive. Would you like me to dive deeper into specific market segments?";
    }

    if (input.includes("competitor") || input.includes("competition")) {
      return "From a competitive analysis perspective, your main differentiators should focus on quality, customer service, and innovation. I suggest conducting a SWOT analysis to identify your competitive advantages. Your positioning should emphasize unique value propositions that competitors can't easily replicate. Shall I help you develop a competitive strategy framework?";
    }

    if (input.includes("strategy") || input.includes("growth")) {
      return "For strategic growth, I recommend a multi-pronged approach: 1) Strengthen core offerings, 2) Expand into adjacent markets, 3) Develop strategic partnerships, 4) Invest in technology and innovation. The key is to balance risk with opportunity while maintaining operational excellence. What specific area of growth would you like to explore first?";
    }

    if (input.includes("client") || input.includes("customer")) {
      return "Client intelligence suggests that retention rates improve by 15% when you implement personalized engagement strategies. I recommend segmenting your client base by value, needs, and behavior patterns. Focus on proactive communication and value-added services for high-value clients. Would you like me to help you develop a client segmentation strategy?";
    }

    return "That's an interesting question! Based on the strategic context you've provided, I'd recommend taking a data-driven approach to this challenge. Let me analyze the key factors: market conditions, competitive landscape, resource allocation, and risk assessment. I can help you develop a comprehensive strategy that addresses both short-term wins and long-term objectives. What specific outcomes are you hoping to achieve?";
  };

  const handlePresetClick = (preset: PresetQuestion) => {
    handleSendMessage(preset.prompt, preset.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const groupedQuestions = presetQuestions.reduce(
    (acc, question) => {
      if (!acc[question.category]) {
        acc[question.category] = [];
      }
      acc[question.category].push(question);
      return acc;
    },
    {} as Record<string, PresetQuestion[]>,
  );

  return (
    <div className="h-full flex">
      {/* Left column - Preset Questions */}
      <div className="w-80 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b bg-white">
          <h2 className="font-semibold text-gray-900">Preset Questions</h2>
          <p className="text-sm text-gray-600">Click to start a conversation</p>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {Object.entries(groupedQuestions).map(([category, questions]) => (
              <div key={category} className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                  {category}
                </h3>
                <div className="space-y-2">
                  {questions.map((preset) => (
                    <Card
                      key={preset.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handlePresetClick(preset)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start space-x-2">
                          <div className="bg-primary/10 p-1.5 rounded-full flex-shrink-0">
                            <Lightbulb className="h-3 w-3 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-gray-900 mb-1">
                              {preset.title}
                            </h4>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {preset.description || preset.prompt}
                            </p>
                            <span className="inline-block mt-1 text-xs text-gray-500">
                              Used {preset.usage_count} times
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}

            {presetQuestions.length === 0 && (
              <div className="text-center py-8">
                <Lightbulb className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  No preset questions available
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right column - Chat Interface */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback className="bg-primary text-white">
                <Bot className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-gray-900">
                AI Strategic Assistant
              </h2>
              <p className="text-sm text-gray-600">
                Always ready to help with your business strategy
              </p>
            </div>
          </div>
        </div>

        {/* Chat messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.sender === "user"
                    ? "flex-row-reverse space-x-reverse"
                    : ""
                }`}
              >
                <Avatar className="flex-shrink-0">
                  <AvatarFallback
                    className={
                      message.sender === "ai"
                        ? "bg-primary text-white"
                        : "bg-gray-600 text-white"
                    }
                  >
                    {message.sender === "ai" ? (
                      <Bot className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>

                <div
                  className={`flex-1 max-w-3xl ${message.sender === "user" ? "text-right" : ""}`}
                >
                  <div
                    className={`inline-block p-3 rounded-lg ${
                      message.sender === "user"
                        ? "bg-primary text-white"
                        : "bg-white border shadow-sm"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {message.tokens_used && (
                      <span className="ml-2">
                        • {message.tokens_used} tokens
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start space-x-3">
                <Avatar>
                  <AvatarFallback className="bg-primary text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white border shadow-sm rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Chat input */}
        <div className="p-4 border-t bg-white">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your strategic question or request..."
                className="flex-1"
                disabled={isLoading || !currentConversation}
              />
              <Button
                type="submit"
                disabled={
                  isLoading || !inputValue.trim() || !currentConversation
                }
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
