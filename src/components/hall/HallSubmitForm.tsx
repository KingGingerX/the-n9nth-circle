"use client";

import { useState, useEffect } from "react";
import { Crown } from "lucide-react";
import { PRICES } from "@/lib/stripe";

export function HallSubmitForm() {
  const [listings, setListings] = useState<any[]>([]);
  const [selectedListing, setSelectedListing] = useState("");
  const [tier, setTier] = useState<"STANDARD" | "IMMORTAL">("STANDARD");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/listings?mine=true")
      .then((r) => r.json())
      .then(setListings)
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedListing) return;
    setLoading(true);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: tier === "IMMORTAL" ? "hall_immortal" : "hall_standard",
          listingId: selectedListing,
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      alert("Checkout failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-8 space-y-6">
      {/* Tier selection */}
      <div>
        <label className="label">Submission Tier</label>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {[
            { id: "STANDARD", label: "Standard", price: "$49", desc: "Considered for Hall. Acceptance not guaranteed." },
            { id: "IMMORTAL", label: "Immortal", price: "$99", desc: "Permanent featured placement if accepted." },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTier(t.id as "STANDARD" | "IMMORTAL")}
              className={`p-4 rounded-sm border-2 text-left transition-all
                ${tier === t.id
                  ? "border-brass-600 bg-brass-900/30"
                  : "border-void-600 hover:border-void-500"
                }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-display font-bold text-sm text-bone-200 uppercase">{t.label}</span>
                <span className="text-brass-400 font-bold">{t.price}</span>
              </div>
              <p className="text-bone-500 text-xs">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Listing selection */}
      <div>
        <label className="label">Select Your Army</label>
        {listings.length === 0 ? (
          <div className="card p-4 text-center">
            <p className="text-bone-500 text-sm">No active listings found.</p>
            <a href="/listings/new" className="text-blood-400 text-sm mt-1 block hover:text-blood-300">
              Create a listing first →
            </a>
          </div>
        ) : (
          <select
            value={selectedListing}
            onChange={(e) => setSelectedListing(e.target.value)}
            required
            className="input"
          >
            <option value="">Choose a listing...</option>
            {listings.map((l) => (
              <option key={l.id} value={l.id}>{l.title} — ${l.price}</option>
            ))}
          </select>
        )}
      </div>

      {/* Terms */}
      <div className="bg-void-700 border border-void-600 rounded-sm p-4 text-xs text-bone-500 space-y-1">
        <p>• Submission fee is non-refundable regardless of acceptance decision.</p>
        <p>• Game Master reviews every submission. No timeline guaranteed.</p>
        <p>• Immortal tier guarantees placement if quality standards are met.</p>
        <p>• Standard tier: Game Master selects the best submissions for the Hall.</p>
      </div>

      <button
        type="submit"
        disabled={loading || !selectedListing}
        className="btn-brass w-full text-base py-4 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Crown className="w-5 h-5" />
        {loading ? "Redirecting to Stripe..." : `Submit — ${tier === "IMMORTAL" ? "$99" : "$49"}`}
      </button>
    </form>
  );
}
