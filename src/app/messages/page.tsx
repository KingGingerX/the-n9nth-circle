export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { MessageSquare } from "lucide-react";
import { parseImages, timeAgo } from "@/lib/utils";

async function getConversations(userId: string) {
  return prisma.conversation.findMany({
    where: { OR: [{ participant1Id: userId }, { participant2Id: userId }] },
    include: {
      participant1: { select: { id: true, name: true, image: true, isPremiumSeller: true } },
      participant2: { select: { id: true, name: true, image: true, isPremiumSeller: true } },
      listing: { select: { id: true, title: true, images: true } },
    },
    orderBy: { lastMessageAt: "desc" },
  });
}

export default async function MessagesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin?callbackUrl=/messages");

  const uid = session.user.id;
  const convs = await getConversations(uid);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <p className="text-blood-500 text-sm font-semibold uppercase tracking-widest mb-1">Comms</p>
        <h1 className="font-display text-3xl font-black text-bone-100 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-blood-500" />
          Messages
        </h1>
      </div>

      {convs.length === 0 ? (
        <div className="card p-12 text-center">
          <MessageSquare className="w-10 h-10 text-bone-600 mx-auto mb-4" />
          <p className="text-bone-400 text-lg mb-2">No messages yet.</p>
          <p className="text-bone-600 text-sm">Message a seller from any listing page.</p>
          <Link href="/marketplace" className="btn-primary mt-6 inline-block">Browse Marketplace</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {convs.map((conv) => {
            const isP1 = conv.participant1Id === uid;
            const other = isP1 ? conv.participant2 : conv.participant1;
            const unread = isP1 ? conv.unread1 : conv.unread2;
            const listingImages = conv.listing ? parseImages(conv.listing.images) : [];

            return (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className={`card p-4 flex items-center gap-4 hover:border-blood-800 transition-colors block
                  ${unread > 0 ? "border-blood-800 bg-blood-950/20" : ""}`}
              >
                <div className="relative shrink-0">
                  {other.image ? (
                    <Image src={other.image} alt={other.name ?? ""} width={44} height={44} className="rounded-full border border-void-600" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-blood-900 border border-blood-800 flex items-center justify-center text-blood-300 font-bold">
                      {other.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blood-600 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {unread}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-semibold text-sm ${unread > 0 ? "text-bone-100" : "text-bone-300"}`}>
                      {other.name ?? "User"}
                      {other.isPremiumSeller && <span className="text-brass-600 ml-1.5">⚜</span>}
                    </span>
                    {conv.lastMessageAt && (
                      <span className="text-bone-600 text-xs shrink-0">{timeAgo(conv.lastMessageAt)}</span>
                    )}
                  </div>
                  {conv.listing && (
                    <p className="text-bone-600 text-xs truncate">re: {conv.listing.title}</p>
                  )}
                  {conv.lastMessage && (
                    <p className={`text-xs truncate mt-0.5 ${unread > 0 ? "text-bone-300" : "text-bone-500"}`}>
                      {conv.lastMessage}
                    </p>
                  )}
                </div>

                {listingImages[0] && (
                  <div className="relative w-10 h-10 shrink-0 rounded-sm overflow-hidden bg-void-700">
                    <Image src={listingImages[0]} alt="" fill className="object-cover" sizes="40px" />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
