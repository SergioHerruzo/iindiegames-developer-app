import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Search, Gamepad2 } from "lucide-react";
import type { CurrentUser } from "@models/CurrentUser";

const AUTH_CURRENT_USER_KEY = "auth.currentUser";

function readStoredCurrentUser(): CurrentUser | null {
    if (typeof window === "undefined") return null;

    const storedUser = window.localStorage.getItem(AUTH_CURRENT_USER_KEY);
    if (!storedUser) return null;

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
        <nav className="relative flex w-full items-center justify-between bg-bg-50 py-4 px-6">

            <div className="flex items-center gap-3">
                <Link to="/dashboard" className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500">
                        <Gamepad2 size={25} className="text-text-200" />
                    </div>

                    <span className="text-2xl font-plus-jakarta-sans tracking-tight text-text-100">
                        Indie Games
                    </span>

                </Link>
            </div>

            <div className="pointer-events-none absolute left-1/2 -translate-x-1/2">
                <div className="pointer-events-auto flex items-center gap-2 rounded-lg border border-border bg-bg-100 px-3 py-2 shadow-sm transition focus-within:ring-1 focus-within:ring-primary-500/60">
                    <Search size={18} className="text-text-300" />
                    <input
                        type="text"
                        placeholder="Buscar juegos"
                        className="w-96 bg-transparent text-sm text-text-200 placeholder:text-text-300 outline-none"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="flex items-center gap-3 cursor-pointer">

                    <div className="flex flex-col items-end justify-center text-right leading-tight">
                        <span className="text-sm font-semibold text-text-100">
                            User
                        </span>
                        <span className="text-xs text-text-300">
                            Developer
                        </span>
                    </div>

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
    );
}