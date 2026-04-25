import type { ProfilePicture } from '@models/ProfilePicture';

export type CurrentUser = {
    userId: string;
    displayName: string;
    profilePicture: ProfilePicture;
    role: string;
}