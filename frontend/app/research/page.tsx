"use client";

import { useState, useRef, useEffect } from "react";
import type * as React from "react";
import Navbar from "../components/Navbar";
import ReactMarkdown from "react-markdown";
import { startupIdeaSchema, researchResponseSchema } from "../lib/schemas";
import type { ResearchResponse, Forecast } from "../lib/types";
import { ZodError } from "zod";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// ============================================================================
// TYPES
// ============================================================================

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  forecast?: Forecast; // Optional forecast data for charts
  forecastSummary?: string; // Optional forecast summary text to display after chart
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Formats the research response from the API into markdown for display
 * Takes the API response and converts it to a formatted markdown string
 * Returns both the formatted text and extracted forecast summary
 */
function formatResearchResponse(data: ResearchResponse): { formatted: string; forecastSummary: string } {
  let formatted = "📊 **Market Research Analysis**\n\n";
  
  // Add summary section
  formatted += "## 📝 Summary\n\n";
  let summary = data.summary;
  
  // Remove JSON code blocks from summary
  summary = summary.replace(/```json[\s\S]*?```/gi, '');
  summary = summary.replace(/```[\s\S]*?```/g, '');
  // Remove standalone JSON objects (forecast JSON)
  summary = summary.replace(/\{[\s\S]*?"title"[\s\S]*?"series"[\s\S]*?\}/g, '');
  // Remove "CHART DATA" or "Forecast JSON" text
  summary = summary.replace(/CHART\s+DATA\s*\([^)]*\):?/gi, '');
  summary = summary.replace(/Forecast\s+JSON[^:]*:?/gi, '');
  // Remove "5-Year Forecast (JSON)" section header and content
  summary = summary.replace(/5-Year\s+Forecast\s*\(JSON\)[\s\S]*?(?=Summary\s+of\s+the\s+5-year|##|$)/gi, '');
  // Remove any remaining JSON-like blocks that might contain forecast data
  summary = summary.replace(/\{\s*"title"[\s\S]*?"series"[\s\S]*?\}/g, '');
  
  // Remove Sources & Citations section from summary (will be added separately)
  // Match various patterns: "## Sources", "## Sources & Citations", "## 📚 Sources & Citations", etc.
  summary = summary.replace(/##\s*📚\s*Sources[^\#]*$/gim, '');
  summary = summary.replace(/##\s*Sources\s*&?\s*Citations?[^\#]*$/gim, '');
  summary = summary.replace(/##\s*Sources[^\#]*$/gim, '');
  summary = summary.replace(/###\s*Sources\s*&?\s*Citations?[^\#]*$/gim, '');
  summary = summary.replace(/###\s*Sources[^\#]*$/gim, '');
  
  // Remove citation-style sources (lines starting with [1], [2], etc. followed by URLs)
  // This catches formatted citations like "[1] Grand View Research — ... https://..."
  // Pattern matches: [number] followed by any text and a URL, across multiple lines
  summary = summary.replace(/(?:^|\n)(\[\d+\][^\n]*https?:\/\/[^\n]*(?:\n|$))+(?=\n\n|\n[^\[]|$)/gim, '');
  
  // Also remove any remaining standalone citation lines
  summary = summary.replace(/^\[\d+\][^\n]*https?:\/\/[^\n]*(?:\n|$)/gim, '');
  
  // Extract forecast summary section (if it exists) to display after chart
  // This should include "Summary of the 5-year forecast" and "Detailed discussion"
  let forecastSummary = '';
  // Try to capture the full forecast summary section including detailed discussion
  const forecastSummaryPatterns = [
    /Summary\s+of\s+the\s+5-year\s+forecast[\s\S]*?Detailed\s+discussion\s+of\s+growth\s+assumptions[\s\S]*?(?=Key\s+milestones|Strategic\s+implications|Strategic\s+Recommendations|##|$)/i,
    /Summary\s+of\s+the\s+5-year\s+forecast[\s\S]*?(?=Key\s+milestones|Strategic\s+implications|Strategic\s+Recommendations|##|$)/i,
    /Summary\s+of\s+the\s+forecast[\s\S]*?(?=Key\s+milestones|Strategic|##|$)/i,
    /5-year\s+revenue\s+forecast[\s\S]*?(?=Key\s+milestones|Strategic|##|$)/i,
  ];
  
  for (const pattern of forecastSummaryPatterns) {
    const match = summary.match(pattern);
    if (match) {
      forecastSummary = match[0].trim();
      // Remove it from the main summary
      summary = summary.replace(match[0], '');
      break;
    }
  }
  
  // If we didn't get the detailed discussion in the first match, try to add it separately
  if (forecastSummary && !forecastSummary.includes('Detailed discussion')) {
    const detailedDiscussionMatch = summary.match(/Detailed\s+discussion\s+of\s+growth\s+assumptions[\s\S]*?(?=Key\s+milestones|Strategic|##|$)/i);
    if (detailedDiscussionMatch) {
      forecastSummary += '\n\n' + detailedDiscussionMatch[0].trim();
      summary = summary.replace(detailedDiscussionMatch[0], '');
    }
  }
  
  // Convert plain text subheadings (without ###) to markdown headers
  // Specifically handle "Market gaps and white space opportunities:" and "Competitive advantages and challenges:"
  const subheadingPatterns = [
    /^Market gaps and white space opportunities:/gim,
    /^Competitive advantages and challenges:/gim,
  ];
  
  for (const pattern of subheadingPatterns) {
    summary = summary.replace(pattern, (match: string) => {
      // Only convert if not already a markdown header
      if (!match.trim().startsWith('###')) {
        return `### ${match.trim()}`;
      }
      return match;
    });
  }
  
  // Convert plain text lines under subheadings to bullet points
  // Handles both "### Heading:" and "Heading:" formats
  // Pattern: Subheading ending with colon, followed by plain text lines (not already bullets)
  summary = summary.replace(/((?:###\s+)?[^:\n]+:)\n((?:[^\n-*#].*\n?)+)/g, (match: string, heading: string, content: string) => {
    // Check if content already has bullets, is a single paragraph, or contains markdown headers
    const trimmed = content.trim();
    if (trimmed.includes('\n\n') || trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('#')) {
      return match; // Already formatted or multi-paragraph, leave as-is
    }
    
    // Convert plain text lines to bullets (only if multiple lines)
    const lines = content.split('\n').filter((line: string) => line.trim().length > 0 && !line.trim().startsWith('-') && !line.trim().startsWith('*'));
    if (lines.length > 1) {
      const bulleted = lines.map((line: string) => `- ${line.trim()}`).join('\n');
      return `${heading}\n${bulleted}\n`;
    }
    return match;
  });
  
  // Convert citation numbers like [1], [2] into clickable anchor links
  summary = summary.replace(/\[(\d+)\]/g, (match, num) => {
    return `[${match}](#source-${num})`;
  });
  formatted += summary + "\n\n";
  
  // Add forecast section (chart is shown separately below)
  if (data.forecast && data.forecast.series && data.forecast.series.length > 0) {
    formatted += "## 📈 Market Forecast\n\n";
    // Clean forecast title - remove JSON text if present
    let forecastTitle = data.forecast.title;
    forecastTitle = forecastTitle.replace(/CHART\s+DATA[^:]*:?\s*/gi, '');
    forecastTitle = forecastTitle.replace(/\{[\s\S]*?\}/g, '');
    formatted += `**${forecastTitle}** (${data.forecast.unit})\n\n`;
    formatted += "*See the interactive chart below for visualization.*\n\n";
  }
  
  // Add sources section with clickable links (deduplicated)
  if (data.sources && data.sources.length > 0) {
    // Deduplicate sources by URL
    const seenUrls = new Set<string>();
    const uniqueSources: string[] = [];
    
    for (const source of data.sources) {
      // Extract URL from source
      let url = source;
      if (source.includes('](')) {
        // Markdown link format [text](url)
        const match = source.match(/\]\(([^\)]+)\)/);
        if (match) url = match[1];
      } else if (source.includes('http')) {
        // Plain URL or text with URL
        const match = source.match(/https?:\/\/[^\s\)\]"]+/);
        if (match) url = match[0];
      }
      
      // Normalize URL (remove trailing punctuation, convert to lowercase for comparison)
      const normalizedUrl = url.toLowerCase().replace(/[.,;:!?)\]]+$/, '');
      
      if (!seenUrls.has(normalizedUrl)) {
        seenUrls.add(normalizedUrl);
        uniqueSources.push(source);
      }
    }
    
    if (uniqueSources.length > 0) {
      formatted += "## 📚 Sources & Citations\n\n";
      uniqueSources.forEach((source, idx) => {
        const sourceNum = idx + 1;
        
        // Format source as a numbered list item with clickable link
        if (source.startsWith('http')) {
          // Direct URL - format as markdown link
          formatted += `${sourceNum}. [${source}](${source})\n`;
        } else if (source.includes('[') && source.includes('](')) {
          // Already a markdown link - just add number
          formatted += `${sourceNum}. ${source}\n`;
        } else {
          // Try to extract URL from text
          const urlMatch = source.match(/https?:\/\/[^\s]+/);
          if (urlMatch) {
            const url = urlMatch[0];
            const text = source.replace(url, '').trim() || url;
            formatted += `${sourceNum}. [${text}](${url})\n`;
          } else {
            // No URL found, just display as text
            formatted += `${sourceNum}. ${source}\n`;
          }
        }
      });
      formatted += "\n";
    }
  }
  
  return { formatted, forecastSummary };
}

/**
 * Custom styles for ReactMarkdown components
 * This makes the markdown look nice in our dark theme
 */
type MarkdownHeadingProps = React.HTMLAttributes<HTMLHeadingElement>;
type MarkdownParagraphProps = React.HTMLAttributes<HTMLParagraphElement>;
type MarkdownListProps = React.HTMLAttributes<HTMLUListElement>;
type MarkdownOrderedListProps = React.HTMLAttributes<HTMLOListElement>;
type MarkdownListItemProps = React.HTMLAttributes<HTMLLIElement>;
type MarkdownStrongProps = React.HTMLAttributes<HTMLElement>;
type MarkdownCodeProps = React.HTMLAttributes<HTMLElement> & { inline?: boolean };
type MarkdownPreProps = React.HTMLAttributes<HTMLPreElement>;
type MarkdownAnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;
type MarkdownSpanProps = React.HTMLAttributes<HTMLSpanElement> & { id?: string };

const markdownComponents = {
  h1: ({ ...props }: MarkdownHeadingProps) => (
    <h1 className="text-xl font-bold text-white mb-3 mt-4 first:mt-0" {...props} />
  ),
  h2: ({ ...props }: MarkdownHeadingProps) => (
    <h2 className="text-lg font-semibold text-white mb-2 mt-4 first:mt-0" {...props} />
  ),
  h3: ({ ...props }: MarkdownHeadingProps) => (
    <h3 className="text-base font-semibold text-gray-200 mb-2 mt-3 first:mt-0" {...props} />
  ),
  p: ({ ...props }: MarkdownParagraphProps) => (
    <p className="text-gray-200 mb-3 leading-relaxed" {...props} />
  ),
  ul: ({ ...props }: MarkdownListProps) => (
    <ul className="list-disc list-outside text-gray-200 mb-3 space-y-1 ml-4 [&>li]:leading-relaxed [&>li]:pl-2 [&>li]:break-words" {...props} />
  ),
  ol: ({ ...props }: MarkdownOrderedListProps) => (
    <ol className="list-decimal list-outside text-gray-200 mb-3 space-y-1 ml-4 [&>li]:leading-relaxed [&>li]:pl-2 [&>li]:break-words" {...props} />
  ),
  li: ({ ...props }: MarkdownListItemProps) => (
    <li className="text-gray-200 leading-relaxed [&>strong]:font-semibold [&>strong]:text-white break-words [&>ul]:ml-4 [&>ul]:mt-1" {...props} />
  ),
  strong: ({ ...props }: MarkdownStrongProps) => (
    <strong className="font-semibold text-white" {...props} />
  ),
  code: ({ inline, ...props }: MarkdownCodeProps) =>
    inline ? (
      <code className="bg-gray-700 px-1.5 py-0.5 rounded text-sm text-gray-100" {...props} />
    ) : (
      <code className="block bg-gray-900 p-3 rounded text-sm text-gray-200 overflow-x-auto" {...props} />
    ),
  pre: ({ ...props }: MarkdownPreProps) => (
    <pre className="bg-gray-900 p-3 rounded text-sm text-gray-200 overflow-x-auto mb-3" {...props} />
  ),
  // Handle links - both external URLs and internal anchor links
  a: ({ href, ...props }: MarkdownAnchorProps) => {
    const isAnchor = href?.startsWith("#");
    return (
      <a
        className="text-blue-400 hover:text-blue-300 underline break-all"
        target={isAnchor ? undefined : "_blank"}
        rel={isAnchor ? undefined : "noopener noreferrer"}
        href={href}
        onClick={
          isAnchor
            ? (e) => {
                // Smooth scroll to anchor link
                e.preventDefault();
                if (!href) return;
                const element = document.querySelector(href);
                if (element) {
                  element.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              }
            : undefined
        }
        {...props}
      />
    );
  },
  // Handle source citation anchors
  span: ({ id, children, ...props }: MarkdownSpanProps) => {
    if (id?.startsWith("source-")) {
      return (
        <span id={id} className="text-blue-400 font-medium" {...props}>
          {children}
        </span>
      );
    }
    return <span {...props}>{children}</span>;
  },
};

// ============================================================================
// COMPONENT: ForecastChart
// ============================================================================

/**
 * Displays a line chart of the market forecast data
 */
function ForecastChart({ forecast, forecastSummary }: { forecast: Forecast; forecastSummary?: string }) {
  if (!forecast.series || forecast.series.length === 0) return null;

  // Clean forecast title - remove JSON text if present
  let forecastTitle = forecast.title;
  forecastTitle = forecastTitle.replace(/CHART\s+DATA[^:]*:?\s*/gi, '');
  forecastTitle = forecastTitle.replace(/\{[\s\S]*?\}/g, '');

  return (
    <div className="mt-4 pt-4 border-t border-gray-700">
      <h4 className="text-sm font-semibold text-gray-200 mb-3">
        📈 {forecastTitle} ({forecast.unit})
      </h4>
      <div className="w-full" style={{ height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={forecast.series} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="year" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
            <YAxis 
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => {
                // Format Y-axis labels based on unit
                if (forecast.unit === 'USD') {
                  return `$${(value / 1000).toFixed(0)}k`;
                }
                return value.toLocaleString();
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F3F4F6'
              }}
              formatter={(value: number) => {
                // Format tooltip values
                if (forecast.unit === 'USD') {
                  return `$${value.toLocaleString()}`;
                }
                return value.toLocaleString();
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#9CA3AF' }} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ fill: '#3B82F6', r: 4 }}
              activeDot={{ r: 6 }}
              name={forecast.unit}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Display forecast summary after chart if available */}
      {forecastSummary && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="max-w-none text-gray-200">
            <ReactMarkdown components={markdownComponents}>
              {forecastSummary}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENT: MessageBubble
// ============================================================================

/**
 * Displays a single message bubble (user or assistant)
 */
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.type === 'user';
  
  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar - only show for assistant */}
      {!isUser && (
        <div className="w-8 h-8 bg-gradient-to-r from-black-500 to-gray-600 border border-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">S</span>
        </div>
      )}
      
      {/* Message content */}
      <div className={`${isUser ? 'max-w-[70%]' : 'max-w-[95%]'} rounded-2xl px-4 py-3 ${
        isUser 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-800 text-gray-100 border border-gray-700'
      }`}>
        {isUser ? (
          // User message - plain text
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          // Assistant message - markdown with optional chart
          <div className="space-y-4 w-full">
            <div className="max-w-none w-full">
              <ReactMarkdown components={markdownComponents}>
                {message.content}
              </ReactMarkdown>
            </div>
            {/* Show chart if forecast data exists */}
            {message.forecast && message.forecast.series && message.forecast.series.length > 0 && (
              <ForecastChart forecast={message.forecast} forecastSummary={message.forecastSummary} />
            )}
          </div>
        )}
      </div>
      
      {/* Avatar - only show for user */}
      {isUser && (
        <div className="w-8 h-8 bg-gradient-to-r from-black-500 to-gray-600 border border-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-gray-200 font-bold text-sm">U</span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENT: LoadingIndicator
// ============================================================================

/**
 * Shows a loading animation while waiting for API response
 */
function LoadingIndicator() {
  return (
    <div className="flex gap-3 justify-start">
      <div className="w-8 h-8 bg-gradient-to-r from-black-500 to-gray-600 border border-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
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
  );
}

// ============================================================================
// MAIN COMPONENT: ResearchPage
// ============================================================================

export default function ResearchPage() {
  // ========== STATE ==========
  const [input, setInput] = useState("");              // User's input text
  const [isLoading, setIsLoading] = useState(false);   // Loading state
  const [messages, setMessages] = useState<Message[]>([]); // Chat messages
  const [error, setError] = useState<string | null>(null); // Error message
  const textareaRef = useRef<HTMLTextAreaElement>(null); // Ref for auto-resizing textarea

  // ========== AUTO-RESIZE TEXTAREA ==========
  
  /**
   * Auto-resizes the textarea based on its content
   */
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set height based on scrollHeight, with min and max constraints
      const newHeight = Math.min(textarea.scrollHeight, 200); // Max height of 200px (about 8-9 lines)
      textarea.style.height = `${newHeight}px`;
    }
  }, [input]);

  // ========== API CALL FUNCTION ==========
  
  /**
   * Calls the backend API to run market research
   * @param startupIdea - The user's startup idea description
   * @returns The research response data
   */
  async function runResearch(startupIdea: string): Promise<ResearchResponse> {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/research/run`;
    
    // Make API request
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startup_idea: startupIdea }),
    });
    
    // Check if request failed
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    
    // Parse JSON response
    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error("Failed to parse API response. The server may have returned invalid JSON.");
    }
    
    // Validate response matches expected schema
    try {
      const validatedData = researchResponseSchema.parse(data);
      return validatedData;
    } catch (err) {
      // Provide detailed validation error if it's a ZodError
      if (err instanceof ZodError) {
        const errorDetails = err.issues.map((issue) => 
          `${issue.path.join('.')}: ${issue.message}`
        ).join(', ');
        throw new Error(`Invalid response format: ${errorDetails}`);
      }
      throw new Error(`Validation error: ${err instanceof Error ? err.message : 'Unknown validation error'}`);
    }
  }

  // ========== FORM SUBMIT HANDLER ==========
  
  /**
   * Handles form submission when user submits their startup idea
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page refresh
    
    // Validate input is not empty
    if (!input.trim()) return;
    
    // Clear any previous errors
    setError(null);
    
    // Validate input using schema (min 10 chars, max 500)
    try {
      startupIdeaSchema.parse(input);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
      return;
    }

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input field
    setInput("");
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    // Start loading
    setIsLoading(true);

    try {
      // Call API to get research results
      const researchData = await runResearch(input);
      
      // Format the response as markdown
      const { formatted: formattedContent, forecastSummary } = formatResearchResponse(researchData);
      
      // Create assistant message with formatted content
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: formattedContent,
        timestamp: new Date(),
        forecast: researchData.forecast || undefined, // Store forecast for chart
        forecastSummary: forecastSummary || undefined // Store forecast summary to display after chart
      };
      
      // Add assistant message to chat
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (err) {
      // Handle errors with better messaging
      if (err instanceof Error) {
        // Check if it's a validation error about forecast
        if (err.message.includes('forecast') || err.message.includes('series')) {
          setError(`Forecast data error: ${err.message}. The backend may not have extracted forecast data correctly.`);
        } else if (err.message.includes('Validation error') || err.message.includes('Invalid response')) {
          setError(err.message);
        } else {
          setError(err.message);
        }
      } else {
        setError("An unknown error occurred. Please check the console for details.");
      }
      console.error("Research error:", err);
    } finally {
      // Always stop loading
      setIsLoading(false);
    }
  };

  // ========== RENDER ==========
  
  return (
    <div className="bg-[#0A0A0A] text-[#E5E7EB] min-h-screen">
      {/* Navigation Bar */}
      <Navbar primaryLabel="Home" primaryHref="/" />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Research your idea</h1>
          <p className="text-gray-400 text-sm mt-1">
            Enter your startup idea to generate market research, competitors, and a chart‑ready forecast.
          </p>
        </div>

        {/* Chat Container */}
        <div className="flex flex-col h-[75vh] rounded-2xl border border-gray-500 bg-[#0A0A0A] w-[95%] max-w-7xl mx-auto">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
            <div className="space-y-6 w-full">
              {/* Welcome message when no messages yet */}
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium mb-2">Welcome to ScoutAI</h3>
                  <p className="text-gray-300 mb-4 max-w-xl mx-auto">
                    Describe your startup idea and get competitors, trends, and a chart‑ready forecast.
                  </p>
                  <p className="text-sm text-gray-400">
                    Try: &quot;AI‑powered meal planning app for busy professionals&quot;
                  </p>
                </div>
              )}

              {/* Display all messages */}
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}

              {/* Loading indicator */}
              {isLoading && <LoadingIndicator />}

              {/* Error message */}
              {error && (
                <div className="bg-red-900/20 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Input Form */}
          <div className="border-t border-gray-400 px-4 py-4 bg-[#0A0A0A] rounded-b-2xl">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe your startup idea..."
                  rows={1}
                  maxLength={1000}
                  className="w-full px-4 py-3 pr-12 bg-[#111111] border border-gray-700 text-white placeholder-gray-400 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent overflow-hidden min-h-[48px] max-h-[200px]"
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    // Submit on Enter (but allow Shift+Enter for new lines)
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  />
                </div>
                
                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading || input.trim().length < 10}
                  className="px-6 py-3 bg-[#111111] text-white rounded-2xl font-medium disabled:bg-[#1A1A1A] disabled:text-[#94A3B8] disabled:cursor-not-allowed transition-all flex items-center gap-2 border border-white/20 hover:border-white/40 hover:shadow-[0_10px_22px_rgba(255,255,255,0.18)] disabled:border-white/10"
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
      </main>
    </div>
  );
}
