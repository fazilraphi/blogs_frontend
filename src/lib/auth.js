const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

export function setTokens(access, refresh) {
    if (typeof window !== 'undefined') {
        localStorage.setItem(ACCESS_KEY, access);
        if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
        try {
            window.dispatchEvent(new Event("auth-changed"));
        } catch {}
    }
}

export function getAccessToken() {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(ACCESS_KEY);
    }
    return null;
}

export function getRefreshToken() {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(REFRESH_KEY);
    }
    return null;
}

export function clearTokens() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
        try {
            window.dispatchEvent(new Event("auth-changed"));
        } catch {}
    }
}

export function isLoggedIn() {
    return !!getAccessToken();
}

export async function logout() {
    const token = getAccessToken();

    if (token) {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logout`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (e) {
            console.error("Logout failed", e);
        }
    }

    clearTokens();
    try {
        window.dispatchEvent(new Event("auth-changed"));
    } catch {}
    window.location.href = "/login";
}
