export type Achievement = {
    id: string;
    gameId: string;
    name: string;
    description: string;
    pictureState: string;
    isPublished: boolean;
    smallPictureUrl: string | null;
    mediumPictureUrl: string | null;
    largePictureUrl: string | null;
};
