"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function AppShell({ children }) {
  const pathname = usePathname();

  const hideNavbar = pathname === "/login";
  const fullWidth = pathname === "/shop" || pathname === "/login" || pathname === "/home";

  return (
    <>
      {!hideNavbar && <Navbar />}
      <div className={fullWidth ? "w-full" : "max-w-6xl mx-auto p-6"}>
        {children}
      </div>
    </>
  );
}