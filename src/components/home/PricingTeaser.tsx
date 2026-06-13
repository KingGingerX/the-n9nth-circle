import Link from "next/link";
import { Check } from "lucide-react";

export function PricingTeaser() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-blood-500 text-sm font-semibold uppercase tracking-widest mb-2">
            Own More of the Arena
          </p>
          <h2 className="section-title">Upgrade Your Arsenal</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Free */}
          <div className="card p-6">
            <div className="mb-6">
              <h3 className="font-display text-bone-200 font-bold text-lg uppercase tracking-wider">Recruit</h3>
              <div className="mt-3">
                <span className="text-3xl font-bold text-bone-100">$0</span>
                <span className="text-bone-500 text-sm ml-1">forever</span>
              </div>
              <p className="text-bone-500 text-sm mt-2">Browse, buy, and sell on the platform.</p>
            </div>
            <ul className="space-y-2.5 mb-6">
              {[
                "Unlimited listings",
                "12% commission per sale",
                "Public forum access",
                "Standard search placement",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-bone-400">
                  <Check className="w-4 h-4 text-bone-600 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/auth/signin" className="btn-secondary text-sm text-center block">
              Start Free
            </Link>
          </div>

          {/* Premium Seller */}
          <div className="relative card border-brass-800 p-6 glow-brass">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-brass-700 text-void-900 text-xs font-bold px-3 py-1 uppercase tracking-wider">
                Most Popular
              </span>
            </div>
            <div className="mb-6">
              <h3 className="font-display text-brass-300 font-bold text-lg uppercase tracking-wider">
                ⚜ Premium Seller
              </h3>
              <div className="mt-3">
                <span className="text-3xl font-bold text-bone-100">$19</span>
                <span className="text-bone-500 text-sm ml-1">/month</span>
              </div>
              <p className="text-bone-500 text-sm mt-2">Priority placement. Sell faster.</p>
            </div>
            <ul className="space-y-2.5 mb-6">
              {[
                "Priority search ranking",
                "Blue verified badge",
                "Unlimited listing photos",
                "Pro Seller forum section",
                "Monthly analytics report",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-bone-300">
                  <Check className="w-4 h-4 text-brass-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/pricing" className="btn-brass text-sm text-center block">
              Upgrade Now
            </Link>
          </div>

          {/* Forum + Lounge */}
          <div className="card p-6">
            <div className="mb-6">
              <h3 className="font-display text-bone-200 font-bold text-lg uppercase tracking-wider">
                💀 Forum Elite
              </h3>
              <div className="mt-3">
                <span className="text-3xl font-bold text-bone-100">$7</span>
                <span className="text-bone-500 text-sm ml-1">/month</span>
              </div>
              <p className="text-bone-500 text-sm mt-2">Access the Exclusive Sales Lounge.</p>
            </div>
            <ul className="space-y-2.5 mb-6">
              {[
                "Exclusive Sales Lounge access",
                "First look at whale listings",
                "Premium forum badge",
                "Direct seller messaging",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-bone-400">
                  <Check className="w-4 h-4 text-blood-600 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/pricing" className="btn-secondary text-sm text-center block">
              Get Access
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
