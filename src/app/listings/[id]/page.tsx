export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ListingDetail } from "@/components/listings/ListingDetail";
import { SimilarListings } from "@/components/listings/SimilarListings";
import { parseImages } from "@/lib/utils";

async function getListing(id: string) {
  return prisma.listing.findUnique({
    where: { id, status: "ACTIVE" },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          image: true,
          isPremiumSeller: true,
          sellerRating: true,
          reviewCount: true,
          totalSales: true,
          createdAt: true,
          bio: true,
          location: true,
        },
      },
    },
  });
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const listing = await getListing(params.id);
  if (!listing) return { title: "Listing Not Found — The N9nth Circle" };

  const images = parseImages(listing.images);
  const description = `${listing.gameSystem}${listing.faction ? ` · ${listing.faction}` : ""} · ${listing.condition} · $${listing.price}. ${listing.description.slice(0, 120)}`;

  return {
    title: `${listing.title} — The N9nth Circle`,
    description,
    openGraph: {
      title: listing.title,
      description,
      type: "website",
      images: images.length > 0 ? [{ url: images[0], width: 1200, height: 900, alt: listing.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: listing.title,
      description,
      images: images.length > 0 ? [images[0]] : [],
    },
  };
}

export default async function ListingPage({ params }: { params: { id: string } }) {
  const listing = await getListing(params.id);
  if (!listing) notFound();

  await prisma.listing.update({
    where: { id: params.id },
    data: { views: { increment: 1 } },
  });

  return (
    <>
      <ListingDetail listing={listing as any} />
      <SimilarListings
        listingId={listing.id}
        gameSystem={listing.gameSystem}
        faction={listing.faction}
      />
    </>
  );
}
