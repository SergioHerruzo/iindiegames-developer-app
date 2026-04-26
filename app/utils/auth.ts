import { refreshSessionWithCognito } from "@services/cognito.client";
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

    const refreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!refreshToken) {
        clearAuthStorage();
        return;
    }

    try {
        await refreshSessionWithCognito(refreshToken);
    } catch {
        clearAuthStorage();
    }
}
