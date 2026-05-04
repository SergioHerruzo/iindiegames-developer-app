import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X, Check, Search } from "lucide-react";
import Card from "@components/Card";
import { Input } from "@components/Input";
import type { Genre } from "@models/genre";
import type { PaginatedResponse } from "@models/PaginatedResponse";
import SecondaryButton from "@components/SecondaryButton";
import PrimaryButton from "@components/PrimaryButton";

type GenreModalProps = {
    isOpen: boolean;
    selectedIds: string[];
    genres: PaginatedResponse<Genre>;
    loading: boolean;
    onConfirm: (ids: string[]) => void;
    onClose: () => void;
};

export default function GenreModal({
    isOpen,
    selectedIds,
    genres,
    loading,
    onConfirm,
    onClose,
}: GenreModalProps) {
    const [localSelected, setLocalSelected] = useState<string[]>(selectedIds);
    const [query, setQuery] = useState("");

    useEffect(() => {
        if (isOpen) {
            setLocalSelected(selectedIds);
            setQuery("");
        }
    }, [isOpen, selectedIds]);

    useEffect(() => {
        if (!isOpen) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isOpen, onClose]);

    const filteredGenres = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return genres.items;
        return genres.items.filter((genre) => genre.name.toLowerCase().includes(normalized));
    }, [genres, query]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
            onMouseDown={onClose}
        >
            <div
                className="w-full max-w-xl"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <Card variant="default">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base text-white/90">Seleccionar géneros</h3>
                            <button
                                type="button"
                                className="inline-flex items-center justify-center rounded-full p-1 transition-colors cursor-pointer border border-(--color-secondary-border) bg-(--color-secondary-bg) text-(--color-secondary-icon) hover:bg-(--color-secondary-bg-hover) hover:border-(--color-secondary-border-hover) hover:text-(--color-secondary-text)"
                                aria-label="Cerrar"
                                onClick={onClose}
                            >
                                <X className="h-4 w-4" strokeWidth={1.5} />
                            </button>
                        </div>

                        {/* Search Input */}
                        <Input.Root
                            id="search-genre"
                            value={query}
                            onChange={setQuery}
                            variant="inside card"
                        >
                            <Input.Label>Buscar género</Input.Label>
                            <Input.Field placeholder="Escribe para filtrar" icon={Search} />
                        </Input.Root>

                        <div className="max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-(--color-scrollbar-thumb) pr-1">
                            {loading ? (
                                <p className="text-sm text-badge-neutral-text text-center my-2">Cargando géneros...</p>
                            ) : filteredGenres.length === 0 ? (
                                <p className="text-sm text-badge-neutral-text text-center my-2">No hay géneros disponibles.</p>
                            ) : (
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {filteredGenres.map((genre) => {
                                        const isSelected = localSelected.includes(genre.id);
                                        return (
                                            <button
                                                key={genre.id}
                                                type="button"
                                                onClick={() => {
                                                    setLocalSelected((prev) =>
                                                        isSelected
                                                            ? prev.filter((id) => id !== genre.id)
                                                            : [...prev, genre.id]
                                                    );
                                                }}
                                                className={`inline-flex items-center rounded-full border px-4 py-2 text-sm cursor-pointer transition-all duration-300 ease-out ${isSelected
                                                    ? "bg-primary-bg border-primary-border text-primary-text hover:bg-primary-bg-hover hover:border-primary-border-hover"
                                                    : "bg-(--color-input-inside-card) border-(--color-border-inside-card) text-badge-neutral-text hover:bg-primary-bg hover:border-primary-border hover:text-primary-text"
                                                    }`}
                                            >
                                                {/* Genre Tag */}
                                                <div
                                                    className={`flex items-center overflow-hidden transition-all duration-300 ease-out ${
                                                        isSelected 
                                                            ? "w-4 mr-1.5 opacity-100 translate-x-0" 
                                                            : "w-0 mr-0 opacity-0 -translate-x-2"
                                                    }`}
                                                >
                                                    <Check className="h-4 w-4 shrink-0" />
                                                </div>
                                                <span>{genre.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            {/* Cancel */}
                            <SecondaryButton onClick={onClose}>
                                Cancelar
                            </SecondaryButton>
                            {/* Confirm */}
                            <PrimaryButton onClick={() => onConfirm(localSelected)}>
                                Confirmar
                            </PrimaryButton>
                        </div>
                    </div>
                </Card>
            </div>
        </div>,
        document.body
    );
}