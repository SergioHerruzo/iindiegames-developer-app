import { useState } from "react";
import { Euro, Percent } from "lucide-react";
import Card from "@components/Card";
import { Input } from "@components/Input";
import Divider from "@components/Divider";
import PrimaryButton from "@components/PrimaryButton";
import GenreSelector from "@components/GenreSelector/GenreSelector";
import type { DeveloperGame } from "@models/DeveloperGame";

type GameDetailsGeneralTabProps = {
    game: DeveloperGame;
};

export default function GameDetailsGeneralTab({ game }: GameDetailsGeneralTabProps) {
    const [title, setTitle] = useState(game.title);
    const [description, setDescription] = useState(game.description);
    const [price, setPrice] = useState(game.price.toString());
    const [discount, setDiscount] = useState(game.discount.toString());
    const [genres, setGenres] = useState<string[]>(game.genres.map((g) => g.id));

    const [errors, setErrors] = useState<Record<string, string | null>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const finalPrice = (() => {
        const p = parseFloat(price);
        const d = parseFloat(discount);
        if (isNaN(p) || isNaN(d)) return null;
        return (p * (1 - d / 100)).toFixed(2);
    })();

    const handleSave = async () => {
        setIsSubmitting(true);
        setTimeout(() => setIsSubmitting(false), 1000);
    };

    return (
        <div className="flex flex-col gap-6">

            {/* Basic Info */}
            <Divider title="Información básica" />

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
                        <Input.Field
                            placeholder="Título del juego"
                            error={errors.title}
                        />
                        <Input.Helper>Entre 1 y 24 caracteres.</Input.Helper>
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
                        <Input.Field placeholder="0" icon={Euro} error={errors.price} />
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
                        <Input.Field placeholder="0" icon={Percent} error={errors.discount} />
                    </Input.Root>
                </Card>
            </div>

            {/* Final price preview */}
            {finalPrice !== null && parseFloat(discount) > 0 && (
                <div className="inline-flex items-center gap-2 text-sm font-light text-(--color-secondary-text)">
                    <span>Precio final con descuento:</span>
                    <span className="text-(--color-primary-text) font-medium">{finalPrice} €</span>
                    <span className="px-2 py-0.5 rounded-full bg-(--color-published-bg) border border-(--color-published-border) text-(--color-published-text) text-xs">
                        -{discount}%
                    </span>
                </div>
            )}

            {/* Genres */}
            <Card>
                <GenreSelector
                    selectedIds={genres}
                    onChange={setGenres}
                    error={errors.genres}
                />
            </Card>

            {/* Description */}
            <Divider title="Descripción" />

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
                    <Input.Field
                        placeholder="Explica brevemente tu juego, sus características y mecánicas."
                        error={errors.description}
                    />
                </Input.Root>
            </Card>

            {/* Save */}
            <Divider />

            <div className="flex flex-col gap-4">
                {submitError && (
                    <div className="rounded-lg border border-(--color-error-border) bg-(--color-error-bg) p-3 text-sm text-(--color-error-text)">
                        {submitError}
                    </div>
                )}

                <PrimaryButton
                    className="max-w-fit"
                    onClick={handleSave}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Guardando..." : "Guardar cambios"}
                </PrimaryButton>
            </div>
        </div>
    );
}