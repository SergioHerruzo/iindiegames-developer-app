import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, ImagePlus } from "lucide-react";
import Card from "@components/Card";
import { Input } from "@components/Input";
import SecondaryButton from "@components/SecondaryButton";
import PrimaryButton from "@components/PrimaryButton";
import { apiClient } from "@services/ApiClient";
import { getApiErrorMessage } from "@/utils/apiErrors";

type CreateAchievementModalProps = {
    isOpen: boolean;
    gameId: string;
    onSuccess: () => void;
    onClose: () => void;
};

export default function CreateAchievementModal({
    isOpen,
    gameId,
    onSuccess,
    onClose,
}: CreateAchievementModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [picture, setPicture] = useState<File | null>(null);
    const [picturePreview, setPicturePreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setName("");
            setDescription("");
            setPicture(null);
            setPicturePreview(null);
            setError(null);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isOpen, onClose]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setPicture(file);
        if (file) {
            const url = URL.createObjectURL(file);
            setPicturePreview(url);
        } else {
            setPicturePreview(null);
        }
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError("El nombre del logro es obligatorio.");
            return;
        }
        if (!description.trim()) {
            setError("La descripción del logro es obligatoria.");
            return;
        }
        if (!picture) {
            setError("La imagen del logro es obligatoria.");
            return;
        }

        setError(null);
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append("Name", name.trim());
            formData.append("Description", description.trim());
            formData.append("Picture", picture);

            const response = await apiClient.post(`/games/${gameId}/achievements`, formData);

            if (!response.ok) {
                throw new Error(
                    getApiErrorMessage(
                        response.status,
                        {
                            401: "No tienes permisos para crear logros en este juego.",
                            403: "No tienes permisos para crear logros en este juego.",
                            404: "El juego no existe o fue eliminado.",
                        },
                        "No se pudo crear el logro."
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
                            <h3 className="text-base text-white/90">Nuevo logro</h3>
                            <button
                                type="button"
                                className="inline-flex items-center justify-center rounded-full p-1 transition-colors cursor-pointer border border-secondary-border bg-secondary-bg text-secondary-icon hover:bg-secondary-bg-hover hover:border-secondary-border-hover hover:text-secondary-text"
                                aria-label="Cerrar"
                                onClick={onClose}
                            >
                                <X className="h-4 w-4" strokeWidth={1.5} />
                            </button>
                        </div>

                        {/* Picture upload */}
                        <div className="flex flex-col gap-2">
                            <span className="text-sm text-badge-neutral-text">Imagen</span>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="relative flex items-center justify-center w-20 h-20 rounded-xl border border-dashed border-secondary-border bg-secondary-bg hover:bg-secondary-bg-hover hover:border-secondary-border-hover transition-colors cursor-pointer overflow-hidden"
                            >
                                {picturePreview ? (
                                    <img
                                        src={picturePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <ImagePlus size={20} strokeWidth={1.5} className="text-secondary-icon" />
                                )}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>

                        {/* Name */}
                        <Input.Root
                            id="achievement-name"
                            type="text"
                            variant="inside card"
                            value={name}
                            onChange={setName}
                            maxLength={256}
                        >
                            <Input.Label>Nombre</Input.Label>
                            <Input.Field placeholder="ej. Primera victoria" />
                        </Input.Root>

                        {/* Description */}
                        <Input.Root
                            id="achievement-description"
                            type="text"
                            variant="inside card"
                            size="large"
                            value={description}
                            onChange={setDescription}
                            maxLength={1024}
                        >
                            <Input.Label>Descripción</Input.Label>
                            <Input.Field placeholder="Describe cómo se consigue este logro..." />
                        </Input.Root>

                        {/* Error */}
                        {error && (
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
                                {isSubmitting ? "Creando..." : "Crear logro"}
                            </PrimaryButton>
                        </div>

                    </div>
                </Card>
            </div>
        </div>,
        document.body
    );
}
