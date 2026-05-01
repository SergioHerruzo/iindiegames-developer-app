import type { ReactNode } from "react";

type DashboardHeaderProps = {
    title: string;
    subtitle: string;
    action?: ReactNode;
};

export default function DashboardHeader({ title, subtitle, action }: DashboardHeaderProps) {
    return (
        <div className="flex items-start justify-between w-full gap-4">
            <div className="flex flex-col gap-1">
                <h1 className="page-title font-space-grotesk">{title}</h1>
                <p className="page-subtitle">{subtitle}</p>
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
        </div>
    );
}
