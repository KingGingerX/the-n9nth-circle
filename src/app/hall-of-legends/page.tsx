export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { HallListing } from "@/components/hall/HallListing";
import { Crown } from "lucide-react";
import Link from "next/link";

async function getHallListings() {
  return prisma.listing.findMany({
    where: { isHallOfLegends: true, hallOfLegendsStatus: { in: ["APPROVED", "IMMORTAL"] }, status: "ACTIVE" },
    include: { seller: { select: { name: true, image: true, isPremiumSeller: true } } },
    orderBy: [{ hallOfLegendsStatus: "desc" }, { createdAt: "desc" }],
  });
}

export default async function HallOfLegendsPage() {
  const listings = await getHallListings();
  const immortals = listings.filter((l) => l.hallOfLegendsStatus === "IMMORTAL");
  const approved = listings.filter((l) => l.hallOfLegendsStatus === "APPROVED");

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative bg-gradient-to-b from-brass-900/20 via-void-900 to-void-950 border-b border-brass-900/30 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Crown className="w-16 h-16 text-brass-600 mx-auto mb-6 opacity-80" />
          <h1 className="font-display text-5xl sm:text-6xl font-black text-bone-100 tracking-tight mb-4">
            Hall of Legends
          </h1>
          <div className="flex items-center justify-center gap-4 my-4">
            <div className="h-px bg-gradient-to-r from-transparent to-brass-700 w-20" />
            <div className="text-brass-600">✦</div>
            <div className="h-px bg-gradient-to-l from-transparent to-brass-700 w-20" />
          </div>
          <p className="text-bone-400 text-lg max-w-2xl mx-auto mb-8">
            Only the finest painted armies grace these walls. Museum-quality masterpieces,
            hand-selected by the Game Master. Every army here is a legend.
          </p>
          <Link href="/hall-of-legends/submit" className="btn-brass">
            Submit Your Army — $49
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {listings.length === 0 ? (
          <div className="text-center py-24">
            <Crown className="w-24 h-24 text-brass-900 mx-auto mb-6" />
            <h2 className="font-display text-2xl text-bone-300 font-bold mb-2">The Hall Awaits Its First Legend</h2>
            <p className="text-bone-500 text-sm mb-8">Be immortalized. Submit your finest work.</p>
            <Link href="/hall-of-legends/submit" className="btn-brass">Submit Your Army</Link>
          </div>
        ) : (
          <>
            {immortals.length > 0 && (
              <section className="mb-16">
                <div className="flex items-center gap-3 mb-8">
                  <Crown className="w-6 h-6 text-brass-400" />
                  <h2 className="section-title text-gradient-brass">Immortal Tier</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {immortals.map((l) => <HallListing key={l.id} listing={l as any} tier="IMMORTAL" />)}
                </div>
              </section>
            )}

            {approved.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <h2 className="section-title">Hall of Legends</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {approved.map((l) => <HallListing key={l.id} listing={l as any} tier="APPROVED" />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
