"use client";

import { useState, useEffect } from "react";
import { braze } from "../lib/braze";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
 Sheet,
 SheetContent,
 SheetHeader,
 SheetTitle,
 SheetTrigger,
} from "@/components/ui/sheet";
import {
 Dialog,
 DialogContent,
 DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
 ShoppingCart,
 Trash2,
 Star,
 Package,
 ExternalLink,
 Search,
 Zap,
 Shield,
 Truck,
 Tag,
} from "lucide-react";

export default function Shop() {
 const [products, setProducts] = useState([]);
 const [cart, setCart] = useState([]);
 const [loading, setLoading] = useState(false);
 const [mounted, setMounted] = useState(false);
 const [selectedProduct, setSelectedProduct] = useState(null);
 const [cartOpen, setCartOpen] = useState(false);
 const [addedMap, setAddedMap] = useState({});
 const [searchQuery, setSearchQuery] = useState("");
 const [activeCategory, setActiveCategory] = useState("All");

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

 const handleAddToCart = (product) => {
 setCart((prev) => [...prev, product]);
 setAddedMap((prev) => ({ ...prev, [product.id]: true }));
 setTimeout(() => setAddedMap((prev) => ({ ...prev, [product.id]: false })), 1500);

 braze.logCustomEvent("add_to_cart", {
 product_id: String(product.id),
 product_name: product.name,
 price: product.price,
 category: product.category,
 });
 braze.requestImmediateDataFlush();
 setTimeout(() => braze.requestContentCardsRefresh(), 2000);
 };

 const handleRemoveFromCart = (productId) => {
 const index = cart.findIndex((p) => p.id === productId);
 if (index === -1) return;
 const removed = cart[index];
 const newCart = [...cart];
 newCart.splice(index, 1);
 setCart(newCart);

 braze.logCustomEvent("remove_from_cart", {
 product_id: String(removed.id),
 product_name: removed.name,
 price: removed.price,
 });
 braze.requestImmediateDataFlush();
 };

 const handleCheckout = () => {
 if (cart.length === 0) return;
 const total = cart.reduce((sum, p) => sum + p.price, 0).toFixed(2);

 braze.logCustomEvent("start_checkout", { total_items: cart.length, total_price: total });

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
 braze.logCustomEvent("order_completed", { total_items: cart.length, total_price: total });
 braze.requestImmediateDataFlush();

 alert(`✅ Order placed! Total: $${total}`);
 setCart([]);
 setCartOpen(false);
 setTimeout(() => braze.requestContentCardsRefresh(), 2000);
 };

 const cartTotal = cart.reduce((sum, p) => sum + p.price, 0).toFixed(2);

 // ─── Categories ───
 const categories = ["All", ...new Set(products.map((p) => p.category))];

 // ─── Filtered Products ───
 const filteredProducts = products.filter((p) => {
 const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
 const matchCategory = activeCategory === "All" || p.category === activeCategory;
 return matchSearch && matchCategory;
 });

 if (!mounted || loading) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
 <div className="flex flex-col items-center gap-4">
 <div className="w-14 h-14 rounded-full border-4 border-black border-t-transparent animate-spin" />
 <p className="text-gray-500 font-medium text-lg">Loading products...</p>
 </div>
 </div>
 );
 }

 return (
 <main className="min-h-screen bg-gray-50">

 {/* ─── Hero Banner ─── */}
 <div className="relative bg-gradient-to-r from-black via-gray-900 to-gray-800 text-white px-8 py-14 overflow-hidden">
 <div className="absolute inset-0 opacity-10"
 style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }}
 />
