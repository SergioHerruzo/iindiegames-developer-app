import { useState } from "react";
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
    const [imageLoaded, setImageLoaded] = useState(false);

    const config = statusConfig[status] ?? statusConfig["NotPublished"];

    return (
        <Link to={`/game/${id}`} className="cursor-pointer h-full group">
            <Card variant="none" className="h-full flex flex-col">

                {/* Image Section */}
                <div className="relative h-52 w-full border-b border-(--color-border-image) overflow-hidden bg-(--color-card-bg)">
                    {imageUrl ? (
                        <>
                            {/* Skeleton Local */}
                            {!imageLoaded && (
                                <div className="absolute inset-0 skeleton-block z-10" />
                            )}
                            <img
                                src={imageUrl}
                                alt={title}
                                onLoad={() => setImageLoaded(true)}
                                className={`h-full w-full object-cover transition-all duration-500 ease-out group-hover:scale-105 ${
                                    imageLoaded ? "opacity-100" : "opacity-0"
                                }`}
                            />
                        </>
                    ) : (
                        <div className="h-full w-full flex items-center justify-center bg-(--color-secondary-bg)">
                            <h3 className="uppercase tracking-[0.2em] text-xs font-semibold text-secondary-text">
                                Sin Artwork
                            </h3>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="flex flex-col gap-2 p-4 flex-1">
                    <h3 className="font-semibold text-slate-200">{title}</h3>
                    
                    {/* Status Tags */}
                    <div className="inline-flex items-center gap-2">
                        <span
                            className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full border ${config.bg} ${config.text} ${config.border}`}
                        >
                            {config.label}
                        </span>

                        {!isPublic && (
                            <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-badge-neutral-bg text-badge-neutral-text border border-badge-neutral-border">
                                Privado
                            </span>
                        )}
                    </div>

                    <p className="text-sm font-light text-secondary-text line-clamp-3">
                        {description}
                    </p>
                </div>

                {/* Footer Section */}
                <div className="border-t border-(--color-border-image) p-4 mt-auto">
                    <div className="inline-flex items-center gap-1 w-fit text-secondary-text group-hover:text-(--color-primary-text) transition-colors duration-300">
                        <span className="text-sm font-medium">Administrar</span>
                        <ArrowRight
                            size={16}
                            className="opacity-0 -translate-x-2 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-x-0"
                        />
                    </div>
                </div>
            </Card>
        </Link>
    );
}