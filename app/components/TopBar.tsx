import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { Bell, GamepadDirectional, Moon, Search, Sun } from "lucide-react";
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
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => readStoredCurrentUser());
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
            {/* Logo */}
            <div className="flex items-center gap-3">
                <Link to="/dashboard" className="flex items-center gap-3">
                    <div className="brand-chip flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 backdrop-blur-sm border border-emerald-200/60 shadow-sm shadow-emerald-100/30">
                        <GamepadDirectional size={22} strokeWidth={1.5} className="brand-icon text-emerald-700" />
                    </div>
                    <span className="brand-title text-2xl font-semibold tracking-tight text-slate-800">
                        Indie Games
                    </span>
                </Link>
            </div>


            {/* Right side */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    className="glass-icon-button relative flex cursor-pointer items-center justify-center rounded-xl p-2 transition backdrop-blur-sm"
                >
                    <Bell size={18} strokeWidth={1.5} className="glass-icon text-slate-500" />
                </button>

                <div className="h-5 w-px bg-slate-200/80" />

                <div ref={themeMenuRef} className="relative">
                    {/* Trigger — sin hover bg */}
                    <button
                        type="button"
                        className="flex cursor-pointer items-center gap-3 px-2 py-1.5 rounded-xl transition"
                        onClick={() => setIsThemeMenuOpen((v) => !v)}
                        aria-haspopup="menu"
                        aria-expanded={isThemeMenuOpen}
                    >
                        <div className="flex flex-col items-end justify-center text-right leading-tight">
                            <span className="user-name text-sm font-medium text-slate-700">{avatarLabel}</span>
                            <span className="user-role text-xs text-slate-400">Developer</span>
                        </div>

                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={avatarLabel}
                                className="avatar-image h-9 w-9 rounded-full object-cover ring-1 ring-white/70 shadow-sm shadow-slate-200/40"
                            />
                        ) : (
                            <div className="avatar-fallback flex h-9 w-9 items-center justify-center rounded-full bg-white/70 ring-1 ring-white/70 text-sm font-semibold text-emerald-700 shadow-sm shadow-slate-200/40">
                                {avatarLabel.slice(0, 1).toUpperCase()}
                            </div>
                        )}
                    </button>

                    {/* Dropdown */}
                    <div
                        className={`theme-dropdown absolute right-0 top-full z-20 mt-2 w-64 origin-top-right overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 p-2 shadow-xl shadow-slate-200/60 transition-all duration-200 ease-out ${
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
                            className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition"
                        >
                            <span className="flex items-center gap-2.5">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100/80 text-slate-500">
                                    {isDarkTheme ? <Moon size={14} /> : <Sun size={14} />}
                                </span>
                                <span className="text-xs font-medium text-slate-600">
                                    {isDarkTheme ? "Modo oscuro" : "Modo claro"}
                                </span>
                            </span>

                            {/* Toggle pill */}
                            <span className={`relative flex h-6 w-11 items-center rounded-full border transition-colors duration-300 ${
                                isDarkTheme
                                    ? "border-slate-300/60 bg-slate-200/60"
                                    : "border-emerald-300/60 bg-emerald-100/60"
                            }`}>
                                <span className={`absolute left-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full shadow transition-transform duration-300 ease-out ${
                                    isDarkTheme
                                        ? "translate-x-5 bg-slate-600 text-slate-200"
                                        : "translate-x-0 bg-white text-emerald-600"
                                }`}>
                                    <span className={`absolute transition-all duration-300 ${isDarkTheme ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}>
                                        <Moon size={11} />
                                    </span>
                                    <span className={`absolute transition-all duration-300 ${!isDarkTheme ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}>
                                        <Sun size={11} />
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