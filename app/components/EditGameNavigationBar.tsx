import { Settings, Image, Package, Trophy } from "lucide-react";
import { useRef, useState, useLayoutEffect } from "react";

export type GameTab = "general" | "artworks" | "builds" | "achievements";

const NAV_TABS: { key: GameTab; label: string; icon: React.ElementType }[] = [
    { key: "general", label: "General", icon: Settings },
    { key: "artworks", label: "Artworks", icon: Image },
    { key: "builds", label: "Builds", icon: Package },
    { key: "achievements", label: "Logros", icon: Trophy },
];

type EditGameNavigationBarProps = {
    activeTab: GameTab;
    onTabChange: (tab: GameTab) => void;
};

export default function EditGameNavigationBar({ activeTab, onTabChange }: EditGameNavigationBarProps) {
    const navRef = useRef<HTMLElement>(null);
    const buttonRefs = useRef<Map<GameTab, HTMLButtonElement>>(new Map());
    const [pill, setPill] = useState<{ left: number; width: number } | null>(null);

    useLayoutEffect(() => {
        const nav = navRef.current;
        const btn = buttonRefs.current.get(activeTab);
        if (!nav || !btn) return;

        const navRect = nav.getBoundingClientRect();
        const btnRect = btn.getBoundingClientRect();

        setPill({
            left: btnRect.left - navRect.left,
            width: btnRect.width,
        });
    }, [activeTab]);

    return (
        <div className="flex items-center justify-center w-full pb-4 mb-2">
            <nav ref={navRef} className="relative flex items-center gap-2 overflow-x-auto no-scrollbar">

                {/* Sliding Pill Background */}
                {pill && (
                    <span
                        className="absolute top-0 h-full rounded-full bg-primary-bg border border-primary-border shadow-sm pointer-events-none"
                        style={{
                            left: pill.left,
                            width: pill.width,
                            transition: "left 0.25s linear, width 0.25s linear",
                        }}
                    />
                )}

                {NAV_TABS.map(({ key, label, icon: Icon }) => {
                    const isActive = activeTab === key;
                    return (
                        <button
                            key={key}
                            ref={(el) => {
                                if (el) buttonRefs.current.set(key, el);
                                else buttonRefs.current.delete(key);
                            }}
                            type="button"
                            onClick={() => onTabChange(key)}
                            className={`
                                relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-light
                                cursor-pointer whitespace-nowrap transition-colors duration-200
                                ${isActive
                                    ? "text-primary-text"
                                    : "text-secondary-text hover:text-slate-200"
                                }
                            `}
                        >
                            <Icon
                                size={16}
                                strokeWidth={isActive ? 2 : 1.5}
                                className={`transition-colors duration-200 ${isActive
                                        ? "text-primary-icon"
                                        : "text-secondary-icon"
                                    }`}
                            />
                            <span>{label}</span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}