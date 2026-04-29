import GameCardStats from '@components/GameCardStats'
import GameCard from '@components/GameCard'
import { Plus, CircleCheck, TriangleAlert, ShoppingCart, GamepadDirectional } from 'lucide-react'
import TopBar from '@components/TopBar'
import { useEffect, useState } from 'react'
import { httpClient } from '@services/http.client'
import type { PaginatedResponse } from '@models/PaginatedResponse'
import type { CreatedGame } from '@models/CreatedGame'
import { Link } from 'react-router'

const DEFAULT_PAGE_NUMBER = 1;
const DEFAULT_PAGE_SIZE = 10;

export default function Dashboard() {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [createdGames, setCreatedGames] = useState<CreatedGame[]>([]);
    const [totalGames, setTotalGames] = useState(0);
    const [isLoadingGames, setIsLoadingGames] = useState(true);
    const [gamesError, setGamesError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setDebouncedSearch(search.trim());
        }, 350);
        return () => window.clearTimeout(timeoutId);
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
                if (controller.signal.aborted) return;
                setGamesError('No se han podido cargar tus juegos. Por favor, inténtalo de nuevo más tarde.');
            } finally {
                if (!controller.signal.aborted) setIsLoadingGames(false);
            }
        }

        fetchCreatedGames();
        return () => controller.abort();
    }, [debouncedSearch, retryCount]);

    const hasGamesError = !isLoadingGames && !!gamesError;
    const hasNoGames = !isLoadingGames && !gamesError && createdGames.length === 0;
    const shouldShowGames = !isLoadingGames && !gamesError && createdGames.length > 0;

    return (
        <>
            <TopBar />
            <div className="flex flex-col items-start justify-start w-full py-2 px-6 gap-8">
                {/* Header */}
                <div className="flex items-start justify-between w-full gap-4">
                    <div className="flex flex-col items-start justify-start gap-1">
                        <h1 className="text-4xl font-semibold text-slate-800">Mis juegos</h1>
                        <p className="text-sm text-slate-400">Gestiona tus juegos, compilaciones y análisis.</p>
                    </div>
                    <Link
                        to="/create-game"
                        className="text-sm self-center inline-flex items-center justify-center px-5 py-2.5 bg-emerald-600/90 hover:bg-emerald-600 backdrop-blur-sm text-white rounded-full transition-all duration-200 border border-emerald-500/40 shadow-sm hover:shadow-md hover:shadow-emerald-200/50"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar juego
                    </Link>
                </div>

                {/* Stats cards */}
                <div className="grid w-full gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <GameCardStats title="Vendidos" description="1,247" change="+12% este mes" icon={ShoppingCart} />
                    <GameCardStats title="Total" description={totalGames.toLocaleString('es-ES')} change="+5 añadidos" icon={GamepadDirectional} />
                    <GameCardStats title="Juegos publicados" description="47" change="+2 esta semana" icon={CircleCheck} />
                    <GameCardStats title="Juegos con incidencias" description="0" change="Sin incidencias" icon={TriangleAlert} />
                </div>

                {/* Games grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                    {isLoadingGames && (
                        <div className="col-span-full flex min-h-56 w-full flex-col items-center justify-center gap-3 text-center">
                            <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                        </div>
                    )}

                    {hasGamesError && (
                        <div className="col-span-full flex min-h-56 w-full flex-col items-center justify-center text-center gap-4">
                            <TriangleAlert className="w-10 h-10 text-rose-400/80" />
                            <div className="flex flex-col gap-1">
                                <p className="text-xl font-medium text-slate-700">No se pudieron cargar tus juegos</p>
                                <p className="text-sm text-slate-400">{gamesError}</p>
                            </div>
                            <button
                                onClick={() => setRetryCount(prev => prev + 1)}
                                className="mt-2 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-600/90 hover:bg-emerald-600 text-white text-sm transition border border-emerald-500/40 cursor-pointer"
                            >
                                Reintentar
                            </button>
                        </div>
                    )}

                    {hasNoGames && (
                        <div className="col-span-full flex min-h-56 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-200/60 bg-white/30 backdrop-blur-sm px-6 py-12 text-center">
                            <p className="text-lg text-slate-500">Aún no has creado ningún juego.</p>
                            <p className="mt-2 text-sm text-slate-400">Empieza tu próxima aventura y publica tu primer título.</p>
                        </div>
                    )}

                    {shouldShowGames && createdGames.map((game) => (
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
    );
}