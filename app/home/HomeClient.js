"use client";

import { useEffect, useRef, useState } from "react";
import { renderBanner } from "../lib/braze";
import { useAllBanners } from "../lib/Banners";

function BannerSlot({ banner }) {
  const containerRef = useRef(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (!banner || !containerRef.current || rendered) return;
    console.log("[BannerSlot] Rendering banner for placement:", banner.placementId);
    containerRef.current.innerHTML = "";
    renderBanner(banner, containerRef.current);
    setRendered(true);
  }, [banner]);

  useEffect(() => {
    setRendered(false);
  }, [banner?.id]);

  if (!banner) return null;

  return <div ref={containerRef} style={{ width: "100%" }} />;
}

function BannerSkeleton({ className }) {
  return (
    <div className={`${className} bg-gray-200 animate-pulse rounded-2xl`} />
  );
}

export default function HomeClient() {
  const { banners, loading } = useAllBanners();

  const heroBanner       = banners["pgatour_row25"];
  const topBanner        = banners["homepage_top_banner"];
  const onboardingBanner = banners["pgatour_onboarding"];
  const sideBarBanner    = banners["side_content_bar"];
  const hasAnyBanner     = heroBanner || topBanner || onboardingBanner || sideBarBanner;

  return (
    <main className="min-h-screen">

      {loading && (
        <div className="p-8 space-y-4">
          <BannerSkeleton className="w-full h-16" />
          <BannerSkeleton className="w-full h-16" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <BannerSkeleton className="h-48 w-full" />
            </div>
            <div className="md:col-span-1">
              <BannerSkeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      )}

      {!loading && !hasAnyBanner && (
        <div className="flex items-center justify-center h-40 text-gray-400 text-base font-medium">
          No banners available
        </div>
      )}

      {!loading && (
        <div className="flex flex-col">

          {heroBanner && <BannerSlot banner={heroBanner} />}

          {topBanner && <BannerSlot banner={topBanner} />}

          {(onboardingBanner || sideBarBanner) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
              <div className="md:col-span-2">
                {onboardingBanner && <BannerSlot banner={onboardingBanner} />}
              </div>
              <div className="md:col-span-1">
                {sideBarBanner && <BannerSlot banner={sideBarBanner} />}
              </div>
            </div>
          )}

        </div>
      )}

    </main>
  );
}