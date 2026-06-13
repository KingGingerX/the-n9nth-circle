"use client";

import { useSession, signIn } from "next-auth/react";
import { Check, Crown, Zap, Lock } from "lucide-react";
import { useState } from "react";

const PLANS = [
  {
    id: "free",
    name: "Recruit",
    price: "$0",
    period: "forever",
    description: "Browse, buy, and list. The arena is open.",
    features: [
      "Unlimited listings",
      "12% commission per sale",
      "Public forum access",
      "Standard search placement",
      "Buyer protection on purchases",
    ],
    cta: "Start Free",
    ctaType: "free",
    icon: null,
  },
  {
    id: "premium",
    name: "⚜ Premium Seller",
    price: "$19",
    yearlyPrice: "$179",
    period: "/month",
    description: "Priority placement. Sell faster. Look like the pro you are.",
    features: [
      "Priority search ranking",
      "Blue verified seller badge",
      "Unlimited listing photos",
      "Pro Seller forum section",
      "Monthly analytics report",
      "Early access to new features",
    ],
    cta: "Upgrade to Premium",
    ctaType: "premium",
    highlight: true,
    icon: <Crown className="w-5 h-5" />,
  },
  {
    id: "forum",
    name: "💀 Forum Elite",
    price: "$7",
    period: "/month",
    description: "Access the Exclusive Sales Lounge. Where the whales hunt.",
    features: [
      "Exclusive Sales Lounge access",
      "First look at rare listings",
      "Premium forum badge",
      "Direct buyer/seller messaging",
    ],
    cta: "Unlock the Lounge",
    ctaType: "forum",
    icon: <Lock className="w-5 h-5" />,
  },
];

const BOOSTS = [
  {
    id: "boost_7day",
    name: "7-Day Boost",
    price: "$9.99",
    description: "Pin your listing at the top of its category for 7 days.",
    icon: <Zap className="w-5 h-5 text-blood-500" />,
  },
  {
    id: "boost_homepage",
    name: "Homepage Feature",
    price: "$19.99",
    description: "Appear on the homepage Featured Armies carousel.",
    icon: <Crown className="w-5 h-5 text-brass-500" />,
  },
];

export default function PricingPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<string | null>(null);
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  async function handleUpgrade(type: string) {
    if (!session) { signIn(); return; }
    setLoading(type);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      alert("Checkout failed. Try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <p className="text-blood-500 text-sm font-semibold uppercase tracking-widest mb-2">Arsenal Upgrades</p>
        <h1 className="font-display text-5xl font-black text-bone-100 mb-4">
          Own More of the Arena
        </h1>
        <p className="text-bone-400 text-lg max-w-xl mx-auto">
          Free gets you in. Premium makes you the house.
        </p>

        {/* Billing toggle */}
        <div className="inline-flex items-center gap-1 bg-void-800 border border-void-700 rounded-sm p-1 mt-6">
          {(["monthly", "yearly"] as const).map((b) => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              className={`px-4 py-1.5 rounded-sm text-sm font-medium transition-all
                ${billing === b ? "bg-blood-800 text-bone-100 border border-blood-700" : "text-bone-400 hover:text-bone-200"}`}
            >
              {b === "yearly" ? "Yearly (save ~20%)" : "Monthly"}
            </button>
          ))}
        </div>
      </div>

      {/* Main plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative card p-8 flex flex-col
              ${plan.highlight ? "border-brass-800 glow-brass" : ""}`}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-brass-700 text-void-900 text-xs font-bold px-3 py-1 uppercase tracking-wider">
                  Most Popular
                </span>
              </div>
            )}

            <div className="mb-6">
              <h3 className={`font-display font-bold text-xl uppercase tracking-wide mb-1
                ${plan.highlight ? "text-brass-300" : "text-bone-200"}`}
              >
                {plan.name}
              </h3>
              <div className="flex items-end gap-1 mt-3">
                <span className="text-4xl font-display font-black text-bone-100">
                  {plan.id === "premium" && billing === "yearly" ? (plan as any).yearlyPrice : plan.price}
                </span>
                {plan.period && (
                  <span className="text-bone-500 text-sm pb-1">
                    {plan.id === "premium" && billing === "yearly" ? "/year" : plan.period}
                  </span>
                )}
              </div>
              <p className="text-bone-500 text-sm mt-2">{plan.description}</p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <Check className={`w-4 h-4 shrink-0 mt-0.5 ${plan.highlight ? "text-brass-500" : "text-bone-600"}`} />
                  <span className={plan.highlight ? "text-bone-300" : "text-bone-400"}>{f}</span>
                </li>
              ))}
            </ul>

            <button
              disabled={loading === plan.ctaType}
              onClick={() => {
                if (plan.ctaType === "free") { if (!session) signIn(); }
                else handleUpgrade(plan.ctaType === "premium" ? (billing === "yearly" ? "premium_seller_yearly" : "premium_seller") : "forum_access");
              }}
              className={`w-full text-center py-3 font-semibold text-sm transition-all disabled:opacity-50
                ${plan.highlight ? "btn-brass" : "btn-secondary"}`}
            >
              {loading === plan.ctaType ? "Redirecting..." : plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Listing boosts */}
      <div className="mb-16">
        <h2 className="section-title text-center mb-8">Listing Power-Ups</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {BOOSTS.map((boost) => (
            <div key={boost.id} className="card p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                {boost.icon}
                <div>
                  <h3 className="font-display text-bone-200 font-bold">{boost.name}</h3>
                  <span className="text-brass-400 font-bold">{boost.price}</span>
                </div>
              </div>
              <p className="text-bone-500 text-sm flex-1 mb-4">{boost.description}</p>
              <button
                onClick={() => handleUpgrade(boost.id)}
                disabled={loading === boost.id}
                className="btn-secondary text-sm disabled:opacity-50"
              >
                {loading === boost.id ? "..." : "Buy Boost"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Hall of Legends */}
      <div className="card border-brass-900/50 p-8 max-w-3xl mx-auto text-center">
        <Crown className="w-12 h-12 text-brass-600 mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold text-brass-300 mb-2">Hall of Legends</h2>
        <p className="text-bone-400 mb-6">
          The most prestigious placement on the platform. Hand-picked by the Game Master.
          Museum-quality armies only.
        </p>
        <div className="grid grid-cols-2 gap-4 mb-6 max-w-sm mx-auto">
          {[
            { tier: "Standard", price: "$49", note: "Consideration — not guaranteed" },
            { tier: "Immortal", price: "$99", note: "Permanent if quality standards met" },
          ].map((t) => (
            <div key={t.tier} className="bg-void-700 border border-brass-900/40 rounded-sm p-3">
              <div className="text-brass-400 font-bold text-lg">{t.price}</div>
              <div className="text-bone-200 text-sm font-semibold">{t.tier}</div>
              <div className="text-bone-600 text-xs mt-0.5">{t.note}</div>
            </div>
          ))}
        </div>
        <a href="/hall-of-legends/submit" className="btn-brass">Submit Your Army</a>
      </div>
    </div>
  );
}
