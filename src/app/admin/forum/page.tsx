export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Pin, Lock, MessageSquare } from "lucide-react";
import { timeAgo } from "@/lib/utils";

export default async function AdminForumPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const posts = await prisma.forumPost.findMany({
    include: {
      author: { select: { name: true } },
      category: { select: { name: true, slug: true } },
      _count: { select: { replies: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-bone-500 hover:text-bone-300 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display text-3xl font-bold text-bone-100">Forum Moderation</h1>
          <p className="text-bone-500 text-sm">{posts.length} posts</p>
        </div>
      </div>

      <div className="space-y-1">
        {posts.length === 0 ? (
          <div className="card p-10 text-center text-bone-500">No forum posts yet.</div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="card p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  {post.isPinned && <Pin className="w-3.5 h-3.5 text-brass-600 shrink-0" />}
                  {post.isLocked && <Lock className="w-3.5 h-3.5 text-blood-600 shrink-0" />}
                  <Link href={`/forum/${post.category.slug}/${post.id}`} className="text-bone-200 font-medium hover:text-bone-100 transition-colors truncate">
                    {post.title}
                  </Link>
                  <span className="badge-void text-xs shrink-0">{post.category.name}</span>
                </div>
                <div className="text-bone-500 text-xs">
                  {post.author.name} · {timeAgo(post.createdAt)}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-bone-500 text-sm shrink-0">
                <MessageSquare className="w-4 h-4" />
                {post._count.replies}
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Link href={`/admin/forum/${post.id}/pin`} className="btn-secondary text-xs py-1 px-2">
                  {post.isPinned ? "Unpin" : "Pin"}
                </Link>
                <Link href={`/admin/forum/${post.id}/lock`} className="btn-secondary text-xs py-1 px-2">
                  {post.isLocked ? "Unlock" : "Lock"}
                </Link>
                <Link href={`/admin/forum/${post.id}/delete`} className="text-xs py-1 px-2 text-blood-500 hover:text-blood-400 border border-blood-900 hover:border-blood-700 rounded-sm transition-colors">
                  Delete
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