<div className="relative w-full flex justify-between items-center">
 <div className="space-y-4">
 <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-sm px-3 py-1">
 🔥 New Arrivals
 </Badge>
 <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
 Discover Our <br />
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-300 to-white">
 Premium Store
 </span>
 </h1>
 <p className="text-gray-400 text-lg max-w-md">
 Explore {products.length} handpicked products crafted for quality and style.
 </p>
 </div>

 {/* Cart Button in Hero */}
 <Sheet open={cartOpen} onOpenChange={setCartOpen}>
 <SheetTrigger asChild>
 <Button
 variant="outline"
 className="relative flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-black border-0 shadow-xl hover:bg-gray-100 cursor-pointer text-base font-semibold"
 >
 <ShoppingCart className="w-5 h-5" />
 Cart
 {cart.length > 0 && (
 <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold shadow">
 {cart.length}
 </span>
 )}
 </Button>
 </SheetTrigger>

 {/* ─── Cart Drawer ─── */}
 <SheetContent className="w-[420px] flex flex-col p-0 bg-white">
 <SheetHeader className="px-6 py-5 border-b bg-gray-50">
 <SheetTitle className="text-xl font-bold flex items-center gap-2">
 <ShoppingCart className="w-5 h-5" /> Your Cart
 <Badge className="ml-2 bg-black text-white">{cart.length}</Badge>
 </SheetTitle>
 </SheetHeader>

 <ScrollArea className="flex-1 px-6 py-4">
 {cart.length === 0 ? (
 <div className="flex flex-col items-center justify-center h-72 gap-4 text-gray-400">
 <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
 <Package className="w-10 h-10 opacity-40" />
 </div>
 <p className="text-base font-medium">Your cart is empty</p>
 <p className="text-sm text-gray-400">Add some products to get started!</p>
 </div>
 ) : (
 <div className="space-y-3">
 {cart.map((item, index) => (
 <div key={index} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition">
 <img
 src={item.image_url || `https://placehold.co/64x64?text=${encodeURIComponent(item.name)}`}
 alt={item.name}
 className="w-16 h-16 object-cover rounded-xl shadow-sm"
 />
 <div className="flex-1 min-w-0">
 <p className="font-semibold text-sm truncate">{item.name}</p>
 <Badge variant="secondary" className="text-xs mt-1">{item.category}</Badge>
 <p className="text-base font-bold mt-1">${item.price}</p>
 </div>
 <Button
 variant="ghost"
 size="icon"
 onClick={() => handleRemoveFromCart(item.id)}
 className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl cursor-pointer"
 >
 <Trash2 className="w-4 h-4" />
 </Button>
 </div>
 ))}
 </div>
 )}
 </ScrollArea>

 <div className="px-6 py-5 border-t space-y-4 bg-gray-50">
 <div className="flex justify-between items-center">
 <span className="text-gray-500 text-sm font-medium">Subtotal ({cart.length} items)</span>
 <span className="font-extrabold text-2xl">${cartTotal}</span>
 </div>
 <Button
 onClick={handleCheckout}
 disabled={cart.length === 0}
 className="w-full py-4 rounded-2xl text-base font-bold cursor-pointer bg-black hover:bg-gray-800 disabled:bg-gray-200"
 >
 {cart.length === 0 ? "Cart is Empty" : `Checkout → $${cartTotal}`}
 </Button>
 <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
 <Shield className="w-3 h-3" /> Secure & encrypted checkout
 </p>
 </div>
 </SheetContent>
 </Sheet>
 </div>
 </div>

 {/* ─── Trust Badges ─── */}
 <div className="bg-white border-b">
<div className="w-full px-8 py-4 grid grid-cols-3 gap-4">
 {[
 { icon: <Truck className="w-4 h-4" />, label: "Free Shipping over $100" },
 { icon: <Shield className="w-4 h-4" />, label: "Secure Payments" },
 { icon: <Zap className="w-4 h-4" />, label: "Fast Delivery" },
 ].map((item, i) => (
 <div key={i} className="flex items-center justify-center gap-2 text-sm text-gray-600 font-medium">
 <span className="text-black">{item.icon}</span>
 {item.label}
 </div>
 ))}
 </div>
 </div>

