export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Heart, TrendingDown, TrendingUp, Minus, ArrowLeft } from "lucide-react";
import { formatListingPrice, parseImages } from "@/lib/utils";
import { SaveButton } from "@/components/listings/SaveButton";

async function getWatchlist(userId: string) {
  return prisma.watchlist.findMany({
    where: { userId },
    include: {
      listing: {
        include: {
          seller: { select: { name: true, image: true, isPremiumSeller: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function WatchlistPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin?callbackUrl=/dashboard/watchlist");

  const watchlist = await getWatchlist(session.user.id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" className="text-bone-500 hover:text-bone-300 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <p className="text-blood-500 text-sm font-semibold uppercase tracking-widest mb-0.5">Saved</p>
          <h1 className="font-display text-3xl font-black text-bone-100 flex items-center gap-2">
            <Heart className="w-6 h-6 text-blood-500 fill-blood-500" />
            Watchlist
          </h1>
        </div>
      </div>

      {watchlist.length === 0 ? (
        <div className="card p-12 text-center">
          <Heart className="w-10 h-10 text-bone-600 mx-auto mb-4" />
          <p className="text-bone-400 text-lg mb-2">No saved listings.</p>
          <p className="text-bone-600 text-sm mb-6">Click the heart icon on any listing to save it here.</p>
          <Link href="/marketplace" className="btn-primary">Browse Marketplace</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {watchlist.map(({ id, priceAtSave, createdAt, listing }) => {
            const images = parseImages(listing.images);
            const priceDiff = listing.price - priceAtSave;
            const pricePct = priceAtSave > 0 ? (priceDiff / priceAtSave) * 100 : 0;
            const dropped = priceDiff < -0.01;
            const risen = priceDiff > 0.01;
            const isSold = listing.status === "SOLD";

            return (
              <div key={id} className={`card p-4 flex items-center gap-4 ${isSold ? "opacity-60" : ""}`}>
                <Link href={`/listings/${listing.id}`} className="relative w-16 h-16 shrink-0 bg-void-700 rounded-sm overflow-hidden group">
                  {images[0] ? (
                    <Image src={images[0]} alt={listing.title} fill className="object-cover group-hover:scale-105 transition-transform" sizes="64px" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-void-600 text-2xl">⚔</div>
                  )}
                </Link>

                <div className="flex-1 min-w-0">
                  <Link href={`/listings/${listing.id}`} className="text-bone-200 font-semibold text-sm hover:text-bone-100 transition-colors line-clamp-1">
                    {listing.title}
                  </Link>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-bone-300 font-bold text-sm">{formatListingPrice(listing.price)}</span>
                    {dropped && (
                      <span className="flex items-center gap-1 text-green-400 text-xs font-semibold">
                        <TrendingDown className="w-3 h-3" />
                        {Math.abs(pricePct).toFixed(0)}% drop
                      </span>
                    )}
                    {risen && (
                      <span className="flex items-center gap-1 text-blood-400 text-xs">
                        <TrendingUp className="w-3 h-3" />
                        +{pricePct.toFixed(0)}%
                      </span>
                    )}
                    {!dropped && !risen && (
                      <span className="flex items-center gap-1 text-bone-600 text-xs">
                        <Minus className="w-3 h-3" />
                        No change
                      </span>
                    )}
                    {isSold && <span className="badge-brass text-xs">Sold</span>}
                  </div>
                  <p className="text-bone-600 text-xs mt-0.5">
                    Saved at {formatListingPrice(priceAtSave)} · {listing.gameSystem}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!isSold && (
                    <Link href={`/listings/${listing.id}`} className="btn-primary text-xs py-1.5 px-3">
                      View
                    </Link>
                  )}
                  <SaveButton listingId={listing.id} initialSaved={true} size="sm" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
