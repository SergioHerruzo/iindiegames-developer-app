import type { DeveloperArtwork } from "@models/DeveloperArtwork";
import type { DeveloperGameReleaseBuild } from "@models/DeveloperGameReleaseBuild";
import type { DeveloperStorePicture } from "@models/DeveloperStorePicture";
import type { Genre } from "@models/genre";

export type DeveloperGame = {
    id: string;
    title: string;
    description: string;
    price: number;
    discount: number;
    releaseBuild: DeveloperGameReleaseBuild | null;
    genres: Genre[];
    artworks: DeveloperArtwork[];
    storePictures: DeveloperStorePicture[];
}