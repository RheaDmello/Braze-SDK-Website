"use client";

import { useEffect, useRef } from "react";
import { braze } from "../lib/braze";
import { useBanners } from "../lib/Banners";

function BannerSlot({ placementId, className }) {
  const banner = useBanners(placementId);
  const containerRef = useRef(null);

  useEffect(() => {
    if (banner && containerRef.current) {
      braze.renderBanner(banner, containerRef.current);
    }
  }, [banner]);

  if (!banner) return null;

  return <div ref={containerRef} className={className} />;
}

export default function Home() {
  const topBanner = useBanners("top_banner");
  const sideBanner = useBanners("side_banner");
  const hasAnyBanner = topBanner || sideBanner;

  return (
    <main className="min-h-screen p-8 space-y-8">

      {!hasAnyBanner && (
        <div className="flex items-center justify-center h-40 text-gray-400 text-base font-medium">
          No banners yet
        </div>
      )}

      {/* ─── Top Banner ─── */}
      <BannerSlot
        placementId="top_banner"
        className="w-full h-64 rounded-3xl overflow-hidden shadow-lg"
      />

      {/* ─── Side Banners ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BannerSlot
          placementId="side_banner"
          className="h-48 rounded-2xl overflow-hidden shadow-md"
        />
      </div>

    </main>
  );
}