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

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface PresetQuestion {
  id: string;
  title: string;
  prompt: string;
  category: string;
}

const presetQuestions: PresetQuestion[] = [
  {
    id: "1",
    title: "Market Analysis",
    prompt:
      "Analyze the current market trends in our industry and identify key opportunities",
    category: "Strategy",
  },
  {
    id: "2",
    title: "Competitive Positioning",
    prompt: "How should we position ourselves against our main competitors?",
    category: "Competition",
  },
  {
    id: "3",
    title: "USP Development",
    prompt: "Help me identify and articulate our unique selling proposition",
    category: "Branding",
  },
  {
    id: "4",
    title: "Client Retention",
    prompt:
      "What strategies can we implement to improve client retention rates?",
    category: "Clients",
  },
  {
    id: "5",
    title: "Growth Strategy",
    prompt: "Outline a 12-month growth strategy for our business",
    category: "Strategy",
  },
  {
    id: "6",
    title: "Pricing Analysis",
    prompt: "Analyze our current pricing strategy and suggest improvements",
    category: "Finance",
  },
  {
    id: "7",
    title: "Team Development",
    prompt: "How can we better develop our team capabilities and skills?",
    category: "HR",
  },
  {
    id: "8",
    title: "Market Entry",
    prompt:
      "What are the key considerations for entering a new market segment?",
    category: "Strategy",
  },
];

export default function AIChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: `Hello ${user?.name}! I'm your AI strategic assistant. I'm here to help you with business strategy, market analysis, competitive insights, and more. How can I assist you today?`,
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response (in real app, this would be an API call)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(content),
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
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
    handleSendMessage(preset.prompt);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  return (
    <div className="h-full flex">
      {/* Left column - Preset Questions */}
      <div className="w-80 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b bg-white">
          <h2 className="font-semibold text-gray-900">Preset Questions</h2>
          <p className="text-sm text-gray-600">Click to start a conversation</p>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {presetQuestions.map((preset) => (
              <Card
                key={preset.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handlePresetClick(preset)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary/10 p-2 rounded-full flex-shrink-0">
                      <Lightbulb className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-gray-900 mb-1">
                        {preset.title}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {preset.prompt}
                      </p>
                      <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        {preset.category}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !inputValue.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
