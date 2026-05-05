import { useState } from "react";
import { Loader, Save } from "lucide-react";
import Card from "@components/Card";
import PrimaryButton from "@components/PrimaryButton";
import GenreSelector from "@components/GenreSelector/GenreSelector";
import { apiClient } from "@services/ApiClient";
import { getApiErrorMessage } from "@/utils/apiErrors";

type GenresSectionProps = {
    gameId: string;
    initialGenres: string[];
};

export default function GenresSection({ gameId, initialGenres }: GenresSectionProps) {
    const [genres, setGenres] = useState<string[]>(initialGenres);

    const [isSavingGenres, setIsSavingGenres] = useState(false);
    const [saveGenresError, setSaveGenresError] = useState<string | null>(null);
    const [saveGenresSuccess, setSaveGenresSuccess] = useState(false);

    const handleSaveGenres = async () => {
        setIsSavingGenres(true);
        setSaveGenresError(null);
        setSaveGenresSuccess(false);

        try {
            const response = await apiClient.patch(`/games/${gameId}/genres`, { genres });

            if (!response.ok) {
                throw new Error(
                    getApiErrorMessage(
                        response.status,
                        {
                            400: "Los géneros seleccionados no son válidos.",
                            401: "No tienes permisos para editar este juego.",
                            403: "No tienes permisos para editar este juego.",
                            404: "El juego no existe o fue eliminado.",
                            500: "Error interno del servidor. Inténtalo más tarde.",
                        },
                        "No se pudieron guardar los géneros."
                    )
                );
            }

            setSaveGenresSuccess(true);
        } catch (err) {
            setSaveGenresError(err instanceof Error ? err.message : "Error inesperado.");
        } finally {
            setIsSavingGenres(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <Card>
                <GenreSelector
                    selectedIds={genres}
                    onChange={(val) => {
                        setGenres(val);
                        setSaveGenresSuccess(false);
                    }}
                />
            </Card>

            {saveGenresError && (
                <div className="rounded-lg border border-(--color-error-border) bg-(--color-error-bg) p-3 text-sm text-(--color-error-text)">
                    {saveGenresError}
                </div>
            )}
            {saveGenresSuccess && (
                <div className="rounded-lg border border-(--color-published-border) bg-(--color-published-bg) p-3 text-sm text-(--color-published-text)">
                    Géneros guardados correctamente.
                </div>
            )}

            <PrimaryButton className="max-w-fit" onClick={handleSaveGenres} disabled={isSavingGenres}>
                {isSavingGenres
                    ? <><Loader size={14} className="animate-spin" /> Guardando géneros...</>
                    : <><Save size={14} strokeWidth={1.5} /> Guardar géneros</>
                }
            </PrimaryButton>
        </div>
    );
}
