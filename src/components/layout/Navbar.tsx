"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X, Skull, ChevronDown } from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import { MessagesBadge } from "./MessagesBadge";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-void-950/95 backdrop-blur-sm border-b border-void-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Skull className="w-7 h-7 text-blood-500 group-hover:text-blood-400 transition-colors" />
            <span className="font-display text-xl font-bold text-bone-100 tracking-widest uppercase">
              9<sup className="text-blood-500 text-xs">th</sup>{" "}
              <span className="text-gradient-brass">Circle</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/marketplace"
              className="text-bone-400 hover:text-bone-100 font-medium transition-colors tracking-wide text-sm uppercase"
            >
              Marketplace
            </Link>
            <Link
              href="/hall-of-legends"
              className="text-bone-400 hover:text-brass-400 font-medium transition-colors tracking-wide text-sm uppercase"
            >
              Hall of Legends
            </Link>
            <Link
              href="/forum"
              className="text-bone-400 hover:text-bone-100 font-medium transition-colors tracking-wide text-sm uppercase"
            >
              Forum
            </Link>
            <Link
              href="/wtb"
              className="text-bone-400 hover:text-bone-100 font-medium transition-colors tracking-wide text-sm uppercase"
            >
              WTB Board
            </Link>
            <Link
              href="/pricing"
              className="text-bone-400 hover:text-bone-100 font-medium transition-colors tracking-wide text-sm uppercase"
            >
              Upgrade
            </Link>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            {session ? (
              <>
                <Link href="/listings/new" className="btn-primary text-sm py-2 px-4">
                  + Sell Army
                </Link>
                <MessagesBadge />
                <NotificationBell />
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 text-bone-300 hover:text-bone-100 transition-colors"
                  >
                    {session.user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={session.user.image}
                        alt={session.user.name ?? "User"}
                        className="w-8 h-8 rounded-full border border-void-600"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blood-900 border border-blood-700 flex items-center justify-center text-blood-300 text-sm font-bold">
                        {session.user.name?.[0]?.toUpperCase() ?? "U"}
                      </div>
                    )}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-void-800 border border-void-600 rounded-sm shadow-xl z-50">
                      <div className="px-4 py-3 border-b border-void-700">
                        <p className="text-bone-200 text-sm font-medium truncate">{session.user.name}</p>
                        {session.user.isPremiumSeller && (
                          <span className="badge-brass text-xs mt-1">⚜ Premium Seller</span>
                        )}
                        {session.user.role === "ADMIN" && (
                          <span className="badge-blood text-xs mt-1">☠ Game Master</span>
                        )}
                      </div>
                      <div className="py-1">
                        <Link
                          href="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-bone-300 hover:text-bone-100 hover:bg-void-700 transition-colors"
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="/dashboard/purchases"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-bone-300 hover:text-bone-100 hover:bg-void-700 transition-colors"
                        >
                          My Purchases
                        </Link>
                        <Link
                          href="/messages"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-bone-300 hover:text-bone-100 hover:bg-void-700 transition-colors"
                        >
                          Messages
                        </Link>
                        <Link
                          href="/dashboard/watchlist"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-bone-300 hover:text-bone-100 hover:bg-void-700 transition-colors"
                        >
                          Watchlist
                        </Link>
                        <Link
                          href="/wtb"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-bone-300 hover:text-bone-100 hover:bg-void-700 transition-colors"
                        >
                          WTB Posts
                        </Link>
                        <Link
                          href="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-bone-300 hover:text-bone-100 hover:bg-void-700 transition-colors"
                        >
                          My Profile
                        </Link>
                        {session.user.role === "ADMIN" && (
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-blood-400 hover:text-blood-300 hover:bg-void-700 transition-colors"
                          >
                            ☠ Admin Panel
                          </Link>
                        )}
                      </div>
                      <div className="py-1 border-t border-void-700">
                        <button
                          onClick={() => signOut()}
                          className="w-full text-left px-4 py-2 text-sm text-bone-500 hover:text-bone-300 hover:bg-void-700 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button onClick={() => signIn()} className="btn-primary text-sm py-2 px-4">
                Enter the Circle
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-bone-400 hover:text-bone-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-void-900 border-t border-void-700 px-4 py-4 space-y-3">
          <Link href="/marketplace" className="block text-bone-300 hover:text-bone-100 py-2">Marketplace</Link>
          <Link href="/hall-of-legends" className="block text-bone-300 hover:text-brass-400 py-2">Hall of Legends</Link>
          <Link href="/forum" className="block text-bone-300 hover:text-bone-100 py-2">Forum</Link>
          <Link href="/wtb" className="block text-bone-300 hover:text-bone-100 py-2">WTB Board</Link>
          <Link href="/pricing" className="block text-bone-300 hover:text-bone-100 py-2">Upgrade</Link>
          {session ? (
            <>
              <Link href="/listings/new" className="btn-primary block text-center text-sm mt-2">+ Sell Army</Link>
              <Link href="/dashboard" className="block text-bone-300 hover:text-bone-100 py-2">Dashboard</Link>
              <Link href="/messages" className="block text-bone-300 hover:text-bone-100 py-2">Messages</Link>
              {session.user.role === "ADMIN" && (
                <Link href="/admin" className="block text-blood-400 py-2">☠ Admin Panel</Link>
              )}
              <button onClick={() => signOut()} className="block text-bone-500 py-2">Sign Out</button>
            </>
          ) : (
            <button onClick={() => signIn()} className="btn-primary block text-center text-sm mt-2 w-full">
              Enter the Circle
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
