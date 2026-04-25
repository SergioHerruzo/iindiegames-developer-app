import GameCardStats from '@components/GameCardStats'
import GameCard from '@components/GameCard'
import Dropdown from '@components/Dropdown'
import { Plus, Gamepad2, CircleCheck, TriangleAlert, ShoppingCart, Search } from 'lucide-react'
import TopBar from '@components/TopBar'
import { useState } from 'react'

type Status = "All" | "Published" | "NotPublished" | "Deleting" | "Failed";

export default function Dashboard() {
    const [status, setStatus] = useState<Status>("All");

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
                        title="Juegos fallidos"
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
                            placeholder="Buscar"
                            className="w-full text-sm rounded-md border placeholder:text-text-400 border-bg-400 py-3 pl-12 pr-4 outline-none focus:border-primary-500"
                        />
                    </div>
                    <Dropdown<Status>
                        value={status}
                        onChange={setStatus}
                        placeholder="Todos los status"
                        options={[
                            { label: "Todos", value: "All" },
                            { label: "Activo", value: "Published" },
                            { label: "Pendiente", value: "NotPublished" },
                            { label: "Fallido", value: "Failed" },
                            { label: "Cerrado", value: "Deleting" },
                        ]}
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                    <GameCard
                        title="Fallout 4"
                        description="De Bethesda Game Studios, los galardonados creadores de Starfield y The Elder Scrolls V: Skyrim, llega Fallout 4. Un hito en el diseño del rol de mundo abierto y ganador de más de 200 premios."
                        imageUrl='https://assets.isthereanydeal.com/018d937f-2bba-710d-aa7f-64f220f04817/banner600.jpg?t=1764696912'
                        status="Published"
                    />
                    <GameCard
                        title="Call of Duty®: Black Ops II"
                        description="Superando las expectativas de los fans con respecto a esta franquicia que ha batido todos los récords, Call of Duty®: Black Ops 2 lleva a los jugadores a una futura Guerra Fría."
                        imageUrl='https://images6.alphacoders.com/447/447007.jpg'
                        status="Deleting"
                    />
                    <GameCard
                        title="VTOL VR"
                        description="VTOL VR is a near-futuristic combat flight game built for Virtual Reality. Pilot advanced multi-role jets, using your hands to flip switches, press buttons, and manipulate the virtual flight controls."
                        imageUrl='https://clan.fastly.steamstatic.com/images/29602983/c9da956631a621c501cbdb8c40dfe4335fee9a89.png'
                        status="Failed"
                    />
                    <GameCard
                        title="Phasmophobia"
                        description="Phasmophobia is a 4 player online co-op psychological horror. Paranormal activity is on the rise and it’s up to you and your team to use all the ghost-hunting equipment at your disposal in order to gather as much evidence as you can."
                        imageUrl='https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/739630/c227a2855aba60f3657bc0c3a46515b8c41fb2b6/header.jpg?t=1776847215'
                        status="NotPublished"
                    />
                    <GameCard
                        title="Call of Duty®: Black Ops III"
                        description="Call of Duty® Black Ops III: Zombies Chronicles Edition incluye el juego original completo y la expansión de contenido Zombies Chronicles."
                        imageUrl='https://www.activision.com/content/dam/atvi/activision/atvi-touchui/activision/games/game-details/call-of-duty/black-ops-3/bo3-hero.jpg'
                        status="Published"
                    />
                    <GameCard
                        title="RV There Yet?"
                        description="Una aventura cooperativa que consiste en conducir una autocaravana de vuelta a casa."
                        imageUrl='https://cdn2.steamgriddb.com/hero_thumb/4be513b952b64b729c1a264ad536c9e0.jpg'
                        status="Published"
                    />
                </div>
            </div>
        </>
    )
}