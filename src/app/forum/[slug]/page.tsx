export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Pin, Lock, MessageSquare, Plus } from "lucide-react";
import { timeAgo } from "@/lib/utils";

export default async function ForumCategoryPage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);

  const category = await prisma.forumCategory.findUnique({ where: { slug: params.slug } });
  if (!category) notFound();

  if (category.isPremiumOnly) {
    if (!session) redirect(`/auth/signin?callbackUrl=/forum/${params.slug}`);
    if (!session.user.hasForumAccess && session.user.role !== "ADMIN") {
      return (
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="text-4xl mb-4">💀</div>
          <h1 className="font-display text-3xl font-bold text-bone-100 mb-3">Premium Access Required</h1>
          <p className="text-bone-400 mb-6">
            The Exclusive Sales Lounge is for Forum Elite members only.
            Where the real whales hunt.
          </p>
          <Link href="/pricing" className="btn-brass">Upgrade — $7/month</Link>
        </div>
      );
    }
  }

  const posts = await prisma.forumPost.findMany({
    where: { categoryId: category.id },
    include: {
      author: { select: { name: true, image: true, isPremiumSeller: true } },
      _count: { select: { replies: true } },
    },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    take: 50,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-bone-500 text-sm mb-2">
            <Link href="/forum" className="hover:text-bone-300 transition-colors">Forum</Link>
            <span>/</span>
            <span className="text-bone-300">{category.name}</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-bone-100 flex items-center gap-2">
            <span className="text-2xl">{category.icon as string}</span>
            {category.name}
            {category.isPremiumOnly && <span className="badge-brass text-xs">⚜ Premium</span>}
          </h1>
          <p className="text-bone-500 text-sm mt-1">{category.description}</p>
        </div>
        {session && (
          <Link href={`/forum/${params.slug}/new`} className="btn-primary text-sm flex items-center gap-2 shrink-0">
            <Plus className="w-4 h-4" />
            New Post
          </Link>
        )}
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-16 card">
          <MessageSquare className="w-12 h-12 text-void-600 mx-auto mb-3" />
          <p className="text-bone-400">No posts yet. Start the conversation.</p>
          {session && (
            <Link href={`/forum/${params.slug}/new`} className="btn-primary text-sm mt-4 inline-block">
              Create First Post
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          {posts.map((post) => (
            <Link key={post.id} href={`/forum/${params.slug}/${post.id}`}>
              <div className="card-hover p-4 flex items-center gap-4 group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {post.isPinned && <Pin className="w-3.5 h-3.5 text-brass-600 shrink-0" />}
                    {post.isLocked && <Lock className="w-3.5 h-3.5 text-blood-600 shrink-0" />}
                    <h3 className="text-bone-200 font-medium group-hover:text-bone-100 transition-colors truncate">
                      {post.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-bone-600">
                    <span>{post.author.name}</span>
                    {post.author.isPremiumSeller && <span className="text-brass-700">⚜</span>}
                    <span>·</span>
                    <span>{timeAgo(post.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-bone-500 text-sm shrink-0">
                  <MessageSquare className="w-4 h-4" />
                  <span>{post._count.replies}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
