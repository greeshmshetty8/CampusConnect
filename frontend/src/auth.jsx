/**
 * auth.jsx
 * --------
 * Stores the logged-in user for the whole app.
 *
 * login()  -> calls POST /api/auth/login, saves the token in localStorage
 * register() -> calls POST /api/auth/register
 * logout() -> deletes the token
 *
 * On page refresh it calls GET /api/auth/me to find out who the token belongs to.
 */
import { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    api("/api/auth/me")
      .then(setUser)
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const data = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem("token", data.access_token);
    setUser(data.user);
    return data.user;
  }

  async function register(name, email, password, adminCode) {
    const data = await api("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password,
        admin_code: adminCode || null,
      }),
    });
    localStorage.setItem("token", data.access_token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
