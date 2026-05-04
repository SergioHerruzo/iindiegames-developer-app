import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { AlertTriangle, RefreshCw, Plus } from "lucide-react";
import type { PaginatedResponse } from "@models/PaginatedResponse";
import type { CreatedGame } from "@models/CreatedGame";
import PanelGameCard from "@components/PanelGameCard";
import { apiClient } from "@services/ApiClient";
import PrimaryButton from "@components/PrimaryButton";

interface CreatedGamesListProps {
    title?: string;
    pageNumber?: number;
    pageSize?: number;
}

const SKELETON_COUNT = 3;
const GRID_CLASS = "grid w-full gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";

const STAGGER_DELAY = ["[animation-delay:0ms]", "[animation-delay:150ms]", "[animation-delay:300ms]"];

function SkeletonCard({ index }: { index: number }) {
    return (
        <div
            className={`flex flex-col h-full rounded-xl border border-border-default bg-card-bg overflow-hidden relative ${STAGGER_DELAY[index] ?? ""}`}
        >
            {/* Image */}
            <div className="h-52 w-full border-b border-(--color-border-image) skeleton-block" />
            <div className="flex flex-col gap-2 p-4 flex-1">
                {/* Title */}
                <div className="h-5 w-3/4 rounded skeleton-block" />

                {/* Tags */}
                <div className="inline-flex items-center gap-2 mt-1">
                    <div className="h-6 w-24 rounded-full skeleton-block" />
                    <div className="h-6 w-20 rounded-full skeleton-block" />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-2 mt-2">
                    <div className="h-3.5 w-full rounded skeleton-block" />
                    <div className="h-3.5 w-5/6 rounded skeleton-block" />
                    <div className="h-3.5 w-4/6 rounded skeleton-block" />
                </div>
            </div>

            {/* Footer*/}
            <div className="border-t border-(--color-border-image) p-4">
                <div className="h-5 w-28 rounded skeleton-block" />
            </div>
        </div>
    );
}

export function CreatedGamesList({
    title,
    pageNumber,
    pageSize,
}: CreatedGamesListProps) {
    const navigate = useNavigate();
    const [data, setData] = useState<PaginatedResponse<CreatedGame> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchGames = useCallback(async () => {
        setLoading(true);
        setError(false);

        try {
            const params = new URLSearchParams();
            if (title !== undefined) params.set("Title", title);
            if (pageNumber !== undefined) params.set("PageNumber", String(pageNumber));
            if (pageSize !== undefined) params.set("PageSize", String(pageSize));

            const response = await apiClient.get(
                `/users/me/created-games?${params.toString()}`
            );

            if (!response.ok) throw new Error("Request failed");

            const json: PaginatedResponse<CreatedGame> = await response.json();
            setData(json);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [title, pageNumber, pageSize]);

    useEffect(() => {
        fetchGames();
    }, [fetchGames]);

    /* ── Loading ── */
    if (loading) {
        return (
            <div className={GRID_CLASS}>
                {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                    <SkeletonCard key={i} index={i} />
                ))}
            </div>
        );
    }

    /* ── Error ── */
    if (error) {
        return (
            <div className={GRID_CLASS}>
                <div className="col-span-full flex flex-col items-center gap-4 rounded-xl border border-error-border bg-error-bg px-6 py-10 text-center">
                    <div className="flex size-12 items-center justify-center rounded-full border border-error-border bg-error-bg">
                        <AlertTriangle
                            className="size-5 text-error-text"
                            strokeWidth={1.5}
                        />
                    </div>
                    <div className="space-y-1">
                        <p className="font-medium text-error-text">
                            No se pudieron cargar tus juegos
                        </p>
                        <p className="text-sm text-secondary">
                            Algo ha salido mal al conectar con el servidor. Inténtalo de nuevo.
                        </p>
                    </div>
                    <button
                        onClick={fetchGames}
                        className="mt-1 inline-flex items-center gap-2 rounded-lg border border-error-border bg-error-bg px-4 py-2 text-sm font-medium text-error-text transition-colors hover:bg-error-bg/80"
                    >
                        <RefreshCw className="size-4" strokeWidth={1.5} />
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    /* ── Empty State ── */
    if (!data || data.items.length === 0) {
        return (
            <div className={GRID_CLASS}>
                <div className="col-span-full flex flex-col items-center gap-4 rounded-xl border border-border-default bg-card-bg px-6 py-14 text-center">
                    <div className="space-y-1.5">
                        <h3 className="font-semibold">
                            ¡Empieza a crear tus juegos!
                        </h3>
                        <h5 className="mt-2 mb-4">
                            Aún no has creado ningún juego. Dale vida a tus ideas y compártelas con el mundo.
                        </h5>
                        <PrimaryButton onClick={() => navigate("/new-game")}>
                            <PrimaryButton.Icon icon={Plus} />
                            Crear juego
                        </PrimaryButton>
                    </div>
                </div>
            </div>
        );
    }

    /* ── Game List ── */
    return (
        <div className={GRID_CLASS}>
            {data.items.map((game) => (
                <PanelGameCard
                    key={game.id}
                    id={game.id}
                    title={game.title}
                    description={game.description}
                    imageUrl={game.artworks?.[0]?.mediumImageUrl ?? ""}
                    status={game.status}
                />
            ))}
        </div>
    );
}