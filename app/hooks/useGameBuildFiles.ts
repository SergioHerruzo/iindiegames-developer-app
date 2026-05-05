import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@services/ApiClient";

type UseGameBuildFilesResult = {
    files: string[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
};

export default function useGameBuildFiles(buildId: string | undefined): UseGameBuildFilesResult {
    const [files, setFiles] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tick, setTick] = useState(0);

    const refetch = useCallback(() => setTick((t) => t + 1), []);

    useEffect(() => {
        if (!buildId) return;

        let cancelled = false;

        const fetchFiles = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await apiClient.get(`/game-builds/developer/${buildId}/files`);

                if (!response.ok) {
                    let message = "No se pudieron cargar los archivos.";
                    switch (response.status) {
                        case 401:
                        case 403:
                            message = "No tienes permisos para ver los archivos de esta build.";
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

                const data: string[] = await response.json();
                if (!cancelled) setFiles(data);

            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Error inesperado al cargar los archivos.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchFiles();
        return () => { cancelled = true; };
    }, [buildId, tick]);

    return { files, loading, error, refetch };
}
