"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GAME_SYSTEMS, FACTIONS_40K } from "@/lib/constants";

export function WtbForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    gameSystem: "",
    faction: "",
    maxBudget: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.gameSystem) {
      setError("Title and game system are required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/wtb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          maxBudget: form.maxBudget ? Number(form.maxBudget) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to post");
        return;
      }
      router.push("/wtb");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5">
      {error && (
        <div className="bg-blood-950 border border-blood-800 text-blood-400 text-sm p-3 rounded-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-bone-300 text-sm font-medium mb-1.5">
          What are you looking for? <span className="text-blood-500">*</span>
        </label>
        <input
          type="text"
          value={form.title}
          onChange={set("title")}
          maxLength={120}
          placeholder="e.g. Space Marines 2000pt painted army"
          className="input-field w-full"
          required
        />
        <p className="text-bone-600 text-xs mt-1">{form.title.length}/120</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-bone-300 text-sm font-medium mb-1.5">
            Game System <span className="text-blood-500">*</span>
          </label>
          <select value={form.gameSystem} onChange={set("gameSystem")} className="input-field w-full" required>
            <option value="">Select system…</option>
            {GAME_SYSTEMS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-bone-300 text-sm font-medium mb-1.5">Faction</label>
          {form.gameSystem === "Warhammer 40,000" ? (
            <select value={form.faction} onChange={set("faction")} className="input-field w-full">
              <option value="">Any faction</option>
              {FACTIONS_40K.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={form.faction}
              onChange={set("faction")}
              placeholder="Any faction"
              className="input-field w-full"
            />
          )}
        </div>
      </div>

      <div>
        <label className="block text-bone-300 text-sm font-medium mb-1.5">Max Budget (optional)</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-bone-500 text-sm">$</span>
          <input
            type="number"
            value={form.maxBudget}
            onChange={set("maxBudget")}
            min="0"
            step="1"
            placeholder="0"
            className="input-field w-full pl-7"
          />
        </div>
      </div>

      <div>
        <label className="block text-bone-300 text-sm font-medium mb-1.5">Details (optional)</label>
        <textarea
          value={form.description}
          onChange={set("description")}
          maxLength={500}
          rows={3}
          placeholder="Condition requirements, specific models, timeline, etc."
          className="input-field w-full resize-none"
        />
        <p className="text-bone-600 text-xs mt-1">{form.description.length}/500</p>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
        {loading ? "Posting…" : "Post WTB"}
      </button>
    </form>
  );
}
