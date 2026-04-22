"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedEmail = localStorage.getItem("user_email");
    const storedExternalId = localStorage.getItem("user_external_id");

    if (storedEmail && storedEmail !== "undefined" && storedEmail !== "null") {
      setUser({ email: storedEmail, externalId: storedExternalId || storedEmail });
    } else {
      setUser(null);
    }

    setLoading(false);
  }, []);

  const login = (email, externalId) => {
    localStorage.setItem("user_email", email);
    localStorage.setItem("user_external_id", externalId || email);
    setUser({ email, externalId: externalId || email });
  };

  const logout = () => {
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_external_id");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);