import { Settings, Image, Package, Trophy, Trash2 } from "lucide-react";

export type GameTab = "general" | "artworks" | "builds" | "achievements";

const NAV_TABS: { key: GameTab; label: string; icon: React.ElementType }[] = [
    { key: "general",      label: "General",     icon: Settings },
    { key: "artworks",     label: "Artworks",    icon: Image    },
    { key: "builds",       label: "Game Builds", icon: Package  },
    { key: "achievements", label: "Logros",       icon: Trophy   },
];

type EditGameNavigationBarProps = {
    activeTab: GameTab;
    onTabChange: (tab: GameTab) => void;
    onDelete?: () => void;
};

export default function EditGameNavigationBar({ activeTab, onTabChange, onDelete }: EditGameNavigationBarProps) {
    return (
        <div className="flex items-center justify-between w-full border-b border-divider">
            {/* Tabs */}
            <nav className="flex items-center gap-1 px-1">
                {NAV_TABS.map(({ key, label, icon: Icon }) => {
                    const isActive = activeTab === key;
                    return (
                        <button
                            key={key}
                            type="button"
                            onClick={() => onTabChange(key)}
                            className={`
                                relative group inline-flex items-center gap-2 px-4 py-3 text-sm font-light
                                transition-colors duration-200 ease-out cursor-pointer
                                ${isActive
                                    ? "text-primary-text"
                                    : "text-secondary-text hover:text-slate-200"
                                }
                            `}
                        >
                            <Icon
                                size={15}
                                strokeWidth={isActive ? 2 : 1.5}
                                className={`transition-colors duration-200 ${
                                    isActive
                                        ? "text-primary-icon"
                                        : "text-secondary-icon group-hover:text-slate-400"
                                }`}
                            />
                            <span>{label}</span>

                            {/* Active indicator */}
                            <span
                                className={`
                                    absolute bottom-0 left-0 right-0 h-px
                                    transition-all duration-200 ease-out
                                    ${isActive
                                        ? "bg-primary-text opacity-100"
                                        : "bg-transparent opacity-0"
                                    }
                                `}
                            />
                        </button>
                    );
                })}
            </nav>

            {/* Delete button */}
            <div className="px-4">
                <button
                    type="button"
                    onClick={onDelete}
                    disabled={!onDelete}
                    className="
                        inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-light
                        text-error-text
                        bg-error-bg
                        border border-error-border
                        transition-all duration-200 ease-out
                        cursor-pointer hover:opacity-80
                        disabled:opacity-50 disabled:cursor-not-allowed
                    "
                >
                    <Trash2 size={14} strokeWidth={1.5} />
                    <span>Eliminar juego</span>
                </button>
            </div>
        </div>
    );
}