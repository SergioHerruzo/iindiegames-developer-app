import { useEffect, useState } from "react";
import { apiClient } from "@services/ApiClient";
import type { Genre } from "@models/genre";
import type { PaginatedResponse } from "@models/PaginatedResponse";

const GENRES_ENDPOINT = "/genres";

const emptyPaginatedResponse: PaginatedResponse<Genre> = {
    items: [],
    pageNumber: 1,
    pageSize: 0,
    pageCount: 0,
    totalItemCount: 0,
};

const genreCache = new Map<string, PaginatedResponse<Genre>>();
let inFlight: Promise<PaginatedResponse<Genre>> | null = null;

export default function useGenres() {
    const [genres, setGenres] = useState<PaginatedResponse<Genre>>(
        () => genreCache.get(GENRES_ENDPOINT) ?? emptyPaginatedResponse
    );
    const [loading, setLoading] = useState(!genreCache.has(GENRES_ENDPOINT));
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        if (genreCache.has(GENRES_ENDPOINT)) {
            return () => {
                active = false;
            };
        }

        if (!inFlight) {
            inFlight = apiClient
                .get(GENRES_ENDPOINT)
                .then(async (res) => {
                    if (!res.ok) throw new Error("Error al cargar los géneros.");
                    const data = (await res.json()) as PaginatedResponse<Genre>;

                    if (!data || !Array.isArray(data.items))
                        throw new Error("Formato de géneros inválido.");

                    genreCache.set(GENRES_ENDPOINT, data);
                    return data;
                })
                .finally(() => {
                    inFlight = null;
                });
        }

        setLoading(true);
        setError(null);

        inFlight
            ?.then((data) => {
                if (!active) return;
                setGenres(data);
                setError(null);
            })
            .catch((err) => {
                if (!active) return;
                const message = err instanceof Error
                    ? err.message
                    : "Error al cargar los géneros.";
                setError(message);
            })
            .finally(() => {
                if (!active) return;
                setLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    return { genres, loading, error };
}