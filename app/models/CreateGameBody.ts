export type CreateGameBody = {
    Title: string;
    Description: string;
    Price: number;
    Genres: string[];
    CapsulePicture: File;
    HeaderPicture: File;
    MainPicture: File;
}