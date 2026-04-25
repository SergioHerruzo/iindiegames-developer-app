import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";

const AUTH_ACCESS_TOKEN_KEY = "auth.accessToken";

function getBearerToken(): string | null {
    if (typeof window === "undefined") {
        return null;
    }

    return window.localStorage.getItem(AUTH_ACCESS_TOKEN_KEY);
}

function applyBearerToken(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    const token = getBearerToken();

    if (!token) {
        return config;
    }

    const headers = AxiosHeaders.from(config.headers);
    headers.set("Authorization", `Bearer ${token}`);
    config.headers = headers;

    return config;
}

export const httpClient = axios.create();

httpClient.interceptors.request.use(applyBearerToken);

export function setAuthToken(token: string | null): void {
    if (typeof window === "undefined") {
        return;
    }

    if (token) {
        window.localStorage.setItem(AUTH_ACCESS_TOKEN_KEY, token);
        return;
    }

    window.localStorage.removeItem(AUTH_ACCESS_TOKEN_KEY);
}

export function getStoredAuthToken(): string | null {
    return getBearerToken();
}
