import { getAccessToken } from "@auth/AuthService";

const BASE_URL = import.meta.env.VITE_API_URL;
if (!BASE_URL)
    throw new Error("VITE_API_URL is not defined in environment variables");

async function getHeaders() {
    const token = await getAccessToken();
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

async function request(path: string, init: RequestInit) {
    try {
        const headers = await getHeaders();
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
    get: (path: string) => request(path, { method: "GET" }),
    post: <T>(path: string, body: T) => request(path, { method: "POST", body: JSON.stringify(body) }),
    put: <T>(path: string, body: T) => request(path, { method: "PUT", body: JSON.stringify(body) }),
    delete: (path: string) => request(path, { method: "DELETE" }),
};