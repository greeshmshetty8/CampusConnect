/**
 * api.js
 * ------
 * One small helper used by every page to talk to the FastAPI backend.
 * It adds the JSON header, attaches the saved login token, and turns error
 * responses into normal JavaScript errors we can show to the user.
 */
const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export function getToken() {
  return localStorage.getItem("token");
}

export async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(BASE_URL + path, { ...options, headers });

  if (!response.ok) {
    let message = "Something went wrong";
    try {
      const data = await response.json();
      message = data.detail || message;
    } catch (e) {
      /* response had no JSON body */
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const CATEGORIES = [
  "Technical",
  "Cultural",
  "Sports",
  "Workshop",
  "Seminar",
  "Competition",
];
