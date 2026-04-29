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
                glass-card relative overflow-hidden
                rounded-2xl p-6
                bg-white/40 backdrop-blur-md
                border border-white/60
                shadow-sm shadow-emerald-100/40
            "
        >

            <div className="relative flex items-center gap-3 mb-4">
                <div className="
                    glass-chip
                    w-10 h-10 rounded-xl
                    bg-emerald-500/15
                    backdrop-blur-sm
                    flex items-center justify-center
                    border border-emerald-200/60
                ">
                    <Icon strokeWidth={1.5} className="glass-chip-icon w-5 h-5 text-emerald-700" />
                </div>

                <p className="glass-title text-sm text-slate-700">
                    {title}
                </p>
            </div>

            <h3 className="glass-value relative text-2xl font-semibold text-slate-800 mb-1">
                {description}
            </h3>

            <p className="glass-change relative text-xs text-slate-600">
                {change}
            </p>
        </div>
    );
}