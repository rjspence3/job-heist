"use client";

import { useState, useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import InterviewComplete from "./InterviewComplete";
import type { ChatMessage, InterviewData, HeistReport } from "@/lib/types";

interface DisplayMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  hidden?: boolean;
}

interface ChatWindowProps {
  onInterviewComplete: (data: InterviewData, report: HeistReport) => void;
}

let messageCounter = 0;
function nextId(): string {
  return `msg-${Date.now()}-${messageCounter++}`;
}

export default function ChatWindow({ onInterviewComplete }: ChatWindowProps) {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    sendInitialMessage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toApiMessages = (msgs: DisplayMessage[]): ChatMessage[] =>
    msgs.map(({ role, content }) => ({ role, content }));

  const sendInitialMessage = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Hello" }],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start conversation");
      }

      const data = await response.json();
      setMessages([
        { id: "init-user", role: "user", content: "Hello", hidden: true },
        { id: "init-assistant", role: "assistant", content: data.reply },
      ]);
    } catch (error) {
      console.error("Error starting conversation:", error);
      setMessages([
        {
          id: "init-error",
          role: "assistant",
          content: "Error: Failed to connect. Please refresh and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: DisplayMessage = {
      id: nextId(),
      role: "user",
      content: input.trim(),
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: toApiMessages(updatedMessages) }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      const assistantMessage: DisplayMessage = {
        id: nextId(),
        role: "assistant",
        content: data.reply,
      };

      setMessages([...updatedMessages, assistantMessage]);

      if (data.interviewComplete && data.extractedData) {
        setGeneratingReport(true);
        await generateReport(data.extractedData);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages([
        ...updatedMessages,
        {
          id: nextId(),
          role: "assistant",
          content: "Error: Failed to process your message. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (interviewData: InterviewData) => {
    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewData }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      const report: HeistReport = await response.json();
      onInterviewComplete(interviewData, report);
    } catch (error) {
      console.error("Error generating report:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: "assistant" as const,
          content:
            "Error: Failed to generate report. Please refresh and try again.",
        },
      ]);
      setGeneratingReport(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const visibleMessages = messages.filter((msg) => !msg.hidden);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {visibleMessages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {generatingReport && <InterviewComplete />}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-fog p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={loading || generatingReport}
            placeholder="Type your response..."
            aria-label="Type your response to the interview"
            className="flex-1 bg-smoke text-light border border-fog rounded-lg px-4 py-2 focus:outline-none focus:border-accent disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={loading || generatingReport || !input.trim()}
            className="px-6 py-2 bg-accent text-light rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono"
          >
            {loading ? "..." : "SEND"}
          </button>
        </div>
      </div>
    </div>
  );
}
