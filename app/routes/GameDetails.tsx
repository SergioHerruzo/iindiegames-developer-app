import { useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import EditGameNavigationBar, { type GameTab } from "@components/EditGameNavigationBar";
import GeneralTab from "@components/GameDetails/GameDetailsGeneralTab";
import ArtworksTab from "@components/GameDetails/GameDetailsAssetTab";
import GameBuildsTab from "@components/GameDetails/GamebuildsTab";
import useGameDetails from "@/hooks/useGameDetails";

function AchievementsTab() {
    return <p className="text-secondary-text text-sm">Logros — próximamente.</p>;
}

function GameDetailsSkeleton() {
    return (
        <div className="flex flex-col gap-4 animate-pulse">
            <div className="h-7 w-48 rounded-lg skeleton-block" />
            <div className="h-px w-full skeleton-block" />
            <div className="flex gap-4">
                <div className="flex-2 h-24 rounded-xl skeleton-block" />
                <div className="flex-1 h-24 rounded-xl skeleton-block" />
                <div className="flex-1 h-24 rounded-xl skeleton-block" />
            </div>
            <div className="h-32 w-full rounded-xl skeleton-block" />
        </div>
    );
}

export default function Game() {
    const { gameId } = useParams();
    const [activeTab, setActiveTab] = useState<GameTab>("general");
    const { game, loading, error } = useGameDetails(gameId);

    return (
        <div className="px-6 py-4 flex flex-col gap-4">
            {/* Back Link */}
            <Link
                to="/panel"
                className="group inline-flex items-center w-fit text-slate-600 dark:text-white/60 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors duration-300"
            >
                <div className="flex items-center w-0 overflow-hidden opacity-0 -translate-x-4 transition-all duration-300 ease-out group-hover:w-6 group-hover:opacity-100 group-hover:translate-x-0">
                    <ArrowLeft size={16} />
                </div>
                <span>Volver al Panel</span>
            </Link>

            <h2>{game?.title || gameId}</h2>

            {/* Tab Navigation */}
            <EditGameNavigationBar activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Tab Content */}
            <div className="flex-1">
                {error && (
                    <div className="rounded-lg border border-(--color-error-border) bg-(--color-error-bg) p-4 text-sm text-(--color-error-text)">
                        {error}
                    </div>
                )}

                {!error && loading && <GameDetailsSkeleton />}

                {!error && !loading && game && (
                    <>
                        {activeTab === "general"      && <GeneralTab game={game} />}
                        {activeTab === "artworks"     && <ArtworksTab game={game} />}
                        {activeTab === "builds"       && <GameBuildsTab />}
                        {activeTab === "achievements" && <AchievementsTab />}
                    </>
                )}
            </div>
        </div>
    );
}