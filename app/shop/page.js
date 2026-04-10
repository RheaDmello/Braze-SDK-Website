"use client";

import { useState } from "react";
import { braze } from "../lib/braze";

const products = [
 { id: 1, name: "Running Shoes", price: 80 },
 { id: 2, name: "Classic T-Shirt", price: 25 },
 { id: 3, name: "Baseball Cap", price: 18 },
];

export default function Shop() {
 const [cart, setCart] = useState([]);

 const handleAddToCart = (product) => {
 setCart((prev) => [...prev, product]);

 braze.logCustomEvent("add_to_cart", {
 product_id: String(product.id),
 product_name: product.name,
 price: product.price,
 });

 braze.requestImmediateDataFlush();

 setTimeout(() => {
 braze.requestContentCardsRefresh();
 }, 2000);
 };

 return (
 <main className="space-y-8">
 <h1 className="text-3xl font-bold">Shop</h1>

 <div className="grid md:grid-cols-3 gap-6">
 {products.map((p) => (
 <div
 key={p.id}
 className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition"
 >
 <div className="h-40 bg-gray-100 rounded mb-4"></div>

 <h2 className="font-semibold">{p.name}</h2>
 <p className="text-gray-600 mb-3">${p.price}</p>

 <button
 onClick={() => handleAddToCart(p)}
 className="w-full bg-black text-white py-2 rounded"
 >
 Add to Cart
 </button>
 </div>
 ))}
 </div>

 <div className="bg-white p-6 rounded-xl shadow-sm flex justify-between items-center">
 <p className="font-medium">Cart: {cart.length} items</p>

 <button className="bg-green-600 text-white px-5 py-2 rounded">
 Checkout
 </button>
 </div>
 </main>
 );
}