import { useNavigate } from "react-router";
import PrimaryButton from "@components/PrimaryButton";
import PanelStatsCard from "@components/PanelStatsCard";
import TopBar from "@components/TopBar/TopBar";
import { CreatedGamesList } from "@components/CreatedGameList";
import { CircleCheck, Plus, ShoppingCart, TriangleAlert, User } from "lucide-react";
import { useState } from "react";

const STATS_DATA = [
    {
        title: "Juegos vendidos",
        value: "0",
        change: "Sin cambios este mes",
        icon: ShoppingCart
    },
    {
        title: "Jugadores",
        value: "0",
        change: "Sin cambios este mes",
        icon: User
    },
    {
        title: "Juegos publicados",
        value: "0",
        change: "Sin cambios este mes",
        icon: CircleCheck
    },
    {
        title: "Juegos con incidencias",
        value: "0",
        change: "Sin cambios este mes",
        icon: TriangleAlert
    }
]

export default function Panel() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");

    return (
        <div className="flex flex-col min-h-screen">
            <TopBar />
            <div className="flex flex-col">
                <div className="flex flex-col flex-1 min-h-0 w-full p-6 gap-8">
                    {/* Header */}
                    <header className="flex items-center justify-between w-full gap-4">
                        <div className="flex flex-col gap-1">
                            {/* Title */}
                            <h2>Panel</h2>
                            <h4>Gestiona tus juegos, advertencias y análisis.</h4>
                        </div>

                        <PrimaryButton onClick={() => navigate("/new-game")}>
                            <PrimaryButton.Icon icon={Plus} />
                            Crear juego
                        </PrimaryButton>
                    </header>

                    {/* Stats */}
                    <div className="grid w-full gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        {STATS_DATA.map((stat, index) => (
                            <PanelStatsCard
                                key={index}
                                title={stat.title}
                                value={stat.value}
                                change={stat.change}
                                icon={stat.icon}
                            />
                        ))}
                    </div>

                    {/* Search */}
                    {/* <Input.Root
                        id="search"
                        value={search}
                        onChange={setSearch}
                    >
                        <Input.Label>Buscar juegos</Input.Label>
                        <Input.Field placeholder="Ingresa el título del juego" icon={Search}></Input.Field>
                    </Input.Root> */}

                    {/* Games */}
                    <CreatedGamesList />
                </div>
            </div>
        </div>
    )
}