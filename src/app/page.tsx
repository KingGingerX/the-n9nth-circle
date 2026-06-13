export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/listings/ListingCard";
import { HeroSection } from "@/components/home/HeroSection";
import { StatsBar } from "@/components/home/StatsBar";
import { HallOfLegendsTeaser } from "@/components/home/HallOfLegendsTeaser";
import { ForumTeaser } from "@/components/home/ForumTeaser";
import { PricingTeaser } from "@/components/home/PricingTeaser";
import { ChevronRight } from "lucide-react";

async function getHomeData() {
  const [featuredListings, hotListings, totalListings, totalUsers] = await Promise.all([
    prisma.listing.findMany({
      where: { status: "ACTIVE", isFeaturedHome: true },
      include: { seller: { select: { name: true, image: true, isPremiumSeller: true, sellerRating: true, reviewCount: true } } },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.listing.findMany({
      where: { status: "ACTIVE" },
      include: { seller: { select: { name: true, image: true, isPremiumSeller: true, sellerRating: true, reviewCount: true } } },
      orderBy: [{ isBoosted: "desc" }, { views: "desc" }, { createdAt: "desc" }],
      take: 8,
    }),
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.user.count(),
  ]);

  return { featuredListings, hotListings, totalListings, totalUsers };
}

export default async function HomePage() {
  const { featuredListings, hotListings, totalListings, totalUsers } = await getHomeData();

  return (
    <div className="min-h-screen">
      <HeroSection />
      <StatsBar totalListings={totalListings} totalUsers={totalUsers} />

      {/* Hot Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-blood-500 text-sm font-semibold uppercase tracking-widest mb-1">Fresh Blood</p>
            <h2 className="section-title">Hot Listings</h2>
          </div>
          <Link
            href="/marketplace"
            className="flex items-center gap-1 text-bone-400 hover:text-brass-400 text-sm transition-colors group"
          >
            View All
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {hotListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {hotListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing as any} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 card">
            <p className="text-bone-500 text-lg mb-2">The arena awaits its first warriors.</p>
            <p className="text-bone-600 text-sm mb-6">Be the first to list your army.</p>
            <Link href="/listings/new" className="btn-primary">List Your Army</Link>
          </div>
        )}
      </section>

      {/* Featured / Boosted */}
      {featuredListings.length > 0 && (
        <section className="bg-void-950 border-y border-void-700 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-brass-500 text-sm font-semibold uppercase tracking-widest mb-1">Spotlighted</p>
                <h2 className="section-title">Featured Armies</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing as any} featured />
              ))}
            </div>
          </div>
        </section>
      )}

      <HallOfLegendsTeaser />
      <ForumTeaser />
      <PricingTeaser />
    </div>
  );
}
