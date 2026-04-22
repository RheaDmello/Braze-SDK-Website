"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import * as braze from "@braze/web-sdk";
import { onBrazeReady } from "../lib/braze";
import { Pin, Inbox } from "lucide-react";

// ─── SORTING (pinned first, then newest) ───
const sortCards = (cards) => {
  return [...cards].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.updated) - new Date(a.updated);
  });
};

// ─── CARD UI BY TYPE ───
function CardContent({ card }) {
  // ─── IMAGE ONLY ───
  if (card instanceof braze.ImageOnly) {
    return (
      <div className="relative">
        <img
          src={card.imageUrl}
          alt=""
          className="w-full h-auto object-contain"
        />

        {card.pinned && (
          <Pin className="absolute top-2 right-2 w-4 h-4 text-white" />
        )}
      </div>
    );
  }

  // ─── CAPTIONED IMAGE ───
  if (card instanceof braze.CaptionedImage) {
    return (
      <div>
        <div className="relative">
          <img
            src={card.imageUrl}
            alt={card.title || ""}
            className="w-full h-auto object-contain"
          />

          {card.pinned && (
            <Pin className="absolute top-2 right-2 w-4 h-4 text-white" />
          )}
        </div>

        <div className="p-4">
          {card.title && (
            <h3 className="font-semibold text-gray-900">{card.title}</h3>
          )}

          {card.description && (
            <p className="text-sm text-gray-600 mt-1">
              {card.description}
            </p>
          )}

          {card.linkText && (
            <p className="text-blue-600 mt-2 text-sm">
              {card.linkText}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ─── CLASSIC ───
  if (card instanceof braze.ClassicCard) {
    return (
      <div className="flex gap-3 p-4">
        {card.imageUrl && (
          <img
            src={card.imageUrl}
            alt=""
            className="w-16 h-16 rounded-lg object-cover"
          />
        )}

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              {card.title && (
                <h3 className="font-semibold text-gray-900">
                  {card.title}
                </h3>
              )}

              {card.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {card.description}
                </p>
              )}

              {card.linkText && (
                <p className="text-blue-600 mt-1 text-sm">
                  {card.linkText}
                </p>
              )}
            </div>

            {card.pinned && (
              <Pin className="w-4 h-4 text-gray-400 ml-2" />
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ─── MAIN ───
function InboxPage() {
  const [mounted, setMounted] = useState(false);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const impressions = useRef(new Set());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    onBrazeReady(() => {
      console.log("Braze ready");

      braze.openSession();

      braze.subscribeToInAppMessage((message) => {
        if (message) {
          braze.showInAppMessage(message);
        }
      });

      const cached = braze.getCachedContentCards();
      console.log("Cached cards:", cached);

      if (cached?.cards) {
        const filtered = cached.cards.filter((c) => !c.isControl);
        setCards(sortCards(filtered));
        setLoading(false);
      }

      braze.subscribeToContentCardsUpdates((updates) => {
        console.log("Content cards update:", updates);

        const filtered = (updates.cards || []).filter(
          (c) => !c.isControl
        );

        setCards(sortCards(filtered));
        setLoading(false);
      });

      braze.requestContentCardsRefresh();
    });
  }, [mounted]);

  // ─── CLICK HANDLER ───
  const handleCardTap = useCallback((card) => {
    card.logClick?.();

    braze.logCustomEvent("content_card_clicked", {
      card_id: card.id,
      title: card.title,
    });

    braze.requestImmediateDataFlush?.();

    setTimeout(() => {
      if (!card.url) return;

      if (!card.url.startsWith("http")) {
        braze.handleBrazeAction(card.url);
      } else {
        window.open(card.url, "_blank");
      }
    }, 300);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#F2F2F7]">
      {loading ? (
        <div className="text-center py-24">Loading...</div>
      ) : cards.length === 0 ? (
        <div className="flex flex-col items-center py-24">
          <Inbox className="w-12 h-12 text-gray-300" />
          <p className="text-gray-400">No messages</p>
        </div>
      ) : (
        <div className="max-w-xl mx-auto py-4">
          {cards.map((card) => {
            if (!impressions.current.has(card.id)) {
              impressions.current.add(card.id);
              card.logImpression?.();
            }

            return (
              <div
                key={card.id}
                onClick={() => handleCardTap(card)}
                className="bg-white rounded-xl shadow-sm mb-3 overflow-hidden cursor-pointer hover:shadow-md transition"
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

export default function Page() {
  return <InboxPage />;
}