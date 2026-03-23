"use client";

import { useState, useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import InterviewComplete from "./InterviewComplete";
import type { ChatMessage, InterviewData, HeistReport } from "@/lib/types";

const FULL_BRIEFING_TEMPLATE = `I'm a [Job Title] at a [Company Type / Industry].

My day is mostly: [describe your main tasks and how you spend your time]

Tools I use daily: [list the key software, platforms, or systems]

The decisions I make that matter: [what calls do you make, what happens if you're wrong?]

Parts I'd automate in a heartbeat: [what tasks would you happily hand to a robot?]`;

// Demo mode: pre-written rich job description + follow-up for zero-interaction demo flow (?demo=1)
const DEMO_INITIAL_MESSAGE =
  "I'm a Senior Account Executive at a mid-market B2B SaaS company. " +
  "I manage a portfolio of 40-50 accounts — running demos, discovery calls, quarterly business reviews, " +
  "and negotiating renewals. I use Salesforce, Gong, Outreach, and LinkedIn Sales Navigator every day. " +
  "My most consequential decisions are which accounts to prioritize for expansion and when to escalate " +
  "at-risk accounts before they churn. I'd automate follow-up email sequencing and CRM data entry " +
  "without thinking twice.";

const DEMO_FOLLOWUP_MESSAGE =
  "Missing an at-risk signal costs us six figures in ARR and four months of sunk work on the account. " +
  "My real edge is reading the room on calls — I know when to push on a discount and when to back off. " +
  "That instinct is not something I can document or hand to anyone. " +
  "But the outreach cadences, CRM hygiene, and QBR prep decks — all of that is pure time " +
  "I'd rather spend on live deals.";

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
  const demoModeRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const isDemoMode =
      new URLSearchParams(window.location.search).get("demo") === "1";
    demoModeRef.current = isDemoMode;
    sendInitialMessage(isDemoMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toApiMessages = (msgs: DisplayMessage[]): ChatMessage[] =>
    msgs.map(({ role, content }) => ({ role, content }));

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

  const sendChatMessage = async (
    currentMessages: DisplayMessage[]
  ): Promise<{
    reply: string;
    interviewComplete: boolean;
    extractedData: InterviewData | null;
  }> => {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: toApiMessages(currentMessages) }),
    });

    if (!response.ok) {
      throw new Error("Failed to send message");
    }

    return response.json();
  };

  const sendInitialMessage = async (isDemoMode: boolean) => {
    try {
      setLoading(true);
      const initialContent = isDemoMode ? DEMO_INITIAL_MESSAGE : "Hello";
      const initialMessages: DisplayMessage[] = [
        { id: "init-user", role: "user", content: initialContent, hidden: true },
      ];

      const data = await sendChatMessage(initialMessages);
      const assistantMsg: DisplayMessage = {
        id: "init-assistant",
        role: "assistant",
        content: data.reply,
      };
      const updatedMessages = [...initialMessages, assistantMsg];
      setMessages(updatedMessages);

      if (data.interviewComplete && data.extractedData) {
        setGeneratingReport(true);
        await generateReport(data.extractedData);
      } else if (isDemoMode) {
        // Auto-send the pre-written follow-up after a brief pause so the first response renders
        setTimeout(() => sendDemoFollowup(updatedMessages), 900);
      }
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

  const sendDemoFollowup = async (currentMessages: DisplayMessage[]) => {
    const userMessage: DisplayMessage = {
      id: nextId(),
      role: "user",
      content: DEMO_FOLLOWUP_MESSAGE,
      hidden: true,
    };
    const updatedMessages = [...currentMessages, userMessage];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const data = await sendChatMessage(updatedMessages);
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
      console.error("Error in demo followup:", error);
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
      const data = await sendChatMessage(updatedMessages);
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

  const handleFullBriefing = () => {
    setInput(FULL_BRIEFING_TEMPLATE);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const visibleMessages = messages.filter((msg) => !msg.hidden);
  const inputLines = input.split("\n").length;
  const textareaRows = Math.min(Math.max(inputLines, 1), 6);

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
        {!generatingReport && (
          <div className="mb-2">
            <button
              onClick={handleFullBriefing}
              disabled={loading || generatingReport}
              className="text-xs text-muted hover:text-accent transition-colors disabled:opacity-40 font-mono"
            >
              Give me the full briefing →
            </button>
          </div>
        )}
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading || generatingReport}
            placeholder="Tell me your job, what fills your hours, tools you use..."
            aria-label="Type your response to the interview"
            rows={textareaRows}
            style={{ resize: "none" }}
            className="flex-1 bg-smoke text-light border border-fog rounded-lg px-4 py-2 focus:outline-none focus:border-accent disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={loading || generatingReport || !input.trim()}
            className="px-6 py-2 bg-accent text-light rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono self-end"
          >
            {loading ? "..." : "SEND"}
          </button>
        </div>
      </div>
    </div>
  );
}
