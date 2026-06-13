import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { sendEmail } from "@/lib/email";
import { createNotification } from "@/lib/notifications";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action } = await req.json();
  if (action !== "accept" && action !== "decline") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const offer = await prisma.offer.findUnique({
    where: { id: params.id },
    include: {
      listing: { select: { id: true, title: true, sellerId: true, status: true } },
      buyer: { select: { id: true, name: true, email: true } },
    },
  });

  if (!offer) return NextResponse.json({ error: "Offer not found" }, { status: 404 });
  if (offer.listing.sellerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (offer.status !== "PENDING") {
    return NextResponse.json({ error: "Offer already resolved" }, { status: 400 });
  }
  if (offer.listing.status !== "ACTIVE") {
    return NextResponse.json({ error: "Listing no longer active" }, { status: 400 });
  }

  if (action === "decline") {
    await prisma.offer.update({ where: { id: params.id }, data: { status: "DECLINED" } });

    await Promise.all([
      offer.buyer.email
        ? sendEmail({
            to: offer.buyer.email,
            subject: `Offer declined — ${offer.listing.title}`,
            html: `
              <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#0e0e1f;color:#f0e8d8;padding:32px;border:1px solid #2a2a4a;">
                <h2 style="color:#b91c1c;font-family:serif;font-size:24px;margin:0 0 16px;">Offer Not Accepted</h2>
                <p style="color:#c8b89a;">${offer.buyer.name ?? "Warrior"},</p>
                <p style="color:#9a9070;">Your offer of <strong style="color:#f0e8d8;">$${offer.amount.toFixed(2)}</strong> on <strong style="color:#f0e8d8;">${offer.listing.title}</strong> was not accepted.</p>
                <p style="color:#9a9070;">The listing remains available at the asking price.</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/listings/${offer.listing.id}" style="display:inline-block;background:#7f1d1d;color:#f0e8d8;text-decoration:none;padding:12px 24px;margin-top:16px;font-weight:bold;">View Listing →</a>
              </div>`,
          })
        : Promise.resolve(),
      createNotification(
        offer.buyer.id,
        "offer_declined",
        "Offer Declined",
        `Your offer on "${offer.listing.title}" was not accepted.`,
        `/listings/${offer.listing.id}`
      ),
    ]);

    return NextResponse.json({ success: true, status: "DECLINED" });
  }

  // Accept: generate Stripe checkout at offer price for the buyer
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: Math.round(offer.amount * 100),
          product_data: {
            name: offer.listing.title,
            description: `Accepted offer — ${offer.listing.title}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      listingId: offer.listing.id,
      buyerId: offer.buyer.id,
      sellerId: session.user.id,
      type: "listing",
      offerId: params.id,
    },
    success_url: `${baseUrl}/dashboard?purchased=1`,
    cancel_url: `${baseUrl}/listings/${offer.listing.id}`,
    customer_email: offer.buyer.email ?? undefined,
  });

  await prisma.offer.update({ where: { id: params.id }, data: { status: "ACCEPTED" } });

  await Promise.all([
    offer.buyer.email && checkoutSession.url
      ? sendEmail({
          to: offer.buyer.email,
          subject: `Offer accepted — ${offer.listing.title}`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#0e0e1f;color:#f0e8d8;padding:32px;border:1px solid #2a2a4a;">
              <h2 style="color:#b8970a;font-family:serif;font-size:24px;margin:0 0 16px;">⚔ Offer Accepted</h2>
              <p style="color:#c8b89a;">${offer.buyer.name ?? "Warrior"},</p>
              <p style="color:#9a9070;">Your offer of <strong style="color:#b8970a;">$${offer.amount.toFixed(2)}</strong> on <strong style="color:#f0e8d8;">${offer.listing.title}</strong> has been accepted.</p>
              <p style="color:#9a9070;">Complete your purchase now — this link expires in 24 hours.</p>
              <a href="${checkoutSession.url}" style="display:inline-block;background:#b8970a;color:#07070f;text-decoration:none;padding:12px 24px;margin-top:16px;font-weight:bold;">Pay $${offer.amount.toFixed(2)} Now →</a>
            </div>`,
        })
      : Promise.resolve(),
    createNotification(
      offer.buyer.id,
      "offer_accepted",
      "Offer Accepted!",
      `Your offer of $${offer.amount.toFixed(2)} on "${offer.listing.title}" was accepted. Complete payment now.`,
      checkoutSession.url ?? `/listings/${offer.listing.id}`
    ),
  ]);

  return NextResponse.json({ success: true, status: "ACCEPTED", checkoutUrl: checkoutSession.url });
}

export const dynamic = "force-dynamic";
