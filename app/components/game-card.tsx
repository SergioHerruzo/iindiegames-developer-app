type GameCardProps = {
    title: string;
    description: string;
    imageUrl: string;
}

export default function GameCard({ title, description, imageUrl }: GameCardProps) {
    return (
        <button className="flex h-full w-full flex-col overflow-hidden rounded-lg bg-bg-200 shadow-md cursor-pointer hover:-translate-y-1.5 transition-transform">
            <img src={imageUrl} alt={title} className="h-44 w-full object-cover transition-transform" />
            <div className="flex flex-1 flex-col px-6 py-5 text-left">
                <h2 className="text-xl font-bold">{title}</h2>
                <p className="text-sm text-text-200 mt-2">{description}</p>
            </div>
        </button>
    )
}