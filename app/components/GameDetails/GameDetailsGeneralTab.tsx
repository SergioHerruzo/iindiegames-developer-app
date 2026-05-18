import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Euro, Globe, Loader, Percent, Save } from "lucide-react";
import Card from "@components/Card";
import Divider from "@components/Divider";
import { Input } from "@components/Input";
import GenreSelector from "@components/GenreSelector/GenreSelector";
import PrimaryButton from "@components/PrimaryButton";
import useGameBuilds from "@/hooks/useGameBuilds";
import { getApiErrorMessage } from "@/utils/apiErrors";
import { apiClient } from "@services/ApiClient";
import type { DeveloperGame } from "@models/DeveloperGame";

type GameDetailsGeneralTabProps = {
    game: DeveloperGame;
    onRefetch?: () => void;
};

type InitialSnapshot = {
    title: string;
    description: string;
    price: number;
    discount: number;
    isPublic: boolean;
    genres: string[];
    releaseBuildId: string;
};

function normalizeGenres(value: string[]) {
    return [...value].sort();
}

function areStringArraysEqual(a: string[], b: string[]) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

export default function GameDetailsGeneralTab({ game, onRefetch }: GameDetailsGeneralTabProps) {
    const initialRef = useRef<InitialSnapshot | null>(null);

    const [title, setTitle] = useState(game.title);
    const [description, setDescription] = useState(game.description);
    const [price, setPrice] = useState(game.price.toString());
    const [discount, setDiscount] = useState(game.discount.toString());
    const [isPublic, setIsPublic] = useState(game.isPublic);
    const [genres, setGenres] = useState<string[]>(game.genres.map((g) => g.id));
    const [selectedBuildId, setSelectedBuildId] = useState("");

    const [errors, setErrors] = useState<Record<string, string | null>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [isPublishing, setIsPublishing] = useState(false);
    const [publishError, setPublishError] = useState<string | null>(null);
    const [publishSuccess, setPublishSuccess] = useState(false);

    const { builds, loading: buildsLoading } = useGameBuilds(game.id);

    useEffect(() => {
        setTitle(game.title);
        setDescription(game.description);
        setPrice(game.price.toString());
        setDiscount(game.discount.toString());
        setIsPublic(game.isPublic);
        setGenres(game.genres.map((g) => g.id));
        setSelectedBuildId("");

        initialRef.current = {
            title: game.title.trim(),
            description: game.description.trim(),
            price: game.price,
            discount: game.discount,
            isPublic: game.isPublic,
            genres: normalizeGenres(game.genres.map((g) => g.id)),
            releaseBuildId: "",
        };

        setErrors({});
        setSaveError(null);
        setSaveSuccess(false);
        setPublishError(null);
        setPublishSuccess(false);
    }, [game.id]);

    useEffect(() => {
        setIsPublic(game.isPublic);
        if (initialRef.current) {
            initialRef.current.isPublic = game.isPublic;
        }
    }, [game.isPublic]);

    useEffect(() => {
        if (!builds) return;
        const id = builds.items.find((b) => b.isReleaseBuild)?.id ?? "";
        setSelectedBuildId(id);
        if (initialRef.current) {
            initialRef.current.releaseBuildId = id;
        }
    }, [builds]);

    const parsedPrice = useMemo(() => parseFloat(price), [price]);
    const parsedDiscount = useMemo(() => parseFloat(discount), [discount]);
    const finalPrice = useMemo(() => {
        if (isNaN(parsedPrice) || isNaN(parsedDiscount)) return null;
        return (parsedPrice * (1 - parsedDiscount / 100)).toFixed(2);
    }, [parsedPrice, parsedDiscount]);

    const { basicChanged, genresChanged, releaseBuildChanged, isDirty } = useMemo(() => {
        const initial = initialRef.current;
        if (!initial) {
            return { basicChanged: false, genresChanged: false, releaseBuildChanged: false, isDirty: false };
        }

        const normalizedTitle = title.trim();
        const normalizedDescription = description.trim();
        const normalizedGenres = normalizeGenres(genres);

        const basicChangedCalc =
            normalizedTitle !== initial.title ||
            normalizedDescription !== initial.description ||
            (!isNaN(parsedPrice) && parsedPrice !== initial.price) ||
            (!isNaN(parsedDiscount) && parsedDiscount !== initial.discount) ||
            isPublic !== initial.isPublic;

        const genresChangedCalc = !areStringArraysEqual(normalizedGenres, initial.genres);
        const releaseBuildChangedCalc = Boolean(selectedBuildId) && selectedBuildId !== initial.releaseBuildId;

        return {
            basicChanged: basicChangedCalc,
            genresChanged: genresChangedCalc,
            releaseBuildChanged: releaseBuildChangedCalc,
            isDirty: basicChangedCalc || genresChangedCalc || releaseBuildChangedCalc,
        };
    }, [title, description, parsedPrice, parsedDiscount, isPublic, genres, selectedBuildId]);

    const validate = () => {
        const nextErrors: Record<string, string | null> = {};
        const trimmedTitle = title.trim();
        if (trimmedTitle.length < 3) nextErrors.title = "El título debe tener al menos 3 caracteres.";
        else if (trimmedTitle.length > 24) nextErrors.title = "El título no puede superar los 24 caracteres.";
        if (isNaN(parsedPrice) || parsedPrice < 0) nextErrors.price = "El precio debe ser un número válido (>= 0).";
        if (isNaN(parsedDiscount) || parsedDiscount < 0 || parsedDiscount > 100) nextErrors.discount = "El descuento debe estar entre 0 y 100.";
        setErrors(nextErrors);
        return Object.values(nextErrors).every((v) => !v);
    };

    const handleSaveAll = async () => {
        if (!isDirty) return;
        if (!validate()) return;

        setIsSaving(true);
        setSaveError(null);
        setSaveSuccess(false);

        try {
            if (basicChanged) {
                const response = await apiClient.put(`/games/${game.id}`, {
                    title: title.trim(),
                    description: description.trim(),
                    price: parsedPrice,
                    discount: parsedDiscount,
                    isPublic,
                });
                if (!response.ok) {
                    throw new Error(getApiErrorMessage(response.status, {
                        400: "Los datos introducidos no son válidos.",
                        401: "No tienes permisos para editar este juego.",
                        403: "No tienes permisos para editar este juego.",
                        404: "El juego no existe o fue eliminado.",
                    }, "No se pudieron guardar los cambios."));
                }
            }

            if (genresChanged) {
                const response = await apiClient.patch(`/games/${game.id}/genres`, { genres });
                if (!response.ok) {
                    throw new Error(getApiErrorMessage(response.status, {
                        400: "Los géneros seleccionados no son válidos.",
                        401: "No tienes permisos para editar este juego.",
                        403: "No tienes permisos para editar este juego.",
                        404: "El juego no existe o fue eliminado.",
                    }, "No se pudieron guardar los géneros."));
                }
            }

            if (releaseBuildChanged) {
                const response = await apiClient.patch(`/games/${game.id}/release-build`, { buildId: selectedBuildId });
                if (!response.ok) {
                    throw new Error(getApiErrorMessage(response.status, {
                        400: "La build seleccionada no es válida.",
                        401: "No tienes permisos para editar este juego.",
                        403: "No tienes permisos para editar este juego.",
                        404: "El juego o la build no existen.",
                    }, "No se pudo guardar la release build."));
                }
            }

            initialRef.current = {
                title: title.trim(),
                description: description.trim(),
                price: parsedPrice,
                discount: parsedDiscount,
                isPublic,
                genres: normalizeGenres(genres),
                releaseBuildId: selectedBuildId,
            };

            setSaveSuccess(true);
            onRefetch?.();
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : "Error inesperado.");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePublish = async () => {
        if (game.isReleased) return;
        setIsPublishing(true);
        setPublishError(null);
        setPublishSuccess(false);

        try {
            const response = await apiClient.post(`/games/${game.id}/publish`, {});
            if (!response.ok) {
                throw new Error(getApiErrorMessage(response.status, {
                    400: "El juego no cumple los requisitos para ser publicado.",
                    401: "No tienes permisos para publicar este juego.",
                    403: "No tienes permisos para publicar este juego.",
                    404: "El juego no existe o fue eliminado.",
                }, "No se pudo publicar el juego."));
            }
            setPublishSuccess(true);
            onRefetch?.();
        } catch (err) {
            setPublishError(err instanceof Error ? err.message : "Error inesperado.");
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">

            {/* Title And Genres */}
            <div className="grid grid-cols-2 gap-4">
                <Card>
                    <Input.Root
                        id="title"
                        type="text"
                        variant="inside card"
                        value={title}
                        onChange={(v) => { setTitle(v); setSaveSuccess(false); }}
                    >
                        <Input.Label>Título</Input.Label>
                        <Input.Field placeholder="Título del juego" error={errors.title} />
                        <Input.Helper>Entre 3 y 24 caracteres.</Input.Helper>
                    </Input.Root>
                </Card>

                <Card>
                    <GenreSelector
                        selectedIds={genres}
                        onChange={(val) => { setGenres(val); setSaveSuccess(false); }}
                    />
                </Card>
            </div>

            {/* Description */}
            <Card>
                <Input.Root
                    id="description"
                    type="text"
                    variant="inside card"
                    size="large"
                    value={description}
                    onChange={(v) => { setDescription(v); setSaveSuccess(false); }}
                >
                    <Input.Label>Descripción</Input.Label>
                    <Input.Field placeholder="Explica brevemente tu juego, sus características y mecánicas." />
                </Input.Root>
            </Card>

            {/* Price And Discount */}
            <div className="grid grid-cols-2 gap-4">
                <Card>
                    <Input.Root
                        id="price"
                        type="number"
                        variant="inside card"
                        value={price}
                        onChange={(v) => { setPrice(v); setSaveSuccess(false); }}
                    >
                        <Input.Label>Precio</Input.Label>
                        <Input.Field placeholder="0" icon={Euro} error={errors.price} />
                    </Input.Root>
                </Card>

                <Card>
                    <Input.Root
                        id="discount"
                        type="number"
                        variant="inside card"
                        value={discount}
                        onChange={(v) => { setDiscount(v); setSaveSuccess(false); }}
                    >
                        <Input.Label>Descuento</Input.Label>
                        <Input.Field placeholder="0" icon={Percent} error={errors.discount} />
                    </Input.Root>
                </Card>
            </div>

            {/* Calculated Final Price */}
            {finalPrice !== null && parsedDiscount > 0 && (
                <div className="inline-flex items-center gap-2 text-secondary-text px-1">
                    <span>Precio final:</span>
                    <span className="text-(--color-primary-text)">{finalPrice} €</span>
                    <span className="px-2 py-0.5 rounded-full bg-(--color-published-bg) border border-published-border text-(--color-published-text) text-sm">
                        -{discount}%
                    </span>
                </div>
            )}

            {/* Visibility And Release Build */}
            <div className="grid grid-cols-2 gap-4">
                <Card>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-badge-neutral-text">Visibilidad</span>
                            <span className="text-xs text-badge-neutral-text">
                                {isPublic ? "Visible en la tienda." : "Oculto en la tienda."}
                            </span>
                            <p className="text-xs text-badge-neutral-text">
                                La visibilidad del juego solo afecta a la tienda, los usuarios que hayan adquirido el producto podrán seguir viéndolo y usándolo en su biblioteca de Indie Games.
                            </p>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={isPublic}
                            onClick={() => { setIsPublic((v) => !v); setSaveSuccess(false); }}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${isPublic ? "bg-emerald-500" : "bg-(--color-secondary-border)"}`}
                        >
                            <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${isPublic ? "translate-x-5" : "translate-x-0"}`} />
                        </button>
                    </div>
                </Card>

                <Card>
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-badge-neutral-text">Release build</span>
                        </div>
                        <div className="relative">
                            <select
                                value={selectedBuildId}
                                onChange={(e) => { setSelectedBuildId(e.target.value); setSaveSuccess(false); }}
                                disabled={buildsLoading || isSaving}
                                className="w-full appearance-none bg-input-inside-card border border-border-inside-card rounded-lg px-3 py-2.5 pr-9 text-sm text-white/60 cursor-pointer focus:outline-none focus:border-primary-focus disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {!builds?.items.some((b) => b.isReleaseBuild) && <option value="">Sin release build</option>}
                                {builds?.items.map((build) => (
                                    <option key={build.id} value={build.id}>
                                        {build.versionName} ({build.id})
                                    </option>
                                ))}
                            </select>
                            <ChevronDown
                                size={14}
                                strokeWidth={1.5}
                                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-secondary-text"
                            />
                        </div>
                    </div>
                </Card>
            </div>

            {/* ── Guardar / Publicar ── */}
            <div className="flex flex-col gap-3">
                {saveError && (
                    <div className="rounded-lg border border-error-border bg-error-bg p-3 text-sm text-error-text">
                        {saveError}
                    </div>
                )}
                {saveSuccess && (
                    <div className="rounded-lg border border-published-border bg-(--color-published-bg) p-3 text-sm text-(--color-published-text)">
                        Cambios guardados correctamente.
                    </div>
                )}
                {publishError && (
                    <div className="rounded-lg border border-error-border bg-error-bg p-3 text-sm text-error-text">
                        {publishError}
                    </div>
                )}
                {publishSuccess && (
                    <div className="rounded-lg border border-published-border bg-published-bg p-3 text-sm text-published-text">
                        Juego publicado correctamente.
                    </div>
                )}
                <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-light text-secondary-text">
                        {isDirty ? "Tienes cambios sin guardar." : "No hay cambios pendientes."}
                    </p>
                    <div className="flex items-center gap-3">
                        {!game.isReleased && (
                            <PrimaryButton className="max-w-fit" onClick={handlePublish} disabled={isPublishing}>
                                {isPublishing
                                    ? <><Loader size={14} className="animate-spin" /> Publicando...</>
                                    : <><Globe size={14} strokeWidth={1.5} /> Publicar juego</>
                                }
                            </PrimaryButton>
                        )}
                        <PrimaryButton className="max-w-fit" onClick={handleSaveAll} disabled={isSaving || !isDirty}>
                            {isSaving
                                ? <><Loader size={14} className="animate-spin" /> Guardando...</>
                                : <><Save size={14} strokeWidth={1.5} /> Guardar cambios</>
                            }
                        </PrimaryButton>
                    </div>
                </div>
            </div>
        </div>
    );
}