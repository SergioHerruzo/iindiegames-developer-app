import type { LucideIcon } from "lucide-react";

type GameCardStatsProps = {
    icon: LucideIcon;
    title: string;
    description: string;
    change: string;
};

export default function GameCardStats({ icon: Icon, title, description, change }: GameCardStatsProps) {
    return (
        <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 transition-all duration-200 hover:bg-white/60 border border-white/60 hover:border-white/80 shadow-sm hover:shadow-md shadow-emerald-100/50">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100/80 backdrop-blur-sm flex items-center justify-center border border-emerald-200/60">
                    <Icon className="w-5 h-5 text-emerald-700" />
                </div>
                <p className="text-sm text-slate-500 font-medium">{title}</p>
            </div>

            <h3 className="text-2xl font-semibold text-slate-800 mb-1">
                {description}
            </h3>

            <p className="text-xs text-slate-400">
                {change}
            </p>
        </div>
    );
}