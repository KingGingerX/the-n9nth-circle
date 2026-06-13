import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, bio: true, location: true, image: true, isPremiumSeller: true, hasForumAccess: true, sellerRating: true, reviewCount: true, totalSales: true, createdAt: true },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { name, bio, location } = await req.json();

    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name.trim().slice(0, 100),
        bio: bio?.trim().slice(0, 500) ?? null,
        location: location?.trim().slice(0, 100) ?? null,
      },
      select: { id: true, name: true, bio: true, location: true, image: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Update profile error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
