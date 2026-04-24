import type { ReactNode } from "react";

type GameCardStatsProps = {
    title: string;
    description: string;
    icon: ReactNode;
};

export default function GameCardStats({ title, description, icon }: GameCardStatsProps) {
    return (
        <div className="flex h-full w-full items-center overflow-hidden rounded-lg bg-bg-200 shadow-md">
            <div className="flex flex-1 flex-col px-6 py-5 text-left">
                <h2 className="text-sm text-text-200">{title}</h2>
                <p className="mt-2 text-3xl font-bold">{description}</p>
            </div>

            <div className="mr-6 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-bg-300 text-primary-200">
                {icon}
            </div>
        </div>
    );
}