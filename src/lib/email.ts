interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(opts: EmailOptions): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? "The N9nth Circle <noreply@theninthcircle.gg>",
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
      }),
    });
  } catch {
    // email failure must never break the main flow
  }
}

export function purchaseConfirmationBuyer(listing: { title: string; price: number }, buyerName: string) {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#0e0e1f;color:#f0e8d8;padding:32px;border:1px solid #2a2a4a;">
      <h2 style="color:#b91c1c;font-family:serif;font-size:24px;margin:0 0 16px;">⚔ Purchase Confirmed</h2>
      <p style="color:#c8b89a;">Warrior ${buyerName},</p>
      <p style="color:#9a9070;">Your acquisition has been logged in the ledger:</p>
      <div style="background:#1a1a2e;border:1px solid #2a2a4a;padding:16px;margin:16px 0;">
        <strong style="color:#f0e8d8;">${listing.title}</strong>
        <div style="color:#b8970a;font-size:20px;font-weight:bold;margin-top:8px;">$${listing.price.toFixed(2)}</div>
      </div>
      <p style="color:#9a9070;">The seller has been notified. Your army comes for you.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block;background:#7f1d1d;color:#f0e8d8;text-decoration:none;padding:12px 24px;margin-top:16px;font-weight:bold;">View Dashboard →</a>
    </div>`;
}

export function purchaseNotificationSeller(listing: { title: string; price: number }, sellerName: string, payout: number) {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#0e0e1f;color:#f0e8d8;padding:32px;border:1px solid #2a2a4a;">
      <h2 style="color:#b8970a;font-family:serif;font-size:24px;margin:0 0 16px;">⚜ Your Army Has Sold</h2>
      <p style="color:#c8b89a;">${sellerName},</p>
      <p style="color:#9a9070;">Congratulations. The following listing has been purchased:</p>
      <div style="background:#1a1a2e;border:1px solid #2a2a4a;padding:16px;margin:16px 0;">
        <strong style="color:#f0e8d8;">${listing.title}</strong>
        <div style="margin-top:8px;">
          <span style="color:#9a9070;">Sale price: </span><span style="color:#f0e8d8;">$${listing.price.toFixed(2)}</span><br/>
          <span style="color:#9a9070;">Your payout (after 12%): </span><span style="color:#b8970a;font-weight:bold;">$${payout.toFixed(2)}</span>
        </div>
      </div>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block;background:#7f1d1d;color:#f0e8d8;text-decoration:none;padding:12px 24px;margin-top:16px;font-weight:bold;">View Dashboard →</a>
    </div>`;
}

export function premiumWelcomeEmail(name: string, isYearly: boolean) {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#0e0e1f;color:#f0e8d8;padding:32px;border:1px solid #2a2a4a;">
      <h2 style="color:#b8970a;font-family:serif;font-size:24px;margin:0 0 16px;">⚜ Welcome to Premium Seller</h2>
      <p style="color:#c8b89a;">${name},</p>
      <p style="color:#9a9070;">Your status has been upgraded. You now command priority placement in the arena.</p>
      <ul style="color:#9a9070;line-height:2;">
        <li>Priority search ranking — your armies appear first</li>
        <li>Blue verified seller badge</li>
        <li>Access to Pro Seller forum section</li>
      </ul>
      <p style="color:#9a9070;">Subscription: ${isYearly ? "1 Year" : "1 Month"}</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/listings/new" style="display:inline-block;background:#b8970a;color:#07070f;text-decoration:none;padding:12px 24px;margin-top:16px;font-weight:bold;">List Your First Army →</a>
    </div>`;
}

export function boostConfirmationEmail(name: string, listingTitle: string, isHomepage: boolean) {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#0e0e1f;color:#f0e8d8;padding:32px;border:1px solid #2a2a4a;">
      <h2 style="color:#b91c1c;font-family:serif;font-size:24px;margin:0 0 16px;">⚡ Listing Boosted</h2>
      <p style="color:#c8b89a;">${name},</p>
      <p style="color:#9a9070;"><strong style="color:#f0e8d8;">${listingTitle}</strong> is now ${isHomepage ? "featured on the homepage" : "pinned at the top of its category"} for 7 days.</p>
      <p style="color:#9a9070;">Your army commands maximum visibility. Get ready for buyers.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block;background:#7f1d1d;color:#f0e8d8;text-decoration:none;padding:12px 24px;margin-top:16px;font-weight:bold;">View Listing →</a>
    </div>`;
}

export function offerNotificationEmail(sellerName: string, buyerName: string, listingTitle: string, offerAmount: number, listingId: string) {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#0e0e1f;color:#f0e8d8;padding:32px;border:1px solid #2a2a4a;">
      <h2 style="color:#b8970a;font-family:serif;font-size:24px;margin:0 0 16px;">⚔ New Offer on Your Listing</h2>
      <p style="color:#c8b89a;">${sellerName},</p>
      <p style="color:#9a9070;"><strong style="color:#f0e8d8;">${buyerName}</strong> has made an offer on:</p>
      <div style="background:#1a1a2e;border:1px solid #2a2a4a;padding:16px;margin:16px 0;">
        <strong style="color:#f0e8d8;">${listingTitle}</strong>
        <div style="color:#b8970a;font-size:20px;font-weight:bold;margin-top:8px;">Offer: $${offerAmount.toFixed(2)}</div>
      </div>
      <p style="color:#9a9070;">Log in to accept or decline the offer.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/listings/${listingId}" style="display:inline-block;background:#7f1d1d;color:#f0e8d8;text-decoration:none;padding:12px 24px;margin-top:16px;font-weight:bold;">View Listing →</a>
    </div>`;
}
