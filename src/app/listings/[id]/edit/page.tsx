"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Upload, X, Plus, Trash2 } from "lucide-react";
import { GAME_SYSTEMS, FACTIONS_40K, CONDITIONS } from "@/lib/constants";
import { calculateCommission, formatListingPrice } from "@/lib/utils";

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    gameSystem: "",
    faction: "",
    condition: "",
    pointsValue: "",
    allowOffers: true,
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
  }, [status, router]);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/listings/${params.id}`)
      .then((r) => r.json())
      .then((listing) => {
        setForm({
          title: listing.title ?? "",
          description: listing.description ?? "",
          price: listing.price?.toString() ?? "",
          gameSystem: listing.gameSystem ?? "",
          faction: listing.faction ?? "",
          condition: listing.condition ?? "",
          pointsValue: listing.pointsValue?.toString() ?? "",
          allowOffers: listing.allowOffers ?? true,
        });
        try {
          setImages(JSON.parse(listing.images ?? "[]"));
        } catch {
          setImages([]);
        }
        setFetching(false);
      })
      .catch(() => {
        setError("Could not load listing.");
        setFetching(false);
      });
  }, [params.id]);

  const price = Number(form.price) || 0;
  const { commission, sellerPayout } = calculateCommission(price);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data.url) setImages((prev) => [...prev, data.url]);
      } catch {
        setError("Image upload failed.");
      }
    }
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (images.length === 0) { setError("At least one image required."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/listings/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: Number(form.price), pointsValue: form.pointsValue ? Number(form.pointsValue) : null, images }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to update");
      }
      router.push(`/listings/${params.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Archive this listing? It won't be visible in the marketplace.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/listings/${params.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      router.push("/dashboard");
    } catch {
      setError("Failed to archive listing.");
    } finally {
      setDeleting(false);
    }
  }

  if (status === "loading" || fetching) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-bone-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-blood-500 text-sm font-semibold uppercase tracking-widest mb-1">Edit</p>
          <h1 className="font-display text-4xl font-black text-bone-100">Update Listing</h1>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-2 text-blood-500 hover:text-blood-400 text-sm transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          Archive
        </button>
      </div>

      {error && (
        <div className="bg-blood-900/50 border border-blood-700 rounded-sm p-3 text-blood-300 text-sm mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="label">Listing Title *</label>
          <input name="title" value={form.title} onChange={handleChange} required placeholder="e.g. 2,000pt Chaos Space Marines" className="input" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Game System *</label>
            <select name="gameSystem" value={form.gameSystem} onChange={handleChange} required className="input">
              <option value="">Select system...</option>
              {GAME_SYSTEMS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Faction</label>
            {form.gameSystem === "Warhammer 40,000" ? (
              <select name="faction" value={form.faction} onChange={handleChange} className="input">
                <option value="">Select faction...</option>
                {FACTIONS_40K.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            ) : (
              <input name="faction" value={form.faction} onChange={handleChange} placeholder="Army / faction name" className="input" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Condition *</label>
            <select name="condition" value={form.condition} onChange={handleChange} required className="input">
              <option value="">Select condition...</option>
              {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Points Value (optional)</label>
            <input name="pointsValue" type="number" value={form.pointsValue} onChange={handleChange} placeholder="e.g. 2000" className="input" />
          </div>
        </div>

        <div>
          <label className="label">Asking Price ($) *</label>
          <input name="price" type="number" min="1" step="0.01" value={form.price} onChange={handleChange} required className="input" />
          {price > 0 && (
            <p className="text-bone-500 text-xs mt-1.5">
              Platform fee (12%): <span className="text-blood-400">{formatListingPrice(commission)}</span>
              {" "}· Your payout: <span className="text-bone-200 font-medium">{formatListingPrice(sellerPayout)}</span>
            </p>
          )}
        </div>

        <div>
          <label className="label">Description *</label>
          <textarea name="description" value={form.description} onChange={handleChange} required rows={6} className="input resize-none" />
        </div>

        <div>
          <label className="label">Photos * (min 1, max 10)</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square bg-void-700 rounded-sm overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 bg-void-900/80 text-blood-400 hover:text-blood-300 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {images.length < 10 && (
              <label className="aspect-square bg-void-700 border-2 border-dashed border-void-600 rounded-sm flex flex-col items-center justify-center cursor-pointer hover:border-void-500 transition-colors">
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                {uploading ? <div className="text-bone-500 text-xs">Uploading...</div> : (
                  <>
                    <Plus className="w-6 h-6 text-bone-600 mb-1" />
                    <span className="text-bone-600 text-xs">Add Photo</span>
                  </>
                )}
              </label>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" id="allowOffers" name="allowOffers" checked={form.allowOffers} onChange={handleChange} className="w-4 h-4 accent-blood-600" />
          <label htmlFor="allowOffers" className="text-bone-300 text-sm cursor-pointer">Accept offers from buyers</label>
        </div>

        <div className="pt-2">
          <button type="submit" disabled={loading} className="btn-primary w-full text-base py-4 disabled:opacity-50">
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
