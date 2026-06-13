export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { DollarSign, Package, Eye, TrendingUp, Plus, Zap, MessageSquare, Heart } from "lucide-react";
import { formatListingPrice, parseImages, timeAgo } from "@/lib/utils";
import Image from "next/image";
import { OfferRow } from "@/components/dashboard/OfferRow";

async function getDashboardData(userId: string) {
  const [user, listings, recentSales, pendingOffers] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        image: true,
        isPremiumSeller: true,
        premiumExpiresAt: true,
        hasForumAccess: true,
        totalSales: true,
        totalEarnings: true,
        sellerRating: true,
        reviewCount: true,
        createdAt: true,
      },
    }),
    prisma.listing.findMany({
      where: { sellerId: userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.purchase.findMany({
      where: { sellerId: userId },
      include: { listing: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.offer.findMany({
      where: {
        listing: { sellerId: userId },
        status: "PENDING",
      },
      include: {
        listing: { select: { id: true, title: true } },
        buyer: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return { user, listings, recentSales, pendingOffers };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin?callbackUrl=/dashboard");

  const { user, listings, recentSales, pendingOffers } = await getDashboardData(session.user.id);
  if (!user) redirect("/auth/signin");

  const activeListings = listings.filter((l) => l.status === "ACTIVE");
  const soldListings = listings.filter((l) => l.status === "SOLD");
  const totalViews = listings.reduce((sum, l) => sum + l.views, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-blood-500 text-sm font-semibold uppercase tracking-widest mb-1">War Room</p>
          <h1 className="font-display text-4xl font-black text-bone-100">Dashboard</h1>
          <p className="text-bone-500 text-sm mt-1">Welcome back, {user.name?.split(" ")[0]}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/watchlist" className="btn-secondary flex items-center gap-2 text-sm">
            <Heart className="w-3.5 h-3.5" />
            Watchlist
          </Link>
          <Link href="/dashboard/purchases" className="btn-secondary flex items-center gap-2 text-sm">
            My Purchases
          </Link>
          <Link href="/listings/new" className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />
            New Listing
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total Earnings", value: formatListingPrice(user.totalEarnings), icon: <DollarSign className="w-5 h-5 text-brass-500" />, note: "After 12% fees" },
          { label: "Total Sales", value: user.totalSales.toString(), icon: <Package className="w-5 h-5 text-blood-500" /> },
          { label: "Active Listings", value: activeListings.length.toString(), icon: <TrendingUp className="w-5 h-5 text-bone-500" /> },
          { label: "Total Views", value: totalViews.toString(), icon: <Eye className="w-5 h-5 text-bone-500" /> },
        ].map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-bone-500 text-xs uppercase tracking-wide">{stat.label}</span>
              {stat.icon}
            </div>
            <div className="font-display text-2xl font-bold text-bone-100">{stat.value}</div>
            {stat.note && <div className="text-bone-600 text-xs mt-0.5">{stat.note}</div>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Listings */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-bone-200 font-semibold uppercase tracking-wider text-sm">
              Your Listings
            </h2>
            <span className="text-bone-500 text-xs">{listings.length} total</span>
          </div>

          {listings.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-bone-500 mb-4">No listings yet. Start selling.</p>
              <Link href="/listings/new" className="btn-primary text-sm">List Your First Army</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {listings.map((listing) => {
                const images = parseImages(listing.images);
                return (
                  <div key={listing.id} className="card p-3 flex items-center gap-3">
                    <div className="relative w-14 h-14 shrink-0 bg-void-700 rounded-sm overflow-hidden">
                      {images[0] ? (
                        <Image src={images[0]} alt="" fill className="object-cover" sizes="56px" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-void-600 text-xl">⚔</div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/listings/${listing.id}`}
                          className="text-bone-200 font-medium text-sm truncate hover:text-bone-100 transition-colors"
                        >
                          {listing.title}
                        </Link>
                        <span className={`badge text-xs shrink-0
                          ${listing.status === "ACTIVE" ? "bg-green-900 text-green-400 border border-green-800" :
                            listing.status === "SOLD" ? "badge-brass" : "badge-void"}`}
                        >
                          {listing.status}
                        </span>
                        {listing.isBoosted && (
                          <span className="badge-blood flex items-center gap-1 text-xs shrink-0">
                            <Zap className="w-2.5 h-2.5" />
                            Boosted
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-bone-500">
                        <span className="text-bone-300 font-semibold">{formatListingPrice(listing.price)}</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{listing.views}</span>
                        <span>{timeAgo(listing.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex gap-1.5 shrink-0">
                      <Link href={`/listings/${listing.id}/edit`} className="btn-secondary text-xs py-1.5 px-2.5">
                        Edit
                      </Link>
                      {listing.status === "ACTIVE" && !listing.isBoosted && (
                        <Link href={`/boost/${listing.id}`} className="btn-primary text-xs py-1.5 px-2.5 flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          Boost
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account status */}
          <div className="card p-5">
            <h3 className="font-display text-bone-200 font-semibold uppercase tracking-wider text-xs mb-4">
              Account Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-bone-400 text-sm">Seller Tier</span>
                {user.isPremiumSeller ? (
                  <span className="badge-brass">⚜ Premium</span>
                ) : (
                  <span className="badge-void">Recruit</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-bone-400 text-sm">Forum Access</span>
                {user.hasForumAccess ? (
                  <span className="badge-brass">Elite</span>
                ) : (
                  <span className="badge-void">Basic</span>
                )}
              </div>
              {user.reviewCount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-bone-400 text-sm">Rating</span>
                  <span className="text-bone-200 text-sm">
                    ⭐ {user.sellerRating.toFixed(1)} ({user.reviewCount})
                  </span>
                </div>
              )}
            </div>
            {!user.isPremiumSeller && (
              <Link href="/pricing" className="btn-brass w-full text-center block text-sm mt-4">
                ⚜ Upgrade to Premium
              </Link>
            )}
          </div>

          {/* Pending offers */}
          {pendingOffers.length > 0 && (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-4 h-4 text-brass-500" />
                <h3 className="font-display text-bone-200 font-semibold uppercase tracking-wider text-xs">
                  Offers ({pendingOffers.length})
                </h3>
              </div>
              <div className="space-y-3">
                {pendingOffers.map((offer) => (
                  <OfferRow key={offer.id} offer={offer} />
                ))}
              </div>
            </div>
          )}

          {/* Recent sales */}
          {recentSales.length > 0 && (
            <div className="card p-5">
              <h3 className="font-display text-bone-200 font-semibold uppercase tracking-wider text-xs mb-4">
                Recent Sales
              </h3>
              <div className="space-y-2.5">
                {recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-bone-300 text-xs truncate">{sale.listing.title}</p>
                      <p className="text-bone-600 text-xs">{timeAgo(sale.createdAt)}</p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <div className="text-brass-400 text-xs font-semibold">+{formatListingPrice(sale.sellerPayout)}</div>
                      <div className="text-bone-600 text-xs">after fee</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
