import Link from "next/link";
import { Skull } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-void-950 border-t border-void-800 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Skull className="w-6 h-6 text-blood-500" />
              <span className="font-display text-lg font-bold text-bone-100 tracking-widest uppercase">
                The N9nth Circle
              </span>
            </div>
            <p className="text-bone-500 text-sm leading-relaxed max-w-sm">
              The premier marketplace for tabletop wargaming. Buy, sell, and trade painted armies,
              custom terrain, and rare minis. You bring the plastic crack — we own the arena.
            </p>
            <div className="flex gap-4 mt-6">
              <div className="text-center">
                <div className="text-brass-400 font-display font-bold text-xl">12%</div>
                <div className="text-bone-600 text-xs">Commission</div>
              </div>
              <div className="text-center">
                <div className="text-brass-400 font-display font-bold text-xl">$0</div>
                <div className="text-bone-600 text-xs">To Browse</div>
              </div>
              <div className="text-center">
                <div className="text-brass-400 font-display font-bold text-xl">∞</div>
                <div className="text-bone-600 text-xs">Nerd Cred</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-display text-bone-200 font-semibold uppercase tracking-wider text-sm mb-4">
              Marketplace
            </h3>
            <ul className="space-y-2">
              {[
                { label: "Browse Listings", href: "/marketplace" },
                { label: "Hall of Legends", href: "/hall-of-legends" },
                { label: "Sell an Army", href: "/listings/new" },
                { label: "Pricing & Upgrades", href: "/pricing" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-bone-500 hover:text-bone-200 text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-bone-200 font-semibold uppercase tracking-wider text-sm mb-4">
              Community
            </h3>
            <ul className="space-y-2">
              {[
                { label: "Forum", href: "/forum" },
                { label: "Painting & Hobby", href: "/forum/painting-hobby" },
                { label: "Tactics & Lists", href: "/forum/tactics-lists" },
                { label: "Contact", href: "/contact" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-bone-500 hover:text-bone-200 text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-void-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-bone-700 text-xs">
            © {new Date().getFullYear()} The N9nth Circle. All rights reserved.
            The house always wins.
          </p>
          <div className="flex gap-6">
            <Link href="/terms" className="text-bone-700 hover:text-bone-400 text-xs transition-colors">Terms</Link>
            <Link href="/privacy" className="text-bone-700 hover:text-bone-400 text-xs transition-colors">Privacy</Link>
            <Link href="/fees" className="text-bone-700 hover:text-bone-400 text-xs transition-colors">Fee Structure</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
