import GameCardStats from '@components/GameCardStats'
import GameCard from '@components/GameCard'
import Dropdown from '@components/Dropdown'
import { Plus, Gamepad2, CircleCheck, TriangleAlert, ShoppingCart, Search } from 'lucide-react'
import TopBar from '@components/TopBar'
import { useEffect, useState } from 'react'
import { httpClient } from '@services/http.client'
import type { PaginatedResponse } from '@models/PaginatedResponse'
import type { CreatedGame } from '@models/CreatedGame'

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

                setGamesError('No se pudieron cargar tus juegos. Intenta nuevamente en unos segundos.');
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
            <div className="flex flex-col items-start justify-start w-full min-h-screen py-8 px-40 gap-8">
                <div className="flex items-start justify-between w-full gap-4">
                    <div className="flex flex-col items-start justify-start gap-2">
                        <h1 className="text-4xl">Mis juegos</h1>
                        <h3 className="text-sm text-text-400">Gestiona tus juegos, compilaciones y análisis.</h3>
                    </div>
                    <button className="text-sm self-center inline-flex items-center justify-center px-4 py-2 bg-primary-400 text-text-100 rounded-full hover:bg-primary-500 cursor-pointer transition-transform hover:-translate-y-1">
                        <Plus className="w-6 h-6 mr-2" />
                        Agregar juego
                    </button>
                </div>
                <div className="flex items-center justify-start w-full gap-4">
                    <GameCardStats
                        title="Vendidos"
                        description="1,247"
                        icon={<ShoppingCart className="h-auto w-20 text-green-500 opacity-10" />}
                    />
                    <GameCardStats
                        title="Total"
                        description={totalGames.toLocaleString('es-ES')}
                        icon={<Gamepad2 className="h-auto w-20 text-neutral-500 opacity-10" />}
                    />
                    <GameCardStats
                        title="Juegos publicados"
                        description="47"
                        icon={<CircleCheck className="h-auto w-20 text-blue-500 opacity-10" />}
                    />
                    <GameCardStats
                        title="Juegos con fallos"
                        description="0"
                        icon={<TriangleAlert className="h-auto w-20 text-yellow-500 opacity-10" />}
                    />
                </div>
                <div className="flex w-full gap-4">
                    <div className="relative w-full">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-400">
                            <Search />
                        </div>
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Buscar"
                            className="w-full text-sm rounded-md border placeholder:text-text-400 border-bg-300 bg-bg-200 py-3 pl-12 pr-4 outline-none focus:border-primary-500"
                        />
                    </div>
                    <Dropdown<Status>
                        value={status}
                        onChange={setStatus}
                        placeholder="Todos los status"
                        options={STATUS_OPTIONS}
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                    {isLoadingGames && (
                        <div className="col-span-full flex min-h-56 w-full items-center justify-center text-center">
                            <p className="text-sm text-text-400">Cargando tus juegos...</p>
                        </div>
                    )}

                    {hasGamesError && (
                        <p className="text-sm text-red-400">{gamesError}</p>
                    )}

                    {hasNoGames && (
                        <div className="col-span-full flex min-h-56 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-bg-300 bg-bg-200 px-6 py-12 text-center">
                            <p className="text-xl text-text-200">Aún no has creado ningún juego.</p>
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