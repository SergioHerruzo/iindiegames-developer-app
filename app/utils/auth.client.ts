import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { httpClient } from "@services/http.client";
import { bootstrapAuth, clearAuthStorage } from "@utils/auth";

let isInitialized = false;
let refreshPromise: Promise<void> | null = null;

function hasRetried(config: InternalAxiosRequestConfig): boolean {
    return Boolean((config as InternalAxiosRequestConfig & { _authRetry?: boolean })._authRetry);
}

function markRetried(config: InternalAxiosRequestConfig): void {
    (config as InternalAxiosRequestConfig & { _authRetry?: boolean })._authRetry = true;
}

async function refreshSession(): Promise<void> {
    if (!refreshPromise) {
        refreshPromise = bootstrapAuth().finally(() => {
            refreshPromise = null;
        });
    }

    await refreshPromise;
}

export function initAuthClient(): void {
    if (isInitialized || typeof window === "undefined") return;
    isInitialized = true;

    httpClient.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
            const status = error.response?.status;
            const config = error.config as InternalAxiosRequestConfig | undefined;

            if (!config || status !== 401 || hasRetried(config)) {
                return Promise.reject(error);
            }

            try {
                markRetried(config);
                await refreshSession();
                return httpClient(config);
            } catch (refreshError) {
                clearAuthStorage();
                return Promise.reject(refreshError);
            }
        }
    );
}
