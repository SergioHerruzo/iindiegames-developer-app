import { useState } from "react";
import { useNavigate } from "react-router";
import Card from "@components/Card";
import PrimaryButton from "@components/PrimaryButton";
import SecondaryButton from "@components/SecondaryButton";
import { apiClient } from "@services/ApiClient";
import { useAuth } from "@auth/UseAuth";

const TERMS = [
    {
        title: "1. Contenido publicado",
        body: "El desarrollador se compromete a no publicar contenido ilegal, obsceno, difamatorio, amenazante o que infrinja derechos de terceros. Queda prohibida la distribución de malware, software malicioso o cualquier código diseñado para dañar sistemas o usuarios.",
    },
    {
        title: "2. Propiedad intelectual",
        body: "El desarrollador declara ser titular de los derechos sobre el contenido que publique o contar con las licencias necesarias para su distribución. IndieGames no se hace responsable de reclamaciones de terceros derivadas de infracciones de propiedad intelectual.",
    },
    {
        title: "3. Contenido para menores",
        body: "Los juegos dirigidos a menores deben cumplir estrictamente la normativa aplicable. Queda prohibido incluir contenido violento explícito, sexual o de apuestas sin las restricciones de edad correspondientes.",
    },
    {
        title: "4. Veracidad de la información",
        body: "El desarrollador se compromete a proporcionar descripciones, capturas de pantalla y materiales promocionales que reflejen fielmente el estado real del juego. Las prácticas de marketing engañosas supondrán la retirada inmediata del contenido.",
    },
    {
        title: "5. Monetización y transacciones",
        body: "Todo modelo de monetización (compras integradas, suscripciones, DLC) debe ser transparente para el usuario final. Está prohibida la implementación de mecánicas de pago ocultas o abusivas.",
    },
    {
        title: "6. Suspensión de cuenta",
        body: "El incumplimiento de cualquiera de estos términos faculta a IndieGames a suspender o eliminar la cuenta del desarrollador sin previo aviso y sin derecho a compensación económica.",
    },
    {
        title: "7. Modificaciones",
        body: "IndieGames se reserva el derecho de modificar estos términos en cualquier momento. El desarrollador será notificado por correo electrónico y deberá aceptar los nuevos términos para continuar publicando contenido.",
    },
];

export default function Agreement() {
    const navigate = useNavigate();
    const { refreshSession } = useAuth();
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAccept = async () => {
        setIsPending(true);
        setError(null);
        try {
            const res = await apiClient.post("/users/me/promote-to-developer", {});
            if (!res.ok) throw new Error();
            await refreshSession();
            navigate("/panel", { replace: true });
        } catch {
            setError("No se pudo completar la solicitud. Inténtalo de nuevo.");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="h-screen overflow-hidden flex items-center justify-center landing-bg px-4 py-12">
            <div className="w-full max-w-2xl h-full flex flex-col gap-6">
                <div className="text-center">
                    <h2>Términos y condiciones para desarrolladores</h2>
                    <h5 className="mt-1">Lee y acepta los términos antes de publicar tus juegos en IndieGames.</h5>
                </div>

                <Card className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-primary">
                    <div className="flex flex-col gap-5">
                        {TERMS.map((term) => (
                            <div key={term.title}>
                                <p className="font-medium text-sm text-slate-700 dark:text-white/80 mb-1">{term.title}</p>
                                <p className="text-sm leading-relaxed">{term.body}</p>
                            </div>
                        ))}
                    </div>
                </Card>

                {error && (
                    <p role="alert" className="text-sm text-center text-red-500">{error}</p>
                )}

                <div className="flex gap-3 justify-center">
                    <SecondaryButton
                        onClick={() => navigate("/", { replace: true })}
                        disabled={isPending}
                        className="px-8 py-3"
                    >
                        <SecondaryButton.Text>No acepto</SecondaryButton.Text>
                    </SecondaryButton>
                    <PrimaryButton
                        onClick={handleAccept}
                        disabled={isPending}
                        className="px-8 py-3"
                    >
                        <PrimaryButton.Text>
                            {isPending ? "Procesando..." : "Acepto los términos"}
                        </PrimaryButton.Text>
                    </PrimaryButton>
                </div>
            </div>
        </div>
    );
}
