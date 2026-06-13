import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const base = process.env.FETCHAPI_URL;
  const token = process.env.FETCHAPI_PROJECT_TOKEN;

  if (!base || !token) {
    return NextResponse.json({ error: "FetchAPI not configured" }, { status: 400 });
  }

  const apiNames = [
    "stripe-secret", "stripe-publishable", "stripe-webhook",
    "cloudinary", "resend",
    "google-oauth", "github-oauth", "discord-oauth",
    "nextauth-secret", "cron-secret",
  ];

  const results: Record<string, string> = {};

  await Promise.all(
    apiNames.map(async (name) => {
      try {
        const res = await fetch(`${base}/api/fetch/${name}`, {
          headers: { "x-project-token": token },
          signal: AbortSignal.timeout(3000),
        });
        const data = await res.json();
        results[name] = data.status;
      } catch {
        results[name] = "unreachable";
      }
    })
  );

  return NextResponse.json({ results });
}
