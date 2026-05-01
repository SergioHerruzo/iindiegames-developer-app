import { useEffect, useRef, useState } from "react";
import { Link, useLoaderData, useLocation, useNavigate } from "react-router";
import { Bell, GamepadDirectional, LogOut, Moon, Sun } from "lucide-react";
import type { CurrentUser } from "@models/CurrentUser";
import { clearAuthStorage } from "@utils/auth";

const THEME_STORAGE_KEY = "app.theme";

type ThemeMode = "light" | "dark";
type TopBarLoaderData = {
    currentUser: CurrentUser | null;
};

function readStoredTheme(): ThemeMode {
    if (typeof window === "undefined") return "light";
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === "light" || storedTheme === "dark") return storedTheme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: ThemeMode) {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
}

export default function TopBar() {
    const { currentUser } = useLoaderData<TopBarLoaderData>();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [theme, setTheme] = useState<ThemeMode>(() => readStoredTheme());
    const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
    const location = useLocation();
    const themeMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => { applyTheme(theme); }, [theme]);
    useEffect(() => { setIsThemeMenuOpen(false); }, [location.pathname]);

    useEffect(() => {
        if (!isThemeMenuOpen) return;
        const handlePointerDown = (event: PointerEvent) => {
            if (!themeMenuRef.current?.contains(event.target as Node)) setIsThemeMenuOpen(false);
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setIsThemeMenuOpen(false);
        };
        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isThemeMenuOpen]);

    const avatarUrl = currentUser?.profilePicture?.smallPictureUrl;
    const avatarLabel = currentUser?.displayName ?? "Usuario";
    const isDarkTheme = theme === "dark";

    const toggleTheme = () => {
        const nextTheme: ThemeMode = isDarkTheme ? "light" : "dark";
        setTheme(nextTheme);
        window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    };

    const handleLogout = () => {
        clearAuthStorage();
        setIsThemeMenuOpen(false);
        navigate("/landing");
    };

    return (
        <nav className="relative flex w-full items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
                <Link to="/dashboard" className="flex items-center gap-3">
                    <div className="
                        flex h-10 w-10 items-center justify-center rounded-xl
                        bg-emerald-500/15 backdrop-blur-sm border border-emerald-200/60
                        dark:bg-emerald-400/10 dark:border-emerald-400/15
                    ">
                        <GamepadDirectional size={22} strokeWidth={1.5} className="text-emerald-700 dark:text-emerald-500" />
                    </div>
                    <span className="page-title text-2xl font-light">
                        Indie Games
                    </span>
                </Link>
            </div>

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    className="relative flex cursor-pointer items-center justify-center rounded-xl p-2 transition backdrop-blur-sm"
                >
                    <Bell size={18} strokeWidth={1.5} className="text-slate-500 dark:text-white/60" />
                </button>

                <div className="h-5 w-px bg-neutral-300/80 dark:bg-white/10" />

                <div ref={themeMenuRef} className="relative">
                    <button
                        type="button"
                        className="flex cursor-pointer items-center gap-3 px-2 py-1.5 rounded-xl transition"
                        onClick={() => setIsThemeMenuOpen((v) => !v)}
                        aria-haspopup="menu"
                        aria-expanded={isThemeMenuOpen}
                    >
                        <div className="flex flex-col items-end justify-center text-right leading-tight">
                            <span className="user-name text-sm text-slate-700 dark:text-white/60">{avatarLabel}</span>
                            <span className="user-role text-xs text-slate-500 dark:text-white/45">Developer</span>
                        </div>

                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={avatarLabel}
                                className="
                                    avatar-image h-9 w-9 rounded-full object-cover
                                    ring-1 ring-black/10
                                    dark:ring-black/20
                                "
                            />
                        ) : (
                            <div className="
                                avatar-fallback flex h-9 w-9 items-center justify-center rounded-full
                                border border-slate-200 bg-white/70 ring-1 ring-black/10
                                text-sm text-emerald-700
                                dark:border-white/5 dark:bg-white/5 dark:ring-black/20
                                dark:text-emerald-600
                            ">
                                {avatarLabel.slice(0, 1).toUpperCase()}
                            </div>
                        )}
                    </button>

                    <div
                        className={`
                            absolute right-0 top-full z-20 mt-2 w-64
                            origin-top-right overflow-hidden rounded-2xl p-2
                            bg-white/70 backdrop-blur-xl border border-white/80
                            shadow-xl shadow-slate-200/60
                            dark:bg-white/2 dark:backdrop-blur-xl
                            dark:border-white/8
                            transition-all duration-200 ease-out
                            ${isThemeMenuOpen
                                ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                                : "pointer-events-none translate-y-2 scale-[0.98] opacity-0"
                            }
                        `}
                        aria-hidden={!isThemeMenuOpen}
                    >
                        <button
                            type="button"
                            role="switch"
                            aria-checked={isDarkTheme}
                            aria-label={`Cambiar a tema ${isDarkTheme ? "claro" : "oscuro"}`}
                            onClick={toggleTheme}
                            className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition cursor-pointer"
                        >
                            <span className="flex items-center gap-2.5">
                                <span className="
                                    flex h-7 w-7 items-center justify-center rounded-full
                                    bg-slate-100/80 text-slate-600
                                    dark:bg-white/[0.07] dark:text-white/50
                                ">
                                    {isDarkTheme ? <Moon size={14} /> : <Sun size={14} />}
                                </span>
                                <span className="text-xs text-slate-600 dark:text-white/50">
                                    {isDarkTheme ? "Modo oscuro" : "Modo claro"}
                                </span>
                            </span>
                            <span
                                className={`relative flex h-6 w-11 items-center rounded-full border transition-colors duration-300 ${isDarkTheme
                                        ? "border-white/10 bg-white/[0.07]"
                                        : "border-emerald-300/60 bg-emerald-100/60"
                                    }`}
                            >
                                <span
                                    className={`absolute top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full shadow transition-all duration-300 ease-out ${isDarkTheme
                                            ? "left-[calc(100%-1.25rem-0.125rem)] bg-white/15 text-white/60"
                                            : "left-0.5 bg-white text-emerald-600"
                                        }`}
                                >
                                    <span
                                        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isDarkTheme ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}
                                    >
                                        <Moon size={11} />
                                    </span>
                                    <span
                                        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${!isDarkTheme ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}
                                    >
                                        <Sun size={11} />
                                    </span>
                                </span>
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="group flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left transition hover:border-rose-500/70 hover:bg-rose-500/15 hover:text-rose-600 dark:hover:border-rose-400/50 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                        >
                            <span className="flex items-center gap-2.5">
                                <span className="
                                    flex h-7 w-7 items-center justify-center rounded-full
                                    bg-slate-100/80 text-slate-600
                                    dark:bg-white/[0.07] dark:text-white/50
                                    transition-colors
                                    group-hover:bg-rose-500/8 group-hover:text-rose-500
                                    dark:group-hover:bg-rose-500/6 dark:group-hover:text-rose-300
                                ">
                                    <LogOut size={14} />
                                </span>
                                <span className="text-xs text-slate-600 transition-colors dark:text-white/50">
                                    Cerrar sesión
                                </span>
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}