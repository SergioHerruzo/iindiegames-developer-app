import { useEffect, useState } from "react";
import { Link } from "react-router";
import type { CurrentUser } from "@models/CurrentUser";

const AUTH_CURRENT_USER_KEY = "auth.currentUser";

function readStoredCurrentUser(): CurrentUser | null {
    if (typeof window === "undefined") {
        return null;
    }

    const storedUser = window.localStorage.getItem(AUTH_CURRENT_USER_KEY);

    if (!storedUser) {
        return null;
    }

    try {
        return JSON.parse(storedUser) as CurrentUser;
    } catch {
        return null;
    }
}

export default function TopBar() {
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

    useEffect(() => {
        setCurrentUser(readStoredCurrentUser());
    }, []);

    const avatarUrl = currentUser?.profilePicture.smallPictureUrl;
    const avatarLabel = currentUser?.displayName ?? "Usuario";

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
                            alt={avatarLabel}
                            className="h-10 w-10 rounded-full object-cover border border-bg-300"
                        />
                    ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-bg-300 bg-bg-200 text-sm font-semibold text-text-200">
                            {avatarLabel.slice(0, 1).toUpperCase()}
                        </div>
                    )}
                </button>
            </div>
        </nav>
    )
}