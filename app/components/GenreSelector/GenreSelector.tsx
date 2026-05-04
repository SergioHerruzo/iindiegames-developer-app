import { useMemo, useState } from "react";
import { X } from "lucide-react";
import useGenres from "@/hooks/useGenres";
import GenreModal from "@components/GenreSelector/GenreModal";
import type { Genre } from "@models/genre";
import type { PaginatedResponse } from "@models/PaginatedResponse";

type GenreSelectorProps = {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  error?: string | null;
};

export default function GenreSelector({ selectedIds, onChange, error }: GenreSelectorProps) {
  const { genres, loading } = useGenres();
  const [isOpen, setIsOpen] = useState(false);

  const selectedGenres = useMemo(() => {
    const byId = new Map(genres.items.map((g) => [g.id, g.name]));
    return selectedIds.map((id) => ({ id, name: byId.get(id) ?? id }));
  }, [genres, selectedIds]);

  const errorBorderClass = error
    ? "border-[color:var(--color-error-input-border)] focus:border-[color:var(--color-error-input-focus)]"
    : "";

  return (
    <div className="flex flex-col gap-1">
      <label className="mb-1 text-badge-neutral-text">Géneros</label>
      <button
        type="button"
        aria-label="Abrir selector de géneros"
        className={`flex h-12 w-full rounded-lg border border-border-inside-card bg-input-inside-card px-3 py-2.5 text-left text-sm text-slate-600 dark:text-white/60 focus:border-primary-focus ${errorBorderClass}`}
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <div className="flex h-full w-full items-center gap-2 overflow-x-auto flex-nowrap">
          {selectedGenres.length === 0 ? (
            <span className="text-badge-neutral-text font-normal">Selecciona géneros</span>
          ) : (
            selectedGenres.map((genre) => (
              <span
                key={genre.id}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-(--color-border-default) bg-(--color-card-bg) px-3 py-1 text-xs text-badge-neutral-text"
              >
                {genre.name}
                <button
                  type="button"
                  className="inline-flex items-center justify-center cursor-pointer text-badge-neutral-text transition-colors hover:text-white"
                  onClick={(event) => {
                    event.stopPropagation();
                    onChange(selectedIds.filter((id) => id !== genre.id));
                  }}
                  aria-label={`Quitar ${genre.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          )}
        </div>
      </button>
      {error ? <span className="text-xs text-(--color-error-message) mt-2">{error}</span> : null}

      <GenreModal
        isOpen={isOpen}
        selectedIds={selectedIds}
        genres={genres}
        loading={loading}
        onConfirm={(ids) => {
          onChange(ids);
          setIsOpen(false);
        }}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}