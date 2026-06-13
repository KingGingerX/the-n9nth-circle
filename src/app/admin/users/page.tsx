export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { timeAgo, formatListingPrice } from "@/lib/utils";
import { ArrowLeft, Crown, Shield } from "lucide-react";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      isPremiumSeller: true,
      hasForumAccess: true,
      totalSales: true,
      totalEarnings: true,
      sellerRating: true,
      reviewCount: true,
      createdAt: true,
      _count: { select: { listings: true } },
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-bone-500 hover:text-bone-300 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display text-3xl font-bold text-bone-100">All Users</h1>
          <p className="text-bone-500 text-sm">{users.length} total</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-void-700 border-b border-void-600">
            <tr>
              <th className="text-left px-4 py-3 text-bone-400 font-medium uppercase tracking-wide text-xs">User</th>
              <th className="text-left px-4 py-3 text-bone-400 font-medium uppercase tracking-wide text-xs hidden md:table-cell">Status</th>
              <th className="text-right px-4 py-3 text-bone-400 font-medium uppercase tracking-wide text-xs hidden lg:table-cell">Sales</th>
              <th className="text-right px-4 py-3 text-bone-400 font-medium uppercase tracking-wide text-xs hidden lg:table-cell">Earnings</th>
              <th className="text-right px-4 py-3 text-bone-400 font-medium uppercase tracking-wide text-xs">Listings</th>
              <th className="text-right px-4 py-3 text-bone-400 font-medium uppercase tracking-wide text-xs hidden sm:table-cell">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-void-700">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-void-700/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {user.image ? (
                      <Image src={user.image} alt="" width={32} height={32} className="rounded-full border border-void-600 shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blood-900 border border-blood-800 flex items-center justify-center text-blood-400 text-xs font-bold shrink-0">
                        {user.name?.[0] ?? "?"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-bone-200 font-medium truncate">{user.name ?? "—"}</div>
                      <div className="text-bone-500 text-xs truncate">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {user.role === "ADMIN" && <span className="badge-blood text-xs">☠ Admin</span>}
                    {user.isPremiumSeller && <span className="badge-brass text-xs">⚜ Premium</span>}
                    {user.hasForumAccess && <span className="badge-brass text-xs">💀 Elite</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-bone-300 hidden lg:table-cell">{user.totalSales}</td>
                <td className="px-4 py-3 text-right text-brass-400 hidden lg:table-cell">{formatListingPrice(user.totalEarnings)}</td>
                <td className="px-4 py-3 text-right text-bone-300">{user._count.listings}</td>
                <td className="px-4 py-3 text-right text-bone-500 hidden sm:table-cell text-xs">{timeAgo(user.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
