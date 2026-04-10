"use client";

import "./globals.css";
import { useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import { initBraze } from "./lib/braze";
import AppShell from "./components/AppShell";

export default function RootLayout({ children }) {
 useEffect(() => {
 initBraze();
 }, []);

 return (
 <html lang="en">
 <body className="bg-gray-100 text-gray-900">
 <AuthProvider>
 <AppShell>{children}</AppShell>
 </AuthProvider>
 </body>
 </html>
 );
}