"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminAdForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    company: "",
    imageUrl: "",
    linkUrl: "",
    placement: "forum",
    startDate: "",
    endDate: "",
    amount: "299",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed");
      }
      setForm({ company: "", imageUrl: "", linkUrl: "", placement: "forum", startDate: "", endDate: "", amount: "299" });
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-4">
      {error && <div className="text-blood-400 text-sm">{error}</div>}
      <div>
        <label className="label">Company Name *</label>
        <input name="company" value={form.company} onChange={handleChange} required className="input" placeholder="e.g. Army Painter" />
      </div>
      <div>
        <label className="label">Ad Image URL *</label>
        <input name="imageUrl" value={form.imageUrl} onChange={handleChange} required className="input" placeholder="https://..." />
      </div>
      <div>
        <label className="label">Destination URL *</label>
        <input name="linkUrl" value={form.linkUrl} onChange={handleChange} required className="input" placeholder="https://..." />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Placement</label>
          <select name="placement" value={form.placement} onChange={handleChange} className="input">
            <option value="forum">Forum</option>
            <option value="marketplace">Marketplace</option>
            <option value="homepage">Homepage</option>
            <option value="sidebar">Sidebar</option>
          </select>
        </div>
        <div>
          <label className="label">Amount ($)</label>
          <input name="amount" type="number" value={form.amount} onChange={handleChange} required className="input" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Start Date *</label>
          <input name="startDate" type="date" value={form.startDate} onChange={handleChange} required className="input" />
        </div>
        <div>
          <label className="label">End Date *</label>
          <input name="endDate" type="date" value={form.endDate} onChange={handleChange} required className="input" />
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn-brass w-full disabled:opacity-50">
        {loading ? "Creating..." : "Create Ad Slot"}
      </button>
    </form>
  );
}
