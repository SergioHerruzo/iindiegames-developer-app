import { useNavigate } from "react-router";
import PrimaryButton from "@components/PrimaryButton";
import PanelStatsCard from "@components/PanelStatsCard";
import PanelGameCard from "@components/PanelGameCard";
import TopBar from "@components/TopBar/TopBar";
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
                    <div className="grid w-full gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                        <PanelGameCard
                            id="1"
                            title="Unturned"
                            description="Eres un superviviente en las ruinas de una sociedad infestada de zombis y debes cooperar con tus amigos para formar nuevas alianzas que te mantendrán con vida."
                            imageUrl="https://cdn.dlcompare.com/game_tetiere/upload/gameimage/file/unturned-tetiere-file-47dd573f.jpg.webp"
                            isPublic={true}
                            status="published" />
                        <PanelGameCard
                            id="2"
                            title="DayZ"
                            description="¿Cuánto podrás sobrevivir en un mundo posapocalíptico? Una tierra plagada de zombis infectados donde compites con otros supervivientes por recursos escasos. ¿Colaborarás con desconocidos y permaneceréis juntos? ¿O irás de lobo solitario para evitar traiciones? Esto es DayZ. Esta es tu historia."
                            imageUrl="https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/221100/header.jpg?t=1769695513"
                            status="with errors" />
                        <PanelGameCard
                            id="3"
                            title="Counter-Strike"
                            description="Disfruta del juego de acción en línea n° 1 en el mundo. Sumérgete en el fragor de la guerra antiterrorista más realista con este archiconocido juego por equipos. Alíate con compañeros para superar misiones estratégicas, asalta bases enemigas, rescata rehenes, y recuerda que tu personaje contribuye al éxito del equipo y viceversa."
                            imageUrl="https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/10/header.jpg?t=1745368572"
                            status="not published" />
                        <PanelGameCard
                            id="4"
                            title="SCP: Secret Laboratory"
                            description="Durante una brecha de contención en una instalación remota de la fundación SCP, muchas de las anomalías han escapado, y no tienen intenciones pacíficas. ¡Conviértete en personal de la instalación, un agente de recontención o una entidad anómala y lucha por tomar el control del lugar!"
                            status="published" />
                    </div>
                </div>
            </div>
        </div>
    )
}