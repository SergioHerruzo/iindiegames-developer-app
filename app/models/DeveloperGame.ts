export type GenreSummary = {
    id: string;
    name: string;
};

export type DeveloperGameArtworkSummary = {
    id: string;
    smallImageUrl: string;
    mediumImageUrl: string;
    largeImageUrl: string;
    status: string;
};

export type DeveloperGameStorePictureSummary = {
    id: string;
    smallImageUrl: string;
    mediumImageUrl: string;
    largeImageUrl: string;
    status: string;
};

export type DeveloperGameResponse = {
    id: string;
    title: string;
    description: string;
    price: number;
    discount: number;
    isPublic: boolean;
    isPublished: boolean;
    genres: GenreSummary[];
    artworks: DeveloperGameArtworkSummary[];
    storePictures: DeveloperGameStorePictureSummary[];
};
