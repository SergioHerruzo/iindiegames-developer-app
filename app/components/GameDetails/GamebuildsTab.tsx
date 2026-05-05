import { useState } from "react";
import { Link, useParams } from "react-router";
import { Package, Plus, CircleAlert } from "lucide-react";
import Divider from "@components/Divider";
import PrimaryButton from "@components/PrimaryButton";
import CreateGameBuildModal from "@components/GameDetails/Creategamebuildmodal";
import useGameBuilds from "@/hooks/useGameBuilds";
import type { DeveloperGameBuild } from "@models/DeveloperGameBuild";

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
        <span className={`text-xs font-light px-2.5 py-1 rounded-full border ${config.bg} ${config.text} ${config.border}`}>
            {config.label}
        </span>
    );
}

// ─── Build Row ────────────────────────────────────────────────────────────────

function BuildRow({ build }: { build: DeveloperGameBuild }) {
    return (
        <Link to={`/game-builds/${build.id}`} className="flex items-center justify-between px-4 py-3 border-b border-(--color-border-default) last:border-b-0 hover:bg-(--color-secondary-bg) transition-colors duration-150">
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-(--color-secondary-bg) border border-(--color-secondary-border)">
                    <Package size={16} strokeWidth={1.5} className="text-(--color-secondary-icon)" />
                </div>
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-slate-200">{build.versionName}</span>
                    <span className="text-xs font-light text-(--color-secondary-text)">{build.id}</span>
                </div>
            </div>

            <div className="inline-flex items-center gap-2">
                {build.isReleaseBuild && (
                    <span className="text-xs font-light px-2.5 py-1 rounded-full border bg-(--color-published-bg) text-(--color-published-text) border-(--color-published-border)">
                        Release
                    </span>
                )}
                <StatusBadge status={build.status} />
            </div>
        </Link>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function BuildsSkeleton() {
    return (
        <div className="flex flex-col animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-(--color-border-default) last:border-b-0">
                    <div className="w-9 h-9 rounded-lg skeleton-block shrink-0" />
                    <div className="flex flex-col gap-1.5 flex-1">
                        <div className="h-3.5 w-32 rounded skeleton-block" />
                        <div className="h-3 w-48 rounded skeleton-block" />
                    </div>
                    <div className="h-6 w-16 rounded-full skeleton-block" />
                </div>
            ))}
        </div>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-(--color-secondary-text)">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-(--color-secondary-bg) border border-(--color-secondary-border)">
                <Package size={22} strokeWidth={1.5} className="text-(--color-secondary-icon)" />
            </div>
            <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-medium text-slate-300">Sin builds todavía</span>
                <span className="text-sm font-light text-(--color-secondary-text)">
                    Crea tu primera build para empezar a distribuir el juego.
                </span>
            </div>
        </div>
    );
}

// ─── Game Builds Tab ──────────────────────────────────────────────────────────

export default function GameBuildsTab() {
    const { gameId } = useParams();
    const { builds, loading, error, refetch } = useGameBuilds(gameId);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const items = builds?.items ?? [];

    return (
        <>
            <div className="flex flex-col gap-4">
                <Divider title="Game Builds" />

                {/* Header row */}
                <div className="flex items-center justify-between">
                    <p className="text-sm font-light text-(--color-secondary-text)">
                        Gestiona las versiones distribuibles de tu juego.
                        {!loading && builds && (
                            <span className="ml-1 text-(--color-badge-neutral-text)">
                                {builds.totalItemCount} {builds.totalItemCount === 1 ? "build" : "builds"}
                            </span>
                        )}
                    </p>

                    <PrimaryButton onClick={() => setIsModalOpen(true)}>
                        <PrimaryButton.Icon icon={Plus} />
                        Nueva build
                    </PrimaryButton>
                </div>

                {/* Content */}
                <div className="rounded-xl border border-(--color-border-default) bg-(--color-card-bg) overflow-hidden">
                    {error && (
                        <div className="flex items-center gap-3 px-4 py-4 text-sm text-(--color-error-text)">
                            <CircleAlert size={16} strokeWidth={1.5} />
                            <span>{error}</span>
                        </div>
                    )}

                    {!error && loading && <BuildsSkeleton />}

                    {!error && !loading && items.length === 0 && <EmptyState />}

                    {!error && !loading && items.length > 0 && (
                        <div className="flex flex-col">
                            {items.map((build) => (
                                <BuildRow key={build.id} build={build} />
                            ))}
                        </div>
                    )}
                </div>
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