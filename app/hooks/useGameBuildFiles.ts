import useFetch from "@/hooks/useFetch";

type UseGameBuildFilesResult = {
    files: string[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
};

export default function useGameBuildFiles(buildId: string | undefined): UseGameBuildFilesResult {
    const { data, loading, error, refetch } = useFetch<string[]>(
        buildId ? `/game-builds/developer/${buildId}/files` : null,
        {
            fallbackError: "No se pudieron cargar los archivos.",
            errorMessages: {
                401: "No tienes permisos para ver los archivos de esta build.",
                403: "No tienes permisos para ver los archivos de esta build.",
                404: "La build no existe o fue eliminada.",
                500: "Error interno del servidor. Inténtalo más tarde.",
            },
        }
    );

    return { files: data ?? [], loading, error, refetch };
}
