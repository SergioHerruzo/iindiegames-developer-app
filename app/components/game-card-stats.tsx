import type { ReactNode } from "react";

type GameCardStatsProps = {
    title: string;
    description: string;
    icon: ReactNode;
};

export default function GameCardStats({ title, description, icon }: GameCardStatsProps) {
    return (
        <div className="flex h-full w-full items-center overflow-hidden rounded-lg bg-bg-200 shadow-md border border-bg-400">
            <div className="flex flex-1 flex-col text-left p-6">
                <h2 className="text-sm uppercase text-text-400">{title}</h2>
                <p className="mt-2 text-3xl">{description}</p>
            </div>
            <div className="self-end p-2">
                {icon}
            </div>
        </div>
    );
}