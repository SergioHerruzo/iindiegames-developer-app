import GameCardStats from '@components/GameCardStats'
import GameCard from '@components/GameCard'
import { Plus, CircleCheck, TriangleAlert, ShoppingCart, GamepadDirectional } from 'lucide-react'
import TopBar from '@components/TopBar'
import { useEffect, useState } from 'react'
import { httpClient } from '@services/http.client'
import type { PaginatedResponse } from '@models/PaginatedResponse'
import type { CreatedGame } from '@models/CreatedGame'
import { Link } from 'react-router'

type Status = "All" | "Published" | "NotPublished" | "Deleting" | "Failed";

const DEFAULT_PAGE_NUMBER = 1;
const DEFAULT_PAGE_SIZE = 10;
const STATUS_OPTIONS: { label: string; value: Status }[] = [
    { label: 'Todos', value: 'All' },
    { label: 'Activo', value: 'Published' },
    { label: 'Pendiente', value: 'NotPublished' },
    { label: 'Fallido', value: 'Failed' },
    { label: 'Cerrado', value: 'Deleting' },
];

export default function Dashboard() {
    const [status, setStatus] = useState<Status>("All");
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [createdGames, setCreatedGames] = useState<CreatedGame[]>([]);
    const [totalGames, setTotalGames] = useState(0);
    const [isLoadingGames, setIsLoadingGames] = useState(true);
    const [gamesError, setGamesError] = useState<string | null>(null);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setDebouncedSearch(search.trim());
        }, 350);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [search]);

    useEffect(() => {
        const controller = new AbortController();

        async function fetchCreatedGames() {
            setIsLoadingGames(true);
            setGamesError(null);

            try {
                const title = debouncedSearch.trim();

                const response = await httpClient.get<PaginatedResponse<CreatedGame>>('/users/me/created-games', {
                    params: {
                        ...(title ? { title } : {}),
                        pageNumber: DEFAULT_PAGE_NUMBER,
                        pageSize: DEFAULT_PAGE_SIZE,
                    },
                    signal: controller.signal,
                });

                const items = response.data.items ?? [];
                setCreatedGames(items);
                setTotalGames(response.data.totalItemCount ?? items.length);
            } catch {
                if (controller.signal.aborted) {
                    return;
                }

                setGamesError('No se han podido cargar tus juegos. Por favor, inténtalo de nuevo más tarde.');
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoadingGames(false);
                }
            }
        }

        fetchCreatedGames();

        return () => {
            controller.abort();
        };
    }, [debouncedSearch]);

    const gamesByStatus = status === 'All' ? createdGames : createdGames;

    const hasGamesError = !isLoadingGames && !!gamesError;
    const hasNoGames = !isLoadingGames && !gamesError && gamesByStatus.length === 0;
    const shouldShowGames = !isLoadingGames && !gamesError && gamesByStatus.length > 0;

    return (
        <>
            <TopBar />
            <div className="flex flex-col items-start justify-start w-full py-2 px-6 gap-8">
                <div className="flex items-start justify-between w-full gap-4">
                    <div className="flex flex-col items-start justify-start gap-2">
                        <h1 className="text-4xl text-text-200">Mis juegos</h1>
                        <h3 className="text-sm text-text-300">Gestiona tus juegos, compilaciones y análisis.</h3>
                    </div>
                    <Link to="/create-game" className="text-sm self-center inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-text-100 rounded-full cursor-pointer transition-transform">
                        <Plus className="w-6 h-6 mr-2" />
                        Agregar juego
                    </Link>
                </div>
                <div className="grid w-full gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <GameCardStats
                        title="Vendidos"
                        description="1,247"
                        change="+12% este mes"
                        icon={ShoppingCart}
                    />

                    <GameCardStats
                        title="Total"
                        description={totalGames.toLocaleString('es-ES')}
                        change="+5 añadidos"
                        icon={GamepadDirectional}
                    />

                    <GameCardStats
                        title="Juegos publicados"
                        description="47"
                        change="+2 esta semana"
                        icon={CircleCheck}
                    />

                    <GameCardStats
                        title="Juegos con incidencias"
                        description="0"
                        change="Sin incidencias"
                        icon={TriangleAlert}
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                    {isLoadingGames && (
                        <div className="col-span-full flex min-h-56 w-full items-center justify-center text-center">
                            <p className="text-sm text-text-400">Cargando tus juegos...</p>
                        </div>
                    )}

                    {hasGamesError && (
                        <div className="col-span-full flex min-h-56 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-bg-100/80 px-6 py-12 text-center gap-4">
                            <TriangleAlert className="w-10 h-10 text-red-400" />
                            <div className="flex flex-col gap-1">
                                <p className="text-xl text-text-300">No se pudieron cargar tus juegos</p>
                                <p className="text-text-400">{gamesError}</p>
                            </div>
                            <button
                                onClick={() => setDebouncedSearch(prev => prev)}
                                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-600 text-text-200 cursor-pointer"
                            >
                                Reintentar
                            </button>
                        </div>
                    )}

                    {hasNoGames && (
                        <div className="col-span-full flex min-h-56 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-bg-100 px-6 py-12 text-center">
                            <p className="text-xl text-text-300">Aún no has creado ningún juego.</p>
                            <p className="mt-2 text-sm text-text-400">Empieza tu próxima aventura y publica tu primer título.</p>
                        </div>
                    )}

                    {shouldShowGames && gamesByStatus.map((game) => (
                        <GameCard
                            key={game.id}
                            id={game.id}
                            title={game.title}
                            description={game.description}
                            imageUrl={game.pictureUrl}
                            status="NotPublished"
                        />
                    ))}
                </div>
            </div>
        </>
    )
}