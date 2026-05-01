import type { ReactNode } from "react";

type SectionHeaderProps = {
    kicker?: string;
    title: string;
    subtitle?: string;
    action?: ReactNode;
    titleClassName?: string;
    subtitleClassName?: string;
    kickerClassName?: string;
};

export default function SectionHeader({
    kicker,
    title,
    subtitle,
    action,
    titleClassName,
    subtitleClassName,
    kickerClassName,
}: SectionHeaderProps) {
    return (
        <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
                {kicker ? (
                    <p className={kickerClassName ?? "ui-section-kicker"}>{kicker}</p>
                ) : null}
                <h2 className={titleClassName ?? "ui-section-title"}>{title}</h2>
                {subtitle ? (
                    <p className={`${subtitleClassName ?? "ui-section-subtitle"} mt-2`}>
                        {subtitle}
                    </p>
                ) : null}
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
        </div>
    );
}
