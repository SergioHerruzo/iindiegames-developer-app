import useFetch from "@/hooks/useFetch";
import type { DeveloperGameBuildDetail } from "@models/DeveloperGameBuildDetail";

type UseGameBuildDetailResult = {
    build: DeveloperGameBuildDetail | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
};

export default function useGameBuildDetail(buildId: string | undefined): UseGameBuildDetailResult {
    const { data, loading, error, refetch } = useFetch<DeveloperGameBuildDetail>(
        buildId ? `/game-builds/developer/${buildId}` : null,
        {
            fallbackError: "No se pudo cargar la build.",
            errorMessages: {
                401: "No tienes permisos para ver esta build.",
                403: "No tienes permisos para ver esta build.",
                404: "La build no existe o fue eliminada.",
                500: "Error interno del servidor. Inténtalo más tarde.",
            },
        }
    );

    return { build: data, loading, error, refetch };
}