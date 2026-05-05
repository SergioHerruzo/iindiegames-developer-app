import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Trash2, Save, Loader, ExternalLink, Package } from "lucide-react";
import Card from "@components/Card";
import { Input } from "@components/Input";
import Divider from "@components/Divider";
import PrimaryButton from "@components/PrimaryButton";
import SecondaryButton from "@components/SecondaryButton";
import useGameBuildDetail from "@/hooks/useGameBuildDetail";
import { apiClient } from "@services/ApiClient";

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
    Completed: {
        bg: "bg-(--color-published-bg)",
        text: "text-(--color-published-text)",
        border: "border-(--color-published-border)",
        label: "Completada",
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

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function GameBuildSkeleton() {
    return (
        <div className="flex flex-col gap-4 animate-pulse">
            <div className="h-7 w-48 rounded-lg skeleton-block" />
            <div className="h-px w-full skeleton-block" />
            <div className="h-24 w-full rounded-xl skeleton-block" />
            <div className="h-24 w-full rounded-xl skeleton-block" />
        </div>
    );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteConfirmCard({ onConfirm, onCancel, isDeleting }: {
    onConfirm: () => void;
    onCancel: () => void;
    isDeleting: boolean;
}) {
    return (
        <div className="rounded-xl border border-(--color-error-border) bg-(--color-error-bg) p-4 flex items-center justify-between gap-4">
            <p className="text-sm text-(--color-error-text)">
                ¿Seguro que quieres eliminar esta build? Esta acción no se puede deshacer.
            </p>
            <div className="inline-flex items-center gap-2 shrink-0">
                <SecondaryButton onClick={onCancel} disabled={isDeleting}>
                    Cancelar
                </SecondaryButton>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={isDeleting}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-light text-(--color-error-text) bg-(--color-error-bg) border border-(--color-error-border) cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                    {isDeleting
                        ? <Loader size={14} className="animate-spin" />
                        : <Trash2 size={14} strokeWidth={1.5} />
                    }
                    {isDeleting ? "Eliminando..." : "Sí, eliminar"}
                </button>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GameBuild() {
    const { buildId } = useParams();
    const navigate = useNavigate();
    const { build, loading, error } = useGameBuildDetail(buildId);

    const [versionName, setVersionName] = useState("");
    const [versionNameError, setVersionNameError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // Init local state once build loads
    const [initialized, setInitialized] = useState(false);
    if (build && !initialized) {
        setVersionName(build.versionName);
        setInitialized(true);
    }

    // ── Edit ──
    const handleSave = async () => {
        if (!versionName.trim()) {
            setVersionNameError("El nombre de la versión es obligatorio.");
            return;
        }

        setVersionNameError(null);
        setSaveError(null);
        setSaveSuccess(false);
        setIsSaving(true);

        try {
            const response = await apiClient.put(`/game-builds/${buildId}`, {
                versionName: versionName.trim(),
            });

            if (!response.ok) {
                let message = "No se pudo guardar los cambios.";
                switch (response.status) {
                    case 400: message = "Los datos enviados son incorrectos."; break;
                    case 401:
                    case 403: message = "No tienes permisos para editar esta build."; break;
                    case 404: message = "La build no existe o fue eliminada."; break;
                    case 409: message = "Ya existe una build con ese nombre de versión."; break;
                    case 500: message = "Error interno del servidor. Inténtalo más tarde."; break;
                }
                throw new Error(message);
            }

            setSaveSuccess(true);
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : "Error inesperado.");
        } finally {
            setIsSaving(false);
        }
    };

    // ── Delete ──
    const handleDelete = async () => {
        setIsDeleting(true);
        setDeleteError(null);

        try {
            const response = await apiClient.delete(`/game-builds/${buildId}`);

            if (!response.ok) {
                let message = "No se pudo eliminar la build.";
                switch (response.status) {
                    case 401:
                    case 403: message = "No tienes permisos para eliminar esta build."; break;
                    case 404: message = "La build no existe o ya fue eliminada."; break;
                    case 500: message = "Error interno del servidor. Inténtalo más tarde."; break;
                }
                throw new Error(message);
            }

            navigate(-1);
        } catch (err) {
            setDeleteError(err instanceof Error ? err.message : "Error inesperado.");
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <div className="px-6 py-4 flex flex-col gap-4">

            {/* Back link */}
            <Link
                to={-1 as unknown as string}
                className="group inline-flex items-center w-fit text-slate-600 dark:text-white/60 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors duration-300"
            >
                <div className="flex items-center w-0 overflow-hidden opacity-0 -translate-x-4 transition-all duration-300 ease-out group-hover:w-6 group-hover:opacity-100 group-hover:translate-x-0">
                    <ArrowLeft size={16} />
                </div>
                <span>Volver al juego</span>
            </Link>

            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-(--color-secondary-bg) border border-(--color-secondary-border)">
                    <Package size={18} strokeWidth={1.5} className="text-(--color-secondary-icon)" />
                </div>
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <h2>{build?.versionName ?? buildId}</h2>
                        {build && <StatusBadge status={build.status} />}
                        {build?.isReleaseBuild && (
                            <span className="text-xs font-light px-2.5 py-1 rounded-full border bg-(--color-published-bg) text-(--color-published-text) border-(--color-published-border)">
                                Release
                            </span>
                        )}
                    </div>
                    {build && (
                        <span className="text-xs font-light text-(--color-secondary-text)">{build.buildId}</span>
                    )}
                </div>
            </div>

            {/* Error loading */}
            {error && (
                <div className="rounded-lg border border-(--color-error-border) bg-(--color-error-bg) p-4 text-sm text-(--color-error-text)">
                    {error}
                </div>
            )}

            {/* Skeleton */}
            {!error && loading && <GameBuildSkeleton />}

            {/* Content */}
            {!error && !loading && build && (
                <>
                    {/* Edit section */}
                    <Divider title="Información" />

                    <Card>
                        <Input.Root
                            id="version-name"
                            type="text"
                            variant="inside card"
                            value={versionName}
                            onChange={(val) => {
                                setVersionName(val);
                                setSaveSuccess(false);
                            }}
                        >
                            <Input.Label>Nombre de versión</Input.Label>
                            <Input.Field
                                placeholder="ej. 1.0.0"
                                error={versionNameError}
                            />
                        </Input.Root>
                    </Card>

                    {/* Manifest URL */}
                    {build.manifestUrl && (
                        <Card>
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-sm font-medium text-slate-200">Manifest</span>
                                    <span className="text-xs font-light text-(--color-secondary-text) truncate max-w-sm">
                                        {build.manifestUrl}
                                    </span>
                                </div>
                                <a
                                    href={build.manifestUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-light text-(--color-secondary-text) bg-(--color-secondary-bg) border border-(--color-secondary-border) hover:bg-(--color-secondary-bg-hover) hover:border-(--color-secondary-border-hover) transition-all duration-200"
                                >
                                    <ExternalLink size={14} strokeWidth={1.5} />
                                    Ver manifest
                                </a>
                            </div>
                        </Card>
                    )}

                    {/* Save feedback */}
                    {saveError && (
                        <div className="rounded-lg border border-(--color-error-border) bg-(--color-error-bg) p-3 text-sm text-(--color-error-text)">
                            {saveError}
                        </div>
                    )}
                    {saveSuccess && (
                        <div className="rounded-lg border border-(--color-published-border) bg-(--color-published-bg) p-3 text-sm text-(--color-published-text)">
                            Cambios guardados correctamente.
                        </div>
                    )}

                    <PrimaryButton className="max-w-fit" onClick={handleSave} disabled={isSaving}>
                        {isSaving
                            ? <><Loader size={14} className="animate-spin" /> Guardando...</>
                            : <><Save size={14} strokeWidth={1.5} /> Guardar cambios</>
                        }
                    </PrimaryButton>

                    {/* Danger zone */}
                    <Divider title="Zona de peligro" />

                    {deleteError && (
                        <div className="rounded-lg border border-(--color-error-border) bg-(--color-error-bg) p-3 text-sm text-(--color-error-text)">
                            {deleteError}
                        </div>
                    )}

                    {showDeleteConfirm ? (
                        <DeleteConfirmCard
                            onConfirm={handleDelete}
                            onCancel={() => setShowDeleteConfirm(false)}
                            isDeleting={isDeleting}
                        />
                    ) : (
                        <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 max-w-fit rounded-full text-sm font-light text-(--color-error-text) bg-(--color-error-bg) border border-(--color-error-border) cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            <Trash2 size={14} strokeWidth={1.5} />
                            Eliminar build
                        </button>
                    )}
                </>
            )}
        </div>
    );
}