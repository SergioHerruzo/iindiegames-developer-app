import { useState } from "react";
import { Link } from "react-router";
import { Lock, Mail, ShieldCheck, User } from "lucide-react";
import { registerWithCognito } from "@services/cognito.client";

export default function Register() {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErrorMessage(null);
        setSuccessMessage(null);

        if (password !== confirmPassword) {
            setErrorMessage("Las contraseñas no coinciden.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await registerWithCognito({ email, username, password });

            if (response.userConfirmed) {
                setSuccessMessage("Cuenta creada. Ya puedes iniciar sesión.");
            } else {
                setSuccessMessage("Cuenta creada. Revisa tu correo para confirmar la cuenta antes de iniciar sesión.");
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "No se pudo crear la cuenta.";
            setErrorMessage(message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen px-4 bg-no-repeat bg-[radial-gradient(80vw_50vw_at_10%_0%,rgba(46,139,87,0.20),transparent_60%),radial-gradient(70vw_40vw_at_90%_100%,rgba(143,188,143,0.14),transparent_65%)]">
            <form onSubmit={handleSubmit} className="bg-bg-200/95 border border-bg-400 rounded-2xl shadow-lg p-8 w-full max-w-xl backdrop-blur-sm">
                <h1 className="font-space-grotesk text-3xl font-bold">Indie Games</h1>
                <h3 className="text-sm text-text-200">Crea tu cuenta para empezar a publicar y descubrir juegos indie.</h3>

                <label className="block mt-4 text-sm font-medium">Correo Electrónico</label>
                <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-200" size={18} />
                    <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="Ingresa tu correo electrónico"
                        required
                        className="w-full pl-10 pr-4 py-2 bg-bg-200 border border-bg-400 rounded-lg outline-none focus:border-primary-500 placeholder:text-sm placeholder:text-text-400"
                    />
                </div>

                <label className="block mt-4 text-sm font-medium">Nombre de Usuario</label>
                <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-200" size={18} />
                    <input
                        type="text"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        placeholder="Crea tu nombre de usuario"
                        required
                        className="w-full pl-10 pr-4 py-2 bg-bg-200 border border-bg-400 rounded-lg outline-none focus:border-primary-500 placeholder:text-sm placeholder:text-text-400"
                    />
                </div>

                <label className="block mt-4 text-sm font-medium">Contraseña</label>
                <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-200" size={18} />
                    <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Crea una contraseña segura"
                        required
                        minLength={8}
                        className="w-full pl-10 pr-4 py-2 bg-bg-200 border border-bg-400 rounded-lg outline-none focus:border-primary-500 placeholder:text-sm placeholder:text-text-400"
                    />
                </div>

                <label className="block mt-4 text-sm font-medium">Confirmar Contraseña</label>
                <div className="relative mt-2">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-text-200" size={18} />
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        placeholder="Confirma tu contraseña"
                        required
                        minLength={8}
                        className="w-full pl-10 pr-4 py-2 bg-bg-200 border border-bg-400 rounded-lg outline-none focus:border-primary-500 placeholder:text-sm placeholder:text-text-400"
                    />
                </div>

                {errorMessage ? <p className="mt-4 text-sm text-red-400">{errorMessage}</p> : null}
                {successMessage ? <p className="mt-4 text-sm text-green-400">{successMessage}</p> : null}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-6 px-4 py-2 bg-primary-400 text-text-100 rounded-full cursor-pointer hover:bg-primary-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Creando cuenta..." : "Crear Cuenta"}
                </button>

                <h4 className="text-sm text-text-200 mt-4">
                    ¿Ya tienes una cuenta? <Link to="/login" className="text-accent-100 hover:text-primary-400 hover:underline">Inicia sesión aquí</Link>
                </h4>
            </form>
        </div>
    );
}