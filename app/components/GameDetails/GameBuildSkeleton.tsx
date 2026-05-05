export default function GameBuildSkeleton() {
    return (
        <div className="flex flex-col gap-4 animate-pulse">
            <div className="h-7 w-48 rounded-lg skeleton-block" />
            <div className="h-px w-full skeleton-block" />
            <div className="h-24 w-full rounded-xl skeleton-block" />
            <div className="h-24 w-full rounded-xl skeleton-block" />
        </div>
    );
}
