import { useMemo, useState } from "react";
import { useLoaderData, useNavigate } from "react-router";
import type { Route } from "./+types/DeveloperAgreement";
import { httpClient, setCurrentUser } from "@services/http.client";
import type { CurrentUser } from "@models/CurrentUser";
import { requireRole } from "@utils/auth.server";
import TopBar from "@components/TopBar";

const TERMS = [
    {
        title: "Responsabilidad del contenido",
        description:
            "Eres responsable del contenido que publiques, incluyendo assets, metadata y textos de tu juego.",
    },
    {
        title: "Calidad y cumplimiento",
        description:
            "Tu juego debe cumplir las normas de calidad, edad y cumplimiento legal aplicables.",
    },
    {
        title: "Propiedad intelectual",
        description:
            "Confirmas que tienes los derechos necesarios para distribuir el contenido que subas.",
    },
    {
        title: "Soporte y actualizaciones",
        description:
            "Te comprometes a mantener tu juego actualizado y responder a incidencias críticas.",
    },
    {
        title: "Pagos y comisiones",
        description:
            "Aceptas el modelo de comisiones y los plazos de liquidacion establecidos.",
    },
];

type LoaderData = {
    currentUser: CurrentUser;
};

export async function loader({ request }: Route.LoaderArgs): Promise<LoaderData> {
    return { currentUser: requireRole(request, "user") };
}

export default function DeveloperAgreement() {
    const { currentUser } = useLoaderData<LoaderData>();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const welcomeLabel = useMemo(() => {
        return currentUser?.displayName ? `Hola, ${currentUser.displayName}` : "Bienvenido";
    }, [currentUser]);

    const handleAccept = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await httpClient.post<CurrentUser>("/users/me/promote-to-developer");
            if (response?.data) {
                setCurrentUser(response.data);
            }
            navigate("/dashboard");
        } catch {
            setError("No se han podido aceptar las condiciones. Intentalo de nuevo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-no-repeat bg-[radial-gradient(80vw_50vw_at_10%_0%,rgba(46,139,87,0.18),transparent_60%),radial-gradient(70vw_40vw_at_90%_100%,rgba(143,188,143,0.12),transparent_65%)]">
            <TopBar />
            <div className="mx-auto w-full max-w-4xl px-6 pb-16">
                <div className="rounded-3xl border border-bg-400 bg-bg-200/90 p-8 shadow-xl backdrop-blur-sm">
                    <p className="text-sm font-medium text-text-200">{welcomeLabel}</p>
                    <h1 className="mt-2 text-3xl font-space-grotesk font-bold text-text-100">
                        Acuerdo de desarrollador
                    </h1>
                    <p className="mt-3 text-text-200">
                        Antes de publicar juegos en Indie Games necesitas aceptar las condiciones de uso.
                        Este acuerdo protege a la comunidad y garantiza una experiencia segura para todos.
                    </p>

                    <div className="mt-8 grid gap-4">
                        {TERMS.map((term) => (
                            <div key={term.title} className="rounded-2xl border border-bg-400 bg-bg-100/60 p-4">
                                <h3 className="text-lg font-semibold text-text-100">{term.title}</h3>
                                <p className="mt-1 text-sm text-text-200">{term.description}</p>
                            </div>
                        ))}
                    </div>

                    {error ? <p className="mt-6 text-sm text-red-400">{error}</p> : null}

                    <div className="mt-8 flex flex-wrap items-center gap-4">
                        <button
                            type="button"
                            onClick={handleAccept}
                            disabled={isSubmitting}
                            className="rounded-full bg-primary-400 px-6 py-2 text-text-100 transition-colors hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isSubmitting ? "Aceptando..." : "Aceptar condiciones"}
                        </button>
                        <p className="text-xs text-text-200">
                            Al aceptar, tu cuenta se convertira en developer y podras acceder al dashboard.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
