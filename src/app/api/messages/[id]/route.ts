import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const uid = session.user.id;
  const conv = await prisma.conversation.findUnique({
    where: { id: params.id },
    include: {
      participant1: { select: { id: true, name: true, image: true, isPremiumSeller: true } },
      participant2: { select: { id: true, name: true, image: true, isPremiumSeller: true } },
      listing: { select: { id: true, title: true, images: true, price: true, status: true } },
      messages: { orderBy: { createdAt: "asc" }, take: 100 },
    },
  });

  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (conv.participant1Id !== uid && conv.participant2Id !== uid) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Mark as read
  const isP1 = conv.participant1Id === uid;
  await prisma.conversation.update({
    where: { id: params.id },
    data: isP1 ? { unread1: 0 } : { unread2: 0 },
  });

  return NextResponse.json({ conversation: conv });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });

  const uid = session.user.id;
  const conv = await prisma.conversation.findUnique({ where: { id: params.id } });

  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (conv.participant1Id !== uid && conv.participant2Id !== uid) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const isP1 = conv.participant1Id === uid;
  const recipientId = isP1 ? conv.participant2Id : conv.participant1Id;

  const [message] = await Promise.all([
    prisma.message.create({
      data: { conversationId: params.id, senderId: uid, content: content.trim().slice(0, 2000) },
    }),
    prisma.conversation.update({
      where: { id: params.id },
      data: {
        lastMessage: content.trim().slice(0, 100),
        lastMessageAt: new Date(),
        ...(isP1 ? { unread2: { increment: 1 } } : { unread1: { increment: 1 } }),
      },
    }),
    createNotification(
      recipientId,
      "new_message",
      `New message from ${session.user.name ?? "Someone"}`,
      content.trim().slice(0, 80),
      `/messages/${params.id}`
    ),
  ]);

  return NextResponse.json({ messageId: message.id }, { status: 201 });
}
