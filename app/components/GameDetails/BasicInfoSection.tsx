import { useState } from "react";
import { Euro, Percent } from "lucide-react";
import Card from "@components/Card";
import { Input } from "@components/Input";
import PrimaryButton from "@components/PrimaryButton";
import { apiClient } from "@services/ApiClient";
import { getApiErrorMessage } from "@/utils/apiErrors";

type BasicInfoSectionProps = {
    gameId: string;
    initialTitle: string;
    initialDescription: string;
    initialPrice: number;
    initialDiscount: number;
    initialIsPublic: boolean;
};

export default function BasicInfoSection({
    gameId,
    initialTitle,
    initialDescription,
    initialPrice,
    initialDiscount,
    initialIsPublic,
}: BasicInfoSectionProps) {
    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription);
    const [price, setPrice] = useState(initialPrice.toString());
    const [discount, setDiscount] = useState(initialDiscount.toString());
    const [isPublic, setIsPublic] = useState(initialIsPublic);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const finalPrice = (() => {
        const parsedPrice = parseFloat(price);
        const parsedDiscount = parseFloat(discount);
        if (isNaN(parsedPrice) || isNaN(parsedDiscount)) return null;
        return (parsedPrice * (1 - parsedDiscount / 100)).toFixed(2);
    })();

    const handleSave = async () => {
        const trimmedTitle = title.trim();
        if (trimmedTitle.length < 3 || trimmedTitle.length > 24) {
            setSubmitError("El título debe tener entre 3 y 24 caracteres.");
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const response = await apiClient.put(`/games/${gameId}`, {
                title: title.trim(),
                description: description.trim(),
                price: parseFloat(price),
                discount: parseFloat(discount),
                isPublic,
            });

            if (!response.ok) {
                throw new Error(
                    getApiErrorMessage(
                        response.status,
                        {
                            400: "Los datos introducidos no son válidos.",
                            401: "No tienes permisos para editar este juego.",
                            403: "No tienes permisos para editar este juego.",
                            404: "El juego no existe o fue eliminado.",
                            500: "Error interno del servidor. Inténtalo más tarde.",
                        },
                        "No se pudieron guardar los cambios."
                    )
                );
            }
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : "Error inesperado.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex gap-4">
                {/* Title */}
                <Card className="flex-2">
                    <Input.Root
                        id="title"
                        type="text"
                        variant="inside card"
                        value={title}
                        onChange={setTitle}
                    >
                        <Input.Label>Título</Input.Label>
                        <Input.Field placeholder="Título del juego" />
                        <Input.Helper>Entre 3 y 24 caracteres.</Input.Helper>
                    </Input.Root>
                </Card>

                {/* Price */}
                <Card className="flex-1">
                    <Input.Root
                        id="price"
                        type="number"
                        variant="inside card"
                        value={price}
                        onChange={setPrice}
                    >
                        <Input.Label>Precio</Input.Label>
                        <Input.Field placeholder="0" icon={Euro} />
                    </Input.Root>
                </Card>

                {/* Discount */}
                <Card className="flex-1">
                    <Input.Root
                        id="discount"
                        type="number"
                        variant="inside card"
                        value={discount}
                        onChange={setDiscount}
                    >
                        <Input.Label>Descuento</Input.Label>
                        <Input.Field placeholder="0" icon={Percent} />
                    </Input.Root>
                </Card>
            </div>

            {/* Final price preview */}
            {finalPrice !== null && parseFloat(discount) > 0 && (
                <div className="inline-flex items-center gap-2 text-sm font-light text-secondary-text">
                    <span>Precio final con descuento:</span>
                    <span className="text-primary-text font-medium">{finalPrice} €</span>
                    <span className="px-2 py-0.5 rounded-full bg-published-bg border border-published-border text-published-text text-xs">
                        -{discount}%
                    </span>
                </div>
            )}

            {/* Visibility */}
            <Card>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-slate-200">Visibilidad</span>
                        <span className="text-xs font-light text-secondary-text">
                            {isPublic ? "El juego es visible en la tienda." : "El juego está oculto en la tienda."}
                        </span>
                    </div>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={isPublic}
                        onClick={() => setIsPublic((v) => !v)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${isPublic ? "bg-emerald-500" : "bg-secondary-border"}`}
                    >
                        <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${isPublic ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                </div>
            </Card>

            {/* Description */}
            <Card>
                <Input.Root
                    id="description"
                    type="text"
                    variant="inside card"
                    size="large"
                    value={description}
                    onChange={setDescription}
                >
                    <Input.Label>Descripción</Input.Label>
                    <Input.Field placeholder="Explica brevemente tu juego, sus características y mecánicas." />
                </Input.Root>
            </Card>

            {/* Save basic info */}
            <div className="flex flex-col gap-4">
                {submitError && (
                    <div className="rounded-lg border border-error-border bg-error-bg p-3 text-sm text-error-text">
                        {submitError}
                    </div>
                )}

                <PrimaryButton className="max-w-fit" onClick={handleSave} disabled={isSubmitting}>
                    {isSubmitting ? "Guardando..." : "Guardar cambios"}
                </PrimaryButton>
            </div>
        </div>
    );
}
