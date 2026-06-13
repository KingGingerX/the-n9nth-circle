export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/listings/ListingCard";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Package, Crown } from "lucide-react";
import { timeAgo } from "@/lib/utils";

export default async function SellerProfilePage({ params }: { params: { id: string } }) {
  const seller = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      image: true,
      bio: true,
      location: true,
      isPremiumSeller: true,
      sellerRating: true,
      reviewCount: true,
      totalSales: true,
      createdAt: true,
    },
  });

  if (!seller) notFound();

  const listings = await prisma.listing.findMany({
    where: { sellerId: params.id, status: "ACTIVE" },
    include: {
      seller: { select: { name: true, image: true, isPremiumSeller: true, sellerRating: true, reviewCount: true } },
    },
    orderBy: [{ isBoosted: "desc" }, { createdAt: "desc" }],
    take: 24,
  });

  const reviews = await prisma.review.findMany({
    where: { revieweeId: params.id },
    include: { reviewer: { select: { name: true, image: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Seller header */}
      <div className="card p-8 mb-10 flex items-start gap-6">
        {seller.image ? (
          <Image src={seller.image} alt={seller.name ?? ""} width={80} height={80} className="rounded-full border border-void-600 shrink-0" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-blood-900 border border-blood-800 flex items-center justify-center text-blood-400 text-3xl font-bold shrink-0">
            {seller.name?.[0] ?? "?"}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display text-3xl font-bold text-bone-100">{seller.name}</h1>
            {seller.isPremiumSeller && (
              <span className="badge-brass flex items-center gap-1">
                <Crown className="w-3 h-3" />
                ⚜ Premium Seller
              </span>
            )}
          </div>

          <div className="flex items-center flex-wrap gap-4 mt-2 text-sm text-bone-500">
            {seller.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {seller.location}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Package className="w-4 h-4" />
              {seller.totalSales} sales
            </div>
            {seller.reviewCount > 0 && (
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-brass-600 fill-brass-600" />
                <span className="text-bone-300">{seller.sellerRating.toFixed(1)}</span>
                <span>({seller.reviewCount} reviews)</span>
              </div>
            )}
            <div>Member since {timeAgo(seller.createdAt)}</div>
          </div>

          {seller.bio && (
            <p className="text-bone-400 text-sm mt-3 leading-relaxed max-w-2xl">{seller.bio}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Listings */}
        <div className="lg:col-span-2">
          <h2 className="font-display text-bone-200 font-bold uppercase tracking-wider text-sm mb-5">
            Active Listings ({listings.length})
          </h2>
          {listings.length === 0 ? (
            <div className="card p-10 text-center text-bone-500">No active listings.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {listings.map((l) => <ListingCard key={l.id} listing={l as any} />)}
            </div>
          )}
        </div>

        {/* Reviews */}
        <div>
          <h2 className="font-display text-bone-200 font-bold uppercase tracking-wider text-sm mb-5">
            Reviews ({reviews.length})
          </h2>
          {reviews.length === 0 ? (
            <div className="card p-6 text-center text-bone-500 text-sm">No reviews yet.</div>
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex text-brass-500">
                      {Array.from({ length: r.rating }, (_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-bone-500 text-xs">{r.reviewer.name}</span>
                  </div>
                  {r.comment && <p className="text-bone-400 text-sm leading-relaxed">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
