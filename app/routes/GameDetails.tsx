import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import TopBar from "@components/TopBar";
import {
    ArrowLeft,
    BarChart3,
    CircleAlert,
    CircleCheck,
    Eye,
    EyeOff,
    ImagePlus,
    Layers3,
    Loader2,
    Plus,
    ShieldAlert,
    Trash2,
    Upload,
    X,
} from "lucide-react";
import { httpClient } from "@services/http.client";
import type { DeveloperGameResponse } from "@models/DeveloperGame";
import { validateAllForPublish } from "@utils/gameValidation";
import type { Route } from "./+types/GameDetails";
import { requireRole } from "@utils/auth.server";

type SectionKey = "info" | "images" | "stats" | "versions";
type ArtworkField = "capsule" | "header" | "main";

type ArtworkState = {
    file: File | null;
    previewUrl: string | null;
};

type StoreImageSlot = {
    id: string;
    file: File | null;
    previewUrl: string | null;
    label: string;
};

const ARTWORK_LABELS: Record<ArtworkField, { title: string; description: string }> = {
    capsule: {
        title: "Capsule",
        description: "La carátula pequeña que identifica el juego en listados y cards.",
    },
    header: {
        title: "Header",
        description: "La imagen horizontal para banners y cabeceras del juego.",
    },
    main: {
        title: "Main",
        description: "La imagen principal para destacar el juego en tienda.",
    },
};

const SECTION_ITEMS: Array<{ key: SectionKey; label: string; description: string }> = [
    { key: "info", label: "Información", description: "Título, precio, visibilidad y publicación." },
    { key: "images", label: "Imágenes", description: "Artworks y capturas de tienda." },
    { key: "stats", label: "Estadísticas", description: "Espacio reservado para métricas." },
    { key: "versions", label: "Versiones", description: "Espacio reservado para releases." },
];

const createEmptyArtworkState = (): ArtworkState => ({
    file: null,
    previewUrl: null,
});

const createEmptyStoreImageSlot = (index: number): StoreImageSlot => ({
    id: `store-image-${index}`,
    file: null,
    previewUrl: null,
    label: `Captura ${index}`,
});

export async function loader({ request }: Route.LoaderArgs) {
    return { currentUser: requireRole(request, "developer") };
}

type GameData = {
    title: string;
    description: string;
    price: string;
    discount: string;
    isPublic: boolean;
};

type ImageData = {
    artworks: Record<ArtworkField, ArtworkState>;
    storeImages: StoreImageSlot[];
    nextStoreImageIndex: number;
};

type UIState = {
    isLoadingGame: boolean;
    gameLoadError: string | null;
    activeSection: SectionKey;
    publishError: string | null;
    publishMessage: string | null;
};

type DeleteModalState = {
    isOpen: boolean;
    titleInput: string;
    acknowledged: boolean;
    error: string | null;
    isProcessing: boolean;
};

