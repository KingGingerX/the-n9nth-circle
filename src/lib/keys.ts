/**
 * FetchAPI integration — fetches API keys from the centralized FetchAPI server.
 * Falls back silently to process.env when FetchAPI is unreachable or unconfigured.
 */

interface FetchAPIResponse {
  status: "approved" | "pending" | "rejected";
  key?: string;
  secret?: string;
  webhook_secret?: string;
  credentials?: Record<string, string>;
}

const cache = new Map<string, FetchAPIResponse>();
let bootstrapped = false;

function getFetchApiBase(): string | null {
  return process.env.FETCHAPI_URL ?? null;
}

function getProjectToken(): string | null {
  return process.env.FETCHAPI_PROJECT_TOKEN ?? null;
}

export async function fetchKey(apiName: string): Promise<FetchAPIResponse | null> {
  const base = getFetchApiBase();
  const token = getProjectToken();
  if (!base || !token) return null;

  if (cache.has(apiName)) return cache.get(apiName)!;

  try {
    const res = await fetch(`${base}/api/fetch/${apiName}`, {
      headers: { "x-project-token": token },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as FetchAPIResponse;
    if (data.status === "approved") {
      cache.set(apiName, data);
    }
    return data;
  } catch {
    return null;
  }
}

/**
 * Bootstrap: fetch all critical keys from FetchAPI and populate process.env.
 * Called once from instrumentation.ts at server startup.
 * Safe to call multiple times — no-ops if already done.
 */
export async function bootstrapKeys(): Promise<void> {
  if (bootstrapped) return;
  const base = getFetchApiBase();
  const token = getProjectToken();
  if (!base || !token) {
    // FetchAPI not configured — use .env values as-is
    bootstrapped = true;
    return;
  }

  const keyMap: Array<[string, () => void]> = [
    ["stripe-secret", () => {
      const d = cache.get("stripe-secret");
      if (d?.key) process.env["STRIPE_SECRET_KEY"] = d.key;
    }],
    ["stripe-publishable", () => {
      const d = cache.get("stripe-publishable");
      if (d?.key) {
        process.env["STRIPE_PUBLISHABLE_KEY"] = d.key;
        // NEXT_PUBLIC_* vars are inlined at build time — cannot be set at runtime
      }
    }],
    ["stripe-webhook", () => {
      const d = cache.get("stripe-webhook");
      if (d?.webhook_secret) process.env["STRIPE_WEBHOOK_SECRET"] = d.webhook_secret;
      else if (d?.key) process.env["STRIPE_WEBHOOK_SECRET"] = d.key;
    }],
    ["cloudinary", () => {
      const d = cache.get("cloudinary");
      if (d?.credentials) {
        if (d.credentials.cloud_name) process.env["CLOUDINARY_CLOUD_NAME"] = d.credentials.cloud_name;
        if (d.credentials.api_key)    process.env["CLOUDINARY_API_KEY"]    = d.credentials.api_key;
        if (d.credentials.api_secret) process.env["CLOUDINARY_API_SECRET"] = d.credentials.api_secret;
      }
    }],
    ["resend", () => {
      const d = cache.get("resend");
      if (d?.key) process.env["RESEND_API_KEY"] = d.key;
    }],
    ["google-oauth", () => {
      const d = cache.get("google-oauth");
      if (d?.key)    process.env["GOOGLE_CLIENT_ID"]     = d.key;
      if (d?.secret) process.env["GOOGLE_CLIENT_SECRET"] = d.secret;
    }],
    ["github-oauth", () => {
      const d = cache.get("github-oauth");
      if (d?.key)    process.env["GITHUB_CLIENT_ID"]     = d.key;
      if (d?.secret) process.env["GITHUB_CLIENT_SECRET"] = d.secret;
    }],
    ["discord-oauth", () => {
      const d = cache.get("discord-oauth");
      if (d?.key)    process.env["DISCORD_CLIENT_ID"]     = d.key;
      if (d?.secret) process.env["DISCORD_CLIENT_SECRET"] = d.secret;
    }],
    ["nextauth-secret", () => {
      const d = cache.get("nextauth-secret");
      if (d?.key) process.env["NEXTAUTH_SECRET"] = d.key;
    }],
    ["cron-secret", () => {
      const d = cache.get("cron-secret");
      if (d?.key) process.env["CRON_SECRET"] = d.key;
    }],
  ];

  // Fetch all in parallel
  await Promise.all(
    keyMap.map(([name]) => fetchKey(name))
  );

  // Apply to process.env
  for (const [, apply] of keyMap) {
    try { apply(); } catch { /* non-fatal */ }
  }

  bootstrapped = true;
  console.log("[keys] bootstrapped from FetchAPI:", base);
}
