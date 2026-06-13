"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import { useRouter } from "next/navigation";

export function WtbBumpButton({ wtbId }: { wtbId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleBump = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "wtb_bump", listingId: wtbId }),
      });
      const data = await res.json();
      if (data.url) {
        router.push(data.url);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleBump}
      disabled={loading}
      className="btn-secondary text-xs py-1.5 px-2.5 flex items-center gap-1 text-brass-400 hover:text-brass-300 hover:border-brass-700 disabled:opacity-50"
    >
      <Zap className="w-3 h-3" />
      {loading ? "…" : "Bump $4.99"}
    </button>
  );
}
