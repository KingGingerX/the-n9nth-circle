import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, offerNotificationEmail } from "@/lib/email";
import { createNotification } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { listingId, amount, message } = await req.json();

    if (!listingId || !amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid offer" }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId, status: "ACTIVE" },
      include: { seller: { select: { id: true, name: true, email: true } } },
    });

    if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    if (listing.sellerId === session.user.id) {
      return NextResponse.json({ error: "Cannot offer on your own listing" }, { status: 400 });
    }
    if (!listing.allowOffers) {
      return NextResponse.json({ error: "Offers not accepted on this listing" }, { status: 400 });
    }

    const offer = await prisma.offer.create({
      data: {
        listingId,
        buyerId: session.user.id,
        amount: Number(amount),
        message: message?.trim().slice(0, 500) ?? null,
      },
    });

    await Promise.all([
      listing.seller.email
        ? sendEmail({
            to: listing.seller.email,
            subject: `New offer on: ${listing.title}`,
            html: offerNotificationEmail(
              listing.seller.name ?? "Seller",
              session.user.name ?? "A buyer",
              listing.title,
              Number(amount),
              listingId
            ),
          })
        : Promise.resolve(),
      createNotification(
        listing.seller.id,
        "offer_received",
        "New Offer",
        `${session.user.name ?? "Someone"} offered $${Number(amount).toFixed(2)} on "${listing.title}"`,
        `/listings/${listingId}`
      ),
    ]);

    return NextResponse.json({ success: true, offerId: offer.id }, { status: 201 });
  } catch (err) {
    console.error("Create offer error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
