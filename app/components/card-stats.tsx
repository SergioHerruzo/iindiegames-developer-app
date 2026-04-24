import type { ReactNode } from "react"

type CardProps = {
    children: ReactNode
}

function CardStatsBase({ children }: CardProps) {
    return (
        <div className="flex flex-col gap-2 bg-neutral-800 border border-neutral-700 rounded-2xl shadow-lg p-6 flex-1 text-center transition-transform hover:-translate-y-1">
            {children}
        </div>
    )
}

function CardIcon({ children }: { children: ReactNode }) {
    return <div className="text-2xl">{children}</div>
}

function CardTitle({ children }: { children: ReactNode }) {
    return <h3 className="font-semibold text-5xl font-space-grotesk text-green-400">{children}</h3>
}

function CardDescription({ children }: { children: ReactNode }) {
    return <p className="text-white font-space-grotesk uppercase font-bold">{children}</p>
}

type CardComponent = React.FC<CardProps> & {
    Icon: typeof CardIcon
    Title: typeof CardTitle
    Description: typeof CardDescription
}

const Card = CardStatsBase as CardComponent

Card.Icon = CardIcon
Card.Title = CardTitle
Card.Description = CardDescription

export default Card