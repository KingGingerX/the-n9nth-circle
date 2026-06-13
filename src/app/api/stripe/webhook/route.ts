import { NextRequest, NextResponse } from "next/server";
import { stripe, COMMISSION_RATE } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import {
  sendEmail,
  purchaseConfirmationBuyer,
  purchaseNotificationSeller,
  premiumWelcomeEmail,
  boostConfirmationEmail,
} from "@/lib/email";
import { createNotification } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error("Webhook sig verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { listingId, buyerId, sellerId, type } = session.metadata ?? {};

    if (type === "listing" && listingId && buyerId && sellerId) {
      const amount = (session.amount_total ?? 0) / 100;
      const commission = Math.round(amount * COMMISSION_RATE * 100) / 100;
      const sellerPayout = Math.round((amount - commission) * 100) / 100;

      const [listing, buyer, seller] = await Promise.all([
        prisma.listing.update({ where: { id: listingId }, data: { status: "SOLD" } }),
        prisma.user.findUnique({ where: { id: buyerId }, select: { name: true, email: true } }),
        prisma.user.findUnique({ where: { id: sellerId }, select: { name: true, email: true } }),
      ]);

      await Promise.all([
        prisma.purchase.create({
          data: {
            listingId,
            buyerId,
            sellerId,
            amount,
            commission,
            sellerPayout,
            stripePaymentIntentId: session.payment_intent as string,
            status: "COMPLETED",
          },
        }),
        prisma.user.update({
          where: { id: sellerId },
          data: { totalSales: { increment: 1 }, totalEarnings: { increment: sellerPayout } },
        }),
        buyer?.email
          ? sendEmail({
              to: buyer.email,
              subject: `Purchase Confirmed: ${listing.title}`,
              html: purchaseConfirmationBuyer({ title: listing.title, price: amount }, buyer.name ?? "Warrior"),
            })
          : Promise.resolve(),
        seller?.email
          ? sendEmail({
              to: seller.email,
              subject: `Your listing sold: ${listing.title}`,
              html: purchaseNotificationSeller({ title: listing.title, price: amount }, seller.name ?? "Seller", sellerPayout),
            })
          : Promise.resolve(),
        createNotification(
          sellerId,
          "listing_sold",
          "Your Listing Sold!",
          `"${listing.title}" sold for $${amount.toFixed(2)}. You earn $${sellerPayout.toFixed(2)} after fees.`,
          "/dashboard"
        ),
        createNotification(
          buyerId,
          "purchase_complete",
          "Purchase Complete",
          `You purchased "${listing.title}" for $${amount.toFixed(2)}.`,
          "/dashboard/purchases"
        ),
      ]);
    }

    if ((type === "premium_seller" || type === "premium_seller_yearly") && session.metadata?.userId) {
      const isYearly = session.metadata.period === "yearly";
      const expiresAt = new Date();
      if (isYearly) expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      else expiresAt.setMonth(expiresAt.getMonth() + 1);

      const user = await prisma.user.update({
        where: { id: session.metadata.userId },
        data: { isPremiumSeller: true, premiumExpiresAt: expiresAt },
        select: { name: true, email: true },
      });

      if (user.email) {
        await sendEmail({
          to: user.email,
          subject: "Welcome to Premium Seller — The N9nth Circle",
          html: premiumWelcomeEmail(user.name ?? "Warrior", isYearly),
        });
      }
    }

    if (type === "forum_access" && session.metadata?.userId) {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);
      await prisma.user.update({
        where: { id: session.metadata.userId },
        data: { hasForumAccess: true, forumAccessExpiresAt: expiresAt },
      });
    }

    if (type === "listing_boost" && session.metadata?.listingId) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      const isHomepage = session.metadata.boostType === "boost_homepage";

      const [listing, user] = await Promise.all([
        prisma.listing.update({
          where: { id: session.metadata.listingId },
          data: { isBoosted: true, boostExpiresAt: expiresAt, ...(isHomepage ? { isFeaturedHome: true } : {}) },
        }),
        prisma.user.findUnique({ where: { id: session.metadata.userId! }, select: { name: true, email: true } }),
      ]);

      if (user?.email) {
        await sendEmail({
          to: user.email,
          subject: `Listing Boosted: ${listing.title}`,
          html: boostConfirmationEmail(user.name ?? "Warrior", listing.title, isHomepage),
        });
      }
    }

    if ((type === "hall_standard" || type === "hall_immortal") && session.metadata?.listingId) {
      await Promise.all([
        prisma.hallOfLegendsSubmission.create({
          data: {
            listingId: session.metadata.listingId,
            userId: session.metadata.userId!,
            tier: type === "hall_immortal" ? "IMMORTAL" : "STANDARD",
            status: "PENDING",
            amount: (session.amount_total ?? 0) / 100,
          },
        }),
        prisma.listing.update({
          where: { id: session.metadata.listingId },
          data: { hallOfLegendsStatus: "PENDING" },
        }),
      ]);
    }

    if (type === "wtb_bump" && session.metadata?.wtbId) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      await prisma.wantToBuy.update({
        where: { id: session.metadata.wtbId },
        data: { isBumped: true, bumpExpiresAt: expiresAt },
      });
    }
  }

  return NextResponse.json({ received: true });
}

export const dynamic = "force-dynamic";
