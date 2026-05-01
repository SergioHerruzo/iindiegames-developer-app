import type { ReactNode } from "react";

type DashboardStateCardProps = {
    children: ReactNode;
    className?: string;
};

export default function DashboardStateCard({ children, className }: DashboardStateCardProps) {
    return (
        <div className={`ui-card flex w-full flex-col items-center justify-center gap-3 rounded-2xl px-6 py-12 text-center flex-1 ${className ?? ""}`.trim()}>
            {children}
        </div>
    );
}
