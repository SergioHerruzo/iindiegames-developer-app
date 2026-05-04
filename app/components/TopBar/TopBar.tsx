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
    const displayName = profile?.displayName ?? "Usuario";

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
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-bg backdrop-blur-sm border border-primary-border">
                    <GamepadDirectional size={26} strokeWidth={1.5} className="text-primary-icon" />
                </div>
                <h2>
                    Indie Games
                </h2>
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
                        <h5 className="font-light">
                            {displayName}
                        </h5>
                        <h6 className="text-xs font-light">
                            {profile?.role ?? "Developer"}
                        </h6>
                    </div>
                    <AvatarButton
                        displayName={displayName}
                        pictureUrl={profile?.profilePicture?.smallPictureUrl}
                    />
                </button>

                <UserDropdown isOpen={isDropdownOpen} />
            </div>
        </div>
    );
}