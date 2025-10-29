"use client";

import { useState } from "react";
import { startupIdeaSchema, researchResponseSchema } from "./lib/schemas";
import type { ResearchResponse } from "./lib/types";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

function formatResearchResponse(data: ResearchResponse): string {
  let formatted = "📊 **Market Research Analysis**\n\n";
  
  // Summary
  formatted += "## 📝 Summary\n";
  formatted += data.summary + "\n\n";
  
  // Competitors
  if (data.competitors && data.competitors.length > 0) {
    formatted += "## 🏢 Key Competitors\n";
    data.competitors.forEach((competitor, idx) => {
      formatted += `${idx + 1}. ${competitor}\n`;
    });
    formatted += "\n";
  }
  
  // Forecast
  if (data.forecast && data.forecast.series && data.forecast.series.length > 0) {
    formatted += "## 📈 Market Forecast\n";
    formatted += `**${data.forecast.title}** (${data.forecast.unit})\n\n`;
    
    data.forecast.series.forEach((point) => {
      const value = data.forecast.unit === "USD" 
        ? `$${point.value.toLocaleString()}` 
        : point.value.toLocaleString();
      formatted += `${point.year}: ${value}\n`;
    });
    formatted += "\n";
  }
  
  // Sources
  if (data.sources && data.sources.length > 0) {
    formatted += "## 📚 Sources\n";
    data.sources.forEach((source, idx) => {
      formatted += `${idx + 1}. ${source}\n`;
    });
  }
  
  return formatted;
}

export default function Home() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setError(null);
    
    // Validate input
    try {
      startupIdeaSchema.parse(input);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Call API
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/research/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ startup_idea: input }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      
      // Validate response
      const validatedData = researchResponseSchema.parse(data);
      
      // Format the response nicely
      const formattedContent = formatResearchResponse(validatedData);
      
      // Add assistant response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: formattedContent,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-700 px-4 py-3 bg-gray-800">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <h1 className="text-lg font-semibold text-white">ScoutAI</h1>
          <span className="text-sm text-gray-400">Market Research Assistant</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12 sm:py-16">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-2xl">S</span>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-3">Welcome to ScoutAI</h2>
              <p className="text-gray-300 mb-8 max-w-xl mx-auto">Describe your startup idea and I'll provide a comprehensive market research analysis with competitors, market forecast, and insights.</p>
              <div className="text-sm text-gray-400">
                <p className="mb-2">Try: "AI-powered meal planning app for busy professionals"</p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'} message-enter`}>
              {message.type === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
              )}
              
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-100 border border-gray-700'
              }`}>
                {message.type === 'user' ? (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <pre className="text-sm text-gray-200 whitespace-pre-wrap overflow-x-auto font-sans leading-relaxed">
                    {message.content}
                  </pre>
                )}
              </div>
              
              {message.type === 'user' && (
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-200 font-bold text-sm">U</span>
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full typing-dots"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full typing-dots" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full typing-dots" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <span className="text-gray-300 text-sm">Analyzing your startup idea...</span>
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-900/20 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-700 px-4 py-4 bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your startup idea..."
                rows={1}
                maxLength={500}
                className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent input-focus"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                {input.length}/500
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading || input.trim().length < 10}
              className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
