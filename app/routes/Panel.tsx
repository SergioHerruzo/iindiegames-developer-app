import { useNavigate } from "react-router";
import PrimaryButton from "@components/PrimaryButton";
import PanelStatsCard from "@components/PanelStatsCard";
import { CreatedGamesList } from "@components/CreatedGameList";
import { CircleCheck, Plus, ShoppingCart, TriangleAlert, User } from "lucide-react";
import { useDeveloperStats } from "@hooks/useDeveloperStats";

export default function Panel() {
    const navigate = useNavigate();
    const { data: stats } = useDeveloperStats();

    const STATS = [
        {
            title: "Juegos vendidos",
            value: String(stats?.gamesSold ?? 0),
            change: stats?.gamesSoldSubtitle ?? "Sin cambios este mes",
            icon: ShoppingCart,
        },
        {
            title: "Jugadores",
            value: String(stats?.players ?? 0),
            change: stats?.playersSubtitle ?? "Sin cambios este mes",
            icon: User,
        },
        {
            title: "Juegos publicados",
            value: String(stats?.publishedGames ?? 0),
            change: stats?.publishedGamesSubtitle ?? "Sin cambios este mes",
            icon: CircleCheck,
        },
        {
            title: "Juegos con incidencias",
            value: String(stats?.gamesWithIssues ?? 0),
            change: stats?.gamesWithIssuesSubtitle ?? "Sin cambios este mes",
            icon: TriangleAlert,
        },
    ];

    return (
        <div className="flex flex-col flex-1 h-full w-full px-6 py-4 gap-8">

            {/* Header */}
            <header className="flex items-center justify-between w-full gap-4">
                <div className="flex flex-col gap-1">
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
                {STATS.map((stat, index) => (
                    <PanelStatsCard
                        key={index}
                        title={stat.title}
                        value={stat.value}
                        change={stat.change}
                        icon={stat.icon}
                    />
                ))}
            </div>

            {/* Created Games List */}
            <CreatedGamesList />
        </div>
    );
}
