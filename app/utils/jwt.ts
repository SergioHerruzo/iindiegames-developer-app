type JwtPayload = Record<string, unknown>;

function base64UrlDecode(input: string): string {
    const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");

    if (typeof atob === "function") {
        return atob(padded);
    }

    if (typeof Buffer !== "undefined") {
        return Buffer.from(padded, "base64").toString("utf-8");
    }

    throw new Error("No base64 decoder available.");
}

export function decodeJwtPayload<T = JwtPayload>(token: string): T | null {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    try {
        const json = base64UrlDecode(parts[1]);
        return JSON.parse(json) as T;
    } catch {
        return null;
    }
}
