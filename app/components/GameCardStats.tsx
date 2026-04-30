import type { LucideIcon } from "lucide-react";

type GameCardStatsProps = {
    icon: LucideIcon;
    title: string;
    description: string;
    change: string;
};

export default function GameCardStats({ icon: Icon, title, description, change }: GameCardStatsProps) {
    return (
        <div
            className="
                relative overflow-hidden
                rounded-2xl p-6
                bg-white/40 backdrop-blur-md
                border border-black/5
                shadow-sm
                dark:bg-white/1 dark:backdrop-blur-md
                dark:border-white/8
                dark:shadow-md dark:shadow-black/30
            "
        >
            <div className="relative flex items-center gap-3 mb-4">
                <div className="
                    w-10 h-10 rounded-xl
                    bg-emerald-500/10
                    flex items-center justify-center
                    border border-emerald-500/20
                    dark:bg-emerald-400/10
                    dark:border-emerald-400/15
                ">
                    <Icon
                        strokeWidth={1.5}
                        className="w-5 h-5 text-emerald-600 dark:text-emerald-500"
                    />
                </div>

                <p className="text-sm text-slate-500 dark:text-white/75">
                    {title}
                </p>
            </div>

            <h3 className="text-2xl font-semibold text-slate-800 mb-1 dark:text-white/70">
                {description}
            </h3>

            <p className="text-xs text-slate-400 dark:text-white/65">
                {change}
            </p>
        </div>
    );
}