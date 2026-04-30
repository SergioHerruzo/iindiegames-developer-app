import type { GameArtwork } from "@models/GameArtwork";

export type CreatedGame = {
    id: string;
    title: string;
    description: string;
    status: string;
    artwork: GameArtwork;
}