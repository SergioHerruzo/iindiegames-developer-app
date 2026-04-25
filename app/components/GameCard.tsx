import { Circle } from "lucide-react"

type GameStatus = "Published" | "NotPublished" | "Deleting" | "Failed";

const statusConfig: Record<GameStatus, { color: string; label: string }> = {
    "Published": { color: "text-green-500 fill-green-500", label: "Publicado" },
    "NotPublished": { color: "text-gray-500 fill-gray-500", label: "No publicado" },
    "Deleting": { color: "text-red-500 fill-red-500", label: "Eliminando" },
    "Failed": { color: "text-amber-500 fill-amber-500", label: "Fallido" },
};

type GameCardProps = {
    title: string;
    description: string;
    imageUrl: string;
    status: GameStatus;
}

export default function GameCard({ title, description, imageUrl, status }: GameCardProps) {
    const config = statusConfig[status];
    return (
        <button className="flex h-full flex-col overflow-hidden rounded-lg bg-bg-200 shadow-md cursor-pointer border border-bg-300">
            <div className="relative h-52 w-full overflow-hidden">
                <img src={imageUrl} alt={title} className="h-full w-full object-cover transition-transform" />
                <div className="absolute bottom-2 left-2 flex items-center gap-2 rounded-full bg-bg-200/60 border border-bg-300 px-4 py-1 text-xs text-white backdrop-blur-sm">
                    <span>
                        <Circle className={`h-2 w-2 ${config.color}`} />
                    </span>
                    <span className="text-sm text-text-200">{config.label}</span>
                </div>
            </div>
            <div className="flex flex-1 flex-col px-4 py-6 text-left gap-3">
                <h2 className="text-xl">{title}</h2>
                <p className="text-xs text-text-400">{description}</p>
            </div>
        </button>
    )
}