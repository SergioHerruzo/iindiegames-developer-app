import { useRef, useState } from "react";
import { Trash2, Upload, ImageOff, Loader, Plus } from "lucide-react";
import Divider from "@components/Divider";
import { apiClient } from "@services/ApiClient";
import type { DeveloperGame } from "@models/DeveloperGame";
import type { DeveloperArtwork } from "@models/DeveloperArtwork";
import type { DeveloperStorePicture } from "@models/DeveloperStorePicture";

// ─── Status Badge ─────────────────────────────────────────────────────────────

const statusConfig: Record<string, { bg: string; text: string; border: string; label: string }> = {
    Ready: {
        bg: "bg-(--color-published-bg)",
        text: "text-(--color-published-text)",
        border: "border-(--color-published-border)",
        label: "Lista",
    },
    Processing: {
        bg: "bg-(--color-badge-neutral-bg)",
        text: "text-(--color-badge-neutral-text)",
        border: "border-(--color-badge-neutral-border)",
        label: "Procesando",
    },
    Error: {
        bg: "bg-(--color-error-bg)",
        text: "text-(--color-error-text)",
        border: "border-(--color-error-border)",
        label: "Error",
    },
};

function StatusBadge({ status }: { status: string }) {
    const config = statusConfig[status] ?? statusConfig["Processing"];
    return (
        <span className={`text-xs font-light px-2 py-0.5 rounded-full border ${config.bg} ${config.text} ${config.border}`}>
            {config.label}
        </span>
    );
}

// ─── Artwork Slot (fixed, named) ──────────────────────────────────────────────

type ArtworkSlotProps = {
    label: string;
    item: DeveloperArtwork | null;
    onUpload: (file: File) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
};

