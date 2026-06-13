import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, COMMISSION_RATE } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { listingId, type } = await req.json();

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (type === "listing") {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId, status: "ACTIVE" },
        include: { seller: { select: { id: true, name: true } } },
      });

      if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
      if (listing.sellerId === session.user.id) {
        return NextResponse.json({ error: "Cannot buy your own listing" }, { status: 400 });
      }

      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: Math.round(listing.price * 100),
              product_data: {
                name: listing.title,
                description: `${listing.gameSystem} · ${listing.faction} · ${listing.condition}`,
              },
            },
            quantity: 1,
          },
        ],
        metadata: { listingId: listing.id, buyerId: session.user.id, sellerId: listing.sellerId, type: "listing" },
        success_url: `${baseUrl}/dashboard?purchased=1`,
        cancel_url: `${baseUrl}/listings/${listing.id}`,
        customer_email: session.user.email ?? undefined,
      });

      return NextResponse.json({ url: checkoutSession.url });
    }

    if (type === "premium_seller" || type === "premium_seller_yearly") {
      const isYearly = type === "premium_seller_yearly";
      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: isYearly ? 17900 : 1900,
              product_data: {
                name: isYearly ? "Premium Seller — 1 Year" : "Premium Seller — 1 Month",
                description: "Priority ranking, verified badge, Pro Seller forum access",
              },
            },
            quantity: 1,
          },
        ],
        metadata: { userId: session.user.id, type, period: isYearly ? "yearly" : "monthly" },
        success_url: `${baseUrl}/dashboard?premium=1`,
        cancel_url: `${baseUrl}/pricing`,
        customer_email: session.user.email ?? undefined,
      });
      return NextResponse.json({ url: checkoutSession.url });
    }

    if (type === "forum_access") {
      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: 700,
              product_data: {
                name: "Forum Elite — 1 Month",
                description: "Exclusive Sales Lounge access — where the whales hunt",
              },
            },
            quantity: 1,
          },
        ],
        metadata: { userId: session.user.id, type: "forum_access" },
        success_url: `${baseUrl}/forum?elite=1`,
        cancel_url: `${baseUrl}/pricing`,
        customer_email: session.user.email ?? undefined,
      });
      return NextResponse.json({ url: checkoutSession.url });
    }

    if (type === "boost_7day" || type === "boost_homepage") {
      if (!listingId) return NextResponse.json({ error: "listingId required" }, { status: 400 });

      const listing = await prisma.listing.findUnique({ where: { id: listingId, sellerId: session.user.id } });
      if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

      const isHomepage = type === "boost_homepage";
      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: isHomepage ? 1999 : 999,
              product_data: {
                name: isHomepage ? "Homepage Feature (7 days)" : "7-Day Listing Boost",
                description: isHomepage ? "Your army on the homepage carousel" : "Pinned at top of category for 7 days",
              },
            },
            quantity: 1,
          },
        ],
        metadata: { listingId, userId: session.user.id, type: "listing_boost", boostType: type },
        success_url: `${baseUrl}/listings/${listingId}?boosted=1`,
        cancel_url: `${baseUrl}/boost/${listingId}`,
        customer_email: session.user.email ?? undefined,
      });
      return NextResponse.json({ url: checkoutSession.url });
    }

    if (type === "hall_standard" || type === "hall_immortal") {
      if (!listingId) return NextResponse.json({ error: "listingId required" }, { status: 400 });

      const listing = await prisma.listing.findUnique({ where: { id: listingId, sellerId: session.user.id } });
      if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

      const isImmortal = type === "hall_immortal";
      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: isImmortal ? 9900 : 4900,
              product_data: {
                name: isImmortal ? "Hall of Legends — Immortal Tier" : "Hall of Legends — Standard Submission",
                description: "Museum-quality showcase. Game Master reviews all submissions.",
              },
            },
            quantity: 1,
          },
        ],
        metadata: { listingId, userId: session.user.id, type: isImmortal ? "hall_immortal" : "hall_standard" },
        success_url: `${baseUrl}/hall-of-legends?submitted=1`,
        cancel_url: `${baseUrl}/hall-of-legends/submit`,
        customer_email: session.user.email ?? undefined,
      });
      return NextResponse.json({ url: checkoutSession.url });
    }

    if (type === "wtb_bump") {
      if (!listingId) return NextResponse.json({ error: "wtbId required" }, { status: 400 });
      const post = await prisma.wantToBuy.findUnique({ where: { id: listingId, userId: session.user.id } });
      if (!post) return NextResponse.json({ error: "WTB post not found" }, { status: 404 });

      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: 499,
              product_data: {
                name: "WTB Bump — 7 Days",
                description: "Pin your Want-to-Buy post at the top for 7 days",
              },
            },
            quantity: 1,
          },
        ],
        metadata: { wtbId: listingId, userId: session.user.id, type: "wtb_bump" },
        success_url: `${baseUrl}/wtb?bumped=1`,
        cancel_url: `${baseUrl}/wtb`,
        customer_email: session.user.email ?? undefined,
      });
      return NextResponse.json({ url: checkoutSession.url });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
