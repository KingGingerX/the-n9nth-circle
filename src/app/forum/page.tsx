export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { FORUM_CATEGORIES } from "@/lib/constants";
import { AdBanner } from "@/components/ads/AdBanner";
import Link from "next/link";
import { MessageSquare, Lock, Pin } from "lucide-react";
import { timeAgo } from "@/lib/utils";

async function getCategoryStats() {
  const stats = await Promise.all(
    FORUM_CATEGORIES.map(async (cat) => {
      const category = await prisma.forumCategory.findUnique({ where: { slug: cat.slug } });
      if (!category) return { ...cat, postCount: 0, replyCount: 0, latestPost: null };

      const [postCount, latestPost] = await Promise.all([
        prisma.forumPost.count({ where: { categoryId: category.id } }),
        prisma.forumPost.findFirst({
          where: { categoryId: category.id },
          orderBy: { createdAt: "desc" },
          include: { author: { select: { name: true } } },
        }),
      ]);

      return { ...cat, postCount, latestPost, categoryId: category.id };
    })
  );
  return stats;
}

export default async function ForumPage() {
  const categoryStats = await getCategoryStats();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-blood-500 text-sm font-semibold uppercase tracking-widest mb-1">War Council</p>
          <h1 className="font-display text-4xl font-black text-bone-100">The Forum</h1>
        </div>
        <Link href="/auth/signin" className="btn-primary text-sm">Join</Link>
      </div>

      <AdBanner placement="forum" className="mb-6" />

      <div className="space-y-1">
        {categoryStats.map((cat) => (
          <Link key={cat.slug} href={`/forum/${cat.slug}`}>
            <div className={`card-hover p-5 flex items-center gap-5 group
              ${cat.isPremiumOnly ? "border-brass-900/40 hover:border-brass-700" : ""}`}
            >
              <div className="text-3xl w-10 shrink-0">{cat.icon}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-bone-200 font-semibold group-hover:text-bone-100 transition-colors">
                    {cat.name}
                  </h3>
                  {cat.isPremiumOnly && (
                    <span className="badge-brass flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Premium
                    </span>
                  )}
                </div>
                <p className="text-bone-500 text-sm">{cat.description}</p>
                {cat.latestPost && (
                  <p className="text-bone-600 text-xs mt-1.5 truncate">
                    Last: <span className="text-bone-400">{cat.latestPost.title}</span>
                    {" "}by {cat.latestPost.author.name} · {timeAgo(cat.latestPost.createdAt)}
                  </p>
                )}
              </div>

              <div className="text-right shrink-0">
                <div className="flex items-center gap-1.5 text-bone-500 justify-end">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-bone-300 font-medium">{cat.postCount}</span>
                </div>
                <div className="text-bone-600 text-xs mt-0.5">posts</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
