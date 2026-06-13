import Link from "next/link";
import Image from "next/image";
import { Crown, Star } from "lucide-react";
import { formatListingPrice, parseImages } from "@/lib/utils";
import type { Listing, User } from "@prisma/client";

type HallListingType = Listing & {
  seller: Pick<User, "name" | "image" | "isPremiumSeller">;
};

interface Props {
  listing: HallListingType;
  tier: "IMMORTAL" | "APPROVED";
}

export function HallListing({ listing, tier }: Props) {
  const images = parseImages(listing.images);
  const isImmortal = tier === "IMMORTAL";

  return (
    <Link href={`/listings/${listing.id}`}>
      <div
        className={`group relative overflow-hidden rounded-sm border transition-all duration-300
          ${isImmortal
            ? "border-brass-700 hover:border-brass-500 glow-brass"
            : "border-void-600 hover:border-brass-800"
          }`}
      >
        {/* Image */}
        <div className={`relative ${isImmortal ? "aspect-[16/9]" : "aspect-[4/3]"} bg-void-800`}>
          {images[0] ? (
            <Image
              src={images[0]}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-void-600 text-8xl">⚔</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-void-950 via-transparent to-transparent" />

          {/* Tier badge */}
          <div className="absolute top-3 left-3">
            {isImmortal ? (
              <div className="flex items-center gap-1.5 bg-brass-900/80 border border-brass-700 px-2.5 py-1 rounded-sm backdrop-blur-sm">
                <Crown className="w-3.5 h-3.5 text-brass-400" />
                <span className="text-brass-300 text-xs font-bold uppercase tracking-widest">Immortal</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-void-900/80 border border-brass-900/50 px-2 py-0.5 rounded-sm">
                <Star className="w-3 h-3 text-brass-600" />
                <span className="text-brass-500 text-xs font-semibold">Hall of Legends</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="absolute bottom-3 right-3">
            <span className={`font-display font-bold px-3 py-1.5 rounded-sm border text-sm
              ${isImmortal
                ? "bg-brass-900/80 border-brass-700 text-brass-200"
                : "bg-void-900/80 border-void-700 text-bone-100"
              }`}
            >
              {formatListingPrice(listing.price)}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className={`p-4 ${isImmortal ? "bg-gradient-to-b from-brass-950/50 to-void-900" : "bg-void-900"}`}>
          <h3 className={`font-display font-bold text-lg leading-tight mb-1 group-hover:text-bone-100 transition-colors
            ${isImmortal ? "text-brass-200" : "text-bone-200"}`}
          >
            {listing.title}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <span className="badge-void text-xs">{listing.gameSystem.replace("Warhammer ", "WH ")}</span>
              {listing.faction && <span className="badge-void text-xs">{listing.faction}</span>}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-bone-500">
              {listing.seller.image ? (
                <Image
                  src={listing.seller.image}
                  alt={listing.seller.name ?? ""}
                  width={16}
                  height={16}
                  className="rounded-full"
                />
              ) : null}
              <span>{listing.seller.name}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
