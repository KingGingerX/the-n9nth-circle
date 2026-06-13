import Link from "next/link";
import { FORUM_CATEGORIES } from "@/lib/constants";

export function ForumTeaser() {
  return (
    <section className="bg-void-950 border-y border-void-800 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-blood-500 text-sm font-semibold uppercase tracking-widest mb-2">War Council</p>
          <h2 className="section-title">The Forum</h2>
          <p className="text-bone-500 text-sm mt-3 max-w-xl mx-auto">
            Trade secrets, argue tactics, rate your transactions. Premium members unlock the Exclusive Sales Lounge
            where the real whales hunt.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {FORUM_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/forum/${cat.slug}`}
              className={`card-hover p-5 group ${cat.isPremiumOnly ? "border-brass-900/40" : ""}`}
            >
              <div className="text-2xl mb-3">{cat.icon}</div>
              <div className="flex items-start gap-2">
                <h3 className="text-bone-200 font-semibold text-sm group-hover:text-bone-100 transition-colors">
                  {cat.name}
                </h3>
                {cat.isPremiumOnly && (
                  <span className="badge-brass shrink-0 mt-0.5">⚜</span>
                )}
              </div>
              <p className="text-bone-500 text-xs mt-1.5 leading-relaxed">{cat.description}</p>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/forum" className="btn-secondary text-sm">
            Enter the Forum
          </Link>
        </div>
      </div>
    </section>
  );
}
