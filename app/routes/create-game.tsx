import { useEffect, useMemo, useRef, useState, type ChangeEvent, type SubmitEvent } from "react";
import { ArrowLeft, Check, Loader2, Plus, Search, X } from "lucide-react";
import { Link, useNavigate } from "react-router";
import TopBar from "~/components/TopBar";
import { httpClient } from "@services/http.client";
import type { Genre } from "@models/Genre";
import type { PaginatedResponse } from "@models/PaginatedResponse";
import type { CreateGameBody } from "@models/CreateGameBody";
import type { Route } from "./+types/create-game";
import { requireRole } from "@utils/auth.server";

type GenreOption = Genre;
type ArtworkField = "capsule" | "header" | "main";
type ArtworkState = {
    file: File | null;
    previewUrl: string | null;
};

const DEFAULT_GENRE_PAGE_SIZE = 12;

export async function loader({ request }: Route.LoaderArgs) {
    return { currentUser: requireRole(request, "developer") };
}

const ARTWORK_LABELS: Record<ArtworkField, { title: string; description: string }> = {
    capsule: {
        title: "Capsule",
        description: "La carátula pequeña que identifica tu juego.",
    },
    header: {
        title: "Header",
        description: "La imagen horizontal para cabeceras y banners.",
    },
    main: {
        title: "Main",
        description: "La imagen principal para destacar tu juego.",
    },
};

const createEmptyArtworkState = (): ArtworkState => ({
    file: null,
    previewUrl: null,
});

