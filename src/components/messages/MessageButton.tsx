"use client";

import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  toUserId: string;
  listingId: string;
  sellerName: string;
}

export function MessageButton({ toUserId, listingId, sellerName }: Props) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId, listingId, content: content.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setSent(true);
        setTimeout(() => router.push(`/messages/${data.conversationId}`), 800);
      }
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-green-900/40 border border-green-700 rounded-sm p-3 text-green-300 text-sm text-center">
        ✓ Message sent. Opening conversation…
      </div>
    );
  }

  return (
    <div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="btn-secondary w-full text-sm flex items-center justify-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          Message {sellerName.split(" ")[0]}
        </button>
      ) : (
        <form onSubmit={handleSend} className="card p-4 space-y-3">
          <p className="text-bone-400 text-xs">Message to {sellerName}</p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ask about condition, shipping, trades…"
            rows={3}
            maxLength={500}
            className="input-field w-full resize-none text-sm"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn-secondary text-sm flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!content.trim() || sending}
              className="btn-primary text-sm flex-1 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {sending ? "Sending…" : "Send"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
