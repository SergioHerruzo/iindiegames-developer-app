import { GamepadDirectional } from "lucide-react";
import { Link } from "react-router";

export default function TopBar() {
    return (
        <div className="relative flex w-full items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
                <Link to="/panel" className="flex items-center gap-3">
                    <div className="
                        flex h-10 w-10 items-center justify-center rounded-xl
                        bg-(--color-accent-bg) backdrop-blur-sm border border-accent-border
                    ">
                        <GamepadDirectional size={24} strokeWidth={1.5} className="text-accent-icon" />
                    </div>
                    <span className="text-2xl font-light tracking-tight text-badge-neutral-text">
                        Indie Games
                    </span>
                </Link>
            </div>
        </div>
    )
}