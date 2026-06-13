"use client";

import { useState } from "react";
import Link from "next/link";
import { formatListingPrice, timeAgo } from "@/lib/utils";

interface Offer {
  id: string;
  amount: number;
  message: string | null;
  createdAt: Date;
  listing: { id: string; title: string };
  buyer: { name: string | null };
}

export function OfferRow({ offer }: { offer: Offer }) {
  const [status, setStatus] = useState<"pending" | "accepted" | "declined" | "loading">("pending");

  async function handleAction(action: "accept" | "decline") {
    setStatus("loading");
    const res = await fetch(`/api/offers/${offer.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });

    if (res.ok) {
      setStatus(action === "accept" ? "accepted" : "declined");
    } else {
      setStatus("pending");
    }
  }

  if (status === "accepted") {
    return (
      <div className="text-xs text-brass-400 py-1">
        ✓ Accepted — payment link sent to buyer
      </div>
    );
  }

  if (status === "declined") {
    return (
      <div className="text-xs text-bone-600 py-1">
        ✗ Offer declined
      </div>
    );
  }

  return (
    <div className="border border-void-700 rounded-sm p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={`/listings/${offer.listing.id}`}
            className="text-bone-200 text-xs font-medium hover:text-bone-100 truncate block"
          >
            {offer.listing.title}
          </Link>
          <p className="text-bone-500 text-xs mt-0.5">
            {offer.buyer.name ?? "Anonymous"} · {timeAgo(offer.createdAt)}
          </p>
          {offer.message && (
            <p className="text-bone-400 text-xs mt-1 italic line-clamp-2">"{offer.message}"</p>
          )}
        </div>
        <div className="text-brass-400 font-bold text-sm shrink-0">
          {formatListingPrice(offer.amount)}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => handleAction("accept")}
          disabled={status === "loading"}
          className="flex-1 btn-brass text-xs py-1.5 disabled:opacity-50"
        >
          ✓ Accept
        </button>
        <button
          onClick={() => handleAction("decline")}
          disabled={status === "loading"}
          className="flex-1 btn-secondary text-xs py-1.5 disabled:opacity-50"
        >
          ✗ Decline
        </button>
      </div>
    </div>
  );
}
