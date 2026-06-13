"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Props {
  listingId: string;
  initialSaved?: boolean;
  size?: "sm" | "md";
}

export function SaveButton({ listingId, initialSaved = false, size = "sm" }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      if (res.ok) {
        const data = await res.json();
        setSaved(data.saved);
      }
    } finally {
      setLoading(false);
    }
  };

  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      aria-label={saved ? "Remove from watchlist" : "Save to watchlist"}
      className={`flex items-center justify-center rounded-sm transition-all duration-150 disabled:opacity-50
        ${size === "sm" ? "w-6 h-6" : "w-8 h-8"}
        ${saved
          ? "bg-blood-900/90 text-blood-400 border border-blood-700 hover:bg-blood-800/90"
          : "bg-void-900/80 text-bone-500 border border-void-700 hover:text-blood-400 hover:border-blood-700"
        }`}
    >
      <Heart className={`${iconSize} ${saved ? "fill-blood-400" : ""}`} />
    </button>
  );
}
