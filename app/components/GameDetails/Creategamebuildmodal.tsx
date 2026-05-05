import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import Card from "@components/Card";
import { Input } from "@components/Input";
import SecondaryButton from "@components/SecondaryButton";
import PrimaryButton from "@components/PrimaryButton";
import { apiClient } from "@services/ApiClient";
import { getApiErrorMessage } from "@/utils/apiErrors";

type CreateGameBuildModalProps = {
    isOpen: boolean;
    gameId: string;
    onSuccess: () => void;
    onClose: () => void;
};

export default function CreateGameBuildModal({
    isOpen,
    gameId,
    onSuccess,
    onClose,
}: CreateGameBuildModalProps) {
    const [versionName, setVersionName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset on open
    useEffect(() => {
        if (isOpen) {
            setVersionName("");
            setError(null);
        }
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isOpen, onClose]);

    const handleSubmit = async () => {
        if (!versionName.trim()) {
            setError("El nombre de la versión es obligatorio.");
            return;
        }

        setError(null);
        setIsSubmitting(true);

        try {
            const response = await apiClient.post(`/games/${gameId}/builds`, {
                versionName: versionName.trim(),
            });

            if (!response.ok) {
                throw new Error(
                    getApiErrorMessage(
                        response.status,
                        {
                            401: "No tienes permisos para crear builds en este juego.",
                            403: "No tienes permisos para crear builds en este juego.",
                            404: "El juego no existe o fue eliminado.",
                            409: "Ya existe una build con ese nombre de versión.",
                        },
                        "No se pudo crear la build."
                    )
                );
            }

            onSuccess();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error inesperado al conectar con el servidor.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
            onMouseDown={onClose}
        >
            <div
                className="w-full max-w-md"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <Card variant="default">
                    <div className="flex flex-col gap-4">

                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-base text-white/90">Nueva build</h3>
                            <button
                                type="button"
                                className="inline-flex items-center justify-center rounded-full p-1 transition-colors cursor-pointer border border-secondary-border bg-secondary-bg text-secondary-icon hover:bg-secondary-bg-hover hover:border-secondary-border-hover hover:text-secondary-text"
                                aria-label="Cerrar"
                                onClick={onClose}
                            >
                                <X className="h-4 w-4" strokeWidth={1.5} />
                            </button>
                        </div>

                        {/* Input */}
                        <Input.Root
                            id="version-name"
                            type="text"
                            variant="inside card"
                            value={versionName}
                            onChange={setVersionName}
                        >
                            <Input.Label>Nombre de versión</Input.Label>
                            <Input.Field
                                placeholder="ej. 1.0.0"
                                error={error}
                            />
                        </Input.Root>

                        {/* Submit error */}
                        {error && versionName.trim() && (
                            <div className="rounded-lg border border-error-border bg-error-bg p-3 text-sm text-error-text">
                                {error}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-2">
                            <SecondaryButton onClick={onClose} disabled={isSubmitting}>
                                Cancelar
                            </SecondaryButton>
                            <PrimaryButton onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting ? "Creando..." : "Crear build"}
                            </PrimaryButton>
                        </div>

                    </div>
                </Card>
            </div>
        </div>,
        document.body
    );
}