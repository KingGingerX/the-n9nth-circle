import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { title, content, categorySlug } = await req.json();

    if (!title?.trim() || !content?.trim() || !categorySlug) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const category = await prisma.forumCategory.findUnique({ where: { slug: categorySlug } });
    if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    if (category.isPremiumOnly && !session.user.hasForumAccess && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Premium forum access required" }, { status: 403 });
    }

    const post = await prisma.forumPost.create({
      data: {
        title: title.trim().slice(0, 300),
        content: content.trim().slice(0, 10000),
        categoryId: category.id,
        authorId: session.user.id,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    console.error("Create post error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
