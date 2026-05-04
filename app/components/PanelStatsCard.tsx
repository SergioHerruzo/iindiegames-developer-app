import type { LucideIcon } from "lucide-react";
import Card from "@components/Card";

export default function PanelStatsCard({ icon: Icon, title, value, change }: {
    icon: LucideIcon,
    title: string,
    value: string,
    change: string
}) {
    return (
        <Card>
            {/* Icon */}
            <div className="relative flex items-center gap-2 mb-4">
                <div className="
                    flex items-center justify-center
                    w-10 h-10
                    rounded-xl
                    bg-primary-bg
                    border border-primary-border
                ">
                    <Icon strokeWidth={1.5} className="w-6 h-6 text-primary-icon" />
                </div>

                {/* Title */}
                <h5 className="font-light">
                    {title}
                </h5>
            </div>

            {/* Value */}
            <h2 className="font-semibold mb-1">
                {value}
            </h2>

            {/* Change */}
            <h6 className="font-light">
                {change}
            </h6>
        </Card>
    )
}