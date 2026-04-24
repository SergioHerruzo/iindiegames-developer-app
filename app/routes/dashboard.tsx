import GameCardStats from '@components/game-card-stats'
import GameCard from '@components/game-card'
import { Plus, Gamepad2, CircleCheck, TriangleAlert, ShoppingCart } from 'lucide-react'
import TopBar from '@components/top-bar'

export default function Dashboard() {
    return (
        <>
            <TopBar />
            <div className="flex flex-col items-start justify-start w-full min-h-screen py-8 px-40 gap-8">
                <div className="flex items-start justify-between w-full gap-4">
                    <div className="flex flex-col items-start justify-start gap-2">
                        <h1 className="text-4xl">Mis juegos</h1>
                        <h3 className="text-sm text-text-400">Gestiona tus juegos, compilaciones y análisis.</h3>
                    </div>
                    <button className="text-sm self-center inline-flex items-center justify-center px-4 py-2 bg-primary-100 text-text-100 rounded-lg hover:bg-primary-200 transition-colors cursor-pointer">
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar nuevo juego
                    </button>
                </div>
                <div className="flex items-center justify-start w-full gap-4">
                    <GameCardStats
                        title="Vendidos"
                        description="1,247"
                        icon={<ShoppingCart className="h-auto w-20 text-green-500 opacity-20" />}
                    />
                    <GameCardStats
                        title="Total"
                        description="47"
                        icon={<Gamepad2 className="h-auto w-20 text-neutral-500 opacity-20" />}
                    />
                    <GameCardStats
                        title="Juegos publicados"
                        description="47"
                        icon={<CircleCheck className="h-auto w-20 text-blue-500 opacity-20" />}
                    />
                    <GameCardStats
                        title="Juegos en revisión"
                        description="0"
                        icon={<TriangleAlert className="h-auto w-20 text-yellow-500 opacity-20" />}
                    />
                </div>
            </div>
        </>
    )
}