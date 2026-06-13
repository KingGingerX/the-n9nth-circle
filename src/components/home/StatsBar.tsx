interface Props {
  totalListings: number;
  totalUsers: number;
}

export function StatsBar({ totalListings, totalUsers }: Props) {
  return (
    <div className="bg-void-800 border-y border-void-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-void-700">
          {[
            { value: totalListings.toString(), label: "Active Listings" },
            { value: totalUsers.toString(), label: "Warriors Registered" },
            { value: "12%", label: "Platform Commission" },
            { value: "$0", label: "To Start Selling" },
          ].map((stat) => (
            <div key={stat.label} className="px-6 py-5 text-center">
              <div className="font-display text-2xl font-bold text-brass-400">{stat.value}</div>
              <div className="text-bone-500 text-xs uppercase tracking-wide mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
