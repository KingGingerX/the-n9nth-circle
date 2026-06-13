export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { parseImages, formatListingPrice } from "@/lib/utils";
import { MessageThread } from "@/components/messages/MessageThread";

async function getConversation(id: string, userId: string) {
  const conv = await prisma.conversation.findUnique({
    where: { id },
    include: {
      participant1: { select: { id: true, name: true, image: true, isPremiumSeller: true } },
      participant2: { select: { id: true, name: true, image: true, isPremiumSeller: true } },
      listing: { select: { id: true, title: true, images: true, price: true, status: true } },
      messages: { orderBy: { createdAt: "asc" }, take: 100 },
    },
  });

  if (!conv) return null;
  if (conv.participant1Id !== userId && conv.participant2Id !== userId) return null;

  // Mark as read
  const isP1 = conv.participant1Id === userId;
  await prisma.conversation.update({
    where: { id },
    data: isP1 ? { unread1: 0 } : { unread2: 0 },
  });

  return conv;
}

export default async function ConversationPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin?callbackUrl=/messages");

  const conv = await getConversation(params.id, session.user.id);
  if (!conv) notFound();

  const isP1 = conv.participant1Id === session.user.id;
  const other = isP1 ? conv.participant2 : conv.participant1;
  const listingImages = conv.listing ? parseImages(conv.listing.images) : [];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/messages" className="text-bone-500 hover:text-bone-300 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3 flex-1">
          {other.image ? (
            <Image src={other.image} alt={other.name ?? ""} width={40} height={40} className="rounded-full border border-void-600" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blood-900 border border-blood-800 flex items-center justify-center text-blood-300 font-bold">
              {other.name?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-bone-200 font-semibold text-sm">{other.name}</span>
              {other.isPremiumSeller && <span className="text-brass-600 text-xs">⚜</span>}
            </div>
            <Link href={`/sellers/${other.id}`} className="text-bone-500 text-xs hover:text-bone-300 transition-colors">
              View Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Listing context */}
      {conv.listing && (
        <Link href={`/listings/${conv.listing.id}`} className="card p-3 flex items-center gap-3 mb-6 hover:border-blood-800 transition-colors block">
          {listingImages[0] && (
            <div className="relative w-12 h-12 shrink-0 rounded-sm overflow-hidden bg-void-700">
              <Image src={listingImages[0]} alt="" fill className="object-cover" sizes="48px" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-bone-300 text-xs truncate font-medium">{conv.listing.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-brass-400 text-xs font-bold">{formatListingPrice(conv.listing.price)}</span>
              <span className={`badge text-xs ${conv.listing.status === "ACTIVE" ? "badge-void" : "badge-brass"}`}>
                {conv.listing.status}
              </span>
            </div>
          </div>
          <span className="text-bone-500 text-xs shrink-0">View →</span>
        </Link>
      )}

      <MessageThread
        conversationId={params.id}
        currentUserId={session.user.id}
        initialMessages={conv.messages}
        otherUser={other}
      />
    </div>
  );
}