<div className="w-full px-8 py-10 space-y-8">

 {/* ─── Search + Filters ─── */}
 <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
 {/* Search */}
 <div className="relative w-full md:w-80">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
 <Input
 placeholder="Search products..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="pl-10 rounded-xl border-gray-200 focus:border-black focus:ring-black"
 />
 </div>

 {/* Category Filters */}
 <div className="flex gap-2 flex-wrap">
 {categories.map((cat) => (
 <button
 key={cat}
 onClick={() => setActiveCategory(cat)}
 className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer border ${
 activeCategory === cat
 ? "bg-black text-white border-black shadow-md"
 : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
 }`}
 >
 {cat}
 </button>
 ))}
 </div>
 </div>

 {/* Results count */}
 <p className="text-gray-400 text-sm">
 Showing <span className="font-semibold text-black">{filteredProducts.length}</span> products
 {activeCategory !== "All" && <> in <span className="font-semibold text-black">{activeCategory}</span></>}
 </p>

 {/* ─── Product Grid ─── */}
 {filteredProducts.length === 0 ? (
 <div className="text-center py-24 text-gray-400">
 <Tag className="w-12 h-12 mx-auto mb-4 opacity-30" />
 <p className="text-lg font-medium">No products found</p>
 <p className="text-sm">Try a different search or category</p>
 </div>
 ) : (
 <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
 {filteredProducts.map((p) => (
 <div
 key={p.id}
 onClick={() => handleViewProduct(p)}
 className="group bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 cursor-pointer"
 >
 {/* Image */}
 <div className="relative h-52 overflow-hidden bg-gray-50">
 <img
 src={p.image_url || `https://placehold.co/400x200?text=${encodeURIComponent(p.name)}`}
 alt={p.name}
 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
 />
 <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
 <Badge className="absolute top-3 left-3 bg-white/90 text-black border-0 shadow-sm text-xs font-semibold backdrop-blur-sm">
 {p.category}
 </Badge>
 {p.quantity <= 5 && (
 <Badge className="absolute top-3 right-3 bg-red-500 text-white border-0 text-xs">
 Only {p.quantity} left!
 </Badge>
 )}
 </div>

 {/* Info */}
 <div className="p-5 space-y-3">
 <div>
 <h2 className="font-bold text-base leading-tight group-hover:text-gray-700 transition-colors">
 {p.name}
 </h2>
 <p className="text-gray-400 text-xs mt-1 line-clamp-1">{p.description}</p>
 </div>

 <div className="flex items-center justify-between">
 <span className="text-2xl font-extrabold">${p.price}</span>
 <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
 <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
 <span className="text-yellow-600 text-xs font-semibold">4.8</span>
 </div>
 </div>

 <Button
 onClick={(e) => {
 e.stopPropagation();
 handleAddToCart(p);
 }}
 className={`w-full rounded-xl font-semibold transition-all duration-300 cursor-pointer ${
 addedMap[p.id]
 ? "bg-green-500 hover:bg-green-500 scale-95"
 : "bg-black hover:bg-gray-800"
 }`}
 >
 {addedMap[p.id] ? "✓ Added to Cart!" : "Add to Cart"}
 </Button>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>

 {/* ─── Product Detail Modal ─── */}
 <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
 <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-3xl border-0 shadow-2xl">
 <VisuallyHidden>
 <DialogTitle>{selectedProduct?.name || "Product Details"}</DialogTitle>
 </VisuallyHidden>

 {selectedProduct && (
 <>
 {/* Image with gradient */}
 <div className="relative h-80 overflow-hidden">
 <img
 src={selectedProduct.image_url || `https://placehold.co/700x320?text=${encodeURIComponent(selectedProduct.name)}`}
 alt={selectedProduct.name}
 className="w-full h-full object-cover"
 />
 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
 <Badge className="absolute top-4 left-4 bg-white/90 text-black text-sm font-semibold backdrop-blur-sm">
 {selectedProduct.category}
 </Badge>
 <div className="absolute bottom-5 left-5 text-white">
 <p className="text-sm text-gray-300 mb-1">Premium Product</p>
 <h2 className="text-3xl font-extrabold">{selectedProduct.name}</h2>
 <p className="text-3xl font-bold text-green-400 mt-1">${selectedProduct.price}</p>
 </div>
 </div>

 {/* Details */}
 <div className="p-7 space-y-5 bg-white">
 <p className="text-gray-600 leading-relaxed text-sm">{selectedProduct.description}</p>

 <Separator />

 <div className="grid grid-cols-2 gap-4">
 <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl">
 <Package className="w-5 h-5 text-gray-500" />
 <div>
 <p className="text-xs text-gray-400">In Stock</p>
 <p className="font-bold text-sm">{selectedProduct.quantity} units</p>
 </div>
 </div>
 <div className="flex items-center gap-3 bg-yellow-50 p-3 rounded-2xl">
 <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
 <div>
 <p className="text-xs text-gray-400">Rating</p>
 <p className="font-bold text-sm">4.8 / 5.0</p>
 </div>
 </div>
 </div>

 {selectedProduct.link && (
 <a
 href={selectedProduct.link}
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center gap-2 text-blue-500 hover:text-blue-700 text-sm font-medium hover:underline"
 >
 <ExternalLink className="w-4 h-4" /> View Product Page
 </a>
 )}

 <div className="flex gap-3 pt-1">
 <Button
 onClick={() => {
 handleAddToCart(selectedProduct);
 setSelectedProduct(null);
 }}
 className="flex-1 rounded-2xl py-4 text-base font-bold cursor-pointer bg-black hover:bg-gray-800"
 >
 Add to Cart
 </Button>
 <Button
 variant="outline"
 onClick={() => setSelectedProduct(null)}
 className="flex-1 rounded-2xl py-4 text-base cursor-pointer border-gray-200 hover:bg-gray-50"
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