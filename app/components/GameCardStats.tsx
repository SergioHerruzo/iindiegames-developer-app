import type { LucideIcon } from "lucide-react";

type GameCardStatsProps = {
    icon: LucideIcon;
    title: string;
    description: string;
    change: string;
};

export default function GameCardStats({ icon: Icon, title, description, change }: GameCardStatsProps) {
    return (
        <div className="bg-bg-200/60 rounded-xl p-6 transition-all duration-200 hover:bg-bg-200/50 border border-transparent hover:border hover:border-primary-500/50">
            
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary-300" />
                </div>
                <p className="text-sm text-text-300">{title}</p>
            </div>

            <h3 className="text-2xl font-semibold text-text-100 mb-1">
                {description}
            </h3>

            <p className="text-xs text-text-400">
                {change}
            </p>
        </div>
    );
}