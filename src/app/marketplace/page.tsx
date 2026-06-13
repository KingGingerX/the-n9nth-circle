export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/listings/ListingCard";
import { MarketplaceFilters } from "@/components/listings/MarketplaceFilters";
import { AdBanner } from "@/components/ads/AdBanner";
import { GAME_SYSTEMS, CONDITIONS } from "@/lib/constants";

interface SearchParams {
  system?: string;
  faction?: string;
  condition?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  q?: string;
  page?: string;
  [key: string]: string | undefined;
}

async function getListings(params: SearchParams) {
  const page = Number(params.page ?? 1);
  const limit = 24;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { status: "ACTIVE" };

  if (params.q) {
    where.OR = [
      { title: { contains: params.q } },
      { description: { contains: params.q } },
      { faction: { contains: params.q } },
    ];
  }
  if (params.system) where.gameSystem = params.system;
  if (params.faction) where.faction = { contains: params.faction };
  if (params.condition) where.condition = { contains: params.condition };
  if (params.minPrice || params.maxPrice) {
    where.price = {
      ...(params.minPrice ? { gte: Number(params.minPrice) } : {}),
      ...(params.maxPrice ? { lte: Number(params.maxPrice) } : {}),
    };
  }

  const orderBy: Record<string, unknown>[] = [{ isBoosted: "desc" }];
  switch (params.sort) {
    case "price_asc":
      orderBy.push({ price: "asc" });
      break;
    case "price_desc":
      orderBy.push({ price: "desc" });
      break;
    case "views":
      orderBy.push({ views: "desc" });
      break;
    default:
      orderBy.push({ createdAt: "desc" });
  }

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where: where as any,
      include: {
        seller: {
          select: { name: true, image: true, isPremiumSeller: true, sellerRating: true, reviewCount: true },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.listing.count({ where: where as any }),
  ]);

  return { listings, total, page, pages: Math.ceil(total / limit) };
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { listings, total, page, pages } = await getListings(searchParams);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="text-blood-500 text-sm font-semibold uppercase tracking-widest mb-1">The Arena</p>
        <h1 className="font-display text-4xl font-black text-bone-100">Marketplace</h1>
        <p className="text-bone-500 text-sm mt-2">
          {total} {total === 1 ? "listing" : "listings"} available
        </p>
      </div>

      <AdBanner placement="marketplace" className="mb-6" />

      <div className="flex gap-8">
        {/* Sidebar filters */}
        <aside className="hidden lg:block w-56 shrink-0">
          <MarketplaceFilters
            gameSystems={[...GAME_SYSTEMS]}
            conditions={[...CONDITIONS]}
            currentParams={searchParams}
          />
        </aside>

        {/* Listings grid */}
        <div className="flex-1 min-w-0">
          {listings.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing as any} />
                ))}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <a
                      key={p}
                      href={`/marketplace?${new URLSearchParams({ ...searchParams, page: String(p) })}`}
                      className={`px-4 py-2 text-sm font-medium rounded-sm border transition-colors
                        ${p === page
                          ? "bg-blood-800 border-blood-700 text-bone-100"
                          : "bg-void-800 border-void-700 text-bone-400 hover:border-blood-800 hover:text-bone-200"
                        }`}
                    >
                      {p}
                    </a>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 card">
              <div className="text-6xl mb-4 opacity-20">⚔</div>
              <p className="text-bone-400 text-lg font-medium">No listings found</p>
              <p className="text-bone-600 text-sm mt-2">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
