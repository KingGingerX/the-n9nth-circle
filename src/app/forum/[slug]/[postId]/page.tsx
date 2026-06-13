"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Pin, Lock, MessageSquare, ArrowLeft } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { FORUM_CATEGORIES } from "@/lib/constants";

interface Reply {
  id: string;
  content: string;
  createdAt: string;
  author: { name: string | null; image: string | null; isPremiumSeller: boolean };
}

interface Post {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  isLocked: boolean;
  views: number;
  createdAt: string;
  author: { name: string | null; image: string | null; isPremiumSeller: boolean };
  replies: Reply[];
  category: { name: string; slug: string; isPremiumOnly: boolean };
}

export default function ForumPostPage() {
  const params = useParams<{ slug: string; postId: string }>();
  const { data: session } = useSession();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [posting, setPosting] = useState(false);
  const [replyError, setReplyError] = useState("");
  const repliesEndRef = useRef<HTMLDivElement>(null);

  const category = FORUM_CATEGORIES.find((c) => c.slug === params.slug);

  useEffect(() => {
    fetch(`/api/forum/posts/${params.postId}`)
      .then((r) => r.json())
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.postId]);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    setPosting(true);
    setReplyError("");
    try {
      const res = await fetch(`/api/forum/posts/${params.postId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: reply }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to post reply");
      }
      const newReply = await res.json();
      setPost((prev) => prev ? { ...prev, replies: [...prev.replies, newReply] } : prev);
      setReply("");
      setTimeout(() => repliesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err: any) {
      setReplyError(err.message);
    } finally {
      setPosting(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><div className="text-bone-500">Loading...</div></div>;
  }

  if (!post || (post as any).error) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-blood-400">Post not found.</p>
        <Link href="/forum" className="btn-secondary text-sm mt-4 inline-block">Back to Forum</Link>
      </div>
    );
  }

  const canReply = session && !post.isLocked && (!post.category.isPremiumOnly || session.user.hasForumAccess || session.user.role === "ADMIN");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-bone-500 text-sm mb-6">
        <Link href="/forum" className="hover:text-bone-300 transition-colors">Forum</Link>
        <span>/</span>
        <Link href={`/forum/${params.slug}`} className="hover:text-bone-300 transition-colors">{category?.name ?? params.slug}</Link>
      </div>

      {/* Post */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-2 mb-3">
          {post.isPinned && <Pin className="w-4 h-4 text-brass-600" />}
          {post.isLocked && <Lock className="w-4 h-4 text-blood-600" />}
          <h1 className="font-display text-2xl font-bold text-bone-100 leading-tight">{post.title}</h1>
        </div>

        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-void-700">
          {post.author.image ? (
            <Image src={post.author.image} alt="" width={36} height={36} className="rounded-full border border-void-600" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-blood-900 border border-blood-800 flex items-center justify-center text-blood-400 text-sm font-bold">
              {post.author.name?.[0] ?? "?"}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-bone-200 text-sm font-medium">{post.author.name}</span>
              {post.author.isPremiumSeller && <span className="badge-brass text-xs">⚜</span>}
            </div>
            <span className="text-bone-500 text-xs">{timeAgo(post.createdAt)}</span>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-bone-500 text-xs">
            <MessageSquare className="w-3.5 h-3.5" />
            {post.replies.length} replies
          </div>
        </div>

        <p className="text-bone-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Replies */}
      {post.replies.length > 0 && (
        <div className="space-y-3 mb-6">
          {post.replies.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                {r.author.image ? (
                  <Image src={r.author.image} alt="" width={32} height={32} className="rounded-full border border-void-600" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blood-900 border border-blood-800 flex items-center justify-center text-blood-400 text-xs font-bold">
                    {r.author.name?.[0] ?? "?"}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-bone-200 text-sm font-medium">{r.author.name}</span>
                    {r.author.isPremiumSeller && <span className="badge-brass text-xs">⚜</span>}
                  </div>
                  <span className="text-bone-500 text-xs">{timeAgo(r.createdAt)}</span>
                </div>
              </div>
              <p className="text-bone-300 text-sm leading-relaxed whitespace-pre-wrap">{r.content}</p>
            </div>
          ))}
          <div ref={repliesEndRef} />
        </div>
      )}

      {/* Reply form */}
      {canReply ? (
        <form onSubmit={handleReply} className="card p-5">
          <h3 className="font-display text-bone-200 font-semibold uppercase tracking-wider text-xs mb-3">Leave a Reply</h3>
          {replyError && (
            <div className="bg-blood-900/50 border border-blood-700 rounded-sm p-2 text-blood-300 text-xs mb-3">{replyError}</div>
          )}
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={4}
            placeholder="Write your reply..."
            className="input resize-none mb-3"
            required
          />
          <button type="submit" disabled={posting || !reply.trim()} className="btn-primary text-sm disabled:opacity-50">
            {posting ? "Posting..." : "Post Reply"}
          </button>
        </form>
      ) : post.isLocked ? (
        <div className="card p-4 text-center text-bone-500 text-sm flex items-center justify-center gap-2">
          <Lock className="w-4 h-4" />
          This thread is locked.
        </div>
      ) : !session ? (
        <div className="card p-4 text-center">
          <p className="text-bone-400 text-sm mb-3">Sign in to join the discussion.</p>
          <Link href={`/auth/signin?callbackUrl=/forum/${params.slug}/${params.postId}`} className="btn-primary text-sm">Sign In</Link>
        </div>
      ) : (
        <div className="card p-4 text-center">
          <p className="text-bone-400 text-sm mb-3">Forum Elite access required to reply here.</p>
          <Link href="/pricing" className="btn-brass text-sm">Upgrade — $7/month</Link>
        </div>
      )}
    </div>
  );
}
