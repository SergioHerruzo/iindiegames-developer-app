import GameCardStats from '@components/GameCardStats'
import GameCard from '@components/GameCard'
import { Plus, CircleCheck, TriangleAlert, ShoppingCart, GamepadDirectional } from 'lucide-react'
import TopBar from '@components/TopBar'
import DashboardHeader from '@components/dashboard/DashboardHeader'
import DashboardStateCard from '@components/dashboard/DashboardStateCard'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { httpClient } from '@services/http.client'
import type { PaginatedResponse } from '@models/PaginatedResponse'
import type { CreatedGame } from '@models/CreatedGame'
import { Link, redirect, useLoaderData } from 'react-router'
import type { Route } from './+types/dashboard'
import { refreshSessionWithCognito } from '@services/cognito.server'
import {
    createAuthCookieHeaders,
    getAccessTokenFromRequest,
    getRefreshTokenFromRequest,
    getUserFromIdToken,
    getUserFromRequest,
    normalizeRole,
} from '@utils/auth.server'

const DEFAULT_PAGE_NUMBER = 1
const DEFAULT_PAGE_SIZE = 10
const GAME_FETCH_ERROR = 'No se han podido cargar tus juegos. Inténtalo de nuevo.'

function getGameImageUrl(game: CreatedGame): string | null {
    const fromArray = game.artworks?.find((artwork) => Boolean(artwork?.mediumImageUrl))
    if (fromArray?.mediumImageUrl) return fromArray.mediumImageUrl
    return game.artwork?.mediumImageUrl ?? null
}

type LoaderData = {
    currentUser: ReturnType<typeof getUserFromRequest>;
    initialGames: CreatedGame[];
    initialTotal: number;
    initialError: string | null;
};

export async function loader({ request }: Route.LoaderArgs) {
    const currentUser = getUserFromRequest(request)
    const refreshToken = getRefreshTokenFromRequest(request)
    let accessToken = getAccessTokenFromRequest(request)
    let resolvedUser = currentUser
    let authHeaders: string[] = []

    async function refreshSession(): Promise<boolean> {
        if (!refreshToken) return false

        try {
            const tokens = await refreshSessionWithCognito(refreshToken)
            accessToken = tokens.accessToken
            resolvedUser = getUserFromIdToken(tokens.idToken)
            authHeaders = createAuthCookieHeaders({
                idToken: tokens.idToken,
                accessToken: tokens.accessToken,
                refreshToken,
                currentUser: resolvedUser ?? undefined,
            })
            return true
        } catch {
            return false
        }
    }

    const jsonResponse = (data: LoaderData, init: ResponseInit = {}) => {
        const headers = new Headers(init.headers)
        headers.set('Content-Type', 'application/json; charset=utf-8')

        authHeaders.forEach((value) => {
            headers.append('Set-Cookie', value)
        })

        return new Response(JSON.stringify(data), { ...init, headers })
    }

    if (!accessToken) {
        await refreshSession()
    }

    if (!accessToken || !resolvedUser) {
        throw redirect('/login')
    }

    if (normalizeRole(resolvedUser.role) !== 'developer') {
        throw redirect('/developer-agreement')
    }

    try {
        const apiBaseUrl = import.meta.env.VITE_BASE_URL
        const url = new URL('/users/me/created-games', apiBaseUrl || 'http://localhost')
        url.searchParams.set('pageNumber', String(DEFAULT_PAGE_NUMBER))
        url.searchParams.set('pageSize', String(DEFAULT_PAGE_SIZE))

        let response = await fetch(url.toString(), {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })

        if (response.status === 401 && (await refreshSession()) && accessToken) {
            response = await fetch(url.toString(), {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            })
        }

        if (!response.ok) {
            return jsonResponse({ currentUser: resolvedUser, initialGames: [], initialTotal: 0, initialError: GAME_FETCH_ERROR })
        }

        const data = (await response.json()) as PaginatedResponse<CreatedGame>
        const items = data.items ?? []

        return jsonResponse({
            currentUser: resolvedUser,
            initialGames: items,
            initialTotal: data.totalItemCount ?? items.length,
            initialError: null,
        })
    } catch {
        return jsonResponse({ currentUser: resolvedUser, initialGames: [], initialTotal: 0, initialError: GAME_FETCH_ERROR })
    }
}

export default function Dashboard() {
    const { initialGames, initialTotal, initialError } = useLoaderData<LoaderData>()
    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [createdGames, setCreatedGames] = useState<CreatedGame[]>(initialGames)
    const [totalGames, setTotalGames] = useState(initialTotal)
    const [isLoadingGames, setIsLoadingGames] = useState(initialGames.length === 0)
    const [gamesError, setGamesError] = useState<string | null>(initialError)
    const [retryCount, setRetryCount] = useState(0)
    const hasBootstrappedRef = useRef(false)
    const [hasLoadedOnce, setHasLoadedOnce] = useState(initialGames.length > 0)

    const totalGamesLabel = useMemo(() => totalGames.toLocaleString('es-ES'), [totalGames])
    const handleRetry = useCallback(() => setRetryCount((prev) => prev + 1), [])

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setDebouncedSearch(search.trim())
        }, 350)
        return () => window.clearTimeout(timeoutId)
    }, [search])

    useEffect(() => {
        if (!hasBootstrappedRef.current) {
            hasBootstrappedRef.current = true
            const shouldSkipInitialFetch = !debouncedSearch && retryCount === 0 && initialGames.length > 0
            if (shouldSkipInitialFetch) return
        }

        const controller = new AbortController()

        async function fetchCreatedGames() {
            setIsLoadingGames(true)
            setGamesError(null)

            try {
                const title = debouncedSearch.trim()

                const response = await httpClient.get<PaginatedResponse<CreatedGame>>(
                    '/users/me/created-games',
                    {
                        params: {
                            ...(title ? { title } : {}),
                            pageNumber: DEFAULT_PAGE_NUMBER,
                            pageSize: DEFAULT_PAGE_SIZE,
                        },
                        signal: controller.signal,
                    }
                )

                const items = response.data.items ?? []
                setCreatedGames(items)
                setTotalGames(response.data.totalItemCount ?? items.length)
            } catch {
                if (controller.signal.aborted) return
                setGamesError(GAME_FETCH_ERROR)
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoadingGames(false)
                    setHasLoadedOnce(true)
                }
            }
        }

        fetchCreatedGames()
        return () => controller.abort()
    }, [debouncedSearch, retryCount, initialGames.length])

    const hasGamesError = !isLoadingGames && !!gamesError
    const hasNoGames = hasLoadedOnce && !isLoadingGames && !gamesError && createdGames.length === 0
    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <TopBar />

            <div className="flex flex-col flex-1 min-h-0 w-full py-8 px-6 gap-8 overflow-hidden">

                <DashboardHeader
                    title="Mis juegos"
                    subtitle="Gestiona tus juegos, compilaciones y análisis."
                    action={
                        <Link to="/create-game" className="ui-button-primary font-light">
                            <Plus className="w-4 h-4" />
                            Agregar juego
                        </Link>
                    }
                />

                <div className="grid w-full gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <GameCardStats title="Vendidos" description="1,247" change="+12% este mes" icon={ShoppingCart} />
                    <GameCardStats title="Total" description={totalGamesLabel} change="+5 añadidos" icon={GamepadDirectional} />
                    <GameCardStats title="Juegos publicados" description="47" change="+2 esta semana" icon={CircleCheck} />
                    <GameCardStats title="Juegos con incidencias" description="0" change="Sin incidencias" icon={TriangleAlert} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full flex-1 min-h-0 overflow-auto">
                    {isLoadingGames && (
                        <DashboardStateCard className="col-span-full">
                            <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                        </DashboardStateCard>
                    )}

                    {hasGamesError && (
                        <DashboardStateCard className="col-span-full">
                            <TriangleAlert className="w-10 h-10 text-rose-400/80 dark:text-rose-400/70" />

                            <div className="flex flex-col gap-1">
                                <p className="text-xl font-medium text-slate-700 dark:text-white/70">
                                    No se pudieron cargar tus juegos
                                </p>
                                <p className="text-sm text-slate-600 dark:text-white/65">
                                    {gamesError}
                                </p>
                            </div>

                            <button onClick={handleRetry} className="ui-button-primary font-light">
                                Reintentar
                            </button>
                        </DashboardStateCard>
                    )}

                    {hasNoGames && (
                        <DashboardStateCard className="col-span-full">
                            <p className="text-lg text-slate-700 dark:text-white/40">
                                Aún no has creado ningún juego.
                            </p>
                            <p className="mt-2 text-sm text-slate-500 dark:text-white/25">
                                Empieza tu próxima aventura y publica tu primer título.
                            </p>
                        </DashboardStateCard>
                    )}
                </div>
            </div>
        </div>
    )
}