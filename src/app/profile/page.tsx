"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { User, MapPin, FileText } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({ name: "", bio: "", location: "" });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin?callbackUrl=/profile");
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetch(`/api/profile`)
        .then((r) => r.json())
        .then((data) => {
          setForm({
            name: data.name ?? session.user.name ?? "",
            bio: data.bio ?? "",
            location: data.location ?? "",
          });
        })
        .catch(() => {
          setForm({ name: session.user.name ?? "", bio: "", location: "" });
        });
    }
  }, [session]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save");
      }
      await update();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-[50vh]"><div className="text-bone-500">Loading...</div></div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <p className="text-blood-500 text-sm font-semibold uppercase tracking-widest mb-1">Identity</p>
        <h1 className="font-display text-4xl font-black text-bone-100">My Profile</h1>
      </div>

      <div className="card p-6 mb-6 flex items-center gap-4">
        {session?.user?.image ? (
          <Image src={session.user.image} alt="" width={64} height={64} className="rounded-full border border-void-600" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-blood-900 border border-blood-800 flex items-center justify-center text-blood-400 text-2xl font-bold">
            {session?.user?.name?.[0] ?? "?"}
          </div>
        )}
        <div>
          <p className="text-bone-200 font-semibold">{session?.user?.name}</p>
          <p className="text-bone-500 text-sm">{session?.user?.email}</p>
          <div className="flex gap-2 mt-1">
            {session?.user?.isPremiumSeller && <span className="badge-brass text-xs">⚜ Premium Seller</span>}
            {session?.user?.hasForumAccess && <span className="badge-brass text-xs">💀 Forum Elite</span>}
            {session?.user?.role === "ADMIN" && <span className="badge-blood text-xs">☠ Game Master</span>}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-blood-900/50 border border-blood-700 rounded-sm p-3 text-blood-300 text-sm mb-6">{error}</div>
      )}
      {saved && (
        <div className="bg-green-900/50 border border-green-700 rounded-sm p-3 text-green-300 text-sm mb-6">Profile saved.</div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="label flex items-center gap-2"><User className="w-4 h-4" />Display Name *</label>
          <input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            required
            maxLength={100}
            className="input"
          />
        </div>
        <div>
          <label className="label flex items-center gap-2"><MapPin className="w-4 h-4" />Location</label>
          <input
            value={form.location}
            onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
            maxLength={100}
            placeholder="e.g. London, UK"
            className="input"
          />
        </div>
        <div>
          <label className="label flex items-center gap-2"><FileText className="w-4 h-4" />Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
            rows={4}
            maxLength={500}
            placeholder="Tell the arena who you are..."
            className="input resize-none"
          />
          <p className="text-bone-600 text-xs mt-1">{form.bio.length}/500</p>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
            {loading ? "Saving..." : "Save Profile"}
          </button>
          <Link href="/dashboard" className="btn-secondary">Dashboard</Link>
        </div>
      </form>
    </div>
  );
}
