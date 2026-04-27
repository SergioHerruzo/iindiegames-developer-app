import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowLeft, Check, Loader2, Plus, Search, X } from "lucide-react";
import { Link, useNavigate } from "react-router";
import TopBar from "~/components/TopBar";
import { httpClient } from "@services/http.client";
import type { Genre } from "@models/Genre";
import type { PaginatedResponse } from "@models/PaginatedResponse";
import type { CreateGameBody } from "@models/CreateGameBody";

type GenreOption = Genre;
type ArtworkField = "capsule" | "header" | "main";
type ArtworkState = {
    file: File | null;
    previewUrl: string | null;
};

const DEFAULT_GENRE_PAGE_SIZE = 12;

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
                if (artwork.previewUrl) {
                    window.URL.revokeObjectURL(artwork.previewUrl);
                }
            });
        };
    }, [artworks]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setDebouncedGenreSearch(genreSearch.trim());
        }, 300);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [genreSearch]);

    useEffect(() => {
        if (!isGenrePickerOpen) {
            return;
        }

        const controller = new AbortController();

        async function fetchGenres() {
            const isFirstPage = genrePageNumber === 1;

            if (isFirstPage) {
                setIsLoadingGenres(true);
            } else {
                setIsLoadingMoreGenres(true);
            }

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
                setAvailableGenres((currentGenres) => (
                    isFirstPage ? items : [...currentGenres, ...items.filter((genre) => !currentGenres.some((currentGenre) => currentGenre.id === genre.id))]
                ));
                setHasMoreGenres(Boolean(response.data.hastNextPage) || items.length === DEFAULT_GENRE_PAGE_SIZE);
            } catch {
                if (!controller.signal.aborted) {
                    setGenresError("No se pudieron cargar los géneros.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoadingGenres(false);
                    setIsLoadingMoreGenres(false);
                }
            }
        }

        fetchGenres();

        return () => {
            controller.abort();
        };
    }, [debouncedGenreSearch, genrePageNumber, isGenrePickerOpen]);

    useEffect(() => {
        if (!isGenrePickerOpen) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsGenrePickerOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
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

    const selectedGenreIds = useMemo(() => new Set(selectedGenres.map((genre) => genre.id)), [selectedGenres]);

    function openGenrePicker() {
        setIsGenrePickerOpen(true);
    }

    function closeGenrePicker() {
        setIsGenrePickerOpen(false);
    }

    function addGenre(genre: GenreOption) {
        setSelectedGenres((currentGenres) => (
            currentGenres.some((currentGenre) => currentGenre.id === genre.id)
                ? currentGenres
                : [...currentGenres, genre]
        ));
    }

    function removeGenre(genreId: string) {
        setSelectedGenres((currentGenres) => currentGenres.filter((genre) => genre.id !== genreId));
    }

    function handleGenreScroll(event: React.UIEvent<HTMLDivElement>) {
        const target = event.currentTarget;

        if (!hasMoreGenres || isLoadingGenres || isLoadingMoreGenres || target.scrollTop + target.clientHeight < target.scrollHeight - 48) {
            return;
        }

        setGenrePageNumber((currentPage) => currentPage + 1);
    }

    function handleGenreSearchChange(value: string) {
        setGenreSearch(value);
        setGenrePageNumber(1);
        setAvailableGenres([]);
        setHasMoreGenres(true);
    }

    function handleArtworkChange(field: ArtworkField, event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0] ?? null;

        setArtworks((currentArtworks) => {
            const currentArtwork = currentArtworks[field];

            if (currentArtwork.previewUrl) {
                window.URL.revokeObjectURL(currentArtwork.previewUrl);
            }

            return {
                ...currentArtworks,
                [field]: {
                    file,
                    previewUrl: file ? window.URL.createObjectURL(file) : null,
                },
            };
        });
    }

    const titleLength = title.trim().length;
    const descriptionLength = description.trim().length;
    const artworkCount = Object.values(artworks).filter((artwork) => artwork.file !== null).length;
    const hasMinimumGenres = selectedGenres.length >= 1;

    const isTitleValid = titleLength >= 1 && titleLength <= 24;
    const isDescriptionValid = descriptionLength >= 4 && descriptionLength <= 4096;
    const isPriceValid = price.trim() !== "" && !Number.isNaN(Number(price)) && Number(price) >= 0;
    const isArtworkValid = artworkCount === 3;
    const isFormValid = isTitleValid && isDescriptionValid && isPriceValid && isArtworkValid && hasMinimumGenres;

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!isTitleValid) {
            setFormError("El título debe tener entre 1 y 24 caracteres.");
            return;
        }

        if (!isDescriptionValid) {
            setFormError("La descripción debe tener entre 4 y 4096 caracteres.");
            return;
        }

        if (!isPriceValid) {
            setFormError("Debes indicar un precio válido.");
            return;
        }

        if (!isArtworkValid) {
            setFormError("Debes subir las tres imágenes de artwork.");
            return;
        }

        if (!hasMinimumGenres) {
            setFormError("Debes seleccionar al menos un género.");
            return;
        }

        setFormError(null);

        const requestBody: CreateGameBody = {
            Title: title.trim(),
            Description: description.trim(),
            Price: Number(price),
            Genres: selectedGenres.map((genre) => genre.id),
            CapsulePicture: artworks.capsule.file!,
            HeaderPicture: artworks.header.file!,
            MainPicture: artworks.main.file!,
        };

        const formData = new FormData();
        formData.append("Title", requestBody.Title);
        formData.append("Description", requestBody.Description);
        formData.append("Price", String(requestBody.Price));
        requestBody.Genres.forEach((genreId) => {
            formData.append("Genres", genreId);
        });
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

    return (
        <>
            <TopBar />
            <div className="flex flex-col items-start justify-start w-full min-h-screen py-8 px-40 gap-8">
                <div>
                    <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-text-200 hover:text-text-300 transition-colorsm">
                        <ArrowLeft className="h-6 w-6" />
                        Volver al dashboard
                    </Link>
                    <h1 className="text-3xl mt-4">Crear juego</h1>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full p-4 border border-bg-300 bg-bg-200 rounded-lg">
                    <div className="flex flex-col gap-2">
                        <label className="block text-sm font-medium mb-2" htmlFor="title">Título del juego</label>
                        <input
                            id="title"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            placeholder="Introduce el título de tu juego"
                            maxLength={24}
                            className="w-full text-sm rounded-md border placeholder:text-text-400 border-bg-300 bg-bg-200 py-3 px-4 outline-none focus:border-primary-500"
                        />
                        <div className="flex items-center justify-between text-xs text-text-400">
                            <span>{titleLength}/24</span>
                            <span>Mínimo 1 carácter</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="block text-sm font-medium mb-2" htmlFor="description">Descripción</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            placeholder="Escribe una descripción para tu juego"
                            maxLength={4096}
                            className="w-full text-sm rounded-md border placeholder:text-text-400 border-bg-300 bg-bg-200 py-3 px-4 outline-none focus:border-primary-500 resize-none h-32"
                        />
                        <div className="flex items-center justify-between text-xs text-text-400">
                            <span>{descriptionLength}/4096</span>
                            <span>Mínimo 4 caracteres</span>
                        </div>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.65fr)_minmax(0,1.35fr)]">
                        <div className="flex flex-col gap-2">
                            <label className="block text-sm font-medium" htmlFor="price">Precio</label>
                            <div className="relative">
                                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-text-400">€</span>
                                <input
                                    id="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={price}
                                    onChange={(event) => setPrice(event.target.value)}
                                    placeholder="0.00"
                                    className="w-full rounded-2xl border border-bg-300 bg-bg-200 py-3 pl-8 pr-4 text-sm outline-none transition-colors placeholder:text-text-400 focus:border-primary-500"
                                />
                            </div>
                            <p className="text-xs text-text-400">Introduce el precio final del juego.</p>
                        </div>
                        <div className="rounded-2xl border border-dashed border-bg-300 bg-bg-300/40 p-4">
                            <p className="text-xs uppercase tracking-[0.35em] text-text-400">Assets</p>
                            <h3 className="mt-2 text-lg">Artwork del juego</h3>
                            <p className="mt-1 text-sm text-text-400">Sube las tres variantes para que el juego se vea completo.</p>
                        </div>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-3">
                        {(Object.keys(ARTWORK_LABELS) as ArtworkField[]).map((field) => {
                            const artwork = artworks[field];
                            const label = ARTWORK_LABELS[field];

                            return (
                                <div key={field} className="overflow-hidden rounded-3xl border border-bg-300 bg-bg-300/40 shadow-sm">
                                    <div className="flex items-start justify-between gap-3 border-b border-bg-300 px-4 py-4">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.35em] text-text-400">Artwork</p>
                                            <h4 className="mt-1 text-lg">{label.title}</h4>
                                            <p className="mt-1 text-sm text-text-400">{label.description}</p>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <label className="group block cursor-pointer">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="sr-only"
                                                onChange={(event) => handleArtworkChange(field, event)}
                                            />
                                            <div className="relative flex min-h-44 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-bg-300 bg-bg-200 transition-colors group-hover:border-primary-500">
                                                {artwork.previewUrl ? (
                                                    <img
                                                        src={artwork.previewUrl}
                                                        alt={`${label.title} preview`}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
                                                        <Plus className="h-6 w-6 text-text-400" />
                                                        <span className="text-sm font-medium text-text-200">Añadir imagen</span>
                                                        <span className="text-xs text-text-400">Haz click para seleccionar un archivo</span>
                                                    </div>
                                                )}
                                            </div>
                                        </label>
                                        {artwork.file && (
                                            <div className="mt-3 rounded-2xl border border-bg-300 bg-bg-200 px-3 py-2 text-xs text-text-300">
                                                {artwork.file.name}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-4">
                            <label className="block text-sm font-medium" htmlFor="genres">Géneros</label>
                            <span className="text-xs text-text-400">Selecciona uno o varios</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-bg-300 bg-bg-300/40 p-3">
                            {selectedGenres.length === 0 ? (
                                <button
                                    type="button"
                                    onClick={openGenrePicker}
                                    className="inline-flex items-center gap-2 rounded-full border border-bg-300 bg-bg-200 px-4 py-2 text-sm text-text-200 transition-colors hover:border-primary-500 hover:text-text-100"
                                >
                                    <Plus className="h-4 w-4" />
                                    Añadir género
                                </button>
                            ) : (
                                <>
                                    {selectedGenres.map((genre) => (
                                        <div key={genre.id} className="inline-flex items-center gap-3 rounded-full border border-bg-300 bg-bg-200 px-4 py-2 text-sm text-text-200 shadow-sm">
                                            <span>{genre.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeGenre(genre.id)}
                                                className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-bg-300 text-text-400 transition-colors hover:border-red-400 hover:text-red-400"
                                                aria-label={`Quitar ${genre.name}`}
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={openGenrePicker}
                                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-bg-300 bg-bg-200 text-text-300 transition-colors hover:border-primary-500 hover:text-text-100"
                                        aria-label="Añadir más géneros"
                                    >
                                        <Plus className="h-5 w-5" />
                                    </button>
                                </>
                            )}
                        </div>
                        <p className="text-xs text-text-400">Seleccionados: {selectedGenres.length}</p>
                    </div>
                    {formError && (
                        <p className="text-sm text-red-400">{formError}</p>
                    )}
                    <button
                        type="submit"
                        disabled={!isFormValid || isSubmitting}
                        className="self-end px-6 py-3 bg-primary-400 text-text-100 rounded-full hover:bg-primary-500 transition-transform hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                        {isSubmitting ? "Creando..." : "Crear juego"}
                    </button>
                </form>
            </div>
            {isGenrePickerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm" onClick={closeGenrePicker}>
                    <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-bg-300 bg-bg-100 shadow-2xl" onClick={(event) => event.stopPropagation()}>
                        <div className="flex items-start justify-between gap-4 border-b border-bg-300 px-6 py-5">
                            <div>
                                <p className="text-xs uppercase tracking-[0.35em] text-text-400">Géneros</p>
                                <h2 className="mt-2 text-2xl">Elige los que quieras</h2>
                            </div>
                            <button
                                type="button"
                                onClick={closeGenrePicker}
                                className="rounded-full border border-bg-300 bg-bg-200 p-2 text-text-300 transition-colors hover:border-primary-500 hover:text-text-100"
                                aria-label="Cerrar selector de géneros"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="border-b border-bg-300 px-6 py-4">
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-400" />
                                <input
                                    autoFocus
                                    value={genreSearch}
                                    onChange={(event) => handleGenreSearchChange(event.target.value)}
                                    placeholder="Buscar género por nombre"
                                    className="w-full rounded-2xl border border-bg-300 bg-bg-200 py-3 pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-text-400 focus:border-primary-500"
                                />
                            </div>
                        </div>
                        <div
                            ref={genreScrollRef}
                            onScroll={handleGenreScroll}
                            className="max-h-112 overflow-y-auto px-3 py-3"
                        >
                            {isLoadingGenres && availableGenres.length === 0 && (
                                <div className="flex min-h-48 items-center justify-center text-sm text-text-400">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Cargando géneros...
                                </div>
                            )}

                            {genresError && (
                                <div className="px-3 py-10 text-center text-sm text-red-400">{genresError}</div>
                            )}

                            {!isLoadingGenres && !genresError && availableGenres.length === 0 && (
                                <div className="px-3 py-10 text-center text-sm text-text-400">No hay géneros para mostrar.</div>
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
                                            className="flex items-center justify-between rounded-2xl border border-bg-300 bg-bg-200 px-4 py-3 text-left transition-colors hover:border-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <span className="text-sm text-text-100">{genre.name}</span>
                                            {isSelected ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-primary-400/20 px-3 py-1 text-xs text-primary-400">
                                                    <Check className="h-3.5 w-3.5" />
                                                    Añadido
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded-full border border-bg-300 px-3 py-1 text-xs text-text-400">
                                                    <Plus className="h-3.5 w-3.5" />
                                                    Añadir
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {isLoadingMoreGenres && (
                                <div className="flex items-center justify-center gap-2 py-4 text-sm text-text-400">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Cargando más géneros...
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </>
    )
}