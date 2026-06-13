import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

interface Props {
  placement: "forum" | "marketplace" | "homepage" | "sidebar";
  className?: string;
}

export async function AdBanner({ placement, className = "" }: Props) {
  const now = new Date();

  const ads = await prisma.adSlot.findMany({
    where: {
      placement,
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
    take: 1,
  });

  if (ads.length === 0) return null;

  const ad = ads[0];

  return (
    <a
      href={ad.linkUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`block relative rounded-sm overflow-hidden border border-brass-900/40 hover:border-brass-700 transition-colors group ${className}`}
    >
      <div className="relative w-full h-20 sm:h-24 bg-void-800">
        <Image
          src={ad.imageUrl}
          alt={`${ad.company} — sponsored`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 728px"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-void-900/30 to-transparent" />
        <div className="absolute bottom-2 right-2 flex items-center gap-1 text-bone-500 text-xs opacity-60">
          <ExternalLink className="w-3 h-3" />
          Sponsored
        </div>
      </div>
    </a>
  );
}
