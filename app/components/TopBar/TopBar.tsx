import { GamepadDirectional } from "lucide-react";
import { Link, useLocation } from "react-router";
import { useAuth } from "@auth/UseAuth";
import { useEffect, useRef, useState } from "react";
import { AvatarButton } from "@components/TopBar/AvatarButton";
import { UserDropdown } from "@components/TopBar/UserDropdown";

export default function TopBar() {
    const { profile } = useAuth();
    const location = useLocation();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const avatarLabel = profile?.displayName ?? "Usuario";

    useEffect(() => { setIsDropdownOpen(false); }, [location.pathname]);

    useEffect(() => {
        if (!isDropdownOpen) return;
        const handlePointerDown = (e: PointerEvent) => {
            if (!dropdownRef.current?.contains(e.target as Node))
                setIsDropdownOpen(false);
        };
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsDropdownOpen(false);
        };
        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isDropdownOpen]);

    return (
        <div className="relative flex w-full items-center justify-between px-6 py-4">
            {/* Logo */}
            <Link to="/panel" className="inline-flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--color-accent-bg) backdrop-blur-sm border border-accent-border">
                    <GamepadDirectional size={26} strokeWidth={1.5} className="text-accent-icon" />
                </div>
                <span className="text-2xl font-light tracking-tight text-badge-neutral-text">
                    Indie Games
                </span>
            </Link>

            {/* Avatar + DropDown */}
            <div ref={dropdownRef} className="relative">
                <button
                    type="button"
                    onClick={() => setIsDropdownOpen((v) => !v)}
                    aria-haspopup="menu"
                    aria-expanded={isDropdownOpen}
                    className="flex items-center gap-3 rounded-xl px-2 py-1.5 cursor-pointer transition"
                >
                    <div className="flex flex-col items-end justify-center leading-tight">
                        <span className="text-sm text-badge-neutral-text">
                            {avatarLabel}
                        </span>
                        <span className="text-xs text-badge-neutral-text opacity-50">
                            {profile?.role ?? "Developer"}
                        </span>
                    </div>
                    <AvatarButton
                        displayName={avatarLabel}
                        pictureUrl={profile?.profilePicture?.smallPictureUrl}
                    />
                </button>

                <UserDropdown isOpen={isDropdownOpen} />
            </div>
        </div>
    );
}