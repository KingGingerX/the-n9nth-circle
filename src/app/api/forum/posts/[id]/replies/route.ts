import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { content } = await req.json();
    if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });

    const post = await prisma.forumPost.findUnique({
      where: { id: params.id },
      include: { category: { select: { isPremiumOnly: true } } },
    });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    if (post.isLocked && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Post is locked" }, { status: 403 });
    }
    if (post.category.isPremiumOnly && !session.user.hasForumAccess && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Premium forum access required" }, { status: 403 });
    }

    const reply = await prisma.forumReply.create({
      data: {
        content: content.trim().slice(0, 5000),
        postId: params.id,
        authorId: session.user.id,
      },
      include: { author: { select: { name: true, image: true, isPremiumSeller: true } } },
    });

    await prisma.forumPost.update({ where: { id: params.id }, data: { updatedAt: new Date() } });

    return NextResponse.json(reply, { status: 201 });
  } catch (err) {
    console.error("Create reply error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
