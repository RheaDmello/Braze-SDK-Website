"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { braze, onBrazeReady } from "../lib/braze";
import { Pin } from "lucide-react";

// ─── Card Type Detection ──────────────────────────────────────────────────────
function getCardType(card) {
  if (braze.ImageOnly && card instanceof braze.ImageOnly) return "image_only";
  if (braze.CaptionedImage && card instanceof braze.CaptionedImage) return "captioned_image";
  if (braze.ClassicCard && card instanceof braze.ClassicCard) return "classic";
  if (typeof card.type === "number") {
    if (card.type === 2) return "image_only";
    if (card.type === 1) return "captioned_image";
    if (card.type === 0) return "classic";
  }
  if (card.imageUrl && !card.title && !card.description) return "image_only";
  if (card.imageUrl && (card.title || card.description)) return "captioned_image";
  return "classic";
}

// ─── Image Only Card ──────────────────────────────────────────────────────────
function ImageOnlyCard({ card }) {
  if (!card.imageUrl) return null;
  return (
    <div className="w-full bg-black rounded-xl overflow-hidden">
      <img
        src={card.imageUrl}
        alt={card.title || ""}
        className="w-full object-contain"
        style={{ maxHeight: "400px" }}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={(e) => (e.currentTarget.parentElement.style.display = "none")}
      />
    </div>
  );
}

// ─── Captioned Image Card ─────────────────────────────────────────────────────
function CaptionedImageCard({ card }) {
  return (
    <div>
      {card.imageUrl && (
        <div className="w-full bg-gray-100 rounded-t-xl overflow-hidden">
          <img
            src={card.imageUrl}
            alt={card.title || ""}
            className="w-full object-contain"
            style={{ maxHeight: "300px" }}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) =>
              (e.currentTarget.parentElement.style.display = "none")
            }
          />
        </div>
      )}
      <div className="p-4">
        {card.title && (
          <div className="flex items-center gap-1 mb-1">
            <span className="text-base font-bold">{card.title}</span>
            {card.pinned && <Pin className="w-3 h-3 text-gray-400" />}
          </div>
        )}
        {card.description && (
          <p className="text-sm text-gray-600">{card.description}</p>
        )}
        {card.linkText && (
          <p className="text-sm font-medium text-[#0088CC] mt-2">
            {card.linkText}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Classic Card ─────────────────────────────────────────────────────────────
function ClassicCard({ card }) {
  return (
    <div className="flex items-center gap-3 p-4">
      {card.imageUrl && (
        <img
          src={card.imageUrl}
          alt={card.title || ""}
          className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      )}
      <div className="min-w-0 flex-1">
        {card.title && (
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold">{card.title}</span>
            {card.pinned && <Pin className="w-3 h-3 text-gray-400" />}
          </div>
        )}
        {card.description && (
          <p className="text-xs text-gray-500 mt-0.5">{card.description}</p>
        )}
        {card.linkText && (
          <p className="text-xs font-medium text-[#0088CC] mt-1">
            {card.linkText}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Card Content Router ──────────────────────────────────────────────────────
function CardContent({ card }) {
  const type = getCardType(card);
  if (type === "image_only") return <ImageOnlyCard card={card} />;
  if (type === "captioned_image") return <CaptionedImageCard card={card} />;
  return <ClassicCard card={card} />;
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function extractVisible(feed) {
  const arr = feed?.cards ?? (Array.isArray(feed) ? feed : []);
  return arr.filter((c) => !c.isControl);
}

// ─── Safe impression logger ───────────────────────────────────────────────────
// Braze v6 exposes logContentCardImpressions (plural, takes array) at the
// top-level SDK. card.logImpression() only exists on live SDK instances, not
// on plain objects returned from getCachedContentCards().
function logImpression(card) {
  try {
    if (typeof card.logImpression === "function") {
      // Live SDK card instance — use the method directly
      card.logImpression();
    } else if (typeof braze.logContentCardImpressions === "function") {
      // Fallback: top-level SDK function (plural, takes array)
      braze.logContentCardImpressions([card]);
    }
  } catch (e) {
    console.warn("Could not log impression for card:", card.id, e);
  }
}

// ─── Safe click logger ────────────────────────────────────────────────────────
function logClick(card) {
  try {
    if (typeof card.logClick === "function") {
      card.logClick();
    } else if (typeof braze.logContentCardClick === "function") {
      braze.logContentCardClick(card);
    }
  } catch (e) {
    console.warn("Could not log click for card:", card.id, e);
  }
}

// ─── Main Inbox Page ──────────────────────────────────────────────────────────
export default function InboxPage() {
  const [cards, setCards] = useState([]);
  const loggedImpressions = useRef(new Set());

  useEffect(() => {
    let unsubscribe = null;

    onBrazeReady(() => {
      // 1. Read cache immediately (synchronous) — zero delay
      const cached = braze.getCachedContentCards();
      const cachedVisible = extractVisible(cached);
      if (cachedVisible.length > 0) {
        console.log("📦 Loaded from cache:", cachedVisible.length);
        setCards(cachedVisible);
      }

      // 2. Subscribe for live updates
      unsubscribe = braze.subscribeToContentCardsUpdates((update) => {
        const visible = extractVisible(update);
        console.log("📬 Cards update received:", visible.length, visible);
        setCards(visible);
      });

      // 3. Trigger fresh fetch from Braze servers
      braze.requestContentCardsRefresh();
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  // ─── Card Tap Handler ────────────────────────────────────────────────────
  const handleCardTap = useCallback((card) => {
    logClick(card);

    if (!card.url) {
      braze.requestImmediateDataFlush?.();
      return;
    }

    if (!card.url.startsWith("http://") && !card.url.startsWith("https://")) {
      // Braze deep-link / custom action (also triggers IAMs configured on click)
      braze.handleBrazeAction?.(card.url);
    } else {
      window.open(card.url, "_blank", "noopener,noreferrer");
    }

    braze.requestImmediateDataFlush?.();
  }, []);

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-100">
      {cards.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium">No messages yet</p>
          <p className="text-sm mt-1">Check back later for updates</p>
        </div>
      ) : (
        <div className="max-w-xl mx-auto py-4 px-3">
          {cards.map((card) => {
            // Log impression once per card per session
            if (!loggedImpressions.current.has(card.id)) {
              loggedImpressions.current.add(card.id);
              logImpression(card);
            }

            return (
              <div
                key={card.id}
                onClick={() => handleCardTap(card)}
                className="bg-white rounded-xl shadow mb-3 cursor-pointer overflow-hidden hover:shadow-md transition-shadow"
              >
                <CardContent card={card} />
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}