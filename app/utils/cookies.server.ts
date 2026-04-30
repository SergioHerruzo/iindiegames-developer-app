export type CookieOptions = {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "lax" | "strict" | "none";
    path?: string;
    maxAge?: number;
    expires?: Date;
};

export function parseCookieHeader(cookieHeader: string | null): Record<string, string> {
    if (!cookieHeader) return {};

    return cookieHeader.split(";").reduce<Record<string, string>>((acc, part) => {
        const [rawName, ...rest] = part.trim().split("=");
        if (!rawName) return acc;
        const value = rest.join("=");
        acc[rawName] = value ? decodeURIComponent(value) : "";
        return acc;
    }, {});
}

export function getCookie(request: Request, name: string): string | null {
    const cookies = parseCookieHeader(request.headers.get("Cookie"));
    return cookies[name] ?? null;
}

export function serializeCookie(name: string, value: string, options: CookieOptions = {}): string {
    const encodedValue = encodeURIComponent(value);
    const parts = [`${name}=${encodedValue}`];

    if (options.maxAge !== undefined) parts.push(`Max-Age=${Math.floor(options.maxAge)}`);
    if (options.expires) parts.push(`Expires=${options.expires.toUTCString()}`);
    if (options.path) parts.push(`Path=${options.path}`);
    if (options.sameSite) parts.push(`SameSite=${options.sameSite.charAt(0).toUpperCase()}${options.sameSite.slice(1)}`);
    if (options.secure) parts.push("Secure");
    if (options.httpOnly) parts.push("HttpOnly");

    return parts.join("; ");
}

export function clearCookie(name: string, options: CookieOptions = {}): string {
    return serializeCookie(name, "", { ...options, maxAge: 0, expires: new Date(0) });
}
