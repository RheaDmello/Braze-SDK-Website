"use client";

import { useState, useEffect, useRef } from "react";
import { braze, onBrazeReady } from "../lib/braze";

export default function Profile() {
 const [email, setEmail] = useState("");
 const [firstName, setFirstName] = useState("");
 const [lastName, setLastName] = useState("");
 const [phone, setPhone] = useState("");
 const [toast, setToast] = useState({
 show: false,
 message: "",
 type: "success",
 });

 const toastTimer = useRef(null);

 useEffect(() => {
 const storedEmail = localStorage.getItem("user_email");
 if (!storedEmail) return;

 setEmail(storedEmail);

 const storedProfile =
 JSON.parse(localStorage.getItem(`user_profile_${storedEmail}`)) || {};

 setFirstName(storedProfile.firstName || "");
 setLastName(storedProfile.lastName || "");
 setPhone(storedProfile.phone || "");
 }, []);

 useEffect(() => {
 return () => {
 if (toastTimer.current) clearTimeout(toastTimer.current);
 };
 }, []);

 const showToast = (message, type = "success") => {
 if (toastTimer.current) clearTimeout(toastTimer.current);

 setToast({ show: true, message, type });

 toastTimer.current = setTimeout(() => {
 setToast((prev) => ({ ...prev, show: false }));
 }, 2500);
 };

 const handleSave = () => {
 if (!email) return;

 const profileData = {
 firstName: firstName.trim(),
 lastName: lastName.trim(),
 phone: phone.trim(),
 };

 localStorage.setItem(`user_profile_${email}`, JSON.stringify(profileData));

 onBrazeReady(() => {
 try {
 const user = braze.getUser();

 if (!user) {
 showToast("Braze user not ready", "error");
 return;
 }

 user.setEmail(email);

 if (profileData.firstName) user.setFirstName(profileData.firstName);
 if (profileData.lastName) user.setLastName(profileData.lastName);
 if (profileData.phone) user.setPhoneNumber(profileData.phone);

 braze.requestImmediateDataFlush();
 showToast("Saved successfully", "success");
 } catch (error) {
 console.error("Braze update failed:", error);
 showToast("Failed to save profile", "error");
 }
 });
 };

 return (
 <main className="min-h-screen py-20 px-4 ">
 <div className="fixed top-6 right-6 z-50 pointer-events-none">
 <div
 className={`min-w-[260px] max-w-sm rounded-xl bg-white px-5 py-4 shadow-xl border border-gray-200 text-gray-800 transform transition-all duration-500 ease-in-out ${
 toast.type === "success"
 ? "border-b-4 border-b-green-500"
 : "border-b-4 border-b-red-500"
 } ${toast.show ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}`}
 >
 <p className="text-sm font-medium">{toast.message}</p>
 </div>
 </div>

 <div className="max-w-4xl mx-auto">
 <div className="bg-white/80 backdrop-blur-md border border-gray-200 shadow-xl rounded-3xl overflow-hidden">
 <div className="bg-gradient-to-r from-gray-900 to-gray-700 px-8 py-10 text-white">
 <h1 className="text-3xl font-bold">My Profile</h1>
 <p className="text-sm text-gray-200 mt-2">
 Manage your personal details
 </p>
 </div>

 <div className="px-8 py-10">
 <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
 <div className="flex flex-col items-center">
 <div className="w-28 h-28 rounded-full bg-gray-200 border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
 <svg
 xmlns="http://www.w3.org/2000/svg"
 className="w-16 h-16 text-gray-500"
 fill="none"
 viewBox="0 0 24 24"
 stroke="currentColor"
 strokeWidth={1.5}
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.118a7.5 7.5 0 0 1 15 0A17.933 17.933 0 0 1 12 21.75a17.933 17.933 0 0 1-7.5-1.632Z"
 />
 </svg>
 </div>
 </div>

 <div className="flex-1 w-full">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 First Name
 </label>
 <input
 type="text"
 placeholder="Enter first name"
 className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black focus:border-black transition"
 value={firstName}
 onChange={(e) => setFirstName(e.target.value)}
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Last Name
 </label>
 <input
 type="text"
 placeholder="Enter last name"
 className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black focus:border-black transition"
 value={lastName}
 onChange={(e) => setLastName(e.target.value)}
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Email Address
 </label>
 <input
 type="email"
 value={email}
 readOnly
 className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-gray-500 cursor-not-allowed"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Phone Number
 </label>
 <input
 type="tel"
 placeholder="Enter phone number"
 className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black focus:border-black transition"
 value={phone}
 onChange={(e) => setPhone(e.target.value)}
 />
 </div>
 </div>

 <div className="mt-8 flex justify-end">
 <button
 onClick={handleSave}
 className="inline-flex items-center justify-center rounded-xl bg-black text-white px-6 py-3 font-medium hover:bg-gray-800 transition shadow-md"
 >
 Save Changes
 </button>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </main>
 );
}