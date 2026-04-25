import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import type { CurrentUser } from "@models/CurrentUser";

const AUTH_ACCESS_TOKEN_KEY = "auth.accessToken";
const AUTH_CURRENT_USER_KEY = "auth.currentUser";
const apiBaseUrl = import.meta.env.VITE_BASE_URL;

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

export const httpClient = axios.create({
    baseURL: apiBaseUrl || undefined,
});

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

export function setCurrentUser(user: CurrentUser | null): void {
    if (typeof window === "undefined") {
        return;
    }

    if (user) {
        window.localStorage.setItem(AUTH_CURRENT_USER_KEY, JSON.stringify(user));
        return;
    }

    window.localStorage.removeItem(AUTH_CURRENT_USER_KEY);
}

export function getStoredCurrentUser(): CurrentUser | null {
    if (typeof window === "undefined") {
        return null;
    }

    const storedUser = window.localStorage.getItem(AUTH_CURRENT_USER_KEY);

    if (!storedUser) {
        return null;
    }

    try {
        return JSON.parse(storedUser) as CurrentUser;
    } catch {
        window.localStorage.removeItem(AUTH_CURRENT_USER_KEY);
        return null;
    }
}