export default function GameDetails() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [gameData, setGameData] = useState<GameData>({
        title: "",
        description: "",
        price: "",
        discount: "",
        isPublic: false,
    });

    const [imageData, setImageData] = useState<ImageData>({
        artworks: {
            capsule: createEmptyArtworkState(),
            header: createEmptyArtworkState(),
            main: createEmptyArtworkState(),
        },
        storeImages: [
            createEmptyStoreImageSlot(1),
            createEmptyStoreImageSlot(2),
            createEmptyStoreImageSlot(3),
        ],
        nextStoreImageIndex: 4,
    });

    const [uiState, setUIState] = useState<UIState>({
        isLoadingGame: true,
        gameLoadError: null,
        activeSection: "info",
        publishError: null,
        publishMessage: null,
    });

    const [deleteModalState, setDeleteModalState] = useState<DeleteModalState>({
        isOpen: false,
        titleInput: "",
        acknowledged: false,
        error: null,
        isProcessing: false,
    });

    const deleteTitleRef = useRef<HTMLInputElement | null>(null);
    const objectUrlsRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        return () => {
            objectUrlsRef.current.forEach((url) => window.URL.revokeObjectURL(url));
            objectUrlsRef.current.clear();
        };
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        async function fetchGameData() {
            if (!id) return;

            try {
                const response = await httpClient.get<DeveloperGameResponse>(
                    `/games/${id}/developer`,
                    { signal: controller.signal }
                );

                const game = response.data;
                setGameData({
                    title: game.title,
                    description: game.description,
                    price: game.price.toString(),
                    discount: game.discount.toString(),
                    isPublic: game.isPublic,
                });
            } catch (error) {
                if (!controller.signal.aborted) {
                    setUIState((prev) => ({
                        ...prev,
                        gameLoadError: "No se pudo cargar la información del juego. Intenta de nuevo.",
                    }));
                }
            } finally {
                if (!controller.signal.aborted) {
                    setUIState((prev) => ({ ...prev, isLoadingGame: false }));
                }
            }
        }

        setUIState((prev) => ({ ...prev, isLoadingGame: true, gameLoadError: null }));
        fetchGameData();

        return () => {
            controller.abort();
        };
    }, [id]);

    useEffect(() => {
        if (!deleteModalState.isOpen) return;

        const focusTimeout = window.setTimeout(() => {
            deleteTitleRef.current?.focus();
        }, 0);

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !deleteModalState.isProcessing) {
                closeDeleteModal();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.clearTimeout(focusTimeout);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [deleteModalState.isOpen, deleteModalState.isProcessing]);

    function registerObjectUrl(file: File | null) {
        if (!file) return null;
        const url = window.URL.createObjectURL(file);
        objectUrlsRef.current.add(url);
        return url;
    }

    function revokeObjectUrl(url: string | null) {
        if (!url) return;
        window.URL.revokeObjectURL(url);
        objectUrlsRef.current.delete(url);
    }

    function handleArtworkChange(field: ArtworkField, event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0] ?? null;
        setImageData((prev) => {
            const oldArtwork = prev.artworks[field];
            revokeObjectUrl(oldArtwork.previewUrl);
            return {
                ...prev,
                artworks: {
                    ...prev.artworks,
                    [field]: {
                        file,
                        previewUrl: registerObjectUrl(file),
                    },
                },
            };
        });
    }

    function clearArtwork(field: ArtworkField) {
        setImageData((prev) => {
            const oldArtwork = prev.artworks[field];
            revokeObjectUrl(oldArtwork.previewUrl);
            return {
                ...prev,
                artworks: {
                    ...prev.artworks,
                    [field]: createEmptyArtworkState(),
                },
            };
        });
    }

    function handleStoreImageChange(slotId: string, event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0] ?? null;
        setImageData((prev) => ({
            ...prev,
            storeImages: prev.storeImages.map((slot) => {
                if (slot.id !== slotId) return slot;
                revokeObjectUrl(slot.previewUrl);
                return {
                    ...slot,
                    file,
                    previewUrl: registerObjectUrl(file),
                };
            }),
        }));
    }

    function handleRemoveStoreImage(slotId: string) {
        setImageData((prev) => ({
            ...prev,
            storeImages: prev.storeImages.filter((slot) => {
                if (slot.id === slotId) {
                    revokeObjectUrl(slot.previewUrl);
                }
                return slot.id !== slotId;
            }),
        }));
    }

    function handleAddStoreImage() {
        setImageData((prev) => ({
            ...prev,
            storeImages: [
                ...prev.storeImages,
                createEmptyStoreImageSlot(prev.nextStoreImageIndex),
            ],
            nextStoreImageIndex: prev.nextStoreImageIndex + 1,
        }));
    }


    const artworkCount = Object.values(imageData.artworks).filter(
        (artwork) => artwork.file !== null
    ).length;

    const priceNumber = Number(gameData.price);
    const discountNumber = Number(gameData.discount);
    const discountedPrice = Math.max(
        priceNumber - (priceNumber * discountNumber) / 100,
        0
    );

    const publishValidation = validateAllForPublish(
        gameData.title,
        gameData.description,
        gameData.price,
        gameData.discount,
        artworkCount
    );

    function openDeleteModal() {
        setDeleteModalState({
            isOpen: true,
            titleInput: "",
            acknowledged: false,
            error: null,
            isProcessing: false,
        });
    }

    function closeDeleteModal() {
        if (deleteModalState.isProcessing) return;
        setDeleteModalState((prev) => ({ ...prev, isOpen: false }));
    }

    function handleAttemptPublish() {
        if (!publishValidation.valid) {
            setUIState((prev) => ({
                ...prev,
                publishError: publishValidation.message || "Error de validación",
                publishMessage: null,
            }));

            if (!publishValidation.message?.includes("artwork")) return;
            setUIState((prev) => ({ ...prev, activeSection: "images" }));
            return;
        }

        setGameData((prev) => ({ ...prev, isPublic: true }));
        setUIState((prev) => ({
            ...prev,
            publishError: null,
            publishMessage: "El juego quedó preparado para publicarse y ya está marcado como público.",
            activeSection: "info",
        }));
    }

    function handleConfirmDelete(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!deleteModalState.acknowledged) {
            setDeleteModalState((prev) => ({
                ...prev,
                error: "Marca la casilla de confirmación para continuar.",
            }));
            return;
        }

        if (deleteModalState.titleInput.trim() !== gameData.title.trim()) {
            setDeleteModalState((prev) => ({
                ...prev,
                error: "Debes escribir exactamente el título del juego.",
            }));
            return;
        }

        setDeleteModalState((prev) => ({ ...prev, isProcessing: true }));
        navigate("/dashboard", { replace: true });
    }

    const sectionNode = (() => {
        switch (uiState.activeSection) {
            case "info":
                return (
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
                        <section className="rounded-4xl border border-bg-300 bg-bg-200/85 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.4em] text-text-500">Información</p>
                                    <h2 className="mt-2 text-2xl font-space-grotesk text-text-100">Metadatos del juego</h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAttemptPublish}
                                    className="ui-button-primary font-medium hover:-translate-y-0.5"
                                >
                                    <CircleCheck className="h-4 w-4" />
                                    Intentar publicar
                                </button>
                            </div>

                            <div className="mt-6 grid gap-5">
                                <div className="grid gap-2">
                                    <label htmlFor="game-title" className="text-sm text-text-300">Título</label>
                                    <input
                                        id="game-title"
                                        value={gameData.title}
                                        onChange={(event) => setGameData((prev) => ({ ...prev, title: event.target.value }))}
                                        className="rounded-2xl border border-bg-300 bg-bg-100 px-4 py-3 text-sm text-text-100 outline-none transition-colors placeholder:text-text-500 focus:border-primary-500"
                                        placeholder="Nombre del juego"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <label htmlFor="game-description" className="text-sm text-text-300">Descripción</label>
                                    <textarea
                                        id="game-description"
                                        value={gameData.description}
                                        onChange={(event) => setGameData((prev) => ({ ...prev, description: event.target.value }))}
                                        rows={6}
                                        className="rounded-2xl border border-bg-300 bg-bg-100 px-4 py-3 text-sm text-text-100 outline-none transition-colors placeholder:text-text-500 focus:border-primary-500"
                                        placeholder="Describe tu juego, su propuesta y el tono que quieres comunicar."
                                    />
                                    <p className="text-xs text-text-500">{gameData.description.trim().length} caracteres</p>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <label className="grid gap-2 rounded-2xl border border-bg-300 bg-bg-100 p-4">
                                        <span className="text-sm text-text-300">Precio</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={gameData.price}
                                            onChange={(event) => setGameData((prev) => ({ ...prev, price: event.target.value }))}
                                            className="rounded-xl border border-bg-300 bg-bg-200 px-4 py-3 text-sm text-text-100 outline-none transition-colors focus:border-primary-500"
                                        />
                                    </label>
                                    <label className="grid gap-2 rounded-2xl border border-bg-300 bg-bg-100 p-4">
                                        <span className="text-sm text-text-300">Descuento</span>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="1"
                                            value={gameData.discount}
                                            onChange={(event) => setGameData((prev) => ({ ...prev, discount: event.target.value }))}
                                            className="rounded-xl border border-bg-300 bg-bg-200 px-4 py-3 text-sm text-text-100 outline-none transition-colors focus:border-primary-500"
                                        />
                                    </label>
                                </div>

                                <div className="rounded-2xl border border-bg-300 bg-bg-100 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm text-text-300">Visibilidad</p>
                                            <p className="mt-1 text-xs text-text-500">Controla si el juego aparece públicamente.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setGameData((prev) => ({ ...prev, isPublic: !prev.isPublic }))}
                                            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors ${gameData.isPublic ? "bg-primary-500 text-text-100" : "bg-bg-200 text-text-300 hover:text-text-100"}`}
                                        >
                                            {gameData.isPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                            {gameData.isPublic ? "Público" : "Privado"}
                                        </button>
                                    </div>
                                </div>

                                {uiState.publishError && (
                                    <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                        <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                                        <p>{uiState.publishError}</p>
                                    </div>
                                )}

                                {uiState.publishMessage && (
                                    <div className="flex items-start gap-3 rounded-2xl border border-primary-500/30 bg-primary-500/10 px-4 py-3 text-sm text-primary-50">
                                        <CircleCheck className="mt-0.5 h-5 w-5 shrink-0" />
                                        <p>{uiState.publishMessage}</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        <aside className="grid gap-4">
                            <div className="overflow-hidden rounded-4xl border border-bg-300 bg-bg-200/85 shadow-[0_24px_60px_rgba(0,0,0,0.22)] backdrop-blur">
                                <div className="border-b border-bg-300 px-5 py-4">
                                    <p className="text-xs uppercase tracking-[0.4em] text-text-500">Vista previa</p>
                                    <h3 className="mt-2 text-xl font-space-grotesk text-text-100">Cómo lo verán en tienda</h3>
                                </div>
                                <div className="space-y-4 p-5">
                                    <div className="rounded-3xl border border-bg-300 bg-linear-to-br from-bg-100 to-bg-200 p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.35em] text-text-500">Juego</p>
                                                <h4 className="mt-2 text-lg text-text-100">{gameData.title.trim() || "Sin título"}</h4>
                                            </div>
                                            <div className={`rounded-full px-3 py-1 text-xs font-medium ${gameData.isPublic ? "bg-primary-500/20 text-primary-50" : "bg-bg-300 text-text-300"}`}>
                                                {gameData.isPublic ? "Público" : "Privado"}
                                            </div>
                                        </div>
                                        <p className="mt-4 text-sm leading-6 text-text-400">{gameData.description.trim() || "Sin descripción todavía."}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="rounded-2xl border border-bg-300 bg-bg-100 p-4">
                                            <p className="text-xs uppercase tracking-[0.3em] text-text-500">Precio final</p>
                                            <p className="mt-2 text-lg text-text-100">€ {discountedPrice.toFixed(2)}</p>
                                        </div>
                                        <div className="rounded-2xl border border-bg-300 bg-bg-100 p-4">
                                            <p className="text-xs uppercase tracking-[0.3em] text-text-500">Descuento</p>
                                            <p className="mt-2 text-lg text-text-100">{discountNumber.toFixed(0)}%</p>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-dashed border-bg-300 bg-bg-100 p-4 text-sm text-text-400">
                                        <p className="text-text-200">Estado de publicación</p>
                                        <p className="mt-2 leading-6">
                                            {publishValidation.valid
                                                ? "Todo listo para publicar."
                                                : "Falta completar algún requisito para publicar correctamente."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-4xl border border-bg-300 bg-bg-200/85 p-5">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-500/15 text-primary-50">
                                        <Layers3 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-text-300">ID interno</p>
                                        <p className="mt-1 text-lg text-text-100">{id ?? "Sin ID"}</p>
                                    </div>
                                </div>
                                <p className="mt-4 text-sm leading-6 text-text-400">
                                    Esta vista centraliza la edición rápida del juego y los controles destructivos.
                                </p>
                            </div>
                        </aside>
                    </div>
                );
            case "images":
                return (
                    <div className="space-y-6">
                        <section className="rounded-4xl border border-bg-300 bg-bg-200/85 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.24)] backdrop-blur">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.4em] text-text-500">Imágenes</p>
                                    <h2 className="mt-2 text-2xl font-space-grotesk text-text-100">Artworks y capturas</h2>
                                    <p className="mt-2 max-w-2xl text-sm leading-6 text-text-400">
                                        Aquí puedes sustituir los tres artworks del juego y crear una galería de capturas para la tienda.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddStoreImage}
                                    className="ui-button-outline"
                                >
                                    <Plus className="h-4 w-4" />
                                    Añadir captura
                                </button>
                            </div>
                        </section>

                        <section className="grid gap-4 lg:grid-cols-3">
                            {(Object.keys(ARTWORK_LABELS) as ArtworkField[]).map((field) => {
                                const artwork = imageData.artworks[field];
                                const label = ARTWORK_LABELS[field];

                                return (
                                    <article key={field} className="overflow-hidden rounded-4xl border border-bg-300 bg-bg-200/85 shadow-[0_20px_50px_rgba(0,0,0,0.22)] backdrop-blur">
                                        <div className="flex items-start justify-between gap-4 border-b border-bg-300 px-5 py-4">
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.35em] text-text-500">Artwork</p>
                                                <h3 className="mt-2 text-lg text-text-100">{label.title}</h3>
                                                <p className="mt-1 text-sm leading-6 text-text-400">{label.description}</p>
                                            </div>
                                            <div className="rounded-full bg-bg-100 px-3 py-1 text-xs text-text-400">Obligatorio</div>
                                        </div>
                                        <div className="p-5">
                                            <label className="group block cursor-pointer">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="sr-only"
                                                    onChange={(event) => handleArtworkChange(field, event)}
                                                />
                                                <div className="relative flex min-h-56 items-center justify-center overflow-hidden rounded-3xl border border-dashed border-bg-300 bg-bg-100 transition-colors group-hover:border-primary-500">
                                                    {artwork.previewUrl ? (
                                                        <img
                                                            src={artwork.previewUrl}
                                                            alt={`${label.title} preview`}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-3 px-6 py-8 text-center text-text-400">
                                                            <Upload className="h-7 w-7" />
                                                            <span className="text-sm text-text-200">Haz click para seleccionar una imagen</span>
                                                            <span className="text-xs">PNG, JPG o WEBP</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </label>

                                            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-bg-300 bg-bg-100 px-4 py-3 text-sm text-text-300">
                                                <span>{artwork.file?.name ?? "Sin archivo todavía"}</span>
                                                {artwork.file && (
                                                    <button
                                                        type="button"
                                                        onClick={() => clearArtwork(field)}
                                                        className="inline-flex items-center gap-1 text-text-400 transition-colors hover:text-red-300"
                                                    >
                                                        <X className="h-4 w-4" />
                                                        Quitar
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </section>

                        <section className="rounded-4xl border border-bg-300 bg-bg-200/85 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.2)] backdrop-blur">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.4em] text-text-500">Storefront</p>
                                    <h3 className="mt-2 text-2xl font-space-grotesk text-text-100">Imágenes de la tienda</h3>
                                    <p className="mt-2 text-sm leading-6 text-text-400">
                                        Sube, previsualiza o elimina capturas según necesites. La galería crece o se limpia desde aquí.
                                    </p>
                                </div>
                                <div className="rounded-full border border-bg-300 bg-bg-100 px-3 py-1 text-xs text-text-400">
                                    {imageData.storeImages.length} capturas
                                </div>
                            </div>

                            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {imageData.storeImages.map((slot) => (
                                    <article key={slot.id} className="overflow-hidden rounded-3xl border border-bg-300 bg-bg-100">
                                        <div className="flex items-center justify-between gap-3 border-b border-bg-300 px-4 py-3">
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.35em] text-text-500">Captura</p>
                                                <h4 className="mt-1 text-base text-text-100">{slot.label}</h4>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveStoreImage(slot.id)}
                                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-bg-300 text-text-400 transition-colors hover:border-red-400 hover:text-red-300"
                                                aria-label={`Eliminar ${slot.label}`}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="p-4">
                                            <label className="group block cursor-pointer">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="sr-only"
                                                    onChange={(event) => handleStoreImageChange(slot.id, event)}
                                                />
                                                <div className="relative flex min-h-44 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-bg-300 bg-bg-200 transition-colors group-hover:border-primary-500">
                                                    {slot.previewUrl ? (
                                                        <img
                                                            src={slot.previewUrl}
                                                            alt={slot.label}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-2 px-6 py-8 text-center text-text-400">
                                                            <ImagePlus className="h-6 w-6" />
                                                            <span className="text-sm text-text-200">Seleccionar imagen</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </label>
                                            <p className="mt-3 truncate text-xs text-text-500">
                                                {slot.file?.name ?? "Sin archivo"}
                                            </p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    </div>
                );
            case "stats":
                return (
                    <section className="rounded-4xl border border-bg-300 bg-bg-200/85 p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.22)] backdrop-blur">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500/15 text-primary-50">
                            <BarChart3 className="h-7 w-7" />
                        </div>
                        <h2 className="mt-5 text-2xl font-space-grotesk text-text-100">Estadísticas</h2>
                        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-text-400">
                            Este apartado queda reservado para métricas del juego, ingresos, sesiones, conversiones y tendencias.
                        </p>
                    </section>
                );
            case "versions":
                return (
                    <section className="rounded-4xl border border-bg-300 bg-bg-200/85 p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.22)] backdrop-blur">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500/15 text-primary-50">
                            <Layers3 className="h-7 w-7" />
                        </div>
                        <h2 className="mt-5 text-2xl font-space-grotesk text-text-100">Versiones</h2>
                        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-text-400">
                            Más adelante podrás gestionar releases, notas de versión y ramas de publicación desde aquí.
                        </p>
                    </section>
                );
        }
    })();

    return (
        <>
            <TopBar />
            <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(37,111,70,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(143,188,143,0.1),transparent_22%),linear-gradient(180deg,#181818_0%,#121212_100%)]">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[linear-gradient(180deg,rgba(37,111,70,0.08),transparent)]" />
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8 lg:px-10">
                    {uiState.isLoadingGame && (
                        <div className="flex min-h-96 items-center justify-center">
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                                <p className="text-sm text-slate-500 dark:text-white/45">Cargando información del juego...</p>
                            </div>
                        </div>
                    )}

                    {uiState.gameLoadError && (
                        <div className="flex items-start gap-3 rounded-4xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-sm text-red-200">
                            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                            <div>
                                <p className="font-medium">{uiState.gameLoadError}</p>
                                <Link to="/dashboard" className="mt-2 inline-flex items-center gap-1 text-red-100 hover:underline">
                                    <ArrowLeft className="h-4 w-4" />
                                    Volver al dashboard
                                </Link>
                            </div>
                        </div>
                    )}

                    {!uiState.isLoadingGame && !uiState.gameLoadError && (
                        <>
                            <div className="ui-section flex flex-col gap-4 rounded-4xl p-6 lg:flex-row lg:items-end lg:justify-between">
                                <div className="space-y-3">
                                    <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-emerald-600 dark:text-white/50 dark:hover:text-emerald-400">
                                        <ArrowLeft className="h-5 w-5" />
                                        Volver al dashboard
                                    </Link>
                                    <div>
                                        <p className="ui-section-kicker">Detalles del juego</p>
                                        <h1 className="mt-2 text-4xl font-space-grotesk text-slate-900 dark:text-white/85">{gameData.title || "Cargando..."}</h1>
                                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-white/50">
                                            Gestiona el contenido, las imágenes, las métricas futuras y el ciclo de vida de publicación desde una sola vista.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="rounded-full border border-black/10 bg-white/60 px-4 py-2 text-sm text-slate-600 dark:border-white/10 dark:bg-white/4 dark:text-white/50">
                                        ID: {id ?? "sin-id"}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={openDeleteModal}
                                        className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200 transition-colors hover:border-red-400 hover:bg-red-500/20"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Eliminar juego
                                    </button>
                                </div>
                            </div>

                    <nav className="ui-section grid gap-3 rounded-4xl p-3 xl:grid-cols-4">
                        {SECTION_ITEMS.map((section) => (
                            <button
                                key={section.key}
                                type="button"
                                onClick={() => setUIState((prev) => ({ ...prev, activeSection: section.key }))}
                                className={`flex flex-col items-start gap-1 rounded-2xl border px-4 py-3 text-left transition-all ${uiState.activeSection === section.key ? "border-emerald-400/60 bg-emerald-500/15 text-slate-900 shadow-[0_12px_30px_rgba(37,111,70,0.18)] dark:text-emerald-100" : "border-black/10 bg-white/60 text-slate-600 hover:border-emerald-400/60 hover:text-emerald-600 dark:border-white/10 dark:bg-white/4 dark:text-white/45 dark:hover:text-emerald-400"}`}
                            >
                                <span className="text-sm font-medium">{section.label}</span>
                                <span className="text-xs leading-5 text-slate-400 dark:text-white/35">{section.description}</span>
                            </button>
                        ))}
                    </nav>

                    {sectionNode}
                        </>
                    )}
                </div>

                {deleteModalState.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm">
                        <form
                            onSubmit={handleConfirmDelete}
                            className="ui-card w-full max-w-2xl rounded-4xl border border-red-500/30 bg-white/85 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.55)] dark:bg-white/6"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/15 text-red-200">
                                        <ShieldAlert className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="ui-section-kicker">Acción destructiva</p>
                                        <h2 className="mt-2 text-2xl font-space-grotesk text-slate-900 dark:text-white/85">Eliminar juego</h2>
                                        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-white/50">
                                            Esta acción no se puede deshacer. Escribe el título exacto y confirma la casilla para continuar.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeDeleteModal}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-slate-500 transition-colors hover:border-emerald-400/40 hover:text-emerald-600 dark:border-white/10 dark:text-white/40 dark:hover:text-emerald-400"
                                    aria-label="Cerrar modal"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="ui-card mt-6 rounded-3xl p-4 text-sm text-slate-600 dark:text-white/50">
                                <p className="text-slate-700 dark:text-white/60">Juego seleccionado</p>
                                <p className="mt-1 text-slate-500 dark:text-white/45">{gameData.title}</p>
                            </div>

                            <div className="mt-5 grid gap-4">
                                <label className="grid gap-2">
                                    <span className="ui-label mb-0 text-sm">Escribe el título del juego</span>
                                    <input
                                        ref={deleteTitleRef}
                                        value={deleteModalState.titleInput}
                                        onChange={(event) => setDeleteModalState((prev) => ({ ...prev, titleInput: event.target.value }))}
                                        className="ui-input rounded-2xl focus:border-red-400"
                                        placeholder={gameData.title}
                                    />
                                </label>

                                <label className="ui-card flex cursor-pointer items-start gap-3 rounded-2xl px-4 py-4 text-sm text-slate-600 dark:text-white/50">
                                    <input
                                        type="checkbox"
                                        checked={deleteModalState.acknowledged}
                                        onChange={(event) => setDeleteModalState((prev) => ({ ...prev, acknowledged: event.target.checked }))}
                                        className="mt-1 h-4 w-4 rounded border-black/20 bg-white/80 text-red-500 focus:ring-red-500 dark:border-white/15 dark:bg-white/5"
                                    />
                                    <span>Confirmo que entiendo que eliminar el juego borrará su información y contenido asociado.</span>
                                </label>

                                {deleteModalState.error && (
                                    <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                        <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                                        <p>{deleteModalState.error}</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeDeleteModal}
                                    className="ui-button-outline"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={deleteModalState.isProcessing}
                                    className="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {deleteModalState.isProcessing ? "Eliminando..." : "Eliminar definitivamente"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </>
    );
}