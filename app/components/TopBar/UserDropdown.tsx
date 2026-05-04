import { LogOut, Moon, Sun } from "lucide-react";
import { useAuth } from "@auth/UseAuth";
import { useTheme } from "@theme/useTheme";
import { useNavigate } from "react-router";
import { AvatarButton } from "@components/TopBar/AvatarButton";

interface Props {
    isOpen: boolean;
}

export function UserDropdown({ isOpen }: Props) {
    const { profile, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const displayName = profile?.displayName ?? "Usuario";

    const handleLogout = async () => {
        await logout();
        navigate("/login", { replace: true });
    };

    return (
        <div
            aria-hidden={!isOpen}
            className={`
                absolute right-0 top-full z-20 mt-2 w-64
                origin-top-right overflow-hidden rounded-2xl p-2
                bg-(--color-card-bg) border border-(--color-border-default)
                transition-all duration-200 ease-out
                ${isOpen
                    ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                    : "pointer-events-none translate-y-2 scale-[0.98] opacity-0"
                }
            `}
        >
            {/* User Info */}
            <div className="flex items-center gap-3 px-3 py-2.5 mb-1 border-b border-(--color-divider)">
                <div className="shrink-0">
                    <AvatarButton
                        displayName={displayName}
                        pictureUrl={profile?.profilePicture?.smallPictureUrl}
                        size="lg"
                    />
                </div>
                <div className="flex flex-col leading-tight min-w-0">
                    <h5 className="font-light">
                        {displayName}
                    </h5>
                    <h6 className="text-xs font-light">
                        {profile?.role ?? "Developer"}
                    </h6>
                </div>
            </div>

            {/* Theme Toggle */}
            <button
                type="button"
                role="switch"
                aria-checked={isDark}
                onClick={toggleTheme}
                className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition"
            >
                <span className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-(--color-accent-bg) text-accent-icon">
                        {isDark ? <Moon size={14} /> : <Sun size={14} />}
                    </span>
                    <span className="text-xs text-badge-neutral-text">
                        {isDark ? "Modo oscuro" : "Modo claro"}
                    </span>
                </span>

                <span className={`relative flex h-6 w-11 items-center rounded-full border transition-colors duration-300 ${isDark
                    ? "border-accent-border bg-(--color-accent-bg)"
                    : "border-accent-border-hover bg-accent-bg-hover"
                    }`}>
                    <span className={`absolute top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full transition-all duration-300 ease-out ${isDark
                        ? "left-[calc(100%-1.375rem)] bg-(--color-accent-text) text-(--color-card-bg)"
                        : "left-0.5 bg-(--color-card-bg) text-accent-icon"
                        }`}>
                        <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isDark ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}>
                            <Moon size={11} />
                        </span>
                        <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${!isDark ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}>
                            <Sun size={11} />
                        </span>
                    </span>
                </span>
            </button>

            {/* Logout */}
            <button
                type="button"
                onClick={handleLogout}
                className="group flex w-full cursor-pointer items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 transition hover:border-error-border hover:bg-error-bg"
            >
                <span className="
                    flex h-7 w-7 items-center justify-center rounded-full
                    bg-(--color-accent-bg) text-accent-icon
                    ring-1 ring-transparent
                    transition-colors
                    group-hover:bg-error-bg group-hover:text-error-text
                    group-hover:ring-error-border
                    ">
                    <LogOut size={14} />
                </span>
                <span className="text-xs text-badge-neutral-text transition-colors group-hover:text-error-text">
                    Cerrar sesión
                </span>
            </button>
        </div>
    );
}