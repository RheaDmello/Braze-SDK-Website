"use client";

import { useEffect, useState } from "react";
import { braze } from "./braze";

const PLACEMENT_IDS = [
  "pgatour_row25",
  "homepage_top_banner",
  "pgatour_onboarding",
  "side_content_bar",
];

export function useAllBanners() {
  const [banners, setBanners] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub;

    const init = () => {
      unsub = braze.subscribeToBannersUpdates((result) => {
        const placements = result ?? {};
        const resolved = {};
        for (const id of PLACEMENT_IDS) {
          resolved[id] = placements[id] || null;
        }
        setBanners(resolved);
        setLoading(false);
      });
      braze.requestBannersRefresh(PLACEMENT_IDS);
    };

    const checkReady = setInterval(() => {
      try {
        if (braze.getUser()) {
          clearInterval(checkReady);
          init();
        }
      } catch (e) {}
    }, 200);

    const fallback = setTimeout(() => {
      clearInterval(checkReady);
      init();
    }, 2000);

    return () => {
      clearInterval(checkReady);
      clearTimeout(fallback);
      if (typeof unsub === "function") unsub();
    };
  }, []);

  return { banners, loading };
}

export function useBanners(placementId) {
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    let unsub;

    const init = () => {
      unsub = braze.subscribeToBannersUpdates((result) => {
        setBanner(result?.[placementId] || null);
      });
      braze.requestBannersRefresh([placementId]);
    };

    const checkReady = setInterval(() => {
      try {
        if (braze.getUser()) {
          clearInterval(checkReady);
          init();
        }
      } catch (e) {}
    }, 200);

    const fallback = setTimeout(() => {
      clearInterval(checkReady);
      init();
    }, 2000);

    return () => {
      clearInterval(checkReady);
      clearTimeout(fallback);
      if (typeof unsub === "function") unsub();
    };
  }, [placementId]);

  return banner;
}