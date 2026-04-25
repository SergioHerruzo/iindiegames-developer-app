import { Link } from "react-router";
import { getStoredCurrentUser } from "@services/http.client";

export default function TopBar() {
    const currentUser = getStoredCurrentUser();
    const avatarUrl = currentUser?.profilePicture.smallPictureUrl;

    return (
        <nav className="flex h-20 w-full items-center justify-between border-b border-bg-500 bg-bg-100 px-40">
            <div className="flex items-center justify-start gap-8">
                <Link to="/dashboard" className="text-2xl font-space-grotesk text-text-200">
                    Indie Games
                </Link>
            </div>
            <div className="flex items-center justify-start gap-4">
                <button className="cursor-pointer">
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt="Image de perfil"
                            className="h-10 w-10 rounded-full object-cover border border-bg-300"
                        />
                    ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-bg-300 bg-bg-200 text-sm font-semibold text-text-200">
                            Imagen de perfil
                        </div>
                    )}
                </button>
            </div>
        </nav>
    )
}