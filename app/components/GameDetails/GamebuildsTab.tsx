import { useState } from "react";
import { Link } from "react-router";
import { Package, Plus, CircleAlert } from "lucide-react";
import PrimaryButton from "@components/PrimaryButton";
import CreateGameBuildModal from "@components/GameDetails/Creategamebuildmodal";
import StatusBadge from "@components/StatusBadge";
import useGameBuilds from "@/hooks/useGameBuilds";
import type { DeveloperGameBuild } from "@models/DeveloperGameBuild";

// ─── Build Card ───────────────────────────────────────────────────────────────

function BuildCard({ build }: { build: DeveloperGameBuild }) {
    return (
        <Link to={`/game-builds/${build.id}`} className="flex flex-col gap-4 p-5 rounded-xl border border-border-default bg-card-bg hover:bg-secondary-bg hover:border-secondary-border transition-all duration-150">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-secondary-bg border border-secondary-border shrink-0">
                    <Package size={22} strokeWidth={1.5} className="text-secondary-icon" />
                </div>
                <div className="inline-flex items-center gap-2 flex-wrap justify-end">
                    {build.isReleaseBuild && (
                        <span className="text-xs font-light px-2.5 py-1 rounded-full border bg-published-bg text-published-text border-published-border">
                            Release
                        </span>
                    )}
                    <StatusBadge status={build.status} />
                </div>
            </div>
            <div className="flex flex-col gap-1">
                <span className="text-base font-medium text-slate-200">{build.versionName}</span>
                <span className="text-xs font-light text-secondary-text">{build.id}</span>
            </div>
        </Link>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function BuildsSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-3 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-4 p-5 rounded-xl border border-border-default bg-card-bg">
                    <div className="flex items-start justify-between gap-3">
                        <div className="w-12 h-12 rounded-xl skeleton-block shrink-0" />
                        <div className="h-6 w-16 rounded-full skeleton-block" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <div className="h-4 w-28 rounded skeleton-block" />
                        <div className="h-3 w-44 rounded skeleton-block" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-secondary-text">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-secondary-bg border border-secondary-border">
                <Package size={22} strokeWidth={1.5} className="text-secondary-icon" />
            </div>
            <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-medium text-slate-300">Sin builds todavía</span>
                <span className="text-sm font-light text-secondary-text">
                    Crea tu primera build para empezar a distribuir el juego.
                </span>
            </div>
        </div>
    );
}

// ─── Game Builds Tab ──────────────────────────────────────────────────────────

export default function GameBuildsTab({ gameId }: { gameId: string }) {
    const { builds, loading, error, refetch } = useGameBuilds(gameId);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const items = builds?.items ?? [];

    return (
        <>
            <div className="flex flex-col gap-4">
                {/* Header row */}
                <div className="flex items-center justify-between">
                    <h4 className="font-light">
                        Gestiona las versiones distribuibles de tu juego.
                    </h4>

                    <PrimaryButton onClick={() => setIsModalOpen(true)}>
                        <PrimaryButton.Icon icon={Plus} />
                        Nueva Build
                    </PrimaryButton>
                </div>

                {/* Content */}
                {error && (
                    <div className="flex items-center gap-3 px-1 py-2 text-sm text-error-text">
                        <CircleAlert size={16} strokeWidth={1.5} />
                        <span>{error}</span>
                    </div>
                )}

                {!error && loading && <BuildsSkeleton />}

                {!error && !loading && items.length === 0 && <EmptyState />}

                {!error && !loading && items.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                        {items.map((build) => (
                            <BuildCard key={build.id} build={build} />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            <CreateGameBuildModal
                isOpen={isModalOpen}
                gameId={gameId ?? ""}
                onSuccess={refetch}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}