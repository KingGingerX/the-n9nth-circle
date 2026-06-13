export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Skull, DollarSign, Users, Package, Crown, TrendingUp } from "lucide-react";
import { formatListingPrice, timeAgo } from "@/lib/utils";
import FetchApiStatus from "@/components/admin/FetchApiStatus";

async function getAdminData() {
  const [
    totalUsers,
    totalListings,
    activeListings,
    totalPurchases,
    recentPurchases,
    hallSubmissions,
    recentListings,
    totalRevenue,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count(),
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.purchase.count({ where: { status: "COMPLETED" } }),
    prisma.purchase.findMany({
      where: { status: "COMPLETED" },
      include: {
        listing: { select: { title: true } },
        buyer: { select: { name: true } },
        seller: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.hallOfLegendsSubmission.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.listing.findMany({
      include: { seller: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.purchase.aggregate({
      where: { status: "COMPLETED" },
      _sum: { commission: true },
    }),
  ]);

  return {
    totalUsers,
    totalListings,
    activeListings,
    totalPurchases,
    recentPurchases,
    hallSubmissions,
    recentListings,
    platformRevenue: totalRevenue._sum.commission ?? 0,
  };
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const data = await getAdminData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Game Master Header */}
      <div className="flex items-center gap-4 mb-10">
        <Skull className="w-10 h-10 text-blood-500" />
        <div>
          <h1 className="font-display text-4xl font-black text-bone-100">Game Master Panel</h1>
          <p className="text-blood-500 text-sm font-semibold uppercase tracking-widest">
            You Own the Arena
          </p>
        </div>
      </div>

      {/* Revenue + stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Platform Revenue", value: formatListingPrice(data.platformRevenue), icon: <DollarSign className="w-5 h-5 text-brass-500" />, sub: "12% of all sales" },
          { label: "Total Users", value: data.totalUsers.toString(), icon: <Users className="w-5 h-5 text-blood-500" /> },
          { label: "Active Listings", value: data.activeListings.toString(), icon: <Package className="w-5 h-5 text-bone-500" /> },
          { label: "Total Sales", value: data.totalPurchases.toString(), icon: <TrendingUp className="w-5 h-5 text-bone-500" /> },
        ].map((stat) => (
          <div key={stat.label} className="card p-5 glow-red">
            <div className="flex items-center justify-between mb-2">
              <span className="text-bone-500 text-xs uppercase tracking-wide">{stat.label}</span>
              {stat.icon}
            </div>
            <div className="font-display text-2xl font-bold text-bone-100">{stat.value}</div>
            {stat.sub && <div className="text-bone-600 text-xs mt-0.5">{stat.sub}</div>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Hall of Legends submissions */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-5 h-5 text-brass-500" />
            <h2 className="font-display text-bone-200 font-semibold uppercase tracking-wider text-sm">
              Hall Submissions ({data.hallSubmissions.length} pending)
            </h2>
          </div>

          {data.hallSubmissions.length === 0 ? (
            <div className="card p-6 text-center text-bone-500 text-sm">No pending submissions</div>
          ) : (
            <div className="space-y-2">
              {data.hallSubmissions.map((sub) => (
                <div key={sub.id} className="card p-4 flex items-center justify-between">
                  <div>
                    <div className="text-bone-200 text-sm font-medium">{sub.listingId}</div>
                    <div className="text-bone-500 text-xs mt-0.5">
                      {sub.tier} · ${sub.amount} · {timeAgo(sub.createdAt)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/hall/${sub.id}/approve`}
                      className="btn-brass text-xs py-1.5 px-3"
                    >
                      ✓ Approve
                    </Link>
                    <Link
                      href={`/admin/hall/${sub.id}/reject`}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      ✗ Reject
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent sales */}
        <div>
          <h2 className="font-display text-bone-200 font-semibold uppercase tracking-wider text-sm mb-4">
            Recent Sales
          </h2>
          {data.recentPurchases.length === 0 ? (
            <div className="card p-6 text-center text-bone-500 text-sm">No sales yet</div>
          ) : (
            <div className="space-y-2">
              {data.recentPurchases.map((purchase) => (
                <div key={purchase.id} className="card p-3 flex items-center justify-between text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="text-bone-200 truncate">{purchase.listing.title}</p>
                    <p className="text-bone-500 text-xs">
                      {purchase.buyer.name} → {purchase.seller.name} · {timeAgo(purchase.createdAt)}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <div className="text-bone-200 font-medium">{formatListingPrice(purchase.amount)}</div>
                    <div className="text-brass-500 text-xs">+{formatListingPrice(purchase.commission)} fee</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-10">
        <h2 className="font-display text-bone-200 font-semibold uppercase tracking-wider text-sm mb-4">
          Game Master Controls
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "All Users", href: "/admin/users" },
            { label: "All Listings", href: "/admin/listings" },
            { label: "Forum Moderation", href: "/admin/forum" },
            { label: "Ad Slots", href: "/admin/ads" },
          ].map((action) => (
            <Link key={action.href} href={action.href} className="btn-secondary text-sm text-center">
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      {/* FetchAPI key status */}
      <div className="mt-10">
        <FetchApiStatus />
      </div>
    </div>
  );
}
