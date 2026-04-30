import type { Route } from "./+types/auth.refresh";
import { refreshSessionWithCognito } from "@services/cognito.server";
import {
    createAuthCookieHeaders,
    getRefreshTokenFromRequest,
    getUserFromIdToken,
} from "@utils/auth.server";

type ActionData = {
    ok?: true;
    error?: string;
    accessToken?: string;
    currentUser?: ReturnType<typeof getUserFromIdToken>;
};

function jsonResponse(data: ActionData, init: ResponseInit = {}) {
    const headers = new Headers(init.headers);
    headers.set("Content-Type", "application/json; charset=utf-8");
    return new Response(JSON.stringify(data), { ...init, headers });
}

export async function action({ request }: Route.ActionArgs) {
    const refreshToken = getRefreshTokenFromRequest(request);

    if (!refreshToken) {
        return jsonResponse({ error: "Sesión expirada." }, { status: 401 });
    }

    try {
        const tokens = await refreshSessionWithCognito(refreshToken);
        const currentUser = getUserFromIdToken(tokens.idToken);

        const headers = new Headers();
        createAuthCookieHeaders({
            idToken: tokens.idToken,
            accessToken: tokens.accessToken,
            refreshToken,
            currentUser,
        }).forEach((value) => {
            headers.append("Set-Cookie", value);
        });

        return jsonResponse(
            {
                ok: true,
                accessToken: tokens.accessToken,
                currentUser,
            },
            { headers }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : "No se pudo renovar la sesión.";
        return jsonResponse({ error: message }, { status: 401 });
    }
}
