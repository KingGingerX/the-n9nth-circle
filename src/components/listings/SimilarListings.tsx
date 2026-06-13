import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/listings/ListingCard";

interface Props {
  listingId: string;
  gameSystem: string;
  faction?: string | null;
}

export async function SimilarListings({ listingId, gameSystem, faction }: Props) {
  const listings = await prisma.listing.findMany({
    where: {
      id: { not: listingId },
      status: "ACTIVE",
      gameSystem,
      ...(faction ? { faction: { contains: faction.split(" ")[0] } } : {}),
    },
    include: {
      seller: { select: { name: true, image: true, isPremiumSeller: true, sellerRating: true, reviewCount: true } },
    },
    orderBy: [{ isBoosted: "desc" }, { views: "desc" }],
    take: 4,
  });

  if (listings.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className="border-t border-void-700 pt-12 mb-8">
        <p className="text-blood-500 text-sm font-semibold uppercase tracking-widest mb-1">More Like This</p>
        <h2 className="font-display text-2xl font-bold text-bone-100">Similar Armies</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {listings.map((l) => (
          <ListingCard key={l.id} listing={l as any} />
        ))}
      </div>
    </section>
  );
}
