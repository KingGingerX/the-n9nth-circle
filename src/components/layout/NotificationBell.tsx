"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

function timeAgoShort(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

const TYPE_ICON: Record<string, string> = {
  offer_received: "⚔",
  offer_accepted: "✅",
  offer_declined: "❌",
  listing_sold: "⚜",
  purchase_complete: "🛡",
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications);
      setUnread(data.unreadCount);
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = async () => {
    setOpen((v) => !v);
    if (!open && unread > 0) {
      setLoading(true);
      await fetch("/api/notifications", { method: "PATCH", body: JSON.stringify({}), headers: { "Content-Type": "application/json" } });
      setUnread(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setLoading(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative text-bone-400 hover:text-bone-100 transition-colors p-1"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-blood-600 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-void-800 border border-void-600 rounded-sm shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="px-4 py-3 border-b border-void-700 flex items-center justify-between">
            <span className="text-bone-200 text-sm font-semibold">Notifications</span>
            {loading && <span className="text-bone-600 text-xs">Marking read…</span>}
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-bone-500 text-sm">
              No notifications yet.
            </div>
          ) : (
            <div>
              {notifications.map((n) => (
                <NotifItem key={n.id} n={n} onClose={() => setOpen(false)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NotifItem({ n, onClose }: { n: Notification; onClose: () => void }) {
  const icon = TYPE_ICON[n.type] ?? "🔔";
  const inner = (
    <div
      className={`px-4 py-3 border-b border-void-700 hover:bg-void-700 transition-colors cursor-pointer
        ${!n.isRead ? "bg-void-750 border-l-2 border-l-blood-600" : ""}`}
    >
      <div className="flex items-start gap-2">
        <span className="text-base shrink-0 mt-0.5">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-bone-200 text-xs font-semibold">{n.title}</span>
            <span className="text-bone-600 text-xs shrink-0">{timeAgoShort(n.createdAt)}</span>
          </div>
          <p className="text-bone-400 text-xs mt-0.5 line-clamp-2">{n.message}</p>
        </div>
      </div>
    </div>
  );

  if (n.link) {
    return (
      <Link href={n.link} onClick={onClose}>
        {inner}
      </Link>
    );
  }
  return inner;
}
