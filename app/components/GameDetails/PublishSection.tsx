import { useState } from "react";
import { Globe, Loader } from "lucide-react";
import PrimaryButton from "@components/PrimaryButton";
import { apiClient } from "@services/ApiClient";
import { getApiErrorMessage } from "@/utils/apiErrors";

type PublishSectionProps = {
    gameId: string;
};

export default function PublishSection({ gameId }: PublishSectionProps) {
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishError, setPublishError] = useState<string | null>(null);
    const [publishSuccess, setPublishSuccess] = useState(false);

    const handlePublish = async () => {
        setIsPublishing(true);
        setPublishError(null);
        setPublishSuccess(false);

        try {
            const response = await apiClient.post(`/games/${gameId}/publish`, {});

            if (!response.ok) {
                throw new Error(
                    getApiErrorMessage(
                        response.status,
                        {
                            400: "El juego no cumple los requisitos para ser publicado.",
                            401: "No tienes permisos para publicar este juego.",
                            403: "No tienes permisos para publicar este juego.",
                            404: "El juego no existe o fue eliminado.",
                            500: "Error interno del servidor. Inténtalo más tarde.",
                        },
                        "No se pudo publicar el juego."
                    )
                );
            }

            setPublishSuccess(true);
        } catch (err) {
            setPublishError(err instanceof Error ? err.message : "Error inesperado.");
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {publishError && (
                <div className="rounded-lg border border-(--color-error-border) bg-(--color-error-bg) p-3 text-sm text-(--color-error-text)">
                    {publishError}
                </div>
            )}
            {publishSuccess && (
                <div className="rounded-lg border border-(--color-published-border) bg-(--color-published-bg) p-3 text-sm text-(--color-published-text)">
                    Juego publicado correctamente.
                </div>
            )}

            <PrimaryButton className="max-w-fit" onClick={handlePublish} disabled={isPublishing}>
                {isPublishing
                    ? <><Loader size={14} className="animate-spin" /> Publicando...</>
                    : <><Globe size={14} strokeWidth={1.5} /> Publicar juego</>
                }
            </PrimaryButton>
        </div>
    );
}
