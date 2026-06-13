import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const uid = session.user.id;

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ participant1Id: uid }, { participant2Id: uid }],
    },
    include: {
      participant1: { select: { id: true, name: true, image: true, isPremiumSeller: true } },
      participant2: { select: { id: true, name: true, image: true, isPremiumSeller: true } },
      listing: { select: { id: true, title: true, images: true, status: true } },
    },
    orderBy: { lastMessageAt: "desc" },
  });

  const totalUnread = conversations.reduce((sum, c) => {
    if (c.participant1Id === uid) return sum + c.unread1;
    return sum + c.unread2;
  }, 0);

  return NextResponse.json({ conversations, totalUnread });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { toUserId, listingId, content } = await req.json();

  if (!toUserId || !content?.trim()) {
    return NextResponse.json({ error: "toUserId and content required" }, { status: 400 });
  }
  if (toUserId === session.user.id) {
    return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });
  }

  const recipient = await prisma.user.findUnique({ where: { id: toUserId }, select: { id: true, name: true } });
  if (!recipient) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const uid = session.user.id;

  // Find or create conversation — p1 = lower id for determinism
  const [p1Id, p2Id] = uid < toUserId ? [uid, toUserId] : [toUserId, uid];
  const isP1 = uid === p1Id;

  let conversation = await prisma.conversation.findFirst({
    where: {
      participant1Id: p1Id,
      participant2Id: p2Id,
      ...(listingId ? { listingId } : {}),
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        participant1Id: p1Id,
        participant2Id: p2Id,
        listingId: listingId ?? null,
        lastMessage: content.trim().slice(0, 100),
        lastMessageAt: new Date(),
        unread1: isP1 ? 0 : 1,
        unread2: isP1 ? 1 : 0,
      },
    });
  } else {
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessage: content.trim().slice(0, 100),
        lastMessageAt: new Date(),
        ...(isP1 ? { unread2: { increment: 1 } } : { unread1: { increment: 1 } }),
      },
    });
  }

  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: uid,
      content: content.trim().slice(0, 2000),
    },
  });

  await createNotification(
    toUserId,
    "new_message",
    `New message from ${session.user.name ?? "Someone"}`,
    content.trim().slice(0, 80),
    `/messages/${conversation.id}`
  );

  return NextResponse.json({ conversationId: conversation.id, messageId: message.id }, { status: 201 });
}
