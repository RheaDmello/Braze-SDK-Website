"use client";

import { useState, useEffect } from "react";
import { braze } from "../lib/braze";

export default function Shop() {
 const [products, setProducts] = useState([]);
 const [cart, setCart] = useState([]);
 const [loading, setLoading] = useState(false);
 const [mounted, setMounted] = useState(false);
 const [selectedProduct, setSelectedProduct] = useState(null);
 const [cartOpen, setCartOpen] = useState(false); // ← cart drawer toggle

 useEffect(() => {
 setMounted(true);
 braze.logCustomEvent("pageview", { page: "shop" });
 braze.requestImmediateDataFlush();

 const fetchProducts = async () => {
 setLoading(true);
 try {
 const res = await fetch("/api/braze-catalog");
 const data = await res.json();
 setProducts(data.items || []);
 } catch (err) {
 console.error("Failed to fetch catalog:", err);
 } finally {
 setLoading(false);
 }
 };
 fetchProducts();
 }, []);

 // ─── Abandoned Cart ───
 useEffect(() => {
 const handleAbandon = () => {
 if (cart.length > 0) {
 braze.logCustomEvent("Abandoned_Cart", {
 total_items: cart.length,
 total_price: cart.reduce((sum, p) => sum + p.price, 0).toFixed(2),
 items: cart.map((p) => p.name).join(", "),
 });
 braze.requestImmediateDataFlush();
 }
 };
 window.addEventListener("beforeunload", handleAbandon);
 return () => window.removeEventListener("beforeunload", handleAbandon);
 }, [cart]);

 // ─── View Product ───
 const handleViewProduct = (product) => {
 setSelectedProduct(product);
 braze.logCustomEvent("viewed_product_page", {
 product_id: String(product.id),
 product_name: product.name,
 category: product.category,
 price: product.price,
 });
 braze.requestImmediateDataFlush();
 };

 // ─── Add to Cart ───
 const handleAddToCart = (product) => {
 setCart((prev) => [...prev, product]);

 console.log("🛒 Firing add_to_cart for:", product.name);

 braze.logCustomEvent("add_to_cart", {
 product_id: String(product.id),
 product_name: product.name,
 price: product.price,
 category: product.category,
 });

 braze.requestImmediateDataFlush();
 setTimeout(() => braze.requestContentCardsRefresh(), 2000);
 };

 // ─── Remove from Cart ───
 const handleRemoveFromCart = (productId) => {
 const index = cart.findIndex((p) => p.id === productId);
 if (index === -1) return;

 const removed = cart[index];
 const newCart = [...cart];
 newCart.splice(index, 1);
 setCart(newCart);

 console.log("🗑️ Removed from cart:", removed.name);

 braze.logCustomEvent("remove_from_cart", {
 product_id: String(removed.id),
 product_name: removed.name,
 price: removed.price,
 category: removed.category,
 });

 braze.requestImmediateDataFlush();
 };

 // ─── Checkout ───
 const handleCheckout = () => {
 if (cart.length === 0) return;

 const total = cart.reduce((sum, p) => sum + p.price, 0).toFixed(2);

 braze.logCustomEvent("start_checkout", {
 total_items: cart.length,
 total_price: total,
 });

 cart.forEach((product) => {
 braze.logPurchase(String(product.id), product.price, "USD", 1, {
 product_name: product.name,
 category: product.category,
 });
 });

 braze.logCustomEvent("order_placed", {
 total_items: cart.length,
 total_price: total,
 items: cart.map((p) => p.name).join(", "),
 });

 braze.logCustomEvent("order_completed", {
 total_items: cart.length,
 total_price: total,
 });

 braze.requestImmediateDataFlush();
 alert(`✅ Order placed for ${cart.length} item(s)! Total: $${total}`);
 setCart([]);
 setCartOpen(false);
 setTimeout(() => braze.requestContentCardsRefresh(), 2000);
 };

 if (!mounted || loading) {
 return <p className="text-gray-500 p-8">Loading products...</p>;
 }

 return (
 <main className="space-y-8">
 <div className="flex justify-between items-center">
 <h1 className="text-3xl font-bold">Shop</h1>

 {/* ─── Cart Icon Button ─── */}
 <button
 onClick={() => setCartOpen(true)}
 className="relative bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition"
 >
 🛒 Cart
 {cart.length > 0 && (
 <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
 {cart.length}
 </span>
 )}
 </button>
 </div>

 {/* ─── Product Grid ─── */}
 <div className="grid md:grid-cols-3 gap-6">
 {products.map((p) => (
 <div
 key={p.id}
 className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition"
 >
 <div
 className="h-40 bg-gray-100 rounded mb-4 overflow-hidden cursor-pointer"
 onClick={() => handleViewProduct(p)}
 >
 <img
 src={p.image_url || `https://placehold.co/300x160?text=${encodeURIComponent(p.name)}`}
 alt={p.name}
 className="w-full h-full object-cover rounded hover:scale-105 transition-transform duration-300"
 />
 </div>

 <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
 {p.category}
 </span>

 <h2
 className="font-semibold text-lg mt-2 cursor-pointer hover:underline"
 onClick={() => handleViewProduct(p)}
 >
 {p.name}
 </h2>
 <p className="text-gray-500 text-sm mb-1">Qty: {p.quantity}</p>
 <p className="text-gray-700 font-medium mb-3">${p.price}</p>

 <button
 onClick={() => handleAddToCart(p)}
 className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
 >
 Add to Cart
 </button>
 </div>
 ))}
 </div>

 {/* ─── Cart Drawer ─── */}
 {cartOpen && (
 <div
 className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-end"
 onClick={() => setCartOpen(false)}
 >
 <div
 className="bg-white w-full max-w-sm h-full shadow-xl flex flex-col"
 onClick={(e) => e.stopPropagation()}
 >
 <div className="p-5 border-b flex justify-between items-center">
 <h2 className="text-xl font-bold">Your Cart</h2>
 <button onClick={() => setCartOpen(false)} className="text-gray-400 hover:text-black text-xl">✕</button>
 </div>

 <div className="flex-1 overflow-y-auto p-5 space-y-4">
 {cart.length === 0 ? (
 <p className="text-gray-400 text-center mt-10">Your cart is empty</p>
 ) : (
 cart.map((item, index) => (
 <div key={index} className="flex items-center gap-4 border-b pb-3">
 <img
 src={item.image_url || `https://placehold.co/60x60?text=${encodeURIComponent(item.name)}`}
 alt={item.name}
 className="w-16 h-16 object-cover rounded"
 />
 <div className="flex-1">
 <p className="font-medium text-sm">{item.name}</p>
 <p className="text-gray-500 text-xs">{item.category}</p>
 <p className="text-gray-700 text-sm font-semibold">${item.price}</p>
 </div>
 {/* ─── Remove Button ─── */}
 <button
 onClick={() => handleRemoveFromCart(item.id)}
 className="text-red-400 hover:text-red-600 text-sm font-medium transition"
 >
 Remove
 </button>
 </div>
 ))
 )}
 </div>

 <div className="p-5 border-t space-y-3">
 <div className="flex justify-between font-semibold text-lg">
 <span>Total</span>
 <span>${cart.reduce((sum, p) => sum + p.price, 0).toFixed(2)}</span>
 </div>
 <button
 onClick={handleCheckout}
 disabled={cart.length === 0}
 className={`w-full py-3 rounded text-white font-medium transition ${
 cart.length === 0
 ? "bg-gray-300 cursor-not-allowed"
 : "bg-green-600 hover:bg-green-700"
 }`}
 >
 Checkout
 </button>
 </div>
 </div>
 </div>
 )}

 {/* ─── Product Detail Modal ─── */}
 {selectedProduct && (
 <div
 className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
 onClick={() => setSelectedProduct(null)}
 >
 <div
 className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 overflow-hidden"
 onClick={(e) => e.stopPropagation()}
 >
 <div className="h-64 overflow-hidden">
 <img
 src={selectedProduct.image_url || `https://placehold.co/600x300?text=${encodeURIComponent(selectedProduct.name)}`}
 alt={selectedProduct.name}
 className="w-full h-full object-cover"
 />
 </div>

 <div className="p-6 space-y-3">
 <div className="flex justify-between items-start">
 <div>
 <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
 {selectedProduct.category}
 </span>
 <h2 className="text-2xl font-bold mt-2">{selectedProduct.name}</h2>
 </div>
 <p className="text-xl font-semibold text-green-600">${selectedProduct.price}</p>
 </div>

 <p className="text-gray-600 text-sm">{selectedProduct.description}</p>

 <p className="text-gray-500 text-sm">
 In Stock:{" "}
 <span className="font-medium text-gray-700">{selectedProduct.quantity} units</span>
 </p>

 {selectedProduct.link && (
 <a
 href={selectedProduct.link}
 target="_blank"
 rel="noopener noreferrer"
 className="text-blue-500 text-sm underline block"
 >
 View Product Link ↗
 </a>
 )}

 <div className="flex gap-3 pt-2">
 <button
 onClick={() => {
 handleAddToCart(selectedProduct);
 setSelectedProduct(null);
 }}
 className="flex-1 bg-black text-white py-2 rounded hover:bg-gray-800 transition"
 >
 Add to Cart
 </button>
 <button
 onClick={() => setSelectedProduct(null)}
 className="flex-1 border border-gray-300 text-gray-600 py-2 rounded hover:bg-gray-50 transition"
 >
 Close
 </button>
 </div>
 </div>
 </div>
 </div>
 )}
 </main>
 );
}