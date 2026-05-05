import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@services/ApiClient";
import type { DeveloperGameBuild } from "@models/DeveloperGameBuild";
import type { PaginatedResponse } from "@models/PaginatedResponse";

type UseGameBuildsResult = {
    builds: PaginatedResponse<DeveloperGameBuild> | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
};

export default function useGameBuilds(gameId: string | undefined): UseGameBuildsResult {
    const [builds, setBuilds] = useState<PaginatedResponse<DeveloperGameBuild> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tick, setTick] = useState(0);

    const refetch = useCallback(() => setTick((t) => t + 1), []);

    useEffect(() => {
        if (!gameId) return;

        let cancelled = false;

        const fetchBuilds = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await apiClient.get(`/games/developer/${gameId}/builds`);

                if (!response.ok) {
                    let message = "No se pudieron cargar las builds.";
                    switch (response.status) {
                        case 401:
                        case 403:
                            message = "No tienes permisos para ver las builds de este juego.";
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

                const data: PaginatedResponse<DeveloperGameBuild> = await response.json();
                if (!cancelled) setBuilds(data);

            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Error inesperado al cargar las builds.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchBuilds();

        return () => { cancelled = true; };
    }, [gameId, tick]);

    return { builds, loading, error, refetch };
}