type StatusKey =
    | "UploadingFiles"
    | "PendingForProcessing"
    | "Processing"
    | "Removing"
    | "Completed"
    | "Failed";

type StatusBadgeProps = {
    status: string;
    className?: string;
};

const statusConfig: Record<StatusKey, { bg: string; text: string; border: string; label: string }> = {
    UploadingFiles: {
        bg: "bg-badge-neutral-bg",
        text: "text-badge-neutral-text",
        border: "border-badge-neutral-border",
        label: "Subida en progreso",
    },
    PendingForProcessing: {
        bg: "bg-badge-neutral-bg",
        text: "text-badge-neutral-text",
        border: "border-badge-neutral-border",
        label: "En cola",
    },
    Processing: {
        bg: "bg-badge-neutral-bg",
        text: "text-badge-neutral-text",
        border: "border-badge-neutral-border",
        label: "Procesando",
    },
    Removing: {
        bg: "bg-error-bg",
        text: "text-error-text",
        border: "border-error-border",
        label: "Eliminando",
    },
    Completed: {
        bg: "bg-published-bg",
        text: "text-published-text",
        border: "border-published-border",
        label: "Completada",
    },
    Failed: {
        bg: "bg-error-bg",
        text: "text-error-text",
        border: "border-error-border",
        label: "Error",
    },
};

const fallback = statusConfig["PendingForProcessing"];

export default function StatusBadge({ status, className }: StatusBadgeProps) {
    const config = status in statusConfig ? statusConfig[status as StatusKey] : fallback;

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
