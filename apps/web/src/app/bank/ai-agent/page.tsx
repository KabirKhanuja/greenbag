'use client';

import { useState } from "react";
import { Search, Bell, Settings, Bot, Send, User, Sparkles } from "lucide-react";
import { BankSidebar } from "@/components/BankSidebar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type AnalysisMode = "all" | "spotlight" | null;
type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export default function BankAIAgent() {
  const [mode, setMode] = useState<AnalysisMode>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  const exampleQuestions = {
    all: [
      "What are the top 5 risk triggers?",
      "Which customer segments show highest risk?",
      "What's the average recovery rate?",
      "Show me geographic patterns",
    ],
    spotlight: [
      "What are the primary risk factors?",
      "What intervention strategies worked?",
      "What's the optimal payment plan?",
    ],
  };

  const handleModeSelect = (selectedMode: AnalysisMode) => {
    setMode(selectedMode);
    setMessages([]);
    if (selectedMode === "all") {
      setMessages([
        {
          id: "1",
          role: "assistant",
          content: "Hello! I'm ready to analyze all customers in your portfolio. What would you like to know?",
          timestamp: new Date(),
        },
      ]);
    } else if (selectedMode === "spotlight") {
      setMessages([
        {
          id: "1",
          role: "assistant",
          content: "I'm ready to provide detailed analysis on a specific customer.",
          timestamp: new Date(),
        },
      ]);
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I've analyzed the data. The current portfolio shows 1,248 high-risk customers.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);

    setInputMessage("");
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <BankSidebar />

      <div className="flex-1 flex flex-col">
        <header className="bg-[#0074A3] text-white px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">AI ANALYSIS AGENT</h1>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
                <Input
                  placeholder="Search..."
                  className="pl-10 bg-[#005F82] border-blue-400 text-white placeholder:text-blue-200"
                />
              </div>
              <button className="p-2 hover:bg-[#005F82] rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-[#005F82] rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 p-8">
          {!mode ? (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="w-20 h-20 bg-gradient-to-br from-[#00A9CE] to-[#0074A3] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">AI Analysis Agent</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card
                  className="p-8 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleModeSelect("all")}
                >
                  <div className="text-center">
                    <Sparkles className="w-8 h-8 text-[#0074A3] mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Analyze All Customers</h3>
                  </div>
                </Card>

                <Card
                  className="p-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleModeSelect("spotlight")}
                >
                  <div className="text-center">
                    <User className="w-8 h-8 text-indigo-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Spotlight on One</h3>
                  </div>
                </Card>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col max-w-6xl mx-auto">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">
                  {mode === "all" ? "Portfolio Analysis" : "Customer Analysis"}
                </h2>
                <Button variant="outline" onClick={() => setMode(null)}>
                  Change Mode
                </Button>
              </div>

              <Card className="flex-1 p-6 bg-white border-blue-100 overflow-y-auto mb-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-2xl px-4 py-3 rounded-lg ${
                          message.role === "user"
                            ? "bg-[#00A9CE] text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="flex gap-3">
                <Textarea
                  placeholder="Ask me anything..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1 min-h-[60px] resize-none"
                />
                <Button
                  onClick={handleSendMessage}
                  className="bg-gradient-to-r from-[#00A9CE] to-[#0074A3] text-white px-6"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
