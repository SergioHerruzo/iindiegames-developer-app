import { setAuthToken, setCurrentUser } from "@services/http.client";

const ACCESS_TOKEN_KEY = "auth.accessToken";
const REFRESH_TOKEN_KEY = "auth.refreshToken";
const ID_TOKEN_KEY = "auth.idToken";
const CURRENT_USER_KEY = "auth.currentUser";

export function isAuthenticated(): boolean {
    if (typeof window === "undefined") {
        return false;
    }

    const accessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);
    return Boolean(accessToken);
}

export function clearAuthStorage(): void {
    if (typeof window === "undefined") {
        return;
    }

    setAuthToken(null);
    setCurrentUser(null);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.localStorage.removeItem(ID_TOKEN_KEY);
    window.localStorage.removeItem(CURRENT_USER_KEY);
}

export async function bootstrapAuth(): Promise<void> {
    if (typeof window === "undefined") {
        return;
    }

    try {
        const response = await fetch("/auth/refresh", {
            method: "POST",
        });

        if (!response.ok) {
            clearAuthStorage();
            return;
        }

        const data = (await response.json()) as {
            accessToken?: string;
            currentUser?: unknown;
        };

        if (data.accessToken) setAuthToken(data.accessToken);
        if (data.currentUser) setCurrentUser(data.currentUser as Parameters<typeof setCurrentUser>[0]);
    } catch {
        clearAuthStorage();
    }
}
