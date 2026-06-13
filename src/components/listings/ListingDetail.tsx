"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Star, Shield, Eye, MapPin, Package, Zap, Crown, X } from "lucide-react";
import { formatListingPrice, calculateCommission, parseImages, timeAgo } from "@/lib/utils";
import type { Listing, User } from "@prisma/client";
import { MessageButton } from "@/components/messages/MessageButton";

type FullListing = Listing & {
  seller: Pick<User, "id" | "name" | "image" | "isPremiumSeller" | "sellerRating" | "reviewCount" | "totalSales" | "createdAt" | "bio" | "location">;
};

export function ListingDetail({ listing }: { listing: FullListing }) {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const isNewListing = searchParams.get("new") === "1";
  const images = parseImages(listing.images);
  const [activeImage, setActiveImage] = useState(0);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [showOffer, setShowOffer] = useState(false);
  const [offerSent, setOfferSent] = useState(false);
  const [offerError, setOfferError] = useState("");
  const [sendingOffer, setSendingOffer] = useState(false);
  const [buying, setBuying] = useState(false);
  const [showBoostBanner, setShowBoostBanner] = useState(isNewListing);

  async function handleBuy() {
    setBuying(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "listing", listingId: listing.id }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error ?? "Checkout failed");
    } catch {
      alert("Checkout failed. Try again.");
    } finally {
      setBuying(false);
    }
  }

  const { commission, sellerPayout } = calculateCommission(listing.price);
  const isOwner = session?.user?.id === listing.sellerId;

  async function handleOffer(e: React.FormEvent) {
    e.preventDefault();
    if (!offerAmount || Number(offerAmount) <= 0) return;
    setSendingOffer(true);
    setOfferError("");
    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: listing.id, amount: Number(offerAmount), message: offerMessage }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to send offer");
      }
      setOfferSent(true);
      setShowOffer(false);
    } catch (err: any) {
      setOfferError(err.message);
    } finally {
      setSendingOffer(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Boost upsell banner — shown after new listing created */}
      {showBoostBanner && !listing.isBoosted && (
        <div className="bg-blood-900/60 border border-blood-700 rounded-sm p-4 mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-blood-400 shrink-0" />
            <div>
              <p className="text-bone-200 font-medium text-sm">Your listing is live. Boost it to the top?</p>
              <p className="text-bone-500 text-xs">Pin it at the top of its category for 7 days — $9.99</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href={`/boost/${listing.id}`} className="btn-primary text-xs py-1.5 px-3">
              Boost Now
            </Link>
            <button onClick={() => setShowBoostBanner(false)} className="text-bone-500 hover:text-bone-300 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image gallery */}
        <div>
          <div className="relative aspect-[4/3] bg-void-800 border border-void-700 rounded-sm overflow-hidden mb-3">
            {images[activeImage] ? (
              <Image
                src={images[activeImage]}
                alt={listing.title}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-void-600 text-8xl">⚔</div>
            )}
            {listing.isHallOfLegends && (
              <div className="absolute top-3 left-3">
                <span className="badge-brass flex items-center gap-1.5">
                  <Crown className="w-3 h-3" />
                  Hall of Legends
                </span>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative w-16 h-16 shrink-0 rounded-sm overflow-hidden border-2 transition-colors
                    ${i === activeImage ? "border-blood-600" : "border-void-700 hover:border-void-500"}`}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex gap-2 mb-3">
            <span className="badge-void">{listing.gameSystem}</span>
            {listing.faction && <span className="badge-void">{listing.faction}</span>}
            {listing.isBoosted && (
              <span className="badge-blood flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Boosted
              </span>
            )}
          </div>

          <h1 className="font-display text-3xl font-bold text-bone-100 leading-tight mb-4">
            {listing.title}
          </h1>

          <div className="flex items-end gap-3 mb-6">
            <span className="text-4xl font-display font-black text-bone-100">
              {formatListingPrice(listing.price)}
            </span>
            <span className="text-bone-500 text-sm pb-1">
              Seller receives {formatListingPrice(sellerPayout)} after 12% fee
            </span>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { label: "Condition", value: listing.condition, icon: <Package className="w-4 h-4" /> },
              ...(listing.pointsValue ? [{ label: "Points Value", value: `${listing.pointsValue}pts`, icon: <Shield className="w-4 h-4" /> }] : []),
              { label: "Views", value: listing.views.toString(), icon: <Eye className="w-4 h-4" /> },
              { label: "Listed", value: timeAgo(listing.createdAt), icon: null },
            ].map((spec) => (
              <div key={spec.label} className="bg-void-800 border border-void-700 rounded-sm p-3">
                <div className="text-bone-500 text-xs uppercase tracking-wide flex items-center gap-1.5 mb-1">
                  {spec.icon}
                  {spec.label}
                </div>
                <div className="text-bone-200 text-sm font-medium">{spec.value}</div>
              </div>
            ))}
          </div>

          {/* Actions */}
          {!isOwner && (
            <div className="space-y-3 mb-6">
              {session ? (
                <>
                  <button
                    onClick={handleBuy}
                    disabled={buying}
                    className="btn-primary w-full text-center block text-base py-4 disabled:opacity-50"
                  >
                    {buying ? "Redirecting..." : `Buy Now — ${formatListingPrice(listing.price)}`}
                  </button>
                  {listing.allowOffers && !offerSent && (
                    <button
                      onClick={() => setShowOffer(!showOffer)}
                      className="btn-secondary w-full text-sm"
                    >
                      Make an Offer
                    </button>
                  )}
                  <MessageButton
                    toUserId={listing.sellerId}
                    listingId={listing.id}
                    sellerName={listing.seller.name ?? "Seller"}
                  />
                  {offerSent && (
                    <div className="bg-green-900/40 border border-green-700 rounded-sm p-3 text-green-300 text-sm text-center">
                      ✓ Offer sent. Seller has been notified.
                    </div>
                  )}
                  {showOffer && !offerSent && (
                    <form onSubmit={handleOffer} className="card p-4 space-y-3">
                      {offerError && <p className="text-blood-400 text-xs">{offerError}</p>}
                      <div>
                        <label className="label">Your Offer ($)</label>
                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          value={offerAmount}
                          onChange={(e) => setOfferAmount(e.target.value)}
                          placeholder={`e.g. ${Math.round(listing.price * 0.85)}`}
                          className="input text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="label">Message (optional)</label>
                        <input
                          type="text"
                          value={offerMessage}
                          onChange={(e) => setOfferMessage(e.target.value)}
                          placeholder="Add a note to the seller..."
                          className="input text-sm"
                          maxLength={500}
                        />
                      </div>
                      <button type="submit" disabled={sendingOffer} className="btn-primary w-full text-sm disabled:opacity-50">
                        {sendingOffer ? "Sending..." : "Send Offer"}
                      </button>
                    </form>
                  )}
                </>
              ) : (
                <Link href="/auth/signin" className="btn-primary w-full text-center block text-base py-4">
                  Sign In to Purchase
                </Link>
              )}
            </div>
          )}

          {isOwner && (
            <div className="mb-6">
              <Link href={`/listings/${listing.id}/edit`} className="btn-secondary w-full text-center block">
                Edit Listing
              </Link>
            </div>
          )}

          {/* Trust badges */}
          <div className="flex gap-4 mb-6 py-3 border-y border-void-700">
            {[
              { icon: <Shield className="w-4 h-4 text-bone-500" />, text: "Buyer Protection" },
              { icon: <Star className="w-4 h-4 text-brass-600" />, text: "Verified Seller" },
            ].map((badge) => (
              <div key={badge.text} className="flex items-center gap-1.5 text-bone-500 text-xs">
                {badge.icon}
                {badge.text}
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="font-display text-bone-200 font-semibold uppercase tracking-wider text-sm mb-3">
              Description
            </h3>
            <p className="text-bone-400 text-sm leading-relaxed whitespace-pre-wrap">{listing.description}</p>
          </div>

          {/* Seller info */}
          <div className="card p-4">
            <h3 className="font-display text-bone-200 font-semibold uppercase tracking-wider text-xs mb-3">
              Seller
            </h3>
            <div className="flex items-center gap-3">
              {listing.seller.image ? (
                <Image
                  src={listing.seller.image}
                  alt={listing.seller.name ?? ""}
                  width={48}
                  height={48}
                  className="rounded-full border border-void-600"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blood-900 border border-blood-800 flex items-center justify-center text-blood-400 font-bold text-lg">
                  {listing.seller.name?.[0] ?? "?"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-bone-200 font-medium text-sm">{listing.seller.name}</span>
                  {listing.seller.isPremiumSeller && (
                    <span className="badge-brass text-xs">⚜ Premium</span>
                  )}
                </div>
                {listing.seller.location && (
                  <div className="flex items-center gap-1 text-bone-500 text-xs mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {listing.seller.location}
                  </div>
                )}
                {listing.seller.reviewCount > 0 && (
                  <div className="flex items-center gap-1 text-xs mt-0.5">
                    <Star className="w-3 h-3 text-brass-600 fill-brass-600" />
                    <span className="text-bone-300">{listing.seller.sellerRating.toFixed(1)}</span>
                    <span className="text-bone-500">({listing.seller.reviewCount} reviews)</span>
                  </div>
                )}
              </div>
              <Link href={`/sellers/${listing.sellerId}`} className="btn-secondary text-xs py-1.5 px-3">
                Profile
              </Link>
            </div>
            {listing.seller.bio && (
              <p className="text-bone-500 text-xs mt-3 leading-relaxed">{listing.seller.bio}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