export default function CreateGame() {
    const navigate = useNavigate();
    const [selectedGenres, setSelectedGenres] = useState<GenreOption[]>([]);
    const [isGenrePickerOpen, setIsGenrePickerOpen] = useState(false);
    const [genreSearch, setGenreSearch] = useState("");
    const [debouncedGenreSearch, setDebouncedGenreSearch] = useState("");
    const [availableGenres, setAvailableGenres] = useState<GenreOption[]>([]);
    const [genrePageNumber, setGenrePageNumber] = useState(1);
    const [hasMoreGenres, setHasMoreGenres] = useState(true);
    const [isLoadingGenres, setIsLoadingGenres] = useState(false);
    const [genresError, setGenresError] = useState<string | null>(null);
    const [isLoadingMoreGenres, setIsLoadingMoreGenres] = useState(false);
    const [price, setPrice] = useState("");
    const [artworks, setArtworks] = useState<Record<ArtworkField, ArtworkState>>({
        capsule: createEmptyArtworkState(),
        header: createEmptyArtworkState(),
        main: createEmptyArtworkState(),
    });
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const genreScrollRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        return () => {
            Object.values(artworks).forEach((artwork) => {
                if (artwork.previewUrl) URL.revokeObjectURL(artwork.previewUrl);
            });
        };
    }, [artworks]);

    useEffect(() => {
        const id = window.setTimeout(() => setDebouncedGenreSearch(genreSearch.trim()), 300);
        return () => window.clearTimeout(id);
    }, [genreSearch]);

    useEffect(() => {
        if (!isGenrePickerOpen) return;
        const controller = new AbortController();

        async function fetchGenres() {
            const isFirstPage = genrePageNumber === 1;
            isFirstPage ? setIsLoadingGenres(true) : setIsLoadingMoreGenres(true);
            setGenresError(null);

            try {
                const response = await httpClient.get<PaginatedResponse<GenreOption>>("/genres", {
                    params: {
                        ...(debouncedGenreSearch ? { Name: debouncedGenreSearch } : {}),
                        PageNumber: genrePageNumber,
                        PageSize: DEFAULT_GENRE_PAGE_SIZE,
                    },
                    signal: controller.signal,
                });
                const items = response.data.items ?? [];
                setAvailableGenres((cur) =>
                    isFirstPage ? items : [...cur, ...items.filter((g) => !cur.some((c) => c.id === g.id))]
                );
                setHasMoreGenres(Boolean(response.data.hastNextPage) || items.length === DEFAULT_GENRE_PAGE_SIZE);
            } catch {
                if (!controller.signal.aborted) setGenresError("No se pudieron cargar los géneros.");
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoadingGenres(false);
                    setIsLoadingMoreGenres(false);
                }
            }
        }

        fetchGenres();
        return () => controller.abort();
    }, [debouncedGenreSearch, genrePageNumber, isGenrePickerOpen]);

    useEffect(() => {
        if (!isGenrePickerOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") setIsGenrePickerOpen(false); };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isGenrePickerOpen]);

    useEffect(() => {
        if (!isGenrePickerOpen) {
            setGenreSearch("");
            setDebouncedGenreSearch("");
            setAvailableGenres([]);
            setGenrePageNumber(1);
            setHasMoreGenres(true);
            setGenresError(null);
        }
    }, [isGenrePickerOpen]);

    const selectedGenreIds = useMemo(() => new Set(selectedGenres.map((g) => g.id)), [selectedGenres]);

    function addGenre(genre: GenreOption) {
        setSelectedGenres((cur) => cur.some((g) => g.id === genre.id) ? cur : [...cur, genre]);
    }

    function removeGenre(id: string) {
        setSelectedGenres((cur) => cur.filter((g) => g.id !== id));
    }

    function handleGenreScroll(e: React.UIEvent<HTMLDivElement>) {
        const t = e.currentTarget;
        if (!hasMoreGenres || isLoadingGenres || isLoadingMoreGenres || t.scrollTop + t.clientHeight < t.scrollHeight - 48) return;
        setGenrePageNumber((p) => p + 1);
    }

    function handleGenreSearchChange(value: string) {
        setGenreSearch(value);
        setGenrePageNumber(1);
        setAvailableGenres([]);
        setHasMoreGenres(true);
    }

    function handleArtworkChange(field: ArtworkField, event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0] ?? null;
        setArtworks((cur) => {
            if (cur[field].previewUrl) URL.revokeObjectURL(cur[field].previewUrl!);
            return { ...cur, [field]: { file, previewUrl: file ? URL.createObjectURL(file) : null } };
        });
    }

    const titleLength = title.trim().length;
    const descriptionLength = description.trim().length;
    const artworkCount = Object.values(artworks).filter((a) => a.file !== null).length;

    const isTitleValid = titleLength >= 1 && titleLength <= 24;
    const isDescriptionValid = descriptionLength >= 4 && descriptionLength <= 4096;
    const isPriceValid = price.trim() !== "" && !Number.isNaN(Number(price)) && Number(price) >= 0;
    const isArtworkValid = artworkCount === 3;
    const hasMinimumGenres = selectedGenres.length >= 1;
    const isFormValid = isTitleValid && isDescriptionValid && isPriceValid && isArtworkValid && hasMinimumGenres;

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!isTitleValid) return setFormError("El título debe tener entre 1 y 24 caracteres.");
        if (!isDescriptionValid) return setFormError("La descripción debe tener entre 4 y 4096 caracteres.");
        if (!isPriceValid) return setFormError("Debes indicar un precio válido.");
        if (!isArtworkValid) return setFormError("Debes subir las tres imágenes de artwork.");
        if (!hasMinimumGenres) return setFormError("Debes seleccionar al menos un género.");

        setFormError(null);

        const requestBody: CreateGameBody = {
            Title: title.trim(),
            Description: description.trim(),
            Price: Number(price),
            Genres: selectedGenres.map((g) => g.id),
            CapsulePicture: artworks.capsule.file!,
            HeaderPicture: artworks.header.file!,
            MainPicture: artworks.main.file!,
        };

        const formData = new FormData();
        formData.append("Title", requestBody.Title);
        formData.append("Description", requestBody.Description);
        formData.append("Price", String(requestBody.Price));
        requestBody.Genres.forEach((id) => formData.append("Genres", id));
        formData.append("CapsulePicture", requestBody.CapsulePicture);
        formData.append("HeaderPicture", requestBody.HeaderPicture);
        formData.append("MainPicture", requestBody.MainPicture);

        setIsSubmitting(true);
        try {
            await httpClient.post("/games", formData);
            navigate("/dashboard");
        } catch {
            setFormError("No se pudo crear el juego. Intenta nuevamente.");
        } finally {
            setIsSubmitting(false);
        }
    }

    // ─── Shared input classes ────────────────────────────────────────────────
    const inputBase = `
        w-full text-sm rounded-xl border
        bg-white/50 backdrop-blur-sm
        border-black/8
        placeholder:text-slate-400
        text-slate-800
        py-3 px-4 outline-none
        transition-colors
        focus:border-emerald-400/60 focus:bg-white/70
        dark:bg-white/3 dark:border-white/8
        dark:placeholder:text-white/30
        dark:text-white/70
        dark:focus:border-emerald-400/30 dark:focus:bg-white/5
    `;

    const sectionCard = `
        relative overflow-hidden rounded-2xl p-6
        bg-white/40 backdrop-blur-md
        border border-black/5
        shadow-sm
        dark:bg-white/1 dark:border-white/8
        dark:shadow-md dark:shadow-black/30
    `;

    const labelClass = "block text-sm text-slate-600 dark:text-white/55 mb-2";
    const hintClass = "text-xs text-slate-400 dark:text-white/30";

    return (
        <>
            <TopBar />
            <div className="flex flex-col items-start w-full min-h-screen py-8 px-6 gap-8">

                {/* Back + title */}
                <div>
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 dark:text-white/40 dark:hover:text-white/60 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver al dashboard
                    </Link>
                    <h1 className="text-3xl font-light tracking-tight text-slate-800 dark:text-white/70 mt-3">
                        Crear juego
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">

                    {/* Title */}
                    <div className={sectionCard}>
                        <label className={labelClass} htmlFor="title">Título del juego</label>
                        <input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Introduce el título de tu juego"
                            maxLength={24}
                            className={inputBase}
                        />
                        <div className={`flex items-center justify-between mt-2 ${hintClass}`}>
                            <span>{titleLength}/24</span>
                            <span>Mínimo 1 carácter</span>
                        </div>
                    </div>

                    {/* Description */}
                    <div className={sectionCard}>
                        <label className={labelClass} htmlFor="description">Descripción</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Escribe una descripción para tu juego"
                            maxLength={4096}
                            className={`${inputBase} resize-none h-32`}
                        />
                        <div className={`flex items-center justify-between mt-2 ${hintClass}`}>
                            <span>{descriptionLength}/4096</span>
                            <span>Mínimo 4 caracteres</span>
                        </div>
                    </div>

                    {/* Price */}
                    <div className={sectionCard}>
                        <label className={labelClass} htmlFor="price">Precio</label>
                        <div className="relative max-w-xs">
                            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 dark:text-white/30">€</span>
                            <input
                                id="price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="0.00"
                                className={`${inputBase} pl-8`}
                            />
                        </div>
                        <p className={`mt-2 ${hintClass}`}>Introduce el precio final del juego.</p>
                    </div>

                    {/* Artwork */}
                    <div className={sectionCard}>
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-white/35 mb-1">Assets</p>
                        <h3 className="text-lg font-light text-slate-800 dark:text-white/70 mb-1">Artwork del juego</h3>
                        <p className={`mb-6 ${hintClass}`}>Sube las tres variantes para que el juego se vea completo.</p>

                        <div className="grid gap-4 lg:grid-cols-3">
                            {(Object.keys(ARTWORK_LABELS) as ArtworkField[]).map((field) => {
                                const artwork = artworks[field];
                                const label = ARTWORK_LABELS[field];

                                return (
                                    <div
                                        key={field}
                                        className="
                                            overflow-hidden rounded-2xl
                                            bg-white/30 backdrop-blur-sm
                                            border border-black/5
                                            dark:bg-white/2 dark:border-white/8
                                        "
                                    >
                                        <div className="border-b border-black/5 dark:border-white/6 px-4 py-4">
                                            <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-white/35">Artwork</p>
                                            <h4 className="mt-1 text-base font-light text-slate-700 dark:text-white/65">{label.title}</h4>
                                            <p className={`mt-1 text-sm ${hintClass}`}>{label.description}</p>
                                        </div>
                                        <div className="p-4">
                                            <label className="group block cursor-pointer">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="sr-only"
                                                    onChange={(e) => handleArtworkChange(field, e)}
                                                />
                                                <div className="
                                                    relative flex min-h-44 items-center justify-center overflow-hidden rounded-xl
                                                    border border-dashed border-black/10
                                                    bg-white/40
                                                    transition-colors
                                                    group-hover:border-emerald-400/50 group-hover:bg-emerald-50/30
                                                    dark:bg-white/2 dark:border-white/8
                                                    dark:group-hover:border-emerald-400/25 dark:group-hover:bg-emerald-400/5
                                                ">
                                                    {artwork.previewUrl ? (
                                                        <img
                                                            src={artwork.previewUrl}
                                                            alt={`${label.title} preview`}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
                                                            <div className="
                                                                flex h-9 w-9 items-center justify-center rounded-xl
                                                                bg-emerald-500/10 border border-emerald-500/20
                                                                dark:bg-emerald-400/10 dark:border-emerald-400/15
                                                            ">
                                                                <Plus className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                                                            </div>
                                                            <span className="text-sm text-slate-500 dark:text-white/40">Añadir imagen</span>
                                                            <span className={`text-xs ${hintClass}`}>Haz click para seleccionar un archivo</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </label>
                                            {artwork.file && (
                                                <div className={`mt-3 rounded-xl border border-black/5 dark:border-white/8 bg-white/40 dark:bg-white/3 px-3 py-2 text-xs text-slate-500 dark:text-white/40`}>
                                                    {artwork.file.name}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Genres */}
                    <div className={sectionCard}>
                        <div className="flex items-center justify-between gap-4 mb-3">
                            <label className={labelClass}>Géneros</label>
                            <span className={hintClass}>Selecciona uno o varios</span>
                        </div>
                        <div className="
                            flex flex-wrap items-center gap-3 rounded-xl
                            border border-dashed border-black/8
                            bg-white/30
                            dark:bg-white/2 dark:border-white/8
                            p-3
                        ">
                            {selectedGenres.length === 0 ? (
                                <button
                                    type="button"
                                    onClick={() => setIsGenrePickerOpen(true)}
                                    className="
                                        inline-flex items-center gap-2 rounded-full
                                        border border-black/8 bg-white/60
                                        dark:border-white/8 dark:bg-white/3
                                        px-4 py-2 text-sm text-slate-500 dark:text-white/40
                                        hover:border-emerald-400/50 hover:text-emerald-700
                                        dark:hover:border-emerald-400/25 dark:hover:text-emerald-400
                                        transition-colors
                                    "
                                >
                                    <Plus className="h-4 w-4" />
                                    Añadir género
                                </button>
                            ) : (
                                <>
                                    {selectedGenres.map((genre) => (
                                        <div
                                            key={genre.id}
                                            className="
                                                inline-flex items-center gap-3 rounded-full
                                                border border-black/8 bg-white/60
                                                dark:border-white/8 dark:bg-white/3
                                                px-4 py-2 text-sm text-slate-600 dark:text-white/55
                                                shadow-sm
                                            "
                                        >
                                            <span>{genre.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeGenre(genre.id)}
                                                className="
                                                    inline-flex h-5 w-5 items-center justify-center rounded-full
                                                    border border-black/8 dark:border-white/10
                                                    text-slate-400 dark:text-white/30
                                                    hover:border-rose-400/50 hover:text-rose-400
                                                    transition-colors
                                                "
                                                aria-label={`Quitar ${genre.name}`}
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setIsGenrePickerOpen(true)}
                                        className="
                                            inline-flex h-9 w-9 items-center justify-center rounded-full
                                            border border-dashed border-black/8 dark:border-white/8
                                            bg-white/50 dark:bg-white/3
                                            text-slate-400 dark:text-white/30
                                            hover:border-emerald-400/50 hover:text-emerald-600
                                            dark:hover:border-emerald-400/25 dark:hover:text-emerald-400
                                            transition-colors
                                        "
                                        aria-label="Añadir más géneros"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </>
                            )}
                        </div>
                        <p className={`mt-2 ${hintClass}`}>Seleccionados: {selectedGenres.length}</p>
                    </div>

                    {/* Error + Submit */}
                    {formError && (
                        <p className="text-sm text-rose-400 dark:text-rose-400/80">{formError}</p>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={!isFormValid || isSubmitting}
                            className="
                                inline-flex items-center gap-2
                                px-6 py-2.5 rounded-full text-sm
                                bg-emerald-500/15 backdrop-blur-md
                                border border-emerald-200/60
                                text-emerald-700
                                hover:bg-emerald-500/25 hover:border-emerald-200/80
                                dark:bg-emerald-400/10 dark:border-emerald-400/20
                                dark:hover:bg-emerald-400/15 dark:hover:border-emerald-400/30
                                dark:text-emerald-400
                                transition-all duration-300
                                disabled:cursor-not-allowed disabled:opacity-40
                                font-light
                            "
                        >
                            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                            {isSubmitting ? "Creando..." : "Crear juego"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Genre picker modal */}
            {isGenrePickerOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm"
                    onClick={() => setIsGenrePickerOpen(false)}
                >
                    <div
                        className="
                            w-full max-w-2xl overflow-hidden rounded-3xl
                            bg-white/80 backdrop-blur-xl
                            border border-white/80
                            shadow-2xl shadow-slate-200/60
                            dark:bg-white/4 dark:backdrop-blur-xl
                            dark:border-white/8
                            dark:shadow-black/50
                        "
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal header */}
                        <div className="flex items-start justify-between gap-4 border-b border-black/5 dark:border-white/6 px-6 py-5">
                            <div>
                                <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-white/35">Géneros</p>
                                <h2 className="mt-2 text-2xl font-light text-slate-800 dark:text-white/70">Elige los que quieras</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsGenrePickerOpen(false)}
                                className="
                                    rounded-full border border-black/8 dark:border-white/8
                                    bg-white/60 dark:bg-white/3
                                    p-2 text-slate-400 dark:text-white/35
                                    hover:border-emerald-400/50 hover:text-emerald-600
                                    dark:hover:border-emerald-400/25 dark:hover:text-emerald-400
                                    transition-colors
                                "
                                aria-label="Cerrar selector de géneros"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="border-b border-black/5 dark:border-white/6 px-6 py-4">
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/30" />
                                <input
                                    autoFocus
                                    value={genreSearch}
                                    onChange={(e) => handleGenreSearchChange(e.target.value)}
                                    placeholder="Buscar género por nombre"
                                    className={`${inputBase} pl-11`}
                                />
                            </div>
                        </div>

                        {/* List */}
                        <div
                            ref={genreScrollRef}
                            onScroll={handleGenreScroll}
                            className="max-h-96 overflow-y-auto px-3 py-3"
                        >
                            {isLoadingGenres && availableGenres.length === 0 && (
                                <div className="flex min-h-48 items-center justify-center text-sm text-slate-400 dark:text-white/35">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Cargando géneros...
                                </div>
                            )}

                            {genresError && (
                                <div className="py-10 text-center text-sm text-rose-400 dark:text-rose-400/70">{genresError}</div>
                            )}

                            {!isLoadingGenres && !genresError && availableGenres.length === 0 && (
                                <div className="py-10 text-center text-sm text-slate-400 dark:text-white/30">No hay géneros para mostrar.</div>
                            )}

                            <div className="grid grid-cols-1 gap-2">
                                {availableGenres.map((genre) => {
                                    const isSelected = selectedGenreIds.has(genre.id);
                                    return (
                                        <button
                                            key={genre.id}
                                            type="button"
                                            onClick={() => addGenre(genre)}
                                            disabled={isSelected}
                                            className="
                                                flex items-center justify-between rounded-xl
                                                border border-black/5 dark:border-white/6
                                                bg-white/50 dark:bg-white/2
                                                px-4 py-3 text-left
                                                hover:border-emerald-400/40 hover:bg-emerald-50/30
                                                dark:hover:border-emerald-400/20 dark:hover:bg-emerald-400/5
                                                transition-colors
                                                disabled:cursor-not-allowed disabled:opacity-50
                                            "
                                        >
                                            <span className="text-sm text-slate-700 dark:text-white/60">{genre.name}</span>
                                            {isSelected ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 dark:bg-emerald-400/10 dark:border-emerald-400/15 px-3 py-1 text-xs text-emerald-600 dark:text-emerald-500">
                                                    <Check className="h-3.5 w-3.5" />
                                                    Añadido
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded-full border border-black/8 dark:border-white/8 px-3 py-1 text-xs text-slate-400 dark:text-white/30">
                                                    <Plus className="h-3.5 w-3.5" />
                                                    Añadir
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {isLoadingMoreGenres && (
                                <div className="flex items-center justify-center gap-2 py-4 text-sm text-slate-400 dark:text-white/30">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Cargando más géneros...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}