import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://theninthcircle.gg";
  const now = new Date();

  const listings = await prisma.listing.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 5000,
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "hourly", priority: 1.0 },
    { url: `${baseUrl}/marketplace`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${baseUrl}/hall-of-legends`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/forum`, lastModified: now, changeFrequency: "hourly", priority: 0.7 },
    { url: `${baseUrl}/pricing`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/listings/new`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const listingRoutes: MetadataRoute.Sitemap = listings.map((l) => ({
    url: `${baseUrl}/listings/${l.id}`,
    lastModified: l.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...listingRoutes];
}
