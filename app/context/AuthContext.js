"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedEmail = localStorage.getItem("user_email");

    if (
      storedEmail &&
      storedEmail !== "undefined" &&
      storedEmail !== "null"
    ) {
      setUser({ email: storedEmail });
    } else {
      setUser(null);
    }

    setLoading(false);
  }, []);

  const login = (email) => {
    localStorage.setItem("user_email", email);
    setUser({ email });
  };

  const logout = () => {
    localStorage.removeItem("user_email");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);