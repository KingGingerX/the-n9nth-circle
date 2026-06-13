export const GAME_SYSTEMS = [
  "Warhammer 40,000",
  "Age of Sigmar",
  "Kill Team",
  "Warcry",
  "Necromunda",
  "Blood Bowl",
  "Horus Heresy",
  "The Old World",
  "Warhammer Underworlds",
  "Bolt Action",
  "Star Wars: Legion",
  "Infinity",
  "Warmachine / Hordes",
  "Kings of War",
  "Saga",
  "Other",
] as const;

export const FACTIONS_40K = [
  "Space Marines",
  "Chaos Space Marines",
  "Death Guard",
  "Thousand Sons",
  "World Eaters",
  "Emperor's Children",
  "Orks",
  "Tyranids",
  "Necrons",
  "Aeldari",
  "Drukhari",
  "Tau Empire",
  "Astra Militarum",
  "Adeptus Mechanicus",
  "Sisters of Battle",
  "Grey Knights",
  "Custodes",
  "Chaos Daemons",
  "Genestealer Cults",
  "Knights",
  "Other",
];

export const CONDITIONS = [
  "New on Sprue (NIB)",
  "New in Box (NIB)",
  "Assembled — Unprimed",
  "Assembled — Primed",
  "Partially Painted",
  "Fully Painted — Tabletop Quality",
  "Fully Painted — Display Quality",
  "Fully Painted — Competition Quality",
] as const;

export const LISTING_STATUSES = {
  ACTIVE: "ACTIVE",
  SOLD: "SOLD",
  PENDING: "PENDING",
  ARCHIVED: "ARCHIVED",
} as const;

export const HALL_STATUSES = {
  NONE: "NONE",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  IMMORTAL: "IMMORTAL",
} as const;

export const FORUM_CATEGORIES = [
  { name: "Painting & Hobby", slug: "painting-hobby", icon: "🎨", isPremiumOnly: false, description: "Techniques, WIP, tips, tutorials" },
  { name: "Tactics & List Building", slug: "tactics-lists", icon: "⚔️", isPremiumOnly: false, description: "Army lists, meta discussion, strategy" },
  { name: "Buy/Sell Feedback", slug: "feedback", icon: "⭐", isPremiumOnly: false, description: "Rate your transactions, seller/buyer reviews" },
  { name: "Exclusive Sales Lounge", slug: "exclusive-sales", icon: "💀", isPremiumOnly: true, description: "First access to rare listings — premium members only" },
  { name: "Off-Topic Degeneracy", slug: "off-topic", icon: "🍺", isPremiumOnly: false, description: "Everything else. Keep it civil-ish." },
] as const;
