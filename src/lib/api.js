const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiRequest(endpoint, options = {}) {
    let token = typeof window !== 'undefined' ? localStorage.getItem("access_token") : null;

    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    let res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (res.status === 401) {
        // Try refresh logic - improved slightly
        try {
            const refreshRes = await fetch(`${API_URL}/refresh`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include", // Important for cookies
            });

            if (refreshRes.ok) {
                const data = await refreshRes.json();
                if (data.access_token) {
                    localStorage.setItem("access_token", data.access_token);
                    try {
                        window.dispatchEvent(new Event("auth-changed"));
                    } catch {}
                    // Update token for retry
                    headers["Authorization"] = `Bearer ${data.access_token}`;
                    return fetch(`${API_URL}${endpoint}`, { ...options, headers });
                }
            }
        } catch (e) {
            console.error("Token refresh failed", e);
        }

        // If refresh fails or throws
        if (typeof window !== 'undefined') {
            localStorage.removeItem("access_token");
            window.location.href = "/login";
        }
        return res; // Return original 401 response so caller can handle if needed, or redirect happened
    }

    return res;
}
