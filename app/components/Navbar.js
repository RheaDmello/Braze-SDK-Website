"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
 const router = useRouter();
 const pathname = usePathname();
 const { user, logout, loading } = useAuth();

 const [open, setOpen] = useState(false);
 const dropdownRef = useRef(null);

 const isLoggedIn = !!user?.email;
 const isAuthPage = pathname === "/login";

 useEffect(() => {
 const handleClickOutside = (e) => {
 if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
 setOpen(false);
 }
 };

 document.addEventListener("click", handleClickOutside);
 return () => document.removeEventListener("click", handleClickOutside);
 }, []);

 if (loading) return null;

 const handleLogout = () => {
 logout();
 setOpen(false);
 router.replace("/login");
 };

 const navItemClass = (path) =>
 `cursor-pointer px-3 py-1 rounded transition ${
 pathname === path
 ? "bg-gray-200 shadow font-semibold"
 : "hover:bg-gray-100"
 }`;

 return (
 <div className="flex justify-between items-center p-4 bg-white shadow">
 <div className="flex gap-6 items-center">
 <h1
 className="font-bold text-xl cursor-pointer"
 onClick={() => router.push("/")}
 >
 MyStore
 </h1>

 {isLoggedIn && !isAuthPage && (
 <>
 <button
 onClick={() => router.push("/shop")}
 className={navItemClass("/shop")}
 >
 Shop
 </button>

 <button
 onClick={() => router.push("/inbox")}
 className={navItemClass("/inbox")}
 >
 Inbox
 </button>

 <button
 onClick={() => router.push("/profile")}
 className={navItemClass("/profile")}
 >
 Profile
 </button>
 </>
 )}
 </div>

 <div className="relative" ref={dropdownRef}>
 {!isLoggedIn && !isAuthPage && (
 <button
 onClick={() => router.push("/login")}
 className="bg-black text-white px-4 py-2 rounded"
 >
 Login
 </button>
 )}

 {isLoggedIn && !isAuthPage && (
 <>
 <div
 onClick={() => setOpen(!open)}
 className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center cursor-pointer font-bold"
 >
 {user.email.charAt(0).toUpperCase()}
 </div>

 {open && (
 <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-md">
 <button
 onClick={() => {
 setOpen(false);
 router.push("/profile");
 }}
 className="block w-full text-left px-4 py-2 hover:bg-gray-100"
 >
 Profile
 </button>

 <button
 onClick={handleLogout}
 className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
 >
 Logout
 </button>
 </div>
 )}
 </>
 )}
 </div>
 </div>
 );
}