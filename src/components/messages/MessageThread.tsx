"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Send } from "lucide-react";

interface Msg {
  id: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string | Date;
}

interface OtherUser {
  id: string;
  name: string | null;
  image: string | null;
}

function formatTime(d: string | Date) {
  const date = new Date(d);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (diff < 86400000) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

interface Props {
  conversationId: string;
  currentUserId: string;
  initialMessages: Msg[];
  otherUser: OtherUser;
}

export function MessageThread({ conversationId, currentUserId, initialMessages, otherUser }: Props) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for new messages every 8s
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/messages/${conversationId}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setMessages(data.conversation.messages);
      } catch {
        // silently fail
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [conversationId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sending) return;
    setSending(true);

    const optimistic: Msg = {
      id: `opt-${Date.now()}`,
      senderId: currentUserId,
      content: content.trim(),
      isRead: false,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, optimistic]);
    const sent = content.trim();
    setContent("");

    try {
      const res = await fetch(`/api/messages/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: sent }),
      });
      if (!res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        setContent(sent);
      }
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as any);
    }
  };

  return (
    <div className="card flex flex-col" style={{ minHeight: "400px" }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-96">
        {messages.length === 0 && (
          <div className="text-center text-bone-600 text-sm py-8">
            Start the conversation. Send your first message.
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : ""}`}>
              {!isMine && (
                <div className="shrink-0 mb-0.5">
                  {otherUser.image ? (
                    <Image src={otherUser.image} alt="" width={28} height={28} className="rounded-full border border-void-600" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-blood-900 border border-blood-800 flex items-center justify-center text-blood-300 text-xs font-bold">
                      {otherUser.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                </div>
              )}
              <div className={`max-w-xs lg:max-w-md ${isMine ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                <div
                  className={`px-3 py-2 rounded-sm text-sm leading-relaxed whitespace-pre-wrap
                    ${isMine
                      ? "bg-blood-900 border border-blood-700 text-bone-200"
                      : "bg-void-800 border border-void-600 text-bone-300"
                    }`}
                >
                  {msg.content}
                </div>
                <span className="text-bone-700 text-xs">{formatTime(msg.createdAt)}</span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Compose */}
      <div className="border-t border-void-700 p-3">
        <form onSubmit={handleSend} className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
            rows={2}
            maxLength={2000}
            className="input-field flex-1 resize-none text-sm"
          />
          <button
            type="submit"
            disabled={!content.trim() || sending}
            className="btn-primary p-2.5 disabled:opacity-50 shrink-0"
            aria-label="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
