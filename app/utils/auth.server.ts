import type { CurrentUser } from "@models/CurrentUser";
import { clearCookie, getCookie, serializeCookie } from "@utils/cookies.server";
import { decodeJwtPayload } from "@utils/jwt";

type JwtUserPayload = {
    sub?: string;
    email?: string;
    preferred_username?: string;
    "cognito:username"?: string;
    role?: string;
    "custom:role"?: string;
};

const AUTH_ID_TOKEN_COOKIE = "auth.idToken";
const AUTH_ACCESS_TOKEN_COOKIE = "auth.accessToken";
const AUTH_REFRESH_TOKEN_COOKIE = "auth.refreshToken";
const AUTH_USER_COOKIE = "auth.user";

const DEFAULT_COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: !import.meta.env.DEV,
};

const REFRESH_TOKEN_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

const REFRESH_COOKIE_OPTIONS = {
    ...DEFAULT_COOKIE_OPTIONS,
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
};

export type AuthLoaderData = {
    currentUser: CurrentUser | null;
};

export function getUserFromIdToken(idToken: string): CurrentUser | null {
    const payload = decodeJwtPayload<JwtUserPayload>(idToken);
    if (!payload) return null;

    const displayName =
        payload.preferred_username ??
        payload["cognito:username"] ??
        payload.email ??
        "Usuario";

    return {
        userId: payload.sub ?? "",
        displayName,
        role: payload["custom:role"] ?? payload.role ?? "Developer",
        profilePicture: {},
    };
}

export function getUserFromRequest(request: Request): CurrentUser | null {
    const storedUser = getCookie(request, AUTH_USER_COOKIE);

    if (storedUser) {
        try {
            return JSON.parse(storedUser) as CurrentUser;
        } catch {
            return null;
        }
    }

    const idToken = getCookie(request, AUTH_ID_TOKEN_COOKIE);
    if (!idToken) return null;

    return getUserFromIdToken(idToken);
}

export function getAccessTokenFromRequest(request: Request): string | null {
    return getCookie(request, AUTH_ACCESS_TOKEN_COOKIE);
}

export function getRefreshTokenFromRequest(request: Request): string | null {
    return getCookie(request, AUTH_REFRESH_TOKEN_COOKIE);
}

export function createAuthCookieHeaders(input: {
    idToken: string;
    accessToken: string;
    refreshToken?: string | null;
    currentUser?: CurrentUser | null;
}): string[] {
    const headers: string[] = [];

    headers.push(serializeCookie(AUTH_ID_TOKEN_COOKIE, input.idToken, DEFAULT_COOKIE_OPTIONS));
    headers.push(serializeCookie(AUTH_ACCESS_TOKEN_COOKIE, input.accessToken, DEFAULT_COOKIE_OPTIONS));

    if (input.refreshToken) {
        headers.push(serializeCookie(AUTH_REFRESH_TOKEN_COOKIE, input.refreshToken, REFRESH_COOKIE_OPTIONS));
    }

    if (input.currentUser) {
        headers.push(
            serializeCookie(
                AUTH_USER_COOKIE,
                JSON.stringify(input.currentUser),
                DEFAULT_COOKIE_OPTIONS
            )
        );
    }

    return headers;
}

export function createLogoutCookieHeaders(): string[] {
    return [
        clearCookie(AUTH_ID_TOKEN_COOKIE, DEFAULT_COOKIE_OPTIONS),
        clearCookie(AUTH_ACCESS_TOKEN_COOKIE, DEFAULT_COOKIE_OPTIONS),
        clearCookie(AUTH_REFRESH_TOKEN_COOKIE, REFRESH_COOKIE_OPTIONS),
        clearCookie(AUTH_USER_COOKIE, DEFAULT_COOKIE_OPTIONS),
    ];
}
