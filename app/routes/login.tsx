import { useEffect, useState } from "react";
import { Form, Link, useActionData, useNavigate, useNavigation } from "react-router";
import { Lock, User } from "lucide-react";
import { loginWithCognito } from "@services/cognito.server";
import { setAuthToken, setCurrentUser } from "@services/http.client";
import type { CurrentUser } from "@models/CurrentUser";
import type { Route } from "./+types/login";
import { createAuthCookieHeaders, getUserFromIdToken } from "@utils/auth.server";

type ActionData = {
    ok?: true;
    error?: string;
    accessToken?: string;
    refreshToken?: string;
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
            currentUser,
        }).forEach((value) => {
            headers.append("Set-Cookie", value);
        });

        return jsonResponse(
            {
                ok: true,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
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
        if (actionData.refreshToken) window.localStorage.setItem("auth.refreshToken", actionData.refreshToken);
        if (actionData.currentUser) setCurrentUser(actionData.currentUser);
        navigate("/dashboard");
    }, [actionData, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen px-4 bg-no-repeat bg-[radial-gradient(80vw_50vw_at_10%_0%,rgba(46,139,87,0.20),transparent_60%),radial-gradient(70vw_40vw_at_90%_100%,rgba(143,188,143,0.14),transparent_65%)]">
            <Form method="post" className="bg-bg-200/95 border border-bg-400 rounded-2xl shadow-lg p-8 w-full max-w-xl backdrop-blur-sm">
                <h1 className="font-space-grotesk text-3xl font-bold">Indie Games</h1>
                <h3 className="text-sm text-text-200">Bienvenido de nuevo, por favor ingresa tus credenciales.</h3>

                <label className="block mt-4 text-sm font-medium">Usuario</label>
                <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-200" size={18} />
                    <input
                        type="text"
                        name="username"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        placeholder="Ingresa tu nombre de usuario"
                        required
                        className="w-full pl-10 pr-4 py-2 bg-bg-200 border border-bg-400 rounded-lg outline-none focus:border-primary-500 placeholder:text-sm placeholder:text-text-400"
                    />
                </div>
                <label className="block mt-4 text-sm font-medium">Contraseña</label>
                <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-200" size={18} />
                    <input
                        type="password"
                        name="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Ingresa tu contraseña"
                        required
                        className="w-full pl-10 pr-4 py-2 bg-bg-200 border border-bg-400 rounded-lg outline-none focus:border-primary-500 placeholder:text-sm placeholder:text-text-400"
                    />
                </div>

                {actionData?.error ? <p className="mt-4 text-sm text-red-400">{actionData.error}</p> : null}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-6 px-4 py-2 bg-primary-400 text-text-100 rounded-full cursor-pointer hover:bg-primary-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Iniciando..." : "Iniciar Sesión"}
                </button>

                <h4 className="text-sm text-text-200 mt-4">
                    ¿No tienes una cuenta? <Link to="/register" className="text-accent-100 hover:text-primary-400 hover:underline">Regístrate aquí</Link>
                </h4>
            </Form>
        </div>
    );
}