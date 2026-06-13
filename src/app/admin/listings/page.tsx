export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Eye, Zap } from "lucide-react";
import { timeAgo, formatListingPrice } from "@/lib/utils";

export default async function AdminListingsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const listings = await prisma.listing.findMany({
    include: { seller: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-bone-500 hover:text-bone-300 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display text-3xl font-bold text-bone-100">All Listings</h1>
          <p className="text-bone-500 text-sm">{listings.length} total</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-void-700 border-b border-void-600">
            <tr>
              <th className="text-left px-4 py-3 text-bone-400 font-medium uppercase tracking-wide text-xs">Title</th>
              <th className="text-left px-4 py-3 text-bone-400 font-medium uppercase tracking-wide text-xs hidden md:table-cell">Seller</th>
              <th className="text-right px-4 py-3 text-bone-400 font-medium uppercase tracking-wide text-xs">Price</th>
              <th className="text-center px-4 py-3 text-bone-400 font-medium uppercase tracking-wide text-xs">Status</th>
              <th className="text-right px-4 py-3 text-bone-400 font-medium uppercase tracking-wide text-xs hidden lg:table-cell">Views</th>
              <th className="text-right px-4 py-3 text-bone-400 font-medium uppercase tracking-wide text-xs hidden sm:table-cell">Listed</th>
              <th className="text-right px-4 py-3 text-bone-400 font-medium uppercase tracking-wide text-xs">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-void-700">
            {listings.map((listing) => (
              <tr key={listing.id} className="hover:bg-void-700/50 transition-colors">
                <td className="px-4 py-3 max-w-xs">
                  <div className="flex items-center gap-2">
                    {listing.isBoosted && <Zap className="w-3.5 h-3.5 text-blood-500 shrink-0" />}
                    <span className="text-bone-200 truncate">{listing.title}</span>
                  </div>
                  <div className="text-bone-500 text-xs mt-0.5">{listing.gameSystem}</div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <div className="text-bone-300 text-xs">{listing.seller.name}</div>
                  <div className="text-bone-500 text-xs">{listing.seller.email}</div>
                </td>
                <td className="px-4 py-3 text-right text-bone-200 font-medium">{formatListingPrice(listing.price)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`badge text-xs
                    ${listing.status === "ACTIVE" ? "bg-green-900 text-green-400 border border-green-800" :
                      listing.status === "SOLD" ? "badge-brass" : "badge-void"}`}
                  >
                    {listing.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-bone-500 hidden lg:table-cell">
                  <div className="flex items-center gap-1 justify-end">
                    <Eye className="w-3 h-3" />
                    {listing.views}
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-bone-500 text-xs hidden sm:table-cell">{timeAgo(listing.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/listings/${listing.id}`} className="btn-secondary text-xs py-1 px-2">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
