"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

interface Props {
  gameSystems: string[];
  conditions: string[];
  currentParams: Record<string, string | undefined>;
}

export function MarketplaceFilters({ gameSystems, conditions, currentParams }: Props) {
  const router = useRouter();
  const [q, setQ] = useState(currentParams.q ?? "");

  function applyFilter(key: string, value: string) {
    const params = new URLSearchParams();
    Object.entries(currentParams).forEach(([k, v]) => {
      if (v && k !== key && k !== "page") params.set(k, v);
    });
    if (value) params.set(key, value);
    router.push(`/marketplace?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    applyFilter("q", q);
  }

  function clearAll() {
    setQ("");
    router.push("/marketplace");
  }

  const hasFilters = Object.values(currentParams).some(Boolean);

  return (
    <div className="space-y-5">
      {/* Search */}
      <form onSubmit={handleSearch}>
        <label className="label">Search</label>
        <div className="relative">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Army, faction, system..."
            className="input pr-10 text-sm"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-bone-500 hover:text-bone-300">
            <Search className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Sort */}
      <div>
        <label className="label flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Sort By
        </label>
        <select
          value={currentParams.sort ?? "recent"}
          onChange={(e) => applyFilter("sort", e.target.value)}
          className="input text-sm"
        >
          <option value="recent">Most Recent</option>
          <option value="views">Most Viewed</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {/* Game System */}
      <div>
        <label className="label">Game System</label>
        <select
          value={currentParams.system ?? ""}
          onChange={(e) => applyFilter("system", e.target.value)}
          className="input text-sm"
        >
          <option value="">All Systems</option>
          {gameSystems.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Condition */}
      <div>
        <label className="label">Condition</label>
        <select
          value={currentParams.condition ?? ""}
          onChange={(e) => applyFilter("condition", e.target.value)}
          className="input text-sm"
        >
          <option value="">All Conditions</option>
          {conditions.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Price range */}
      <div>
        <label className="label">Price Range ($)</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={currentParams.minPrice ?? ""}
            onChange={(e) => applyFilter("minPrice", e.target.value)}
            className="input text-sm"
          />
          <input
            type="number"
            placeholder="Max"
            value={currentParams.maxPrice ?? ""}
            onChange={(e) => applyFilter("maxPrice", e.target.value)}
            className="input text-sm"
          />
        </div>
      </div>

      {hasFilters && (
        <button onClick={clearAll} className="text-blood-500 hover:text-blood-400 text-sm transition-colors">
          × Clear all filters
        </button>
      )}
    </div>
  );
}
