"use client";

import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import Link from "next/link";

export function MessagesBadge() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/messages", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setUnread(data.totalUnread ?? 0);
      } catch {
        // silently fail
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Link href="/messages" className="relative text-bone-400 hover:text-bone-100 transition-colors p-1" aria-label="Messages">
      <MessageSquare className="w-5 h-5" />
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 bg-brass-600 text-void-950 text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
