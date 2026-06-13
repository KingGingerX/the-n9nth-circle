import Link from "next/link";
import { Shield, Sword, Crown } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden hero-gradient">
      {/* Background rune decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-blood-900/30 to-transparent" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-blood-900/20 to-transparent" />
        <div className="absolute top-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-void-600/40 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 relative">
        <div className="text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 bg-blood-900/50 border border-blood-800 rounded-sm px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-blood-500 animate-pulse" />
            <span className="text-blood-400 text-xs font-semibold uppercase tracking-widest">
              The Premier Wargaming Marketplace
            </span>
          </div>

          {/* Main headline */}
          <h1 className="font-display text-5xl sm:text-6xl lg:text-8xl font-black text-bone-100 tracking-tight mb-4 leading-none">
            The Ninth
            <span className="block text-gradient-blood">Circle</span>
          </h1>

          <div className="flex items-center justify-center gap-4 my-6">
            <div className="h-px bg-gradient-to-r from-transparent to-brass-800 w-24" />
            <div className="text-brass-600">✦</div>
            <div className="h-px bg-gradient-to-l from-transparent to-brass-800 w-24" />
          </div>

          <p className="text-bone-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            Buy and sell rare painted armies, custom terrain, and wargaming treasures.
            They bring the plastic crack — <span className="text-bone-200 font-medium">you own the table.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/marketplace" className="btn-primary text-base px-8 py-4">
              Browse the Arena
            </Link>
            <Link href="/listings/new" className="btn-secondary text-base px-8 py-4">
              Sell Your Army
            </Link>
          </div>

          {/* Value props */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              {
                icon: <Sword className="w-6 h-6 text-blood-500" />,
                title: "Rare Armies",
                desc: "God-tier painted forces, rare out-of-print minis, and custom commissions",
              },
              {
                icon: <Crown className="w-6 h-6 text-brass-500" />,
                title: "Hall of Legends",
                desc: "Museum-quality showcase for the finest painted armies in the hobby",
              },
              {
                icon: <Shield className="w-6 h-6 text-bone-500" />,
                title: "Trusted Platform",
                desc: "Verified sellers, secure payments, buyer protection on every transaction",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-void-800/50 border border-void-700 rounded-sm p-5 text-left"
              >
                <div className="mb-3">{item.icon}</div>
                <h3 className="font-display text-bone-200 font-semibold text-sm uppercase tracking-wider mb-1.5">
                  {item.title}
                </h3>
                <p className="text-bone-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-void-900 to-transparent" />
    </section>
  );
}
