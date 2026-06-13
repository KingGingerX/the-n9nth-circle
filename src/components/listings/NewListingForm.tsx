"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Plus } from "lucide-react";
import { GAME_SYSTEMS, FACTIONS_40K, CONDITIONS } from "@/lib/constants";
import { calculateCommission, formatListingPrice } from "@/lib/utils";

export function NewListingForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

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
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.url) setImages((prev) => [...prev, data.url]);
      } catch {
        setError("Image upload failed. Check Cloudinary config.");
      }
    }
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (images.length === 0) {
      setError("At least one image required.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: Number(form.price), pointsValue: form.pointsValue ? Number(form.pointsValue) : null, images }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create listing");
      }

      const listing = await res.json();
      router.push(`/listings/${listing.id}?new=1`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-blood-900/50 border border-blood-700 rounded-sm p-3 text-blood-300 text-sm">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="label">Listing Title *</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          placeholder="e.g. 2,000pt Chaos Space Marines — Pro Painted Death Guard"
          className="input"
        />
      </div>

      {/* Game System + Faction */}
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
            <input
              name="faction"
              value={form.faction}
              onChange={handleChange}
              placeholder="Army / faction name"
              className="input"
            />
          )}
        </div>
      </div>

      {/* Condition + Points */}
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
          <input
            name="pointsValue"
            type="number"
            value={form.pointsValue}
            onChange={handleChange}
            placeholder="e.g. 2000"
            className="input"
          />
        </div>
      </div>

      {/* Price */}
      <div>
        <label className="label">Asking Price ($) *</label>
        <input
          name="price"
          type="number"
          min="1"
          step="0.01"
          value={form.price}
          onChange={handleChange}
          required
          placeholder="e.g. 450"
          className="input"
        />
        {price > 0 && (
          <p className="text-bone-500 text-xs mt-1.5">
            Platform fee (12%): <span className="text-blood-400">{formatListingPrice(commission)}</span>
            {" "}· Your payout: <span className="text-bone-200 font-medium">{formatListingPrice(sellerPayout)}</span>
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="label">Description *</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          rows={6}
          placeholder="Describe what's included, paint quality, any damage, what you're including, shipping details..."
          className="input resize-none"
        />
      </div>

      {/* Images */}
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
              {uploading ? (
                <div className="text-bone-500 text-xs">Uploading...</div>
              ) : (
                <>
                  <Plus className="w-6 h-6 text-bone-600 mb-1" />
                  <span className="text-bone-600 text-xs">Add Photo</span>
                </>
              )}
            </label>
          )}
        </div>
        {images.length === 0 && (
          <p className="text-bone-600 text-xs">
            Images are uploaded to Cloudinary. Configure CLOUDINARY_* env vars to enable.
          </p>
        )}
      </div>

      {/* Allow offers */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="allowOffers"
          name="allowOffers"
          checked={form.allowOffers}
          onChange={handleChange}
          className="w-4 h-4 accent-blood-600"
        />
        <label htmlFor="allowOffers" className="text-bone-300 text-sm cursor-pointer">
          Accept offers from buyers
        </label>
      </div>

      <div className="pt-2">
        <button type="submit" disabled={loading} className="btn-primary w-full text-base py-4 disabled:opacity-50">
          {loading ? "Publishing..." : "Publish Listing"}
        </button>
      </div>
    </form>
  );
}
