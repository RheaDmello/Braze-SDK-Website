"use client";

import "./globals.css";
import { useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import { initBraze } from "./lib/braze";
import AppShell from "./components/AppShell";

export default function RootLayout({ children }) {
  useEffect(() => {
    // Use the stored externalId (set during login) — this is the canonical
    // Braze user ID. Fall back to email only if externalId isn't stored yet
    // (e.g. users who logged in before this fix was deployed).
    const storedExternalId = localStorage.getItem("braze_external_id");
    const storedEmail = localStorage.getItem("user_email");

    const userId =
      storedExternalId && storedExternalId !== "undefined" && storedExternalId !== "null"
        ? storedExternalId
        : storedEmail && storedEmail !== "undefined" && storedEmail !== "null"
        ? storedEmail
        : undefined;

    // initBraze will call changeUser(userId) if userId is present,
    // then openSession — correct order guaranteed inside initBraze.
    initBraze(userId);
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