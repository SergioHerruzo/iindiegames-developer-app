import type { ReactNode } from "react"

type CardStatsProps = {
    children: ReactNode
}

function CardStatsBase({ children }: CardStatsProps) {
    return (
        <div className="flex flex-col gap-2 bg-bg-200 border border-bg-300 rounded-2xl shadow-lg p-6 flex-1 text-center transition-transform hover:-translate-y-1">
            {children}
        </div>
    )
}

function CardStatsIcon({ children }: { children: ReactNode }) {
    return <div className="text-2xl">{children}</div>
}

function CardStatsTitle({ children }: { children: ReactNode }) {
    return <h3 className="font-semibold text-5xl font-space-grotesk text-primary-200">{children}</h3>
}

function CardStatsDescription({ children }: { children: ReactNode }) {
    return <p className="text-text-100 uppercase font-bold">{children}</p>
}

type CardStatsComponent = React.FC<CardStatsProps> & {
    Icon: typeof CardStatsIcon
    Title: typeof CardStatsTitle
    Description: typeof CardStatsDescription
}

const CardStats = CardStatsBase as CardStatsComponent

CardStats.Icon = CardStatsIcon
CardStats.Title = CardStatsTitle
CardStats.Description = CardStatsDescription

export default CardStats