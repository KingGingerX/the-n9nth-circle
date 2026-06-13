import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const gameSystem = searchParams.get("gameSystem");
  const faction = searchParams.get("faction");

  const posts = await prisma.wantToBuy.findMany({
    where: {
      isActive: true,
      ...(gameSystem ? { gameSystem } : {}),
      ...(faction ? { faction } : {}),
    },
    include: {
      user: { select: { id: true, name: true, image: true, isPremiumSeller: true } },
    },
    orderBy: [{ isBumped: "desc" }, { createdAt: "desc" }],
    take: 50,
  });

  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, gameSystem, faction, maxBudget } = await req.json();

  if (!title?.trim() || !gameSystem) {
    return NextResponse.json({ error: "Title and game system required" }, { status: 400 });
  }

  const active = await prisma.wantToBuy.count({
    where: { userId: session.user.id, isActive: true },
  });
  if (active >= 10) {
    return NextResponse.json({ error: "Max 10 active WTB posts" }, { status: 400 });
  }

  const post = await prisma.wantToBuy.create({
    data: {
      userId: session.user.id,
      title: title.trim().slice(0, 120),
      description: description?.trim().slice(0, 500) ?? null,
      gameSystem,
      faction: faction?.trim() || null,
      maxBudget: maxBudget ? Number(maxBudget) : null,
    },
  });

  return NextResponse.json({ success: true, id: post.id }, { status: 201 });
}
