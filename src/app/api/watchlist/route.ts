import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const watchlist = await prisma.watchlist.findMany({
    where: { userId: session.user.id },
    include: {
      listing: {
        include: {
          seller: {
            select: { name: true, image: true, isPremiumSeller: true, sellerRating: true, reviewCount: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ watchlist });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { listingId } = await req.json();
  if (!listingId) return NextResponse.json({ error: "listingId required" }, { status: 400 });

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, price: true, status: true },
  });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  const existing = await prisma.watchlist.findUnique({
    where: { userId_listingId: { userId: session.user.id, listingId } },
  });

  if (existing) {
    await prisma.watchlist.delete({ where: { id: existing.id } });
    return NextResponse.json({ saved: false });
  }

  await prisma.watchlist.create({
    data: { userId: session.user.id, listingId, priceAtSave: listing.price },
  });

  return NextResponse.json({ saved: true });
}
