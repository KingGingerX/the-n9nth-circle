import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; action: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const post = await prisma.forumPost.findUnique({ where: { id: params.id } });
  if (!post) return NextResponse.redirect(new URL("/admin/forum", req.url));

  if (params.action === "pin") {
    await prisma.forumPost.update({ where: { id: params.id }, data: { isPinned: !post.isPinned } });
  } else if (params.action === "lock") {
    await prisma.forumPost.update({ where: { id: params.id }, data: { isLocked: !post.isLocked } });
  } else if (params.action === "delete") {
    await prisma.forumPost.delete({ where: { id: params.id } });
  }

  return NextResponse.redirect(new URL("/admin/forum", req.url));
}
