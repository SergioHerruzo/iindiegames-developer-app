type GameCardProps = {
    title: string;
    description: string;
    imageUrl: string;
}

export default function GameCard({ title, description, imageUrl }: GameCardProps) {
    return (
        <button className="flex h-full flex-col overflow-hidden rounded-lg bg-bg-200 shadow-md cursor-pointer">
            <img src={imageUrl} alt={title} className="h-44 w-full object-cover transition-transform" />
            <div className="flex flex-1 flex-col px-6 py-5 text-left">
                <h2 className="text-xl">{title}</h2>
                <p className="text-xs text-text-400 mt-2">{description}</p>
            </div>
        </button>
    )
}