function ArtworkSlot({ label, item, onUpload, onDelete }: ArtworkSlotProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [dragging, setDragging] = useState(false);

    const handleFile = async (file: File) => {
        setUploading(true);
        await onUpload(file);
        setUploading(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && !item) handleFile(file);
    };

    const handleDelete = async () => {
        if (!item) return;
        setDeleting(true);
        await onDelete(item.id);
        setDeleting(false);
    };

    return (
        <div className="flex flex-col gap-2">
            {/* Label */}
            <span className="text-sm font-light text-(--color-secondary-text)">{label}</span>

            <div className="rounded-xl border border-(--color-border-default) bg-(--color-card-bg) overflow-hidden">
                {/* Image area */}
                <div
                    className={`group relative h-44 w-full bg-(--color-secondary-bg) overflow-hidden ${!item ? "cursor-pointer" : ""}`}
                    onClick={() => !item && !uploading && inputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); if (!item) setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                >
                    {item ? (
                        <>
                            {!imageLoaded && <div className="absolute inset-0 skeleton-block z-10" />}
                            <img
                                src={item.mediumPictureUrl}
                                alt={label}
                                onLoad={() => setImageLoaded(true)}
                                className={`h-full w-full object-cover transition-all duration-500 ease-out group-hover:scale-105 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                            />
                            {/* Delete overlay */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-light text-(--color-error-text) bg-(--color-error-bg) border border-(--color-error-border) cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50"
                                >
                                    {deleting
                                        ? <Loader size={14} className="animate-spin" />
                                        : <Trash2 size={14} strokeWidth={1.5} />
                                    }
                                    <span>{deleting ? "Eliminando..." : "Eliminar"}</span>
                                </button>
                            </div>
                        </>
                    ) : (
                        /* Empty slot — upload area */
                        <div className={`
                            flex h-full w-full flex-col items-center justify-center gap-2
                            transition-colors duration-200
                            ${dragging
                                ? "bg-(--color-primary-bg)"
                                : "hover:bg-(--color-secondary-bg-hover)"
                            }
                            ${uploading ? "pointer-events-none opacity-60" : ""}
                        `}>
                            {uploading
                                ? <Loader size={20} className="animate-spin text-(--color-primary-icon)" />
                                : <Upload size={20} strokeWidth={1.5} className="text-(--color-secondary-icon)" />
                            }
                            <span className="text-sm font-light text-(--color-secondary-text)">
                                {uploading ? "Subiendo..." : "Subir imagen"}
                            </span>
                        </div>
                    )}

                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFile(file);
                            e.target.value = "";
                        }}
                    />
                </div>

                {/* Footer — only when there's an image */}
                {item && (
                    <div className="flex items-center justify-between px-3 py-2 border-t border-(--color-border-image)">
                        <span className="text-xs text-(--color-secondary-text) font-light truncate max-w-[60%]">
                            {item.id}
                        </span>
                        <StatusBadge status={item.processingStatus} />
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Store Picture Card ───────────────────────────────────────────────────────

function StorePictureCard({ item, onDelete }: { item: DeveloperStorePicture; onDelete: (id: string) => Promise<void> }) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        await onDelete(item.id);
        setDeleting(false);
    };

    return (
        <div className="group relative flex flex-col rounded-xl border border-(--color-border-default) bg-(--color-card-bg) overflow-hidden">
            <div className="relative h-44 w-full bg-(--color-secondary-bg) overflow-hidden">
                {!imageLoaded && <div className="absolute inset-0 skeleton-block z-10" />}
                <img
                    src={item.mediumPictureUrl}
                    alt=""
                    onLoad={() => setImageLoaded(true)}
                    className={`h-full w-full object-cover transition-all duration-500 ease-out group-hover:scale-105 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-light text-(--color-error-text) bg-(--color-error-bg) border border-(--color-error-border) cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50"
                    >
                        {deleting
                            ? <Loader size={14} className="animate-spin" />
                            : <Trash2 size={14} strokeWidth={1.5} />
                        }
                        <span>{deleting ? "Eliminando..." : "Eliminar"}</span>
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between px-3 py-2 border-t border-(--color-border-image)">
                <span className="text-xs text-(--color-secondary-text) font-light truncate max-w-[60%]">
                    {item.id}
                </span>
                <StatusBadge status={item.processingStatus} />
            </div>
        </div>
    );
}

// ─── Store Pictures Add Button ─────────────────────────────────────────────────

function AddStorePictureButton({ onUpload }: { onUpload: (file: File) => Promise<void> }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [dragging, setDragging] = useState(false);

    const handleFile = async (file: File) => {
        setUploading(true);
        try {
            await onUpload(file);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div
            onClick={() => !uploading && inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const file = e.dataTransfer.files[0];
                if (file) handleFile(file);
            }}
            className={`
                flex flex-col items-center justify-center gap-3 h-44 rounded-xl
                border border-dashed cursor-pointer
                transition-all duration-200
                ${dragging
                    ? "border-(--color-primary-border) bg-(--color-primary-bg)"
                    : "border-(--color-border-default) bg-(--color-secondary-bg) hover:border-(--color-primary-border) hover:bg-(--color-primary-bg)"
                }
                ${uploading ? "pointer-events-none opacity-60" : ""}
            `}
        >
            {uploading
                ? <Loader size={20} className="animate-spin text-(--color-primary-icon)" />
                : <Plus size={20} strokeWidth={1.5} className="text-(--color-secondary-icon)" />
            }
            <span className="text-sm font-light text-(--color-secondary-text)">
                {uploading ? "Subiendo..." : "Añadir imagen"}
            </span>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                    e.target.value = "";
                }}
            />
        </div>
    );
}

// ─── Artworks Tab ─────────────────────────────────────────────────────────────

const ARTWORK_SLOTS = [
    { key: "capsule", label: "Capsule" },
    { key: "header",  label: "Header"  },
    { key: "main",    label: "Main"    },
] as const;

type ArtworkKey = typeof ARTWORK_SLOTS[number]["key"];

type ArtworksTabProps = {
    game: DeveloperGame;
    onRefetch: () => void;
};

export default function ArtworksTab({ game, onRefetch }: ArtworksTabProps) {
    // Artworks — map by position key (assumes order: capsule, header, main)
    const [artworks, setArtworks] = useState<Record<ArtworkKey, DeveloperArtwork | null>>({
        capsule: game.artworks[0] ?? null,
        header:  game.artworks[1] ?? null,
        main:    game.artworks[2] ?? null,
    });

    const [storePictures, setStorePictures] = useState(game.storePictures);

    // ── Artwork handlers ──
    const handleUploadArtwork = (key: ArtworkKey) => async (_file: File) => {
        // TODO: apiClient.post(`/games/${game.id}/artworks/${key}`, formData)
    };

    const handleDeleteArtwork = (key: ArtworkKey) => async (_id: string) => {
        // TODO: apiClient.delete(`/games/${game.id}/artworks/${key}`)
        setArtworks((prev) => ({ ...prev, [key]: null }));
    };

    // ── Store Pictures handlers ──
    const handleUploadStorePicture = async (file: File) => {
        const formData = new FormData();
        formData.append("StorePicture", file);

        const response = await apiClient.post(`/games/${game.id}/store-picture`, formData);
        if (!response.ok) throw new Error("No se pudo subir la imagen.");

        onRefetch();
    };

    const handleDeleteStorePicture = async (id: string) => {
        // TODO: apiClient.delete(`/games/${game.id}/store-pictures/${id}`)
        setStorePictures((prev) => prev.filter((p) => p.id !== id));
    };

    return (
        <div className="flex flex-col gap-8">

            {/* ── Artworks ── */}
            <div className="flex flex-col gap-4">
                <Divider title="Artworks" />
                <p className="text-sm font-light text-(--color-secondary-text)">
                    Imágenes principales del juego. Cada slot tiene un propósito específico y solo puede contener una imagen.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {ARTWORK_SLOTS.map(({ key, label }) => (
                        <ArtworkSlot
                            key={key}
                            label={label}
                            item={artworks[key]}
                            onUpload={handleUploadArtwork(key)}
                            onDelete={handleDeleteArtwork(key)}
                        />
                    ))}
                </div>
            </div>

            {/* ── Store Pictures ── */}
            <div className="flex flex-col gap-4">
                <Divider title="Store Pictures" />
                <p className="text-sm font-light text-(--color-secondary-text)">
                    Capturas y material visual que se mostrará en la página de la tienda.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {storePictures.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center gap-2 py-6 text-(--color-secondary-text)">
                            <ImageOff size={24} strokeWidth={1.5} className="text-(--color-secondary-icon)" />
                            <span className="text-sm font-light">No hay imágenes de tienda todavía</span>
                        </div>
                    )}
                    {storePictures.map((pic) => (
                        <StorePictureCard key={pic.id} item={pic} onDelete={handleDeleteStorePicture} />
                    ))}
                    <AddStorePictureButton onUpload={handleUploadStorePicture} />
                </div>
            </div>

        </div>
    );
}