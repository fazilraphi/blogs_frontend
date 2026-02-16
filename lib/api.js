// lib/api.js
import { getAccessToken, clearTokens } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiRequest(endpoint, options = {}) {
  const token = getAccessToken();

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    clearTokens();
    window.location.href = "/login";
    return;
  }

  return res;
}
