"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  purchaseId: string;
  sellerName: string;
}

export function ReviewForm({ purchaseId, sellerName }: Props) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setError("Select a star rating."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchaseId, rating, comment }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="text-blood-400 text-xs">{error}</p>}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setRating(s)}
            onMouseEnter={() => setHovered(s)}
            onMouseLeave={() => setHovered(0)}
            className="transition-colors"
          >
            <Star
              className={`w-5 h-5 transition-colors ${
                s <= (hovered || rating) ? "text-brass-500 fill-brass-500" : "text-void-600"
              }`}
            />
          </button>
        ))}
        <span className="text-bone-500 text-xs ml-2">
          {rating > 0 ? ["", "Poor", "Fair", "Good", "Great", "Perfect"][rating] : "Rate " + sellerName}
        </span>
      </div>
      <input
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Leave a comment (optional)"
        maxLength={1000}
        className="input text-sm"
      />
      <button type="submit" disabled={loading || rating === 0} className="btn-secondary text-xs py-1.5 px-4 disabled:opacity-50">
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
