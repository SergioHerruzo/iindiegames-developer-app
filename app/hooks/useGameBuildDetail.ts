import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@services/ApiClient";
import type { DeveloperGameBuildDetail } from "@models/DeveloperGameBuildDetail";

type UseGameBuildDetailResult = {
    build: DeveloperGameBuildDetail | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
};

export default function useGameBuildDetail(buildId: string | undefined): UseGameBuildDetailResult {
    const [build, setBuild] = useState<DeveloperGameBuildDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tick, setTick] = useState(0);

    const refetch = useCallback(() => setTick((t) => t + 1), []);

    useEffect(() => {
        if (!buildId) return;

        let cancelled = false;

        const fetchBuild = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await apiClient.get(`/game-builds/developer/${buildId}`);

                if (!response.ok) {
                    let message = "No se pudo cargar la build.";
                    switch (response.status) {
                        case 401:
                        case 403:
                            message = "No tienes permisos para ver esta build.";
                            break;
                        case 404:
                            message = "La build no existe o fue eliminada.";
                            break;
                        case 500:
                            message = "Error interno del servidor. Inténtalo más tarde.";
                            break;
                    }
                    throw new Error(message);
                }

                const data: DeveloperGameBuildDetail = await response.json();
                if (!cancelled) setBuild(data);

            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Error inesperado al cargar la build.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchBuild();
        return () => { cancelled = true; };
    }, [buildId, tick]);

    return { build, loading, error, refetch };
}