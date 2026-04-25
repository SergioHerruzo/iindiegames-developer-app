import { Circle } from "lucide-react"
import { Link } from "react-router";

type GameStatus = "Published" | "NotPublished" | "Deleting" | "Failed";

const statusConfig: Record<GameStatus, { color: string; label: string }> = {
    "Published": { color: "text-green-600 fill-green-600", label: "Publicado" },
    "NotPublished": { color: "text-gray-600 fill-gray-600", label: "No publicado" },
    "Deleting": { color: "text-red-500 fill-red-500", label: "Eliminando" },
    "Failed": { color: "text-amber-600 fill-amber-600", label: "Fallido" },
};

type GameCardProps = {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    status: GameStatus;
}

export default function GameCard({ id, title, description, imageUrl, status }: GameCardProps) {
    const config = statusConfig[status];
    return (
        <Link to={`/games/${id}`} className="transition-transform hover:scale-105 flex h-full flex-col overflow-hidden rounded-lg bg-bg-200 shadow-md cursor-pointer border border-bg-300">
            <div className="relative h-52 w-full overflow-hidden">
                <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
                <div className="absolute bottom-2 left-2 flex items-center gap-2 rounded-full bg-bg-200/60 px-3 py-1.5 text-xs text-white backdrop-blur-sm">
                    <span>
                        <Circle className={`h-2 w-2 ${config.color}`} />
                    </span>
                    <span className="text-text-300">{config.label}</span>
                </div>
            </div>
            <div className="flex flex-1 flex-col px-4 pt-6 text-left gap-3">
                <h2 className="text-xl">{title}</h2>
                <p className="text-sm text-text-400">{description}</p>
            </div>
        </Link>
    )
}