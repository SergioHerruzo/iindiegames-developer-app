import type { ReactNode } from "react";

type SectionCardProps = {
    children: ReactNode;
    className?: string;
};

export default function SectionCard({ children, className }: SectionCardProps) {
    return (
        <section className={`ui-section ${className ?? ""}`.trim()}>
            {children}
        </section>
    );
}
