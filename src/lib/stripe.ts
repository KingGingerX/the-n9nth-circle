import Stripe from "stripe";

export const COMMISSION_RATE = 0.12;

export const PRICES = {
  PREMIUM_SELLER_MONTHLY: 1900,
  PREMIUM_SELLER_YEARLY: 17900,
  FORUM_ACCESS_MONTHLY: 700,
  LISTING_BOOST_7DAY: 999,
  LISTING_BOOST_HOMEPAGE: 1999,
  HALL_OF_LEGENDS_STANDARD: 4900,
  HALL_OF_LEGENDS_IMMORTAL: 9900,
  AD_SLOT_MONTHLY: 29900,
} as const;

export const PRICE_LABELS = {
  PREMIUM_SELLER_MONTHLY: "$19/month",
  PREMIUM_SELLER_YEARLY: "$179/year",
  FORUM_ACCESS_MONTHLY: "$7/month",
  LISTING_BOOST_7DAY: "$9.99 — 7-day pin",
  LISTING_BOOST_HOMEPAGE: "$19.99 — Homepage feature",
  HALL_OF_LEGENDS_STANDARD: "$49 — Hall of Legends consideration",
  HALL_OF_LEGENDS_IMMORTAL: "$99 — Immortal slot",
  AD_SLOT_MONTHLY: "$299/month",
} as const;

let _stripe: Stripe | null = null;

export const stripe = new Proxy({} as Stripe, {
  get(_, prop: string | symbol) {
    if (!_stripe) {
      _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: "2026-05-27.dahlia",
        typescript: true,
      });
    }
    const val = (_stripe as any)[prop as string];
    return typeof val === "function" ? val.bind(_stripe) : val;
  },
});
