import { getAccessToken } from "@auth/AuthService";

const BASE_URL = import.meta.env.VITE_API_URL;
if (!BASE_URL)
    throw new Error("VITE_API_URL is not defined in environment variables");

async function request(path: string, init: RequestInit) {
    try {
        const token = await getAccessToken();
        const headers = new Headers(init.headers);

        if (token && !headers.has("Authorization")) {
            headers.set("Authorization", `Bearer ${token}`);
        }
        
        const isFormData = init.body instanceof FormData;
        if (!isFormData && !headers.has("Content-Type")) {
            headers.set("Content-Type", "application/json");
        }

        const response = await fetch(`${BASE_URL}${path}`, { ...init, headers });

        if (response.status === 401) {
            window.dispatchEvent(new Event("auth:expired"));
        }

        return response;
    } catch (err) {
        window.dispatchEvent(new Event("auth:expired"));
        throw err;
    }
}

export const apiClient = {
    get: (path: string, headers?: Record<string, string>) => 
        request(path, { method: "GET", headers }),
        
    post: <T>(path: string, body: T, headers?: Record<string, string>) => 
        request(path, { 
            method: "POST", 
            body: body instanceof FormData ? body : JSON.stringify(body), 
            headers 
        }),
        
    put: <T>(path: string, body: T, headers?: Record<string, string>) =>
        request(path, {
            method: "PUT",
            body: body instanceof FormData ? body : JSON.stringify(body),
            headers
        }),

    patch: <T>(path: string, body: T, headers?: Record<string, string>) =>
        request(path, {
            method: "PATCH",
            body: body instanceof FormData ? body : JSON.stringify(body),
            headers
        }),

    delete: (path: string, headers?: Record<string, string>) =>
        request(path, { method: "DELETE", headers }),
};