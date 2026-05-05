import { useState } from "react";
import { ChevronDown, Loader, Save } from "lucide-react";
import Card from "@components/Card";
import PrimaryButton from "@components/PrimaryButton";
import useGameBuilds from "@/hooks/useGameBuilds";
import { apiClient } from "@services/ApiClient";
import { getApiErrorMessage } from "@/utils/apiErrors";
import type { DeveloperGameReleaseBuild } from "@models/DeveloperGameReleaseBuild";

type ReleaseBuildSectionProps = {
    gameId: string;
    initialReleaseBuild: DeveloperGameReleaseBuild | null;
};

export default function ReleaseBuildSection({ gameId, initialReleaseBuild }: ReleaseBuildSectionProps) {
    const [selectedBuildId, setSelectedBuildId] = useState(initialReleaseBuild?.id ?? "");

    const [isSavingReleaseBuild, setIsSavingReleaseBuild] = useState(false);
    const [saveReleaseBuildError, setSaveReleaseBuildError] = useState<string | null>(null);
    const [saveReleaseBuildSuccess, setSaveReleaseBuildSuccess] = useState(false);

    const { builds, loading: buildsLoading } = useGameBuilds(gameId);

    const handleSaveReleaseBuild = async () => {
        if (!selectedBuildId) return;

        setIsSavingReleaseBuild(true);
        setSaveReleaseBuildError(null);
        setSaveReleaseBuildSuccess(false);

        try {
            const response = await apiClient.patch(`/games/${gameId}/release-build`, { buildId: selectedBuildId });

            if (!response.ok) {
                throw new Error(
                    getApiErrorMessage(
                        response.status,
                        {
                            400: "La build seleccionada no es válida.",
                            401: "No tienes permisos para editar este juego.",
                            403: "No tienes permisos para editar este juego.",
                            404: "El juego o la build no existen.",
                            500: "Error interno del servidor. Inténtalo más tarde.",
                        },
                        "No se pudo guardar la release build."
                    )
                );
            }

            setSaveReleaseBuildSuccess(true);
        } catch (err) {
            setSaveReleaseBuildError(err instanceof Error ? err.message : "Error inesperado.");
        } finally {
            setIsSavingReleaseBuild(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <Card>
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-slate-200">Versión de release</span>
                        <span className="text-xs font-light text-(--color-secondary-text)">
                            {initialReleaseBuild
                                ? `Actual: ${initialReleaseBuild.versionName}`
                                : "Ninguna build configurada como release."
                            }
                        </span>
                    </div>

                    <div className="relative">
                        <select
                            value={selectedBuildId}
                            onChange={(e) => {
                                setSelectedBuildId(e.target.value);
                                setSaveReleaseBuildSuccess(false);
                            }}
                            disabled={buildsLoading || isSavingReleaseBuild}
                            className="w-full appearance-none bg-(--color-secondary-bg) border border-(--color-secondary-border) rounded-lg px-3 py-2.5 pr-9 text-sm text-slate-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">Sin release build</option>
                            {builds?.items.map((build) => (
                                <option key={build.id} value={build.id}>
                                    {build.versionName}
                                    {build.isReleaseBuild ? " (actual)" : ""}
                                    {" · "}
                                    {build.status}
                                </option>
                            ))}
                        </select>
                        <ChevronDown
                            size={14}
                            strokeWidth={1.5}
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--color-secondary-text)"
                        />
                    </div>
                </div>
            </Card>

            {saveReleaseBuildError && (
                <div className="rounded-lg border border-(--color-error-border) bg-(--color-error-bg) p-3 text-sm text-(--color-error-text)">
                    {saveReleaseBuildError}
                </div>
            )}
            {saveReleaseBuildSuccess && (
                <div className="rounded-lg border border-(--color-published-border) bg-(--color-published-bg) p-3 text-sm text-(--color-published-text)">
                    Release build actualizada correctamente.
                </div>
            )}

            <PrimaryButton
                className="max-w-fit"
                onClick={handleSaveReleaseBuild}
                disabled={isSavingReleaseBuild || !selectedBuildId}
            >
                {isSavingReleaseBuild
                    ? <><Loader size={14} className="animate-spin" /> Guardando...</>
                    : <><Save size={14} strokeWidth={1.5} /> Guardar release build</>
                }
            </PrimaryButton>
        </div>
    );
}
