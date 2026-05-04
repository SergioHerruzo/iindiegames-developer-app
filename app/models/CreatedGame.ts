import type { Artwork } from "@models/Artwork";

export type CreatedGame = {
    id: string;
    title: string;
    description: string;
    status: string;
    isPublic: boolean;
    artworks: Artwork[];
}