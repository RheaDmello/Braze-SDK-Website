"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { braze, onBrazeReady } from "../lib/braze";
import { useAuth } from "../context/AuthContext";
import { Loader2, ShoppingBag, Mail, ArrowRight } from "lucide-react";

export default function LoginPage() {
 const [email, setEmail] = useState("");
 const [isLoading, setIsLoading] = useState(false);

 const { user, login, loading } = useAuth();
 const router = useRouter();

 useEffect(() => {
 if (!loading && user) {
 router.replace("/inbox");
 }
 }, [user, loading, router]);

 const isValidEmail = email.trim().includes("@");

 const handleLogin = async () => {
 const trimmedEmail = email.trim();
 if (!trimmedEmail.includes("@")) return;

 setIsLoading(true);

 try {
 const res = await fetch("/api/braze-identify", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ email: trimmedEmail }),
 });

 const data = await res.json();

 if (!res.ok || data.error) {
 throw new Error(data.error || "Identity check failed");
 }

 const externalId = data.external_id;

 login(trimmedEmail);

 onBrazeReady(() => {
 try {
 braze.changeUser(externalId);

 const bUser = braze.getUser();
 if (bUser) {
 bUser.setEmail(trimmedEmail);

 const storedProfile =
 JSON.parse(localStorage.getItem(`user_profile_${trimmedEmail}`)) || {};

 if (storedProfile.firstName?.trim()) bUser.setFirstName(storedProfile.firstName.trim());
 if (storedProfile.lastName?.trim()) bUser.setLastName(storedProfile.lastName.trim());
 if (storedProfile.phone?.trim()) bUser.setPhoneNumber(storedProfile.phone.trim());
 }

 braze.openSession();

 setTimeout(() => {
 braze.logCustomEvent("user_logged_in");
 braze.requestContentCardsRefresh();
 braze.requestImmediateDataFlush();
 }, 500);

 router.replace("/inbox");
 } catch (error) {
 console.error("Braze login error:", error);
 alert("Login failed. Please try again.");
 } finally {
 setIsLoading(false);
 }
 });
 } catch (err) {
 console.error("Login error:", err);
 alert("Login failed. Please try again.");
 setIsLoading(false);
 }
 };

 if (loading) return null;
 if (user) return null;

 return (
 <div className="min-h-screen flex bg-white">

 {/* ─── Left Panel ─── */}
 <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-black via-gray-900 to-gray-800 flex-col justify-between p-12 relative overflow-hidden">
 {/* Dot pattern */}
 <div
 className="absolute inset-0 opacity-10"
 style={{
 backgroundImage:
 "radial-gradient(circle, white 1px, transparent 1px)",
 backgroundSize: "32px 32px",
 }}
 />

 {/* Logo */}
 <div className="relative flex items-center gap-3">
 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
 <ShoppingBag className="w-5 h-5 text-black" />
 </div>
 <span className="text-white font-bold text-xl">MyStore</span>
 </div>

 {/* Center text */}
 <div className="relative space-y-4">
 <h2 className="text-5xl font-extrabold text-white leading-tight">
 Shop smarter. <br />
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-300 to-white">
 Live better.
 </span>
 </h2>
 <p className="text-gray-400 text-lg max-w-sm">
 Discover handpicked products, personalised offers, and seamless checkout — all in one place.
 </p>
 </div>

 {/* Bottom trust badges */}
 <div className="relative flex gap-6">
 {["Free Shipping", "Secure Payments", "24/7 Support"].map((item) => (
 <div key={item} className="flex items-center gap-2 text-gray-400 text-sm">
 <span className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
 {item}
 </div>
 ))}
 </div>
 </div>

 {/* ─── Right Panel ─── */}
 <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
 <div className="w-full max-w-md space-y-8">

 {/* Mobile logo */}
 <div className="flex lg:hidden items-center gap-3 mb-2">
 <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center">
 <ShoppingBag className="w-4 h-4 text-white" />
 </div>
 <span className="font-bold text-lg">MyStore</span>
 </div>

 {/* Heading */}
 <div className="space-y-2">
 <h1 className="text-3xl font-extrabold text-gray-900">Welcome back</h1>
 <p className="text-gray-500 text-sm">
 Enter your email to sign in to your account
 </p>
 </div>

 {/* Form */}
 <div className="space-y-5">
 <div className="space-y-2">
 <label className="text-sm font-medium text-gray-700">
 Email Address
 </label>
 <div className="relative">
 <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
 <input
 type="email"
 placeholder="you@example.com"
 className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition shadow-sm"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 onKeyDown={(e) => e.key === "Enter" && handleLogin()}
 />
 </div>
 </div>

 <button
 onClick={handleLogin}
 disabled={!isValidEmail || isLoading}
 className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
 isValidEmail && !isLoading
 ? "bg-black text-white hover:bg-gray-800 shadow-md hover:shadow-lg"
 : "bg-gray-100 text-gray-400 cursor-not-allowed"
 }`}
 >
 {isLoading ? (
 <>
 <Loader2 className="w-4 h-4 animate-spin" />
 Signing in...
 </>
 ) : (
 <>
 Continue
 <ArrowRight className="w-4 h-4" />
 </>
 )}
 </button>
 </div>

 <p className="text-xs text-gray-400 text-center">
 By continuing, you agree to our{" "}
 <span className="underline cursor-pointer hover:text-gray-600">Terms of Service</span>{" "}
 &{" "}
 <span className="underline cursor-pointer hover:text-gray-600">Privacy Policy</span>
 </p>
 </div>
 </div>
 </div>
 );
}