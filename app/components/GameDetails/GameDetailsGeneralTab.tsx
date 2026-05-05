import { useState } from "react";
import { Euro, Percent, Save, Loader, ChevronDown, Globe } from "lucide-react";
import Card from "@components/Card";
import { Input } from "@components/Input";
import Divider from "@components/Divider";
import PrimaryButton from "@components/PrimaryButton";
import GenreSelector from "@components/GenreSelector/GenreSelector";
import useGameBuilds from "@/hooks/useGameBuilds";
import { apiClient } from "@services/ApiClient";
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
    const [isPublic, setIsPublic] = useState(game.isPublic);
    const [selectedBuildId, setSelectedBuildId] = useState(game.releaseBuild?.id ?? "");

    const [errors, setErrors] = useState<Record<string, string | null>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const [isSavingGenres, setIsSavingGenres] = useState(false);
    const [saveGenresError, setSaveGenresError] = useState<string | null>(null);
    const [saveGenresSuccess, setSaveGenresSuccess] = useState(false);

    const [isSavingReleaseBuild, setIsSavingReleaseBuild] = useState(false);
    const [saveReleaseBuildError, setSaveReleaseBuildError] = useState<string | null>(null);
    const [saveReleaseBuildSuccess, setSaveReleaseBuildSuccess] = useState(false);

    const [isPublishing, setIsPublishing] = useState(false);
    const [publishError, setPublishError] = useState<string | null>(null);
    const [publishSuccess, setPublishSuccess] = useState(false);

    const { builds, loading: buildsLoading } = useGameBuilds(game.id);

    const handlePublish = async () => {
        setIsPublishing(true);
        setPublishError(null);
        setPublishSuccess(false);

        try {
            const response = await apiClient.post(`/games/${game.id}/publish`, {});

            if (!response.ok) {
                let message = "No se pudo publicar el juego.";
                switch (response.status) {
                    case 400: message = "El juego no cumple los requisitos para ser publicado."; break;
                    case 401:
                    case 403: message = "No tienes permisos para publicar este juego."; break;
                    case 404: message = "El juego no existe o fue eliminado."; break;
                    case 500: message = "Error interno del servidor. Inténtalo más tarde."; break;
                }
                throw new Error(message);
            }

            setPublishSuccess(true);
        } catch (err) {
            setPublishError(err instanceof Error ? err.message : "Error inesperado.");
        } finally {
            setIsPublishing(false);
        }
    };

    const finalPrice = (() => {
        const p = parseFloat(price);
        const d = parseFloat(discount);
        if (isNaN(p) || isNaN(d)) return null;
        return (p * (1 - d / 100)).toFixed(2);
    })();

    const handleSave = async () => {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const response = await apiClient.put(`/games/${game.id}`, {
                title: title.trim(),
                description: description.trim(),
                price: parseFloat(price),
                discount: parseFloat(discount),
                isPublic,
            });

            if (!response.ok) {
                let message = "No se pudieron guardar los cambios.";
                switch (response.status) {
                    case 400: message = "Los datos introducidos no son válidos."; break;
                    case 401:
                    case 403: message = "No tienes permisos para editar este juego."; break;
                    case 404: message = "El juego no existe o fue eliminado."; break;
                    case 500: message = "Error interno del servidor. Inténtalo más tarde."; break;
                }
                throw new Error(message);
            }
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : "Error inesperado.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveGenres = async () => {
        setIsSavingGenres(true);
        setSaveGenresError(null);
        setSaveGenresSuccess(false);

        try {
            const response = await apiClient.patch(`/games/${game.id}/genres`, { genres });

            if (!response.ok) {
                let message = "No se pudieron guardar los géneros.";
                switch (response.status) {
                    case 400: message = "Los géneros seleccionados no son válidos."; break;
                    case 401:
                    case 403: message = "No tienes permisos para editar este juego."; break;
                    case 404: message = "El juego no existe o fue eliminado."; break;
                    case 500: message = "Error interno del servidor. Inténtalo más tarde."; break;
                }
                throw new Error(message);
            }

            setSaveGenresSuccess(true);
        } catch (err) {
            setSaveGenresError(err instanceof Error ? err.message : "Error inesperado.");
        } finally {
            setIsSavingGenres(false);
        }
    };

    const handleSaveReleaseBuild = async () => {
        if (!selectedBuildId) return;
        setIsSavingReleaseBuild(true);
        setSaveReleaseBuildError(null);
        setSaveReleaseBuildSuccess(false);

        try {
            const response = await apiClient.patch(`/games/${game.id}/release-build`, { buildId: selectedBuildId });

            if (!response.ok) {
                let message = "No se pudo guardar la release build.";
                switch (response.status) {
                    case 400: message = "La build seleccionada no es válida."; break;
                    case 401:
                    case 403: message = "No tienes permisos para editar este juego."; break;
                    case 404: message = "El juego o la build no existen."; break;
                    case 500: message = "Error interno del servidor. Inténtalo más tarde."; break;
                }
                throw new Error(message);
            }

            setSaveReleaseBuildSuccess(true);
        } catch (err) {
            setSaveReleaseBuildError(err instanceof Error ? err.message : "Error inesperado.");
        } finally {
            setIsSavingReleaseBuild(false);
        }
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

            {/* Visibility */}
            <Card>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-slate-200">Visibilidad</span>
                        <span className="text-xs font-light text-(--color-secondary-text)">
                            {isPublic ? "El juego es visible en la tienda." : "El juego está oculto en la tienda."}
                        </span>
                    </div>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={isPublic}
                        onClick={() => setIsPublic((v) => !v)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${isPublic ? "bg-emerald-500" : "bg-(--color-secondary-border)"}`}
                    >
                        <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${isPublic ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                </div>
            </Card>

            {/* Genres */}
            <Card>
                <GenreSelector
                    selectedIds={genres}
                    onChange={(val) => {
                        setGenres(val);
                        setSaveGenresSuccess(false);
                    }}
                    error={errors.genres}
                />
            </Card>

            {saveGenresError && (
                <div className="rounded-lg border border-(--color-error-border) bg-(--color-error-bg) p-3 text-sm text-(--color-error-text)">
                    {saveGenresError}
                </div>
            )}
            {saveGenresSuccess && (
                <div className="rounded-lg border border-(--color-published-border) bg-(--color-published-bg) p-3 text-sm text-(--color-published-text)">
                    Géneros guardados correctamente.
                </div>
            )}

            <PrimaryButton className="max-w-fit" onClick={handleSaveGenres} disabled={isSavingGenres}>
                {isSavingGenres
                    ? <><Loader size={14} className="animate-spin" /> Guardando géneros...</>
                    : <><Save size={14} strokeWidth={1.5} /> Guardar géneros</>
                }
            </PrimaryButton>

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

            {/* Save basic info */}
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

            {/* Release build */}
            <Divider title="Release build" />

            <Card>
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-slate-200">Versión de release</span>
                        <span className="text-xs font-light text-(--color-secondary-text)">
                            {game.releaseBuild
                                ? `Actual: ${game.releaseBuild.versionName}`
                                : "Ninguna build configurada como release."
                            }
                        </span>
                    </div>

                    <div className="relative">
                        <select
                            value={selectedBuildId}
                            onChange={(e) => {
                                setSelectedBuildId(e.target.value);
                                setSaveReleaseBuildSuccess(false);
                            }}
                            disabled={buildsLoading || isSavingReleaseBuild}
                            className="w-full appearance-none bg-(--color-secondary-bg) border border-(--color-secondary-border) rounded-lg px-3 py-2.5 pr-9 text-sm text-slate-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">Sin release build</option>
                            {builds?.items.map((build) => (
                                <option key={build.id} value={build.id}>
                                    {build.versionName}
                                    {build.isReleaseBuild ? " (actual)" : ""}
                                    {" · "}
                                    {build.status}
                                </option>
                            ))}
                        </select>
                        <ChevronDown
                            size={14}
                            strokeWidth={1.5}
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--color-secondary-text)"
                        />
                    </div>
                </div>
            </Card>

            {saveReleaseBuildError && (
                <div className="rounded-lg border border-(--color-error-border) bg-(--color-error-bg) p-3 text-sm text-(--color-error-text)">
                    {saveReleaseBuildError}
                </div>
            )}
            {saveReleaseBuildSuccess && (
                <div className="rounded-lg border border-(--color-published-border) bg-(--color-published-bg) p-3 text-sm text-(--color-published-text)">
                    Release build actualizada correctamente.
                </div>
            )}

            <PrimaryButton
                className="max-w-fit"
                onClick={handleSaveReleaseBuild}
                disabled={isSavingReleaseBuild || !selectedBuildId}
            >
                {isSavingReleaseBuild
                    ? <><Loader size={14} className="animate-spin" /> Guardando...</>
                    : <><Save size={14} strokeWidth={1.5} /> Guardar release build</>
                }
            </PrimaryButton>

            {/* Publish */}
            <Divider title="Publicar" />

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
