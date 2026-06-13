"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Zap, Crown } from "lucide-react";
import Link from "next/link";
import { formatListingPrice } from "@/lib/utils";

export default function BoostListingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
  }, [status, router]);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/listings/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setListing(data);
        setFetching(false);
      })
      .catch(() => setFetching(false));
  }, [params.id]);

  async function handleBoost(type: string) {
    setLoading(type);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, listingId: params.id }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error ?? "Checkout failed");
    } catch {
      alert("Checkout failed. Try again.");
    } finally {
      setLoading(null);
    }
  }

  if (status === "loading" || fetching) {
    return <div className="flex items-center justify-center min-h-[50vh]"><div className="text-bone-500">Loading...</div></div>;
  }

  if (!listing || listing.error) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-bone-400">Listing not found.</p>
        <Link href="/dashboard" className="btn-secondary text-sm mt-4 inline-block">Back to Dashboard</Link>
      </div>
    );
  }

  if (listing.sellerId !== session?.user?.id) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-blood-400">You don't own this listing.</p>
        <Link href="/dashboard" className="btn-secondary text-sm mt-4 inline-block">Dashboard</Link>
      </div>
    );
  }

  if (listing.isBoosted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <Zap className="w-12 h-12 text-blood-500 mx-auto mb-4" />
        <h1 className="font-display text-3xl font-bold text-bone-100 mb-2">Already Boosted</h1>
        <p className="text-bone-400 mb-6">This listing is already pinned and running hot.</p>
        <Link href={`/listings/${params.id}`} className="btn-primary text-sm">View Listing</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 text-center">
        <p className="text-blood-500 text-sm font-semibold uppercase tracking-widest mb-1">Power Up</p>
        <h1 className="font-display text-4xl font-black text-bone-100">Boost Your Listing</h1>
        <p className="text-bone-400 text-sm mt-2 max-w-md mx-auto">
          Outranking everyone else's listing for a fraction of the price.
        </p>
      </div>

      <div className="card p-5 mb-8 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-bone-200 font-medium truncate">{listing.title}</p>
          <p className="text-bone-500 text-sm">{listing.gameSystem} · {formatListingPrice(listing.price)}</p>
        </div>
        <Link href={`/listings/${params.id}`} className="btn-secondary text-xs py-1.5 px-3 shrink-0">View</Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            type: "boost_7day",
            name: "7-Day Boost",
            price: "$9.99",
            icon: <Zap className="w-8 h-8 text-blood-500" />,
            features: [
              "Pinned at top of category for 7 days",
              "⚡ Boosted badge on your listing",
              "Priority in search results",
            ],
          },
          {
            type: "boost_homepage",
            name: "Homepage Feature",
            price: "$19.99",
            icon: <Crown className="w-8 h-8 text-brass-500" />,
            features: [
              "Featured Armies carousel on homepage",
              "Maximum visibility to all visitors",
              "7-day homepage placement",
            ],
          },
        ].map((boost) => (
          <div key={boost.type} className="card p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              {boost.icon}
              <div>
                <h3 className="font-display text-bone-100 font-bold text-lg">{boost.name}</h3>
                <span className="text-brass-400 font-bold text-xl">{boost.price}</span>
              </div>
            </div>
            <ul className="space-y-2 mb-6 flex-1">
              {boost.features.map((f) => (
                <li key={f} className="text-bone-400 text-sm flex items-start gap-2">
                  <span className="text-blood-500 shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleBoost(boost.type)}
              disabled={loading === boost.type}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading === boost.type ? "Redirecting..." : `Boost — ${boost.price}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
