import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@services/ApiClient";
import { getApiErrorMessage } from "@/utils/apiErrors";

type UseFetchOptions = {
    errorMessages?: Partial<Record<number, string>>;
    fallbackError?: string;
};

type UseFetchResult<T> = {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
};

export default function useFetch<T>(
    url: string | null | undefined,
    options?: UseFetchOptions
): UseFetchResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tick, setTick] = useState(0);

    const refetch = useCallback(() => setTick((t) => t + 1), []);

    useEffect(() => {
        if (!url) return;

        let cancelled = false;

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await apiClient.get(url);

                if (!response.ok) {
                    throw new Error(
                        getApiErrorMessage(
                            response.status,
                            options?.errorMessages ?? {},
                            options?.fallbackError ?? "Ha ocurrido un error inesperado."
                        )
                    );
                }

                const json = (await response.json()) as T;
                if (!cancelled) setData(json);

            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Error inesperado.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchData();

        return () => {
            cancelled = true;
        };
        // NOTE: options is intentionally excluded (see plan).
    }, [url, tick]);

    return { data, loading, error, refetch };
}
