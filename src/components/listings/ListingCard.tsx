"use client";

import Link from "next/link";
import Image from "next/image";
import { Eye, Star, Zap } from "lucide-react";
import { formatListingPrice, parseImages, timeAgo } from "@/lib/utils";
import type { Listing, User } from "@prisma/client";
import { SaveButton } from "./SaveButton";

type ListingWithSeller = Listing & {
  seller: Pick<User, "name" | "image" | "isPremiumSeller" | "sellerRating" | "reviewCount">;
};

interface Props {
  listing: ListingWithSeller;
  featured?: boolean;
  isSaved?: boolean;
}

export function ListingCard({ listing, featured, isSaved = false }: Props) {
  const images = parseImages(listing.images);
  const firstImage = images[0] ?? null;

  return (
    <Link href={`/listings/${listing.id}`}>
      <div
        className={`group relative flex flex-col h-full card-hover overflow-hidden transition-all duration-300
          ${featured ? "border-brass-800 hover:border-brass-600" : "hover:border-blood-800"}
          ${listing.isBoosted ? "ring-1 ring-blood-800" : ""}`}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] bg-void-700 overflow-hidden">
          {firstImage ? (
            <Image
              src={firstImage}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-void-600 text-6xl">⚔</div>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 listing-card-gradient" />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1.5">
            {listing.isBoosted && (
              <span className="badge-blood flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Boosted
              </span>
            )}
            {listing.isHallOfLegends && (
              <span className="badge-brass">⚜ Hall</span>
            )}
            {featured && (
              <span className="badge bg-brass-900 text-brass-300 border border-brass-800">Featured</span>
            )}
          </div>

          {/* Save + Price */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
            <SaveButton listingId={listing.id} initialSaved={isSaved} size="sm" />
            <span className="bg-void-900/90 text-bone-100 font-display font-bold text-sm px-2 py-1 rounded-sm border border-void-700">
              {formatListingPrice(listing.price)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col flex-1">
          <h3 className="text-bone-200 font-semibold text-sm leading-snug line-clamp-2 group-hover:text-bone-100 transition-colors">
            {listing.title}
          </h3>

          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="badge-void text-xs">{listing.gameSystem.replace("Warhammer ", "WH ")}</span>
            {listing.faction && (
              <span className="badge-void text-xs">{listing.faction}</span>
            )}
          </div>

          <div className="mt-auto pt-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              {listing.seller.image ? (
                <Image
                  src={listing.seller.image}
                  alt={listing.seller.name ?? "Seller"}
                  width={20}
                  height={20}
                  className="rounded-full border border-void-600"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-blood-900 border border-blood-800 flex items-center justify-center text-blood-400 text-xs font-bold">
                  {listing.seller.name?.[0] ?? "?"}
                </div>
              )}
              <span className="text-bone-500 text-xs truncate">{listing.seller.name ?? "Seller"}</span>
              {listing.seller.isPremiumSeller && (
                <span className="text-brass-600 text-xs shrink-0">⚜</span>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs text-bone-600 shrink-0">
              {listing.seller.reviewCount > 0 && (
                <>
                  <Star className="w-3 h-3 text-brass-600 fill-brass-600" />
                  <span className="text-bone-400">{listing.seller.sellerRating.toFixed(1)}</span>
                </>
              )}
              <Eye className="w-3 h-3 ml-1" />
              <span>{listing.views}</span>
            </div>
          </div>

          <div className="mt-1.5">
            <span className="text-bone-600 text-xs">{timeAgo(listing.createdAt)}</span>
            {listing.condition && (
              <span className="text-bone-600 text-xs ml-2">· {listing.condition.split("—")[0].trim()}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
