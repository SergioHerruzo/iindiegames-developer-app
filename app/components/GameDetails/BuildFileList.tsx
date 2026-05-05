import { FileText } from "lucide-react";

type BuildFileListProps = {
    files: string[];
    loading: boolean;
    error: string | null;
};

export default function BuildFileList({ files, loading, error }: BuildFileListProps) {
    if (error) {
        return (
            <div className="rounded-lg border border-(--color-error-border) bg-(--color-error-bg) p-3 text-sm text-(--color-error-text)">
                {error}
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-(--color-border-default) bg-(--color-card-bg) overflow-hidden">
            {loading && (
                <div className="flex flex-col animate-pulse">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b border-(--color-border-default) last:border-b-0">
                            <div className="w-3.5 h-3.5 rounded skeleton-block shrink-0" />
                            <div className="h-3 w-64 rounded skeleton-block" />
                        </div>
                    ))}
                </div>
            )}

            {!loading && files.length === 0 && (
                <div className="flex items-center justify-center py-8 text-sm font-light text-(--color-secondary-text)">
                    No hay archivos subidos todavía.
                </div>
            )}

            {!loading && files.length > 0 && (
                <div className="flex flex-col">
                    {files.map((file) => (
                        <div key={file} className="flex items-center gap-3 px-4 py-2.5 border-b border-(--color-border-default) last:border-b-0">
                            <FileText size={14} strokeWidth={1.5} className="text-(--color-secondary-icon) shrink-0" />
                            <span className="text-xs font-light text-(--color-secondary-text) truncate">{file}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
