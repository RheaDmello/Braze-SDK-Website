"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { braze, onBrazeReady } from "../lib/braze";
import { useAuth } from "../context/AuthContext";

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
 // ─────────────────────────────────────────────────────────────
 // STEP 1: Server-side identity resolution
 // Check if this email already has a Braze profile
 // ─────────────────────────────────────────────────────────────
 const res = await fetch("/api/braze-identify", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ email: trimmedEmail }),
 });

 const data = await res.json();

 if (!res.ok || data.error) {
 throw new Error(data.error || "Identity check failed");
 }

 console.log("Braze identity resolution:", data.status, "→ external_id:", data.external_id);

 // The external_id to use — either the existing one or email for new users
 const externalId = data.external_id;

 // ─────────────────────────────────────────────────────────────
 // STEP 2: Login locally
 // ─────────────────────────────────────────────────────────────
 login(trimmedEmail);

 // ─────────────────────────────────────────────────────────────
 // STEP 3: Now safely call changeUser() with the resolved ID
 // ─────────────────────────────────────────────────────────────
 onBrazeReady(() => {
 try {
 // This now correctly links to existing profile OR creates new one
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
 <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4">
 <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
 <div className="text-center">
 <h1 className="text-3xl font-bold tracking-tight">MyStore</h1>
 <p className="text-gray-500 text-sm mt-1">
 Welcome back! Please login to continue
 </p>
 </div>

 <div className="space-y-2">
 <label className="text-sm font-medium text-gray-700">
 Email Address
 </label>
 <input
 type="email"
 placeholder="you@example.com"
 className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 onKeyDown={(e) => e.key === "Enter" && handleLogin()}
 />
 </div>

 <button
 onClick={handleLogin}
 disabled={!isValidEmail || isLoading}
 className={`w-full py-2 rounded-lg font-medium transition cursor-pointer ${
 isValidEmail && !isLoading
 ? "bg-black text-white hover:bg-gray-800"
 : "bg-gray-300 text-gray-500 opacity-70"
 }`}
 >
 {isLoading ? "Logging in..." : "Continue"}
 </button>

 <p className="text-xs text-gray-400 text-center">
 By continuing, you agree to our Terms & Privacy Policy
 </p>
 </div>
 </div>
 );
}