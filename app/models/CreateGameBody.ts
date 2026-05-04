export type CreateGameBody = {
    title: string;
    description: string;
    price: number;
    genres: string[];
    capsulePicture: File;
    headerPicture: File;
    mainFile: File;
}