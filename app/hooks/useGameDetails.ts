import { useEffect, useState } from "react";
import { apiClient } from "@services/ApiClient";
import type { DeveloperGame } from "@models/DeveloperGame";

type UseGameDetailsResult = {
    game: DeveloperGame | null;
    loading: boolean;
    error: string | null;
};

export default function useGameDetails(gameId: string | undefined): UseGameDetailsResult {
    const [game, setGame] = useState<DeveloperGame | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!gameId) return;

        let cancelled = false;

        const fetchGame = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await apiClient.get(`/games/developer/${gameId}`);

                if (!response.ok) {
                    let message = "No se pudo cargar el juego.";
                    switch (response.status) {
                        case 401:
                        case 403:
                            message = "No tienes permisos para ver este juego.";
                            break;
                        case 404:
                            message = "El juego no existe o fue eliminado.";
                            break;
                        case 500:
                            message = "Error interno del servidor. Inténtalo más tarde.";
                            break;
                    }
                    throw new Error(message);
                }

                const data: DeveloperGame = await response.json();
                if (!cancelled) setGame(data);

            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Error inesperado al cargar el juego.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchGame();

        return () => { cancelled = true; };
    }, [gameId]);

    return { game, loading, error };
}