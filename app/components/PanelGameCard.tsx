import Card from "@components/Card";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

const statusConfig: Record<string, { bg: string; text: string; border: string; label: string }> = {
    "Published": {
        bg: "bg-(--color-published-bg)",
        text: "text-(--color-published-text)",
        border: "border-(--color-published-border)",
        label: "Publicado"
    },
    "NotPublished": {
        bg: "bg-(--color-badge-neutral-bg)",
        text: "text-(--color-badge-neutral-text)",
        border: "border-(--color-badge-neutral-border)",
        label: "No Publicado"
    },
    "WithErrors": {
        bg: "bg-(--color-error-bg)",
        text: "text-(--color-error-text)",
        border: "border-(--color-error-border)",
        label: "Con Errores"
    },
};

export default function PanelGameCard({ id, title, description, imageUrl, status, isPublic }: {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    status: string;
    isPublic?: boolean;
}) {
    return (
        <Link to={`/game/${id}`} className="cursor-pointer h-full group">
            <Card variant="none" className="h-full flex flex-col">

                {/* Image */}
                <div className="relative h-52 w-full border-b border-(--color-border-image) overflow-hidden">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={title}
                            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                        />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center">
                            <h3 className="uppercase tracking-[0.2em] font-semibold">
                                Sin Artwork
                            </h3>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex flex-col gap-2 p-4 flex-1">
                    <h3 className="font-semibold">{title}</h3>
                    {/* Tags */}
                    <div className="inline-flex items-center gap-2">
                        <span
                            className={`text-sm font-light px-3 py-0.75 rounded-full ${statusConfig[status].bg} ${statusConfig[status].text} border ${statusConfig[status].border}`}
                        >
                            {statusConfig[status].label}
                        </span>

                        {!isPublic && (
                            <span className="text-sm font-light px-3 py-0.75 rounded-full bg-badge-neutral-bg text-badge-neutral-text border border-badge-neutral-border">
                                Privado
                            </span>
                        )}
                    </div>
                    <p className="text-sm font-light">
                        {description}
                    </p>
                </div>

                {/* Footer */}
                <div className="border-t border-(--color-border-image) p-4">
                    <div className="inline-flex items-center gap-1 w-fit text-slate-600 dark:text-white/60 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors duration-300">
                        <span className="text-sm font-light">Administrar</span>
                        <ArrowRight
                            size={16}
                            className="opacity-0 -translate-x-2 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-x-0"
                        />
                    </div>
                </div>
            </Card>
        </Link>
    )
}