"use client";

import { useEffect, useState } from "react";
import { braze } from "./braze";

export function useBanners(placementId) {
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    const unsub = braze.subscribeToBannersUpdates((banners) => {
      const match = banners.placements?.[placementId];
      setBanner(match || null);
    });

    braze.requestBannersRefresh([placementId]);

    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [placementId]);

  return banner;
}