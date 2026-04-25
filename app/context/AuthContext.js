"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedEmail = localStorage.getItem("user_email");
    const storedExternalId = localStorage.getItem("braze_external_id");

    if (
      storedEmail &&
      storedEmail !== "undefined" &&
      storedEmail !== "null"
    ) {
      setUser({
        email: storedEmail,
        // externalId is the canonical Braze ID (same as email in your case,
        // but kept separate so it's explicit and easy to change later)
        externalId: storedExternalId || storedEmail,
      });
    } else {
      setUser(null);
    }

    setLoading(false);
  }, []);

  /**
   * login(email, externalId)
   * Both are stored; externalId is what gets passed to braze.changeUser().
   */
  const login = (email, externalId) => {
    const id = externalId || email;
    localStorage.setItem("user_email", email);
    localStorage.setItem("braze_external_id", id);
    setUser({ email, externalId: id });
  };

  const logout = () => {
    localStorage.removeItem("user_email");
    localStorage.removeItem("braze_external_id");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);