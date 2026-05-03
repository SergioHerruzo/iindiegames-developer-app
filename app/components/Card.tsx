import type { ReactNode } from "react";

type CardVariant = "default" | "compact" | "none";

type CardProps = {
    children: ReactNode;
    className?: string;
    variant?: CardVariant;
};

const variants: Record<CardVariant, string> = {
    default: "p-6",
    compact: "p-4",
    none: "p-0",
};

export default function Card({
    children,
    className = "",
    variant = "default",
}: CardProps) {
    return (
        <div
            className={`
                relative overflow-hidden w-full rounded-2xl
                bg-(--color-card-bg)
                border border-(--color-border-default)
                backdrop-blur-md
                ${variants[variant]}
                ${className}
            `}
        >
            {children}
        </div>
    );
}