import { useEffect, useState } from "react";
import { Form, Link, useActionData, useNavigate, useNavigation } from "react-router";
import { Lock, User } from "lucide-react";
import { loginWithCognito } from "@services/cognito.server";
import { setAuthToken, setCurrentUser } from "@services/http.client";
import type { CurrentUser } from "@models/CurrentUser";
import type { Route } from "./+types/login";
import { createAuthCookieHeaders, getUserFromIdToken, redirectIfAuthenticated } from "@utils/auth.server";

type ActionData = {
    ok?: true;
    error?: string;
    accessToken?: string;
    currentUser?: CurrentUser | null;
};

function jsonResponse(data: ActionData, init: ResponseInit = {}) {
    const headers = new Headers(init.headers);
    headers.set("Content-Type", "application/json; charset=utf-8");
    return new Response(JSON.stringify(data), { ...init, headers });
}

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!username || !password) {
        return jsonResponse({ error: "Debes ingresar usuario y contraseña." }, { status: 400 });
    }

    try {
        const tokens = await loginWithCognito({ username, password });
        const currentUser = getUserFromIdToken(tokens.idToken);

        const headers = new Headers();
        createAuthCookieHeaders({
            idToken: tokens.idToken,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
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
        const message = error instanceof Error ? error.message : "No se pudo iniciar sesión.";
        return jsonResponse({ error: message }, { status: 401 });
    }
}

export default function Login() {
    const navigate = useNavigate();
    const actionData = useActionData<ActionData>();
    const navigation = useNavigation();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const isSubmitting = navigation.state === "submitting";

    useEffect(() => {
        if (!actionData?.ok) return;
        if (actionData.accessToken) setAuthToken(actionData.accessToken);
        if (actionData.currentUser) setCurrentUser(actionData.currentUser);
        navigate("/dashboard");
    }, [actionData, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen px-4 bg-no-repeat bg-[radial-gradient(80vw_50vw_at_10%_0%,rgba(46,139,87,0.20),transparent_60%),radial-gradient(70vw_40vw_at_90%_100%,rgba(143,188,143,0.14),transparent_65%)]">
            <Form method="post" className="ui-card w-full max-w-xl p-8 backdrop-blur-sm">
                <h1 className="page-title font-space-grotesk">Indie Games</h1>
                <h3 className="page-subtitle">Bienvenido de nuevo, por favor ingresa tus credenciales.</h3>

                <label className="ui-label mt-4">Usuario</label>
                <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/35" size={18} />
                    <input
                        type="text"
                        name="username"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        placeholder="Ingresa tu nombre de usuario"
                        required
                        className="ui-input pl-10"
                    />
                </div>
                <label className="ui-label mt-4">Contraseña</label>
                <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/35" size={18} />
                    <input
                        type="password"
                        name="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Ingresa tu contraseña"
                        required
                        className="ui-input pl-10"
                    />
                </div>

                {actionData?.error ? <p className="mt-4 text-sm text-rose-400">{actionData.error}</p> : null}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="ui-button-primary w-full mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Iniciando..." : "Iniciar Sesión"}
                </button>

                <h4 className="page-subtitle mt-4">
                    ¿No tienes una cuenta? <Link to="/register" className="text-emerald-600 hover:text-emerald-500 hover:underline dark:text-emerald-400">Regístrate aquí</Link>
                </h4>
            </Form>
        </div>
    );
}

export function loader({ request }: Route.LoaderArgs) {
    redirectIfAuthenticated(request);
    return null;
}