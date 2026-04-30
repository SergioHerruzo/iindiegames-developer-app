import { ArrowRight } from "lucide-react"
import { Link } from "react-router";

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    "Published":    { bg: "bg-emerald-500/15 dark:bg-emerald-400/15", text: "text-emerald-700 dark:text-emerald-400", label: "Publicado" },
    "NotPublished": { bg: "bg-slate-200/70 dark:bg-white/10",          text: "text-slate-600 dark:text-white/50",    label: "No publicado" },
    "Deleting":     { bg: "bg-rose-500/15 dark:bg-rose-400/15",       text: "text-rose-700 dark:text-rose-400",     label: "Eliminando" },
    "Failed":       { bg: "bg-amber-500/15 dark:bg-amber-400/15",     text: "text-amber-700 dark:text-amber-400",   label: "Fallido" },
};

type GameCardProps = {
    id: string;
    title: string;
    description: string;
    imageUrl?: string | null;
    status: string;
}

export default function GameCard({ id, title, description, imageUrl, status }: GameCardProps) {
    const config = statusConfig[status] ?? { bg: "bg-slate-200/70 dark:bg-white/10", text: "text-slate-600 dark:text-white/50", label: status };

    return (
        <Link
            to={`/game-details/${id}`}
            className="
                group flex h-full flex-col overflow-hidden rounded-2xl cursor-pointer
                bg-white/40 backdrop-blur-md
                border border-black/5
                shadow-sm
                dark:bg-white/3 dark:backdrop-blur-md
                dark:border-white/8
                dark:shadow-md dark:shadow-black/30
                transition-all duration-300 ease-out
                hover:shadow-md hover:border-black/10
                dark:hover:border-white/12 dark:hover:bg-white/5
            "
        >
            {/* Image */}
            <div className="relative h-48 w-full overflow-hidden rounded-t-2xl">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={title}
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                ) : (
                    <div className="
                        flex h-full w-full items-center justify-center
                        bg-slate-100/60 dark:bg-white/3
                        border-b border-dashed border-slate-200/80 dark:border-white/8
                        text-xs tracking-[0.3em] font-light text-slate-300 dark:text-white/20
                    ">
                        SIN IMAGEN
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col gap-3 px-4 py-4">
                <h2 className="
                    text-xl font-medium leading-snug text-slate-800
                    dark:text-white/70
                    line-clamp-1
                ">
                    {title}
                </h2>

                {/* Status badge */}
                <div className="flex">
                    <span className={`
                        inline-flex items-center
                        rounded-full px-2.5 py-1 text-xs font-light
                        ${config.bg} ${config.text}
                    `}>
                        {config.label}
                    </span>
                </div>

                <p className="
                    text-sm leading-relaxed text-slate-500
                    dark:text-white/45
                    line-clamp-2 flex-1
                ">
                    {description}
                </p>
            </div>

            {/* Footer CTA */}
            <div className="
                px-4 py-3
                border-t border-black/5 dark:border-white/6
            ">
                <span className="
                    inline-flex items-center gap-1.5
                    text-xs text-slate-500 dark:text-white/40
                    group-hover:text-emerald-600 dark:group-hover:text-emerald-400
                    transition-colors duration-300
                ">
                    Gestionar juego
                    <ArrowRight
                        size={13}
                        className="
                            transition-all duration-300 ease-out
                            -translate-x-2 opacity-0
                            group-hover:translate-x-0 group-hover:opacity-100
                        "
                    />
                </span>
            </div>
        </Link>
    );
}