import Link from "next/link";
import { Crown, ChevronRight } from "lucide-react";

export function HallOfLegendsTeaser() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brass-900/20 via-void-900 to-void-950" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brass-700/50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brass-700/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 mb-6">
              <Crown className="w-5 h-5 text-brass-500" />
              <span className="text-brass-500 text-sm font-semibold uppercase tracking-widest">
                Hall of Legends
              </span>
            </div>

            <h2 className="font-display text-4xl sm:text-5xl font-black text-bone-100 leading-tight mb-6">
              Where Gods
              <span className="block text-gradient-brass">Hang Their Armies</span>
            </h2>

            <p className="text-bone-400 text-lg leading-relaxed mb-8">
              Not every army earns a place in the Hall. Only competition-quality masterpieces
              grace these hallowed walls. Submit your finest work — if it passes judgment,
              you achieve immortality.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { label: "Standard Entry", price: "$49", desc: "Consideration for a Hall spot" },
                { label: "Immortal Tier", price: "$99", desc: "Permanent featured placement" },
              ].map((tier) => (
                <div key={tier.label} className="bg-void-800/80 border border-brass-900/50 rounded-sm p-4">
                  <div className="text-brass-400 font-display font-bold text-xl">{tier.price}</div>
                  <div className="text-bone-200 text-sm font-semibold mt-0.5">{tier.label}</div>
                  <div className="text-bone-500 text-xs mt-1">{tier.desc}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <Link href="/hall-of-legends" className="btn-brass flex items-center gap-2">
                Enter the Hall
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link href="/hall-of-legends/submit" className="btn-secondary">
                Submit Army
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square bg-void-800 border border-brass-900/50 rounded-sm flex items-center justify-center glow-brass">
              <div className="text-center p-8">
                <Crown className="w-20 h-20 text-brass-600 mx-auto mb-4 opacity-60" />
                <p className="font-display text-brass-500 text-lg font-semibold uppercase tracking-widest opacity-70">
                  Hall of Legends
                </p>
                <p className="text-bone-600 text-sm mt-2">First armies coming soon</p>
              </div>
            </div>
            {/* Decorative corner brackets */}
            <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-brass-700/60" />
            <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-brass-700/60" />
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-brass-700/60" />
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-brass-700/60" />
          </div>
        </div>
      </div>
    </section>
  );
}
