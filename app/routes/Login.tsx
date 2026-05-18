import Card from "@components/Card";
import { Input } from "@components/Input";
import { Lock, User } from "lucide-react";
import { useState, type SubmitEvent } from "react";
import PrimaryButton from "@components/PrimaryButton";
import { Link, useNavigate } from "react-router";
import { login } from "@auth/AuthService";
import { useAuth } from "@auth/UseAuth";

function parseAuthError(err: unknown): string {
    if (err instanceof Error) {
        const map: Record<string, string> = {
            NotAuthorizedException: "El usuario o la contraseña introducidos son incorrectos",
            UserNotConfirmedException: "Necesitas confirmar tu correo antes de iniciar sesión",
            UserNotFoundException: "No existe ningún usuario con ese nombre de usuario",
            TooManyRequestsException: "Demasiados intentos. Intenta de nuevo más tarde",
        };
        return map[err.name] ?? err.message;
    }
    return "Error inesperado";
}

export default function Login() {
    const { refreshSession } = useAuth();
    const navigate = useNavigate();

    const [user, setUser] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault();
        setError(null);
        if (!user.trim()) {
            setError("El nombre de usuario es obligatorio");
            return;
        }
        if (!password.trim()) {
            setError("La contraseña es obligatoria");
            return;
        }

        setIsPending(true);
        try {
            await login(user, password);
            await refreshSession();
            navigate("/panel", { replace: true });
        } catch (err) {
            setError(parseAuthError(err));
        } finally {
            setIsPending(false);
        }
    };

    return (
        <form
            className="min-h-screen max-w-xl m-auto flex items-center"
            onSubmit={handleSubmit}
        >
            <Card>
                <div className="mb-6">
                    <h2>Iniciar Sesión</h2>
                    <h5>Bienvenido de nuevo, ingresa tus credenciales</h5>
                </div>

                <div className="flex flex-col gap-4">
                    <Input.Root
                        id="user"
                        type="text"
                        value={user}
                        onChange={setUser}
                        variant="inside card"
                    >
                        <Input.Label>Usuario</Input.Label>
                        <Input.Field placeholder="Ingresa tu nombre de usuario" icon={User} />
                    </Input.Root>

                    <Input.Root
                        id="password"
                        type="password"
                        value={password}
                        onChange={setPassword}
                        variant="inside card"
                    >
                        <Input.Label>Contraseña</Input.Label>
                        <Input.Field placeholder="Ingresa tu contraseña" icon={Lock} />
                    </Input.Root>

                    {error && (
                        <p role="alert" className="text-sm text-red-500">
                            {error}
                        </p>
                    )}

                    <PrimaryButton type="submit" disabled={isPending}>
                        {isPending ? "Iniciando sesión..." : "Iniciar Sesión"}
                    </PrimaryButton>

                    <p className="text-sm">
                        No tienes una cuenta?{" "}
                        <Link to="/register" className="link">Registrarse</Link>
                    </p>
                </div>
            </Card>
        </form>
    );
}