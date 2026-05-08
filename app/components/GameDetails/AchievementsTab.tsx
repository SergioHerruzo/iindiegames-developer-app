import { useState } from "react";
import { Trophy, Plus, CircleAlert, Trash2, Loader, Globe } from "lucide-react";
import PrimaryButton from "@components/PrimaryButton";
import SecondaryButton from "@components/SecondaryButton";
import StatusBadge from "@components/StatusBadge";
import CreateAchievementModal from "@components/GameDetails/CreateAchievementModal";
import useAchievements from "@/hooks/useAchievements";
import { apiClient } from "@services/ApiClient";
import { getApiErrorMessage } from "@/utils/apiErrors";
import type { Achievement } from "@models/Achievement";

// ─── Achievement Card ─────────────────────────────────────────────────────────

type AchievementCardProps = {
    achievement: Achievement;
    isDeleting: boolean;
    isPublishing: boolean;
    onDelete: () => void;
    onPublish: () => void;
};

function AchievementCard({ achievement, isDeleting, isPublishing, onDelete, onPublish }: AchievementCardProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [imgError, setImgError] = useState(false);
    const canPublish = achievement.pictureState === "Completed" && !achievement.isPublished;

    return (
        <div className="flex flex-col gap-4 p-5 rounded-xl border border-border-default bg-card-bg">
            {/* Top row */}
            <div className="flex items-start gap-3">
                {achievement.smallPictureUrl && !imgError && (
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-secondary-bg border border-secondary-border shrink-0 overflow-hidden">
                        <img src={achievement.smallPictureUrl} alt={achievement.name} className="w-full h-full object-cover" onError={() => setImgError(true)} />
                    </div>
                )}
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <span className="text-sm font-medium text-slate-200 truncate">{achievement.name}</span>
                    <span className="text-xs font-light text-secondary-text line-clamp-2">{achievement.description}</span>
                </div>
                <div className="inline-flex items-center gap-2 flex-wrap justify-end shrink-0">
                    {achievement.isPublished && (
                        <span className="text-xs font-light px-2.5 py-1 rounded-full border bg-published-bg text-published-text border-published-border">
                            Publicado
                        </span>
                    )}
                    <StatusBadge status={achievement.pictureState} />
                </div>
            </div>

            {/* Delete confirmation */}
            {showDeleteConfirm ? (
                <div className="rounded-xl border border-error-border bg-error-bg p-4 flex items-center justify-between gap-4">
                    <p className="text-sm text-error-text">
                        ¿Seguro que quieres eliminar este logro? Esta acción no se puede deshacer.
                    </p>
                    <div className="inline-flex items-center gap-2 shrink-0">
                        <SecondaryButton onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
                            Cancelar
                        </SecondaryButton>
                        <button
                            type="button"
                            onClick={onDelete}
                            disabled={isDeleting}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-light text-error-text bg-error-bg border border-error-border cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50"
                        >
                            {isDeleting ? <Loader size={14} className="animate-spin" /> : <Trash2 size={14} strokeWidth={1.5} />}
                            {isDeleting ? "Eliminando..." : "Sí, eliminar"}
                        </button>
                    </div>
                </div>
            ) : (
                /* Action buttons */
                <div className="flex items-center justify-end gap-2">
                    {canPublish && (
                        <button
                            type="button"
                            onClick={onPublish}
                            disabled={isPublishing}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-light text-published-text bg-published-bg border border-published-border cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50"
                        >
                            {isPublishing ? <Loader size={12} className="animate-spin" /> : <Globe size={12} strokeWidth={1.5} />}
                            {isPublishing ? "Publicando..." : "Publicar"}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={isDeleting}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-light text-error-text bg-error-bg border border-error-border cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50"
                    >
                        <Trash2 size={12} strokeWidth={1.5} />
                        Eliminar
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function AchievementsSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-3 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-4 p-5 rounded-xl border border-border-default bg-card-bg">
                    <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl skeleton-block shrink-0" />
                        <div className="flex flex-col gap-2 flex-1">
                            <div className="h-4 w-28 rounded skeleton-block" />
                            <div className="h-3 w-full rounded skeleton-block" />
                        </div>
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
                <Trophy size={22} strokeWidth={1.5} className="text-secondary-icon" />
            </div>
            <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-medium text-slate-300">Sin logros todavía</span>
                <span className="text-sm font-light text-secondary-text">
                    Crea el primer logro para motivar a tus jugadores.
                </span>
            </div>
        </div>
    );
}

// ─── Achievements Tab ─────────────────────────────────────────────────────────

export default function AchievementsTab({ gameId }: { gameId: string }) {
    const { achievements, loading, error, refetch } = useAchievements(gameId);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [publishingId, setPublishingId] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const items = achievements ?? [];

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        setActionError(null);
        try {
            const response = await apiClient.delete(`/games/achievement/${id}`);
            if (!response.ok) {
                throw new Error(
                    getApiErrorMessage(
                        response.status,
                        {
                            401: "No tienes permisos para eliminar este logro.",
                            403: "No tienes permisos para eliminar este logro.",
                            404: "El logro no existe o fue eliminado.",
                        },
                        "No se pudo eliminar el logro."
                    )
                );
            }
            refetch();
        } catch (err) {
            setActionError(err instanceof Error ? err.message : "Error inesperado al conectar con el servidor.");
        } finally {
            setDeletingId(null);
        }
    };

    const handlePublish = async (id: string) => {
        setPublishingId(id);
        setActionError(null);
        try {
            const response = await apiClient.post(`/achievement/${id}/publish`, {});
            if (!response.ok) {
                throw new Error(
                    getApiErrorMessage(
                        response.status,
                        {
                            401: "No tienes permisos para publicar este logro.",
                            403: "No tienes permisos para publicar este logro.",
                            404: "El logro no existe o fue eliminado.",
                            409: "El logro ya está publicado.",
                        },
                        "No se pudo publicar el logro."
                    )
                );
            }
            refetch();
        } catch (err) {
            setActionError(err instanceof Error ? err.message : "Error inesperado al conectar con el servidor.");
        } finally {
            setPublishingId(null);
        }
    };

    return (
        <>
            <div className="flex flex-col gap-4">
                {/* Header row */}
                <div className="flex items-center justify-between">
                    <h4 className="font-light">
                        Gestiona los logros que pueden desbloquear los jugadores.
                    </h4>
                    <PrimaryButton onClick={() => setIsModalOpen(true)}>
                        <PrimaryButton.Icon icon={Plus} />
                        Nuevo Logro
                    </PrimaryButton>
                </div>

                {/* Fetch error */}
                {error && (
                    <div className="flex items-center gap-3 px-1 py-2 text-sm text-error-text">
                        <CircleAlert size={16} strokeWidth={1.5} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Action error */}
                {actionError && (
                    <div className="flex items-center gap-3 px-1 py-2 text-sm text-error-text">
                        <CircleAlert size={16} strokeWidth={1.5} />
                        <span>{actionError}</span>
                    </div>
                )}

                {!error && loading && <AchievementsSkeleton />}

                {!error && !loading && items.length === 0 && <EmptyState />}

                {!error && !loading && items.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                        {items.map((achievement) => (
                            <AchievementCard
                                key={achievement.id}
                                achievement={achievement}
                                isDeleting={deletingId === achievement.id}
                                isPublishing={publishingId === achievement.id}
                                onDelete={() => handleDelete(achievement.id)}
                                onPublish={() => handlePublish(achievement.id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <CreateAchievementModal
                isOpen={isModalOpen}
                gameId={gameId}
                onSuccess={refetch}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
