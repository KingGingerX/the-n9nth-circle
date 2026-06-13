import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { createNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

const WARN_DAYS = 3;

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret") ?? req.nextUrl.searchParams.get("secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const warnDate = new Date(now.getTime() + WARN_DAYS * 24 * 60 * 60 * 1000);
  const results = { expiredBoosts: 0, expiredPremium: 0, expiredForum: 0, warnedPremium: 0, warnedForum: 0, expiredWtbBumps: 0, priceDropAlerts: 0 };

  // expire listing boosts
  const expiredBoosts = await prisma.listing.updateMany({
    where: { isBoosted: true, boostExpiresAt: { lte: now } },
    data: { isBoosted: false, isFeaturedHome: false },
  });
  results.expiredBoosts = expiredBoosts.count;

  // expire premium seller + notify
  const expiringPremium = await prisma.user.findMany({
    where: { isPremiumSeller: true, premiumExpiresAt: { lte: now } },
    select: { id: true, name: true, email: true },
  });
  if (expiringPremium.length > 0) {
    await prisma.user.updateMany({
      where: { id: { in: expiringPremium.map((u) => u.id) } },
      data: { isPremiumSeller: false },
    });
    results.expiredPremium = expiringPremium.length;
    await Promise.all(
      expiringPremium.filter((u) => u.email).map((u) =>
        sendEmail({
          to: u.email!,
          subject: "Your Premium Seller subscription has expired",
          html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#0e0e1f;color:#f0e8d8;padding:32px;border:1px solid #2a2a4a;">
            <h2 style="color:#b91c1c;font-family:serif;font-size:24px;margin:0 0 16px;">⚔ Premium Seller Expired</h2>
            <p style="color:#c8b89a;">${u.name ?? "Warrior"},</p>
            <p style="color:#9a9070;">Your Premium Seller subscription has expired. Renew to keep your priority ranking and verified badge.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing" style="display:inline-block;background:#b8970a;color:#07070f;text-decoration:none;padding:12px 24px;margin-top:16px;font-weight:bold;">Renew Now →</a>
          </div>`,
        })
      )
    );
  }

  // expire forum access
  const expiringForum = await prisma.user.findMany({
    where: { hasForumAccess: true, forumAccessExpiresAt: { lte: now } },
    select: { id: true, name: true, email: true },
  });
  if (expiringForum.length > 0) {
    await prisma.user.updateMany({
      where: { id: { in: expiringForum.map((u) => u.id) } },
      data: { hasForumAccess: false },
    });
    results.expiredForum = expiringForum.length;
  }

  // warn users expiring within 3 days
  const warnPremium = await prisma.user.findMany({
    where: {
      isPremiumSeller: true,
      premiumExpiresAt: { gt: now, lte: warnDate },
    },
    select: { name: true, email: true, premiumExpiresAt: true },
  });
  await Promise.all(
    warnPremium.filter((u) => u.email).map((u) =>
      sendEmail({
        to: u.email!,
        subject: "Your Premium Seller subscription expires in 3 days",
        html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#0e0e1f;color:#f0e8d8;padding:32px;border:1px solid #2a2a4a;">
          <h2 style="color:#b8970a;font-family:serif;font-size:24px;margin:0 0 16px;">⚜ Subscription Expiring Soon</h2>
          <p style="color:#c8b89a;">${u.name ?? "Warrior"},</p>
          <p style="color:#9a9070;">Your Premium Seller subscription expires on <strong style="color:#f0e8d8;">${u.premiumExpiresAt?.toLocaleDateString()}</strong>. Renew now to keep your priority ranking.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing" style="display:inline-block;background:#b8970a;color:#07070f;text-decoration:none;padding:12px 24px;margin-top:16px;font-weight:bold;">Renew Now →</a>
        </div>`,
      })
    )
  );
  results.warnedPremium = warnPremium.length;

  // expire WTB bumps
  const expiredWtbBumps = await prisma.wantToBuy.updateMany({
    where: { isBumped: true, bumpExpiresAt: { lte: now } },
    data: { isBumped: false },
  });
  results.expiredWtbBumps = expiredWtbBumps.count;

  // price drop notifications for watchlist
  const watchlistItems = await prisma.watchlist.findMany({
    where: { listing: { status: "ACTIVE" } },
    include: {
      listing: { select: { id: true, title: true, price: true } },
      user: { select: { id: true, email: true, name: true } },
    },
  });

  const priceDropItems = watchlistItems.filter(
    (w) => w.listing.price < w.priceAtSave * 0.95
  );

  await Promise.all(
    priceDropItems.map(async (w) => {
      const drop = ((w.priceAtSave - w.listing.price) / w.priceAtSave * 100).toFixed(0);
      await Promise.all([
        createNotification(
          w.user.id,
          "price_drop",
          "Price Drop on Saved Listing",
          `"${w.listing.title}" dropped ${drop}% — now $${w.listing.price.toFixed(2)} (was $${w.priceAtSave.toFixed(2)})`,
          `/listings/${w.listing.id}`
        ),
        w.user.email
          ? sendEmail({
              to: w.user.email,
              subject: `Price Drop: ${w.listing.title} (−${drop}%)`,
              html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#0e0e1f;color:#f0e8d8;padding:32px;border:1px solid #2a2a4a;">
                <h2 style="color:#b8970a;font-family:serif;font-size:24px;margin:0 0 16px;">📉 Price Drop Alert</h2>
                <p style="color:#c8b89a;">${w.user.name ?? "Warrior"},</p>
                <p style="color:#9a9070;">A listing on your watchlist just dropped in price:</p>
                <div style="background:#1a1a2e;border:1px solid #2a2a4a;padding:16px;margin:16px 0;">
                  <strong style="color:#f0e8d8;">${w.listing.title}</strong>
                  <div style="margin-top:8px;">
                    <span style="color:#9a9070;text-decoration:line-through;">Was: $${w.priceAtSave.toFixed(2)}</span><br/>
                    <span style="color:#22c55e;font-size:20px;font-weight:bold;">Now: $${w.listing.price.toFixed(2)} (−${drop}%)</span>
                  </div>
                </div>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/listings/${w.listing.id}" style="display:inline-block;background:#b8970a;color:#07070f;text-decoration:none;padding:12px 24px;margin-top:16px;font-weight:bold;">View Listing →</a>
              </div>`,
            })
          : Promise.resolve(),
      ]);
    })
  );
  results.priceDropAlerts = priceDropItems.length;

  console.log("[cron/expire]", results);
  return NextResponse.json({ success: true, ...results, timestamp: now.toISOString() });
}
