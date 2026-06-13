export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { formatListingPrice, timeAgo } from "@/lib/utils";
import { AdminAdForm } from "@/components/admin/AdminAdForm";

export default async function AdminAdsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const ads = await prisma.adSlot.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-bone-500 hover:text-bone-300 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display text-3xl font-bold text-bone-100">Ad Slots</h1>
          <p className="text-bone-500 text-sm">{ads.length} active/past slots · $299/month each</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="font-display text-bone-200 font-semibold uppercase tracking-wider text-xs mb-4">Add New Ad Slot</h2>
          <AdminAdForm />
        </div>

        <div>
          <h2 className="font-display text-bone-200 font-semibold uppercase tracking-wider text-xs mb-4">
            All Slots ({ads.length})
          </h2>
          {ads.length === 0 ? (
            <div className="card p-6 text-center text-bone-500 text-sm">No ad slots yet.</div>
          ) : (
            <div className="space-y-3">
              {ads.map((ad) => (
                <div key={ad.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-bone-200 font-medium text-sm">{ad.company}</span>
                        <span className={`badge text-xs ${ad.isActive ? "bg-green-900 text-green-400 border border-green-800" : "badge-void"}`}>
                          {ad.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="text-bone-500 text-xs mt-0.5">{ad.placement} · {formatListingPrice(ad.amount)}</div>
                      <div className="text-bone-600 text-xs">
                        {new Date(ad.startDate).toLocaleDateString()} → {new Date(ad.endDate).toLocaleDateString()}
                      </div>
                    </div>
                    <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="text-bone-500 hover:text-bone-300 shrink-0">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
