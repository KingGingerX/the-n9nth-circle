import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: {
    default: "The N9nth Circle — Premium Wargaming Marketplace",
    template: "%s | The N9nth Circle",
  },
  description:
    "Buy, sell, and trade rare painted armies, custom terrain, and wargaming treasures. The premier marketplace for serious hobbyists.",
  keywords: ["warhammer", "40k", "miniatures", "wargaming", "marketplace", "painted armies", "terrain"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://theninthcircle.gg"),
  openGraph: {
    title: "The N9nth Circle",
    description: "Premium Wargaming Marketplace",
    type: "website",
    siteName: "The N9nth Circle",
  },
  twitter: {
    card: "summary_large_image",
    title: "The N9nth Circle — Premium Wargaming Marketplace",
    description: "Buy, sell, and trade rare painted armies. The premier marketplace for serious wargamers.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-void-900 text-bone-200 flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
