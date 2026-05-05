import useFetch from "@/hooks/useFetch";
import type { DeveloperGame } from "@models/DeveloperGame";

type UseGameDetailsResult = {
    game: DeveloperGame | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
};

export default function useGameDetails(gameId: string | undefined): UseGameDetailsResult {
    const { data, loading, error, refetch } = useFetch<DeveloperGame>(
        gameId ? `/games/developer/${gameId}` : null,
        {
            fallbackError: "No se pudo cargar el juego.",
            errorMessages: {
                401: "No tienes permisos para ver este juego.",
                403: "No tienes permisos para ver este juego.",
                404: "El juego no existe o fue eliminado.",
                500: "Error interno del servidor. Inténtalo más tarde.",
            },
        }
    );

    return { game: data, loading, error, refetch };
}