import useFetch from "@/hooks/useFetch";
import type { DeveloperGameBuild } from "@models/DeveloperGameBuild";
import type { PaginatedResponse } from "@models/PaginatedResponse";

type UseGameBuildsResult = {
    builds: PaginatedResponse<DeveloperGameBuild> | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
};

export default function useGameBuilds(gameId: string | undefined): UseGameBuildsResult {
    const { data, loading, error, refetch } = useFetch<PaginatedResponse<DeveloperGameBuild>>(
        gameId ? `/games/developer/${gameId}/builds` : null,
        {
            fallbackError: "No se pudieron cargar las builds.",
            errorMessages: {
                401: "No tienes permisos para ver las builds de este juego.",
                403: "No tienes permisos para ver las builds de este juego.",
                404: "El juego no existe o fue eliminado.",
                500: "Error interno del servidor. Inténtalo más tarde.",
            },
        }
    );

    return { builds: data, loading, error, refetch };
}