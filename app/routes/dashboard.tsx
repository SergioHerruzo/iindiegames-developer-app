import GameCardStats from '@components/GameCardStats'
import GameCard from '@components/GameCard'
import Dropdown from '@components/Dropdown'
import { Plus, Gamepad2, CircleCheck, TriangleAlert, ShoppingCart, Search, ChevronDown } from 'lucide-react'
import TopBar from '@components/TopBar'
import { useState } from 'react'

type Status = "all" | "active" | "pending" | "closed";

export default function Dashboard() {
    const [status, setStatus] = useState<Status>("all");

    return (
        <>
            <TopBar />
            <div className="flex flex-col items-start justify-start w-full min-h-screen py-8 px-40 gap-8">
                <div className="flex items-start justify-between w-full gap-4">
                    <div className="flex flex-col items-start justify-start gap-2">
                        <h1 className="text-4xl">Mis juegos</h1>
                        <h3 className="text-sm text-text-400">Gestiona tus juegos, compilaciones y análisis.</h3>
                    </div>
                    <button className="text-sm self-center inline-flex items-center justify-center px-4 py-2 bg-primary-400 text-text-100 rounded-full hover:bg-primary-500 transition-colors cursor-pointer">
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
                        description="47"
                        icon={<Gamepad2 className="h-auto w-20 text-neutral-500 opacity-10" />}
                    />
                    <GameCardStats
                        title="Juegos publicados"
                        description="47"
                        icon={<CircleCheck className="h-auto w-20 text-blue-500 opacity-10" />}
                    />
                    <GameCardStats
                        title="Juegos en revisión"
                        description="0"
                        icon={<TriangleAlert className="h-auto w-20 text-yellow-500 opacity-10" />}
                    />
                </div>
                <div className="flex w-full gap-6">
                    <div className="relative w-full">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-bg-500">
                            <Search />
                        </div>
                        <input
                            placeholder="Buscar"
                            className="w-full text-sm rounded-md border border-bg-400 py-3 pl-12 pr-4 outline-none focus:border-primary-500"
                        />
                    </div>
                    <Dropdown<Status>
                        value={status}
                        onChange={setStatus}
                        placeholder="Todos los status"
                        options={[
                            { label: "Todos los status", value: "all" },
                            { label: "Activo", value: "active" },
                            { label: "Pendiente", value: "pending" },
                            { label: "Cerrado", value: "closed" },
                        ]}
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                    <GameCard
                        title="Juego de ejemplo"
                        description="Un juego de ejemplo para mostrar cómo se vería un juego en el dashboard."
                        imageUrl='https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/202970/ss_984d4a8eecace2d353f7507772c8dc329d2ccfa0.1920x1080.jpg?t=1748037715'
                    />
                </div>
            </div>
        </>
    )
}