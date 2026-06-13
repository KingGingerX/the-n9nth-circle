import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { title, description, price, gameSystem, faction, condition, pointsValue, images, allowOffers } = body;

    if (!title || !description || !price || !gameSystem || !condition) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (price <= 0 || price > 100000) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }

    const listing = await prisma.listing.create({
      data: {
        title: title.trim().slice(0, 200),
        description: description.trim().slice(0, 5000),
        price: Number(price),
        gameSystem,
        faction: faction || "",
        condition,
        pointsValue: pointsValue ? Number(pointsValue) : null,
        images: JSON.stringify(images ?? []),
        allowOffers: allowOffers ?? true,
        sellerId: session.user.id,
      },
    });

    // WTB matching — fire-and-forget after response
    matchWtbPosts(listing.id, listing.gameSystem, listing.faction, listing.title, listing.price).catch(() => {});

    return NextResponse.json(listing, { status: 201 });
  } catch (err) {
    console.error("Create listing error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function matchWtbPosts(listingId: string, gameSystem: string, faction: string, title: string, price: number) {
  const wtbPosts = await prisma.wantToBuy.findMany({
    where: {
      isActive: true,
      gameSystem,
      ...(faction ? { OR: [{ faction: null }, { faction: "" }, { faction }] } : {}),
    },
    include: { user: { select: { id: true } } },
  });

  if (wtbPosts.length === 0) return;

  // Filter out already-notified matches
  const existingMatches = await prisma.wtbMatch.findMany({
    where: { listingId, wtbId: { in: wtbPosts.map((p) => p.id) } },
    select: { wtbId: true },
  });
  const alreadyNotified = new Set(existingMatches.map((m) => m.wtbId));
  const newMatches = wtbPosts.filter((p) => !alreadyNotified.has(p.id));

  if (newMatches.length === 0) return;

  await Promise.all([
    ...newMatches.map((p) =>
      prisma.wtbMatch.create({ data: { wtbId: p.id, listingId } }).catch(() => {})
    ),
    ...newMatches.map((p) =>
      createNotification(
        p.user.id,
        "wtb_match",
        "WTB Match Found!",
        `A new listing matches your WTB: "${title}" — $${price.toFixed(2)} · ${gameSystem}`,
        `/listings/${listingId}`
      )
    ),
  ]);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sellerId = searchParams.get("sellerId");
  const mine = searchParams.get("mine");

  const session = await getServerSession(authOptions);

  const where: Record<string, unknown> = {};

  if (mine === "true") {
    if (!session) return NextResponse.json([], { status: 200 });
    where.sellerId = session.user.id;
    where.status = "ACTIVE";
  } else if (sellerId) {
    where.sellerId = sellerId;
    if (!session || session.user.id !== sellerId) {
      where.status = "ACTIVE";
    }
  } else {
    where.status = "ACTIVE";
  }

  const listings = await prisma.listing.findMany({
    where: where as any,
    include: {
      seller: { select: { name: true, image: true, isPremiumSeller: true, sellerRating: true, reviewCount: true } },
    },
    orderBy: [{ isBoosted: "desc" }, { createdAt: "desc" }],
    take: 50,
  });

  return NextResponse.json(listings);
}
