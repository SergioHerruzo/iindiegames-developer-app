import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import EditGameNavigationBar, { type GameTab } from "@components/EditGameNavigationBar";
import GeneralTab from "@components/GameDetails/GameDetailsGeneralTab";
import ArtworksTab from "@components/GameDetails/GameDetailsAssetTab";
import GameBuildsTab from "@components/GameDetails/GamebuildsTab";
import AchievementsTab from "@components/GameDetails/AchievementsTab";
import useGameDetails from "@/hooks/useGameDetails";

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
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState<GameTab>((searchParams.get("tab") as GameTab) ?? "general");
    const { game, loading, error, refetch } = useGameDetails(gameId);

    return (
        <div className="flex flex-col flex-1 h-full w-full px-6 py-4 gap-4">
            {/* Back Link + Tab Navigation */}
            <div className="flex items-center gap-6">
                <Link
                    to="/panel"
                    className="group relative inline-flex items-center shrink-0 ml-5 text-slate-600 dark:text-white/60 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors duration-300"
                >
                    <ArrowLeft
                        size={16}
                        className="absolute -left-5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out"
                    />
                    <span>Volver al Panel</span>
                </Link>

                <EditGameNavigationBar
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
            </div>

            {/* Tab Content */}
            <div className="flex-1 mt-2">
                {error && (
                    <div className="rounded-lg border border-error-border bg-error-bg p-4 text-sm text-error-text">
                        {error}
                    </div>
                )}

                {!error && loading && <GameDetailsSkeleton />}

                {!error && !loading && game && (
                    <>
                        {activeTab === "general" && <GeneralTab game={game} onRefetch={refetch} />}
                        {activeTab === "artworks" && <ArtworksTab game={game} onRefetch={refetch} />}
                        {activeTab === "builds" && <GameBuildsTab gameId={game.id} />}
                        {activeTab === "achievements" && <AchievementsTab gameId={game.id} />}
                    </>
                )}
            </div>
        </div>
    );
}