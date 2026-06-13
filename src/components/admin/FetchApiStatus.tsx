"use client";

import { useState } from "react";
import { Key, RefreshCw, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";

const API_LABELS: Record<string, string> = {
  "stripe-secret": "Stripe Secret",
  "stripe-publishable": "Stripe Publishable",
  "stripe-webhook": "Stripe Webhook",
  "cloudinary": "Cloudinary",
  "resend": "Resend Email",
  "google-oauth": "Google OAuth",
  "github-oauth": "GitHub OAuth",
  "discord-oauth": "Discord OAuth",
  "nextauth-secret": "NextAuth Secret",
  "cron-secret": "Cron Secret",
};

type Status = "approved" | "pending" | "rejected" | "unreachable" | "error";

function StatusIcon({ status }: { status: Status }) {
  switch (status) {
    case "approved":
      return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    case "pending":
      return <Clock className="w-4 h-4 text-brass-500" />;
    case "rejected":
      return <XCircle className="w-4 h-4 text-blood-500" />;
    case "unreachable":
      return <AlertCircle className="w-4 h-4 text-bone-500" />;
    default:
      return <XCircle className="w-4 h-4 text-bone-600" />;
  }
}

function statusLabel(status: Status): string {
  switch (status) {
    case "approved": return "Active";
    case "pending": return "Pending";
    case "rejected": return "Rejected";
    case "unreachable": return "Unreachable";
    default: return "Error";
  }
}

function statusColor(status: Status): string {
  switch (status) {
    case "approved": return "text-emerald-400";
    case "pending": return "text-brass-400";
    case "rejected": return "text-blood-400";
    default: return "text-bone-500";
  }
}

export default function FetchApiStatus() {
  const [results, setResults] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  async function checkStatus() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/keys", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        setResults({ error: data.error ?? "Failed" } as Record<string, Status>);
      } else {
        const data = await res.json();
        setResults(data.results as Record<string, string>);
        setLastChecked(new Date());
      }
    } catch {
      setResults({ error: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  const apiNames = Object.keys(API_LABELS);
  const approvedCount = results && !results["error"]
    ? apiNames.filter((k) => results[k] === "approved").length
    : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-brass-500" />
          <h2 className="font-display text-bone-200 font-semibold uppercase tracking-wider text-sm">
            FetchAPI Key Status
          </h2>
          {approvedCount !== null && (
            <span className="bg-abyss-800 text-bone-400 text-xs px-2 py-0.5 rounded-full border border-abyss-700">
              {approvedCount}/{apiNames.length} active
            </span>
          )}
        </div>
        <button
          onClick={checkStatus}
          disabled={loading}
          className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Checking…" : "Check Status"}
        </button>
      </div>

      {!results && !loading && (
        <div className="card p-6 text-center text-bone-500 text-sm">
          Click &quot;Check Status&quot; to ping FetchAPI for all keys
        </div>
      )}

      {results && (results as Record<string, string>).error && (
        <div className="card p-4 border border-blood-900 text-blood-400 text-sm">
          {(results as Record<string, string>).error}
        </div>
      )}

      {results && !(results as Record<string, string>).error && (
        <div className="card overflow-hidden">
          <div className="divide-y divide-abyss-800">
            {apiNames.map((name) => {
              const status = ((results[name] ?? "error") as Status);
              return (
                <div key={name} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-bone-300 text-sm">{API_LABELS[name]}</span>
                  <div className="flex items-center gap-1.5">
                    <StatusIcon status={status} />
                    <span className={`text-xs font-medium ${statusColor(status)}`}>
                      {statusLabel(status)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {lastChecked && (
        <p className="text-bone-600 text-xs mt-2">
          Last checked: {lastChecked.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
