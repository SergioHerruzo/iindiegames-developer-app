import type { ReactNode, ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";

function Root({
    children,
    disabled,
    className = "",
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            type="button"
            disabled={disabled}
            className={`
                inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-light
                text-secondary-text
                bg-secondary-bg
                backdrop-blur-md
                border border-secondary-border
                transition-all duration-200 ease-out
                ${disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer hover:bg-secondary-bg-hover hover:border-secondary-border-hover"
                }
                ${className}
            `}
            {...props}
        >
            {children}
        </button>
    );
}

function Icon({ icon: Icon }: { icon: LucideIcon }) {
    return <Icon className="w-4 h-4" />;
}

function Text({ children }: { children: ReactNode }) {
    return <span>{children}</span>;
}

const Button = Object.assign(Root, {
    Icon,
    Text,
});

export default Button;