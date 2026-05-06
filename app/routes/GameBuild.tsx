import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Trash2, Save, Loader, ExternalLink, Package, FolderOpen, CheckCircle } from "lucide-react";
import Card from "@components/Card";
import { Input } from "@components/Input";
import Divider from "@components/Divider";
import PrimaryButton from "@components/PrimaryButton";
import SecondaryButton from "@components/SecondaryButton";
import StatusBadge from "@components/StatusBadge";
import BuildFileList from "@components/GameDetails/BuildFileList";
import DeleteConfirmCard from "@components/GameDetails/DeleteConfirmCard";
import GameBuildSkeleton from "@components/GameDetails/GameBuildSkeleton";
import useGameBuildDetail from "@/hooks/useGameBuildDetail";
import useGameBuildFiles from "@/hooks/useGameBuildFiles";
import useGameBuildActions from "@/hooks/useGameBuildActions";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GameBuild() {
    const { buildId } = useParams();
    const navigate = useNavigate();
    const { build, loading, error } = useGameBuildDetail(buildId);
    const { files, loading: filesLoading, error: filesError, refetch: refetchFiles } = useGameBuildFiles(buildId);

    const isReadOnly = Boolean(build?.isReleaseBuild);

    const {
        versionName,
        versionNameError,
        onVersionNameChange,

        isSaving,
        saveError,
        saveSuccess,
        uploadProgress,
        handleSave,

        showDeleteConfirm,
        setShowDeleteConfirm,
        isDeleting,
        deleteError,
        handleDelete,

        folderInputRef,
        selectedFiles,
        folderName,
        skippedCount,
        handleFolderChange,

        isCompleting,
        completeError,
        completeSuccess,
        handleComplete,
    } = useGameBuildActions(
        buildId,
        build?.versionName ?? "",
        isReadOnly,
        files,
        () => navigate(-1),
        () => refetchFiles()
    );

    return (
        <div className="flex flex-col flex-1 h-full w-full px-6 py-4 gap-8">

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
            <header className="flex items-center justify-between w-full gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-secondary-bg border border-secondary-border">
                        <Package size={24} strokeWidth={1.5} className="text-secondary-icon" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2>{build?.versionName ?? buildId}</h2>
                            {build && <StatusBadge status={build.status} />}
                            {build?.isReleaseBuild && (
                                <span className="text-xs font-light px-2.5 py-1 rounded-full border bg-published-bg text-published-text border-published-border">
                                    Release
                                </span>
                            )}
                        </div>
                        <h4>
                            Gestiona los archivos y detalles de esta build.
                        </h4>
                    </div>
                </div>
            </header>

            {/* Error loading */}
            {error && (
                <div className="rounded-lg border border-error-border bg-error-bg p-4 text-sm text-error-text">
                    {error}
                </div>
            )}

            {/* Skeleton */}
            {!error && loading && <GameBuildSkeleton />}

            {/* Content */}
            {!error && !loading && build && (
                <>
                    {isReadOnly && (
                        <div className="rounded-lg border border-secondary-border bg-secondary-bg p-4 text-sm text-secondary-text">
                            Esta build está marcada como <span className="font-medium">Release</span> y no se puede editar.
                        </div>
                    )}

                    {/* Edit section */}
                    {isReadOnly ? (
                        <Card>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-medium text-slate-200">Nombre de versión</span>
                                <span className="text-xs font-light text-secondary-text">
                                    {build.versionName}
                                </span>
                            </div>
                        </Card>
                    ) : (
                        <Card>
                            <Input.Root
                                id="version-name"
                                type="text"
                                variant="inside card"
                                value={versionName}
                                onChange={onVersionNameChange}
                            >
                                <Input.Label>Nombre de versión</Input.Label>
                                <Input.Field
                                    placeholder="ej. 1.0.0"
                                    error={versionNameError}
                                />
                            </Input.Root>
                        </Card>
                    )}

                    {/* Manifest URL */}
                    {build.manifestUrl && (
                        <Card>
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-sm font-medium text-slate-200">Manifest</span>
                                    <span className="text-xs font-light text-secondary-text truncate max-w-sm">
                                        {build.manifestUrl}
                                    </span>
                                </div>
                                <a
                                    href={build.manifestUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-light text-secondary-text bg-secondary-bg border border-secondary-border hover:bg-secondary-bg-hover hover:border-secondary-border-hover transition-all duration-200"
                                >
                                    <ExternalLink size={14} strokeWidth={1.5} />
                                    Ver manifest
                                </a>
                            </div>
                        </Card>
                    )}

                    {/* Files section */}
                    <Divider title="Archivos" />

                    <BuildFileList files={files} loading={filesLoading} error={filesError} />

                    {!isReadOnly && (
                        <>
                            <input
                                ref={folderInputRef}
                                type="file"
                                className="hidden"
                                // @ts-ignore
                                webkitdirectory=""
                                onChange={handleFolderChange}
                                disabled={isSaving}
                            />

                            <Card>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-sm font-medium text-slate-200">Carpeta de archivos</span>
                                        <span className="text-xs font-light text-secondary-text">
                                            {folderName
                                                ? `${folderName} · ${selectedFiles.length} archivo${selectedFiles.length !== 1 ? "s" : ""}${skippedCount > 0 ? ` · ${skippedCount} ya existente${skippedCount !== 1 ? "s" : ""} omitido${skippedCount !== 1 ? "s" : ""}` : ""}`
                                                : "Ninguna carpeta seleccionada"
                                            }
                                        </span>
                                    </div>
                                    <SecondaryButton onClick={() => folderInputRef.current?.click()} disabled={isSaving}>
                                        <FolderOpen size={14} strokeWidth={1.5} />
                                        Seleccionar carpeta
                                    </SecondaryButton>
                                </div>
                            </Card>

                            {isSaving && uploadProgress && (
                                <div className="rounded-lg border border-secondary-border bg-secondary-bg p-3 text-sm text-secondary-text">
                                    Subiendo {uploadProgress.done} / {uploadProgress.total} archivos...
                                </div>
                            )}
                        </>
                    )}

                    {/* Feedback messages */}
                    {saveError && (
                        <div className="rounded-lg border border-error-border bg-error-bg p-3 text-sm text-error-text">
                            {saveError}
                        </div>
                    )}
                    {saveSuccess && (
                        <div className="rounded-lg border border-published-border bg-published-bg p-3 text-sm text-published-text">
                            Cambios guardados correctamente.
                        </div>
                    )}
                    {completeError && (
                        <div className="rounded-lg border border-error-border bg-error-bg p-3 text-sm text-error-text">
                            {completeError}
                        </div>
                    )}
                    {completeSuccess && (
                        <div className="rounded-lg border border-published-border bg-published-bg p-3 text-sm text-published-text">
                            Build completada correctamente.
                        </div>
                    )}
                    {deleteError && (
                        <div className="rounded-lg border border-error-border bg-error-bg p-3 text-sm text-error-text">
                            {deleteError}
                        </div>
                    )}

                    {/* Bottom action row */}
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3 flex-wrap">
                            {!isReadOnly && (
                                <PrimaryButton onClick={handleSave} disabled={isSaving || isCompleting}>
                                    {isSaving
                                        ? <><Loader size={14} className="animate-spin" /> Guardando...</>
                                        : <><Save size={14} strokeWidth={1.5} /> Guardar cambios</>
                                    }
                                </PrimaryButton>
                            )}
                            {!isReadOnly && (
                                <PrimaryButton onClick={handleComplete} disabled={isCompleting || isSaving}>
                                    {isCompleting
                                        ? <><Loader size={14} className="animate-spin" /> Completando...</>
                                        : <><CheckCircle size={14} strokeWidth={1.5} /> Completar build</>
                                    }
                                </PrimaryButton>
                            )}
                        </div>

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
                                disabled={isReadOnly || isDeleting}
                                className="inline-flex items-center gap-2 px-4 py-2 max-w-fit rounded-full text-sm font-light text-error-text bg-error-bg border border-error-border cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <Trash2 size={14} strokeWidth={1.5} />
                                Eliminar build
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
