import { useState } from "react";
import { CheckCircle2, KeyRound } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { confirmSignUpWithCognito } from "@services/cognito.client";

export default function ConfirmAccount() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const username = searchParams.get("username") ?? "";
    const [code, setCode] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErrorMessage(null);
        setSuccessMessage(null);

        if (!username.trim()) {
            setErrorMessage("No se encontro el usuario a confirmar. Vuelve a registrarte.");
            return;
        }

        setIsSubmitting(true);

        try {
            await confirmSignUpWithCognito({ username, code });
            setSuccessMessage("Cuenta confirmada correctamente. Ya puedes iniciar sesión.");
            navigate("/login");
        } catch (error) {
            const message = error instanceof Error ? error.message : "No se pudo confirmar la cuenta.";
            setErrorMessage(message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen px-4 bg-no-repeat bg-[radial-gradient(80vw_50vw_at_10%_0%,rgba(46,139,87,0.20),transparent_60%),radial-gradient(70vw_40vw_at_90%_100%,rgba(143,188,143,0.14),transparent_65%)]">
            <form onSubmit={handleSubmit} className="bg-bg-200/95 border border-bg-400 rounded-2xl shadow-lg p-8 w-full max-w-xl backdrop-blur-sm">
                <h1 className="font-space-grotesk text-3xl font-bold">Verificar Cuenta</h1>
                <h3 className="text-sm text-text-200">
                    Introduce el codigo de verificacion que recibiste por correo para activar tu cuenta.
                </h3>

                <label className="block mt-4 text-sm font-medium">Codigo de verificacion</label>
                <div className="relative mt-2">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-text-200" size={18} />
                    <input
                        type="text"
                        value={code}
                        onChange={(event) => setCode(event.target.value)}
                        placeholder="Ej. 123456"
                        required
                        className="w-full pl-10 pr-4 py-2 bg-bg-200 border border-bg-400 rounded-lg outline-none focus:border-primary-500 placeholder:text-sm placeholder:text-text-400"
                    />
                </div>

                {errorMessage ? <p className="mt-4 text-sm text-red-400">{errorMessage}</p> : null}
                {successMessage ? (
                    <p className="mt-4 text-sm text-green-400 inline-flex items-center gap-2">
                        <CheckCircle2 size={16} />
                        {successMessage}
                    </p>
                ) : null}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-6 px-4 py-2 bg-primary-400 text-text-100 rounded-full cursor-pointer hover:bg-primary-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Confirmando..." : "Confirmar Cuenta"}
                </button>

                <h4 className="text-sm text-text-200 mt-4">
                    ¿Ya confirmaste? <Link to="/login" className="text-accent-100 hover:text-primary-400 hover:underline">Inicia sesión</Link>
                </h4>
            </form>
        </div>
    );
}
