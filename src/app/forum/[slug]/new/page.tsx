"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FORUM_CATEGORIES } from "@/lib/constants";

export default function NewForumPostPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();

  const category = FORUM_CATEGORIES.find((c) => c.slug === params.slug);

  const [form, setForm] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push(`/auth/signin?callbackUrl=/forum/${params.slug}/new`);
  }, [status, router, params.slug]);

  if (!category) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-blood-400">Category not found.</p>
        <Link href="/forum" className="btn-secondary text-sm mt-4 inline-block">Back to Forum</Link>
      </div>
    );
  }

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-[50vh]"><div className="text-bone-500">Loading...</div></div>;
  }

  if (category.isPremiumOnly && !session?.user?.hasForumAccess && session?.user?.role !== "ADMIN") {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="text-4xl mb-4">💀</div>
        <h1 className="font-display text-3xl font-bold text-bone-100 mb-3">Premium Access Required</h1>
        <p className="text-bone-400 mb-6">Upgrade to Forum Elite to post in the Exclusive Sales Lounge.</p>
        <Link href="/pricing" className="btn-brass">Upgrade — $7/month</Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setError("Title and content required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/forum/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, content: form.content, categorySlug: params.slug }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create post");
      }
      const post = await res.json();
      router.push(`/forum/${params.slug}/${post.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-2 text-bone-500 text-sm mb-6">
        <Link href="/forum" className="hover:text-bone-300 transition-colors">Forum</Link>
        <span>/</span>
        <Link href={`/forum/${params.slug}`} className="hover:text-bone-300 transition-colors">{category.name}</Link>
        <span>/</span>
        <span className="text-bone-300">New Post</span>
      </div>

      <h1 className="font-display text-3xl font-black text-bone-100 mb-8">New Post</h1>

      {error && (
        <div className="bg-blood-900/50 border border-blood-700 rounded-sm p-3 text-blood-300 text-sm mb-6">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">Title *</label>
          <input
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            required
            maxLength={300}
            placeholder="What are you posting about?"
            className="input"
          />
        </div>
        <div>
          <label className="label">Content *</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
            required
            rows={10}
            placeholder="Write your post..."
            className="input resize-y"
          />
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
            {loading ? "Posting..." : "Publish Post"}
          </button>
          <Link href={`/forum/${params.slug}`} className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
