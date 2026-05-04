import type { ProfilePicture } from '@models/ProfilePicture';

export type UserProfile = {
    id: string;
    displayName: string;
    profilePicture: ProfilePicture;
    role: string;
}