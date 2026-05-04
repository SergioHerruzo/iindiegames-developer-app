import { useState } from "react";

interface Props {
    displayName: string;
    pictureUrl?: string;
    size?: "sm" | "lg";
}

export function AvatarButton({ displayName, pictureUrl, size = "sm" }: Props) {
    const [imgError, setImgError] = useState(false);
    const showFallback = !pictureUrl || imgError;
    const dim = size === "lg" ? "h-10 w-10" : "h-9 w-9";

    return (
        <div className={`relative flex ${dim} items-center justify-center rounded-full ring-2 ring-accent-border hover:ring-accent-border-hover transition-all duration-300`}>
            {showFallback ? (
                <div className={`flex ${dim} items-center justify-center rounded-full bg-(--color-accent-bg)`}>
                    <span className="text-sm font-light text-(--color-accent-text)">
                        {displayName[0].toUpperCase()}
                    </span>
                </div>
            ) : (
                <img
                    src={pictureUrl}
                    alt={displayName}
                    className={`${dim} rounded-full object-cover`}
                    onError={() => setImgError(true)}
                />
            )}
        </div>
    );
}