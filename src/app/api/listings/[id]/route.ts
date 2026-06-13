import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: { seller: { select: { id: true, name: true, image: true, isPremiumSeller: true, sellerRating: true, reviewCount: true } } },
  });

  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (listing.status !== "ACTIVE") {
    if (!session || (session.user.id !== listing.sellerId && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  return NextResponse.json(listing);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (listing.sellerId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (listing.status === "SOLD") {
    return NextResponse.json({ error: "Cannot edit a sold listing" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { title, description, price, gameSystem, faction, condition, pointsValue, images, allowOffers } = body;

    if (!title || !description || !price || !gameSystem || !condition) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (price <= 0 || price > 100000) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }

    const updated = await prisma.listing.update({
      where: { id: params.id },
      data: {
        title: title.trim().slice(0, 200),
        description: description.trim().slice(0, 5000),
        price: Number(price),
        gameSystem,
        faction: faction || "",
        condition,
        pointsValue: pointsValue ? Number(pointsValue) : null,
        images: images ? JSON.stringify(images) : listing.images,
        allowOffers: allowOffers ?? listing.allowOffers,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Update listing error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (listing.sellerId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (listing.status === "SOLD") {
    return NextResponse.json({ error: "Cannot delete a sold listing" }, { status: 400 });
  }

  await prisma.listing.update({ where: { id: params.id }, data: { status: "ARCHIVED" } });
  return NextResponse.json({ success: true });
}
