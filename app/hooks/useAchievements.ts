import useFetch from "@/hooks/useFetch";
import type { Achievement } from "@models/Achievement";

type UseAchievementsResult = {
    achievements: Achievement[] | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
};

export default function useAchievements(gameId: string | undefined): UseAchievementsResult {
    const { data, loading, error, refetch } = useFetch<{ value: Achievement[] }>(
        gameId ? `/games/${gameId}/achievements` : null,
        {
            fallbackError: "No se pudieron cargar los logros.",
            errorMessages: {
                401: "No tienes permisos para ver los logros de este juego.",
                403: "No tienes permisos para ver los logros de este juego.",
                404: "El juego no existe o fue eliminado.",
                500: "Error interno del servidor. Inténtalo más tarde.",
            },
        }
    );

    return { achievements: data?.value ?? null, loading, error, refetch };
}
