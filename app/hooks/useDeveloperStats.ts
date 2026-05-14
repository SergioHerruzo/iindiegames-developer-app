import useFetch from "@hooks/useFetch";

export type DeveloperStats = {
    gamesSold: number;
    gamesSoldSubtitle: string;
    players: number;
    playersSubtitle: string;
    publishedGames: number;
    publishedGamesSubtitle: string;
    gamesWithIssues: number;
    gamesWithIssuesSubtitle: string;
};

export function useDeveloperStats() {
    return useFetch<DeveloperStats>("/users/me/developer-stats");
}
