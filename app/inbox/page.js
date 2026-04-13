"use client";

import { useEffect, useState, useRef } from "react";
import { braze, onBrazeReady } from "../lib/braze";
import {
 Dialog,
 DialogContent,
 DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { ExternalLink, Clock } from "lucide-react";

export default function InboxPage() {
 const [cards, setCards] = useState([]);
 const [selectedCard, setSelectedCard] = useState(null);
 const [readCards, setReadCards] = useState(new Set());
 const hasFetched = useRef(false);

 useEffect(() => {
 onBrazeReady(() => {
 if (hasFetched.current) return;
 hasFetched.current = true;

 const email = localStorage.getItem("user_email");
 if (email) braze.changeUser(email);
 braze.openSession();

 const cached = braze.getCachedContentCards();
 if (cached?.cards?.length > 0) setCards(cached.cards);

 const sub = braze.subscribeToContentCardsUpdates((updates) => {
 setCards(updates.cards || []);
 });

 braze.requestContentCardsRefresh();
 return () => braze.removeSubscription(sub);
 });
 }, []);

 const handleCardClick = (card) => {
 setSelectedCard(card);
 setReadCards((prev) => new Set([...prev, card.id]));
 braze.logContentCardImpressions([card]);
 if (card.url) braze.logContentCardClick(card);
 };

 const handleCardAction = (card) => {
 braze.logContentCardClick(card);
 if (card.url) {
 if (card.url.startsWith("http")) {
 window.open(card.url, "_blank");
 } else {
 braze.handleBrazeAction(card.url);
 }
 }
 setSelectedCard(null);
 };

 const formatDate = (timestamp) => {
 if (!timestamp) return "";
 const date = new Date(timestamp * 1000);
 const now = new Date();
 const diff = Math.floor((now - date) / 1000);
 if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
 if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
 return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};
 return (
 <main className="min-h-screen bg-gray-50 px-6 py-8">
 <h1 className="text-3xl font-bold text-gray-900 mb-6">Inbox</h1>

 {/* ─── Empty State ─── */}
 {cards.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-32 text-gray-400 gap-3">
 <p className="text-lg font-medium">No messages yet</p>
 <p className="text-sm">Your personalised messages will appear here.</p>
 </div>
 ) : (
 <div className="space-y-4 max-w-3xl">
 {cards.map((card) => {
 const isRead = readCards.has(card.id);
 return (
 <div
 key={card.id}
 onClick={() => handleCardClick(card)}
 className={`flex gap-4 items-start bg-white rounded-2xl p-4 border cursor-pointer hover:shadow-md transition-all duration-200 ${
 !isRead ? "border-blue-200 bg-blue-50/30" : "border-gray-100"
 }`}
 >
 {/* Image */}
 {card.imageUrl && (
 <img
 src={card.imageUrl}
 alt={card.title}
 className="w-16 h-16 rounded-xl object-cover shrink-0"
 />
 )}

 {/* Content */}
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2">

 <h2 className={`text-sm truncate ${!isRead ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
 {card.title}
 </h2>
 </div>
 <p className="text-sm text-gray-500 mt-1 line-clamp-2">{card.description}</p>
 
 </div>
 </div>
 );
 })}
 </div>
 )}

 {/* ─── Detail Modal ─── */}
 <Dialog open={!!selectedCard} onOpenChange={() => setSelectedCard(null)}>
 <DialogContent className="max-w-lg p-0 overflow-hidden rounded-3xl border-0 shadow-2xl">
 <VisuallyHidden>
 <DialogTitle>{selectedCard?.title || "Message"}</DialogTitle>
 </VisuallyHidden>

 {selectedCard && (
 <>
 {selectedCard.imageUrl && (
 <div className="relative h-52 overflow-hidden">
 <img
 src={selectedCard.imageUrl}
 alt={selectedCard.title}
 className="w-full h-full object-cover"
 />
 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
 <h2 className="absolute bottom-4 left-5 text-white text-2xl font-extrabold">
 {selectedCard.title}
 </h2>
 </div>
 )}

 <div className="p-6 space-y-4 bg-white">
 {!selectedCard.imageUrl && (
 <h2 className="text-xl font-bold text-gray-900">{selectedCard.title}</h2>
 )}

 <p className="text-gray-600 text-sm leading-relaxed">{selectedCard.description}</p>

 

 <div className="flex gap-3 pt-2">
 {selectedCard.url && (
 <Button
 onClick={() => handleCardAction(selectedCard)}
 className="flex-1 rounded-2xl py-3 font-bold cursor-pointer bg-black hover:bg-gray-800 flex items-center justify-center gap-2"
 >
 <ExternalLink className="w-4 h-4" /> Open
 </Button>
 )}
 <Button
 variant="outline"
 onClick={() => setSelectedCard(null)}
 className={`rounded-2xl py-3 cursor-pointer ${selectedCard.url ? "flex-1" : "w-full"}`}
 >
 Close
 </Button>
 </div>
 </div>
 </>
 )}
 </DialogContent>
 </Dialog>
 </main>
 );
}