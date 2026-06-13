export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { formatListingPrice, timeAgo, parseImages } from "@/lib/utils";
import { ReviewForm } from "@/components/dashboard/ReviewForm";
import { Package } from "lucide-react";

export default async function PurchasesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin?callbackUrl=/dashboard/purchases");

  const purchases = await prisma.purchase.findMany({
    where: { buyerId: session.user.id, status: "COMPLETED" },
    include: {
      listing: { select: { id: true, title: true, images: true, gameSystem: true } },
      seller: { select: { name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const reviewedPurchaseIds = new Set(
    (await prisma.review.findMany({
      where: { reviewerId: session.user.id },
      select: { purchaseId: true },
    })).map((r) => r.purchaseId)
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-4 mb-8">
        <div>
          <p className="text-blood-500 text-sm font-semibold uppercase tracking-widest mb-1">History</p>
          <h1 className="font-display text-4xl font-black text-bone-100">My Purchases</h1>
        </div>
        <Link href="/dashboard" className="btn-secondary text-sm ml-auto">← Dashboard</Link>
      </div>

      {purchases.length === 0 ? (
        <div className="card p-16 text-center">
          <Package className="w-12 h-12 text-void-600 mx-auto mb-4" />
          <p className="text-bone-400 text-lg mb-2">No purchases yet.</p>
          <Link href="/marketplace" className="btn-primary text-sm mt-4 inline-block">Browse the Arena</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase) => {
            const images = parseImages(purchase.listing.images);
            const hasReviewed = reviewedPurchaseIds.has(purchase.id);

            return (
              <div key={purchase.id} className="card p-5">
                <div className="flex items-start gap-4">
                  <div className="relative w-16 h-16 shrink-0 bg-void-700 rounded-sm overflow-hidden">
                    {images[0] ? (
                      <Image src={images[0]} alt="" fill className="object-cover" sizes="64px" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-void-600 text-xl">⚔</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/listings/${purchase.listing.id}`}
                          className="text-bone-200 font-medium hover:text-bone-100 transition-colors line-clamp-2"
                        >
                          {purchase.listing.title}
                        </Link>
                        <p className="text-bone-500 text-xs mt-0.5">
                          {purchase.listing.gameSystem} · Seller: {purchase.seller.name}
                        </p>
                        <p className="text-bone-600 text-xs">{timeAgo(purchase.createdAt)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-bone-100 font-display font-bold">{formatListingPrice(purchase.amount)}</div>
                        <div className="text-green-400 text-xs mt-0.5">Completed</div>
                      </div>
                    </div>

                    {!hasReviewed ? (
                      <div className="mt-4 border-t border-void-700 pt-4">
                        <p className="text-bone-400 text-xs mb-3">Rate this transaction to help other buyers:</p>
                        <ReviewForm purchaseId={purchase.id} sellerName={purchase.seller.name ?? "Seller"} />
                      </div>
                    ) : (
                      <div className="mt-3 text-bone-600 text-xs flex items-center gap-1">
                        <span className="text-brass-600">★</span> Review submitted
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
