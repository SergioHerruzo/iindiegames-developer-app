export default function Divider({ title, className = "" }: {
    title?: string,
    className?: string
}) {
    if (!title) {
        return (
            <div
                className={`w-full h-px bg-divider ${className}`}
            />
        );
    }

    return (
        <div className={`flex items-center w-full gap-3 ${className}`}>
            <div className="flex-1 h-px bg-divider" />

            <h5 className="whitespace-nowrap uppercase tracking-[0.2em]">
                {title}
            </h5>

            <div className="flex-1 h-px bg-divider" />
        </div>
    );
}