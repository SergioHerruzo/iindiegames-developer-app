import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { Bell, GamepadDirectional, Moon, Search } from "lucide-react";
import type { CurrentUser } from "@models/CurrentUser";

const AUTH_CURRENT_USER_KEY = "auth.currentUser";
const THEME_STORAGE_KEY = "app.theme";

type ThemeMode = "light" | "dark";

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

function readStoredTheme(): ThemeMode {
    if (typeof window === "undefined") return "dark";

    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (storedTheme === "light" || storedTheme === "dark") {
        return storedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: ThemeMode) {
    if (typeof document === "undefined") return;

    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
}

export default function TopBar() {
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => readStoredCurrentUser());
    const [search, setSearch] = useState("");
    const [theme, setTheme] = useState<ThemeMode>(() => readStoredTheme());
    const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
    const location = useLocation();
    const themeMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    useEffect(() => {
        setIsThemeMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (!isThemeMenuOpen) {
            return;
        }

        const handlePointerDown = (event: PointerEvent) => {
            if (!themeMenuRef.current?.contains(event.target as Node)) {
                setIsThemeMenuOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsThemeMenuOpen(false);
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isThemeMenuOpen]);

    const avatarUrl = currentUser?.profilePicture.smallPictureUrl;
    const avatarLabel = currentUser?.displayName ?? "Usuario";
    const isDarkTheme = theme === "dark";

    const toggleTheme = () => {
        const nextTheme: ThemeMode = isDarkTheme ? "light" : "dark";
        setTheme(nextTheme);
        window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    };

    return (
        <nav className="relative flex w-full items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
                <Link to="/dashboard" className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500">
                        <GamepadDirectional size={25} className="text-text-200" />
                    </div>

                    <span className="text-2xl font-plus-jakarta-sans tracking-tight text-text-200">
                        Indie Games
                    </span>
                </Link>
            </div>

            {location.pathname === "/dashboard" && (
                <div className="pointer-events-none absolute left-1/2 -translate-x-1/2">
                    <div className="pointer-events-auto flex items-center gap-1.5 rounded-lg border border-transparent bg-bg-200/60 px-3 py-2 shadow-sm transition focus-within:ring-1 focus-within:ring-primary-500/60">
                        <Search size={20} className="text-text-400" />
                        <input
                            type="text"
                            placeholder="Buscar"
                            className="w-lg bg-transparent text-text-300 placeholder:text-text-400 outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            )}

            <div className="flex items-center gap-4">
                <button type="button" className="relative flex cursor-pointer items-center justify-center rounded-lg p-2 transition">
                    <Bell size={20} className="text-text-400" />
                </button>

                <div className="h-6 w-px bg-bg-300" />

                <div ref={themeMenuRef} className="relative">
                    <button
                        type="button"
                        className="flex cursor-pointer items-center gap-3 px-2 py-2 text-left"
                        onClick={() => setIsThemeMenuOpen((value) => !value)}
                        aria-haspopup="menu"
                        aria-expanded={isThemeMenuOpen}
                    >
                        <div className="flex flex-col items-end justify-center text-right leading-tight">
                            <span className="text-sm text-text-100">
                                {avatarLabel}
                            </span>
                            <span className="text-xs text-text-300">
                                Developer
                            </span>
                        </div>

                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={avatarLabel}
                                className="h-10 w-10 rounded-full border border-bg-300 object-cover"
                            />
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-bg-300 bg-bg-200 text-sm font-semibold text-text-200">
                                {avatarLabel.slice(0, 1).toUpperCase()}
                            </div>
                        )}
                    </button>

                    <div
                        className={`absolute right-0 top-full z-20 mt-3 w-72 origin-top-right overflow-hidden rounded-2xl border border-bg-300/80 bg-bg-100/95 p-2 shadow-2xl shadow-black/20 backdrop-blur-xl transition-all duration-200 ease-out ${
                            isThemeMenuOpen
                                ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                                : "pointer-events-none translate-y-2 scale-[0.98] opacity-0"
                        }`}
                        aria-hidden={!isThemeMenuOpen}
                    >
                        <button
                            type="button"
                            role="switch"
                            aria-checked={isDarkTheme}
                            aria-label={`Cambiar a tema ${isDarkTheme ? "claro" : "oscuro"}`}
                            onClick={toggleTheme}
                            className="group flex w-full items-center justify-between gap-3 rounded-xl px-2.5 py-2 text-left text-xs transition-all duration-300 hover:bg-bg-200/40"
                        >
                            <span className="flex items-center gap-2.5 text-text-100">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-bg-200/60 text-text-300 transition-colors duration-300 group-hover:text-text-100">
                                    <Moon size={14} />
                                </span>

                                <span className="text-xs font-medium tracking-tight text-text-100">
                                    Modo oscuro
                                </span>
                            </span>

                            <span className={`relative flex h-6 w-11 items-center rounded-full border px-0.5 transition-colors duration-300 ${
                                isDarkTheme ? "border-bg-500 bg-bg-300" : "border-primary-500/30 bg-primary-500/10"
                            }`}>
                                <span className={`absolute left-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full shadow-md transition-transform duration-300 ease-out ${
                                    isDarkTheme ? "translate-x-5 bg-bg-100 text-text-100" : "translate-x-0 bg-bg-100 text-primary-500"
                                }`}>
                                    <span className={`absolute transition-all duration-300 ${isDarkTheme ? "scale-100 rotate-0 opacity-100" : "scale-75 -rotate-90 opacity-0"}`}>
                                        <Moon size={11} />
                                    </span>
                                </span>
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}