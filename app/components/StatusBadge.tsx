type StatusKey = "Ready" | "Processing" | "Completed" | "Error";

type StatusBadgeProps = {
    status: string;
    className?: string;
};

const statusConfig: Record<StatusKey, { bg: string; text: string; border: string; label: string }> = {
    Ready: {
        bg: "bg-(--color-published-bg)",
        text: "text-(--color-published-text)",
        border: "border-(--color-published-border)",
        label: "Lista",
    },
    Processing: {
        bg: "bg-(--color-badge-neutral-bg)",
        text: "text-(--color-badge-neutral-text)",
        border: "border-(--color-badge-neutral-border)",
        label: "Procesando",
    },
    Completed: {
        bg: "bg-(--color-published-bg)",
        text: "text-(--color-published-text)",
        border: "border-(--color-published-border)",
        label: "Completada",
    },
    Error: {
        bg: "bg-(--color-error-bg)",
        text: "text-(--color-error-text)",
        border: "border-(--color-error-border)",
        label: "Error",
    },
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
    const key = (status in statusConfig ? (status as StatusKey) : "Processing") as StatusKey;
    const config = statusConfig[key];

    return (
        <span
            className={
                `text-xs font-light px-2.5 py-1 rounded-full border ${config.bg} ${config.text} ${config.border}` +
                (className ? ` ${className}` : "")
            }
        >
            {config.label}
        </span>
    );
}
