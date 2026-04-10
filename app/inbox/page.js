"use client";

import { useEffect, useState, useRef } from "react";
import { braze, onBrazeReady } from "../lib/braze";

export default function Inbox() {
  const [cards, setCards] = useState([]);
  const hasFetched = useRef(false); // ✅ prevents multiple refresh calls

  useEffect(() => {
    onBrazeReady(() => {
      console.log("Braze ready in Inbox");

      if (hasFetched.current) return;
      hasFetched.current = true;

      const email = localStorage.getItem("user_email");
      console.log("User:", email);


if (email) {
 braze.changeUser(email);
}

      braze.openSession();

      // ✅ 1. LOAD CACHED CARDS FIRST (your original logic kept)
      const cached = braze.getCachedContentCards();

      if (cached?.cards?.length > 0) {
        console.log("Using cached cards:", cached.cards);
        setCards(cached.cards);
      }

      // ✅ 2. SUBSCRIBE FOR UPDATES (fixed version)
      const sub = braze.subscribeToContentCardsUpdates((updates) => {
        console.log("Content Cards Update:", updates.cards);
        setCards(updates.cards || []);
      });

      // ✅ 3. FETCH ONLY ONCE (rate-limit safe)
      braze.requestContentCardsRefresh();

      return () => {
        braze.removeSubscription(sub);
      };
    });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Inbox</h1>

      {cards.length === 0 && (
        <p className="text-gray-500">No messages yet</p>
      )}

      <div className="space-y-4">
        {cards.map((card) => (
          <div
            key={card.id}
            className="bg-white rounded-xl shadow p-4 flex gap-4"
          >
            {/* 🖼️ IMAGE */}
            {card.imageUrl && (
              <img
                src={card.imageUrl}
                className="w-20 h-20 object-cover rounded"
              />
            )}

            {/* 📄 CONTENT */}
            <div>
              <h2 className="font-semibold">{card.title}</h2>
              <p className="text-gray-600">{card.description}</p>

              {/* 🔗 CTA */}
              {card.url && (
                <a
                  href={card.url}
                  target="_blank"
                  className="text-blue-600 text-sm"
                >
                  View →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}