export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Zap } from "lucide-react";
import { GAME_SYSTEMS } from "@/lib/constants";
import { WtbDeleteButton } from "@/components/wtb/WtbDeleteButton";
import { WtbBumpButton } from "@/components/wtb/WtbBumpButton";
import { formatListingPrice, timeAgo } from "@/lib/utils";

async function getWtbPosts(gameSystem?: string) {
  return prisma.wantToBuy.findMany({
    where: {
      isActive: true,
      ...(gameSystem ? { gameSystem } : {}),
    },
    include: {
      user: { select: { id: true, name: true, image: true, isPremiumSeller: true } },
    },
    orderBy: [{ isBumped: "desc" }, { createdAt: "desc" }],
    take: 60,
  });
}

export default async function WtbPage({
  searchParams,
}: {
  searchParams: { gameSystem?: string; bumped?: string };
}) {
  const session = await getServerSession(authOptions);
  const posts = await getWtbPosts(searchParams.gameSystem);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-blood-500 text-sm font-semibold uppercase tracking-widest mb-1">Buyers Seeking Armies</p>
          <h1 className="font-display text-4xl font-black text-bone-100">WTB Board</h1>
          <p className="text-bone-500 text-sm mt-1">Sellers — match a post and make the sale.</p>
        </div>
        {session && (
          <Link href="/wtb/new" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Post WTB
          </Link>
        )}
      </div>

      {searchParams.bumped && (
        <div className="card border-brass-700 bg-brass-950/30 p-4 mb-6 text-brass-400 text-sm">
          ⚡ Your WTB post is now bumped to the top for 7 days.
        </div>
      )}

      <div className="flex gap-2 mb-6 flex-wrap">
        <Link
          href="/wtb"
          className={`badge text-xs py-1.5 px-3 transition-colors ${!searchParams.gameSystem ? "badge-blood" : "badge-void hover:border-blood-700"}`}
        >
          All Systems
        </Link>
        {GAME_SYSTEMS.slice(0, 8).map((sys) => (
          <Link
            key={sys}
            href={`/wtb?gameSystem=${encodeURIComponent(sys)}`}
            className={`badge text-xs py-1.5 px-3 transition-colors ${
              searchParams.gameSystem === sys ? "badge-blood" : "badge-void hover:border-blood-700"
            }`}
          >
            {sys.replace("Warhammer ", "WH ")}
          </Link>
        ))}
      </div>

      {posts.length === 0 ? (
        <div className="card p-12 text-center">
          <Search className="w-10 h-10 text-bone-600 mx-auto mb-4" />
          <p className="text-bone-400 text-lg mb-2">No WTB posts yet.</p>
          {session ? (
            <>
              <p className="text-bone-600 text-sm mb-6">Post what you&apos;re looking for and let sellers come to you.</p>
              <Link href="/wtb/new" className="btn-primary">Post What You Want</Link>
            </>
          ) : (
            <p className="text-bone-600 text-sm">Sign in to post a WTB listing.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className={`card p-5 ${post.isBumped ? "border-brass-700 bg-brass-950/20" : ""}`}
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  {post.user.image ? (
                    <Image
                      src={post.user.image}
                      alt={post.user.name ?? "User"}
                      width={40}
                      height={40}
                      className="rounded-full border border-void-600"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blood-900 border border-blood-700 flex items-center justify-center text-blood-300 font-bold">
                      {post.user.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {post.isBumped && (
                          <span className="badge-brass flex items-center gap-1 text-xs">
                            <Zap className="w-3 h-3" />
                            Pinned
                          </span>
                        )}
                        <h3 className="text-bone-100 font-semibold">{post.title}</h3>
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="badge-void text-xs">{post.gameSystem.replace("Warhammer ", "WH ")}</span>
                        {post.faction && <span className="badge-void text-xs">{post.faction}</span>}
                        {post.maxBudget && (
                          <span className="text-brass-400 text-xs font-semibold">
                            Budget: up to {formatListingPrice(post.maxBudget)}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-bone-600 text-xs shrink-0">{timeAgo(post.createdAt)}</span>
                  </div>

                  {post.description && (
                    <p className="text-bone-400 text-sm mt-2 line-clamp-2">{post.description}</p>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-bone-500 text-xs">by</span>
                      <span className="text-bone-300 text-xs font-medium">{post.user.name ?? "Anonymous"}</span>
                      {post.user.isPremiumSeller && <span className="text-brass-600 text-xs">⚜</span>}
                    </div>

                    <div className="flex items-center gap-2">
                      {session?.user.id === post.user.id && (
                        <>
                          {!post.isBumped && <WtbBumpButton wtbId={post.id} />}
                          <WtbDeleteButton postId={post.id} />
                        </>
                      )}
                      <Link
                        href={`/marketplace?gameSystem=${encodeURIComponent(post.gameSystem)}${post.faction ? `&faction=${encodeURIComponent(post.faction)}` : ""}`}
                        className="btn-primary text-xs py-1.5 px-3"
                      >
                        Find Match →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!session && (
        <div className="card border-blood-800 p-6 text-center mt-8">
          <p className="text-bone-300 font-semibold mb-2">Looking for a specific army?</p>
          <p className="text-bone-500 text-sm mb-4">Post your WTB and let sellers find you.</p>
          <Link href="/auth/signin" className="btn-primary">Sign In to Post</Link>
        </div>
      )}
    </div>
  );
}
