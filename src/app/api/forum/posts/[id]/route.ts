import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const post = await prisma.forumPost.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { name: true, image: true, isPremiumSeller: true } },
      category: { select: { name: true, slug: true, isPremiumOnly: true } },
      replies: {
        include: { author: { select: { name: true, image: true, isPremiumSeller: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.forumPost.update({ where: { id: params.id }, data: { views: { increment: 1 } } });

  return NextResponse.json(post);
}
