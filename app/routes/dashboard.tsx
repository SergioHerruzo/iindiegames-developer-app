import GameCardStats from '@components/game-card-stats'
import GameCard from '@components/game-card'
import { Plus, Gamepad, Computer, DollarSign, TriangleAlert } from 'lucide-react'

export default function Dashboard() {
    return (
        <div className="flex flex-col items-start justify-start w-full min-h-screen p-8 gap-8">
            <div className="flex items-center justify-start w-full gap-4">
                <GameCardStats
                    title="Juegos publicados"
                    description="0"
                    icon={<Gamepad className="w-6 h-6" />}
                />
                <GameCardStats
                    title="Juegos en desarrollo"
                    description="0"
                    icon={<Computer className="w-6 h-6" />}
                />
                <GameCardStats
                    title="Juegos vendidos"
                    description="0"
                    icon={<DollarSign className="w-6 h-6" />}
                />
                <GameCardStats
                    title="Juegos en revisión"
                    description="0"
                    icon={<TriangleAlert className="w-6 h-6" />}
                />
            </div>
            <div className="flex items-start justify-between w-full gap-4">
                <div className="flex flex-col items-start justify-start gap-2">
                    <h1 className="text-4xl font-bold">Mis juegos</h1>
                    <h3 className="text-sm text-text-200 font-semibold">Gestiona tus juegos, compilaciones y análisis.</h3>
                </div>
                <button className="text-sm self-center inline-flex items-center justify-center px-4 py-2 bg-primary-100 text-text-100 rounded-full hover:bg-primary-200 transition-colors cursor-pointer">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar nuevo juego
                </button>
            </div>
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <GameCard
                    title="Mi primer juego"
                    description="Un juego increíble que estoy desarrollando."
                    imageUrl="https://i.blogs.es/162898/bo22/500_333.jpeg"
                />
                <GameCard
                    title="Mi segundo juego"
                    description="Otro juego increíble que estoy desarrollando."
                    imageUrl="https://i.blogs.es/162898/bo22/500_333.jpeg"
                />
                <GameCard
                    title="Mi tercer juego"
                    description="Un tercer juego increíble que estoy desarrollando."
                    imageUrl="https://i.blogs.es/162898/bo22/500_333.jpeg"
                />
                <GameCard
                    title="Mi tercer juego"
                    description="Un tercer juego increíble que estoy desarrollando."
                    imageUrl="https://i.blogs.es/162898/bo22/500_333.jpeg"
                />
                <GameCard
                    title="Mi tercer juego"
                    description="Un tercer juego increíble que estoy desarrollando."
                    imageUrl="https://i.blogs.es/162898/bo22/500_333.jpeg"
                />
            </div>
        </div>

    )
}