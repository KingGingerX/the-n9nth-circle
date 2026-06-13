"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function WtbDeleteButton({ postId }: { postId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Delete this WTB post?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/wtb/${postId}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="btn-secondary text-xs py-1.5 px-2 text-blood-400 hover:text-blood-300 hover:border-blood-700 disabled:opacity-50"
      aria-label="Delete WTB post"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}
