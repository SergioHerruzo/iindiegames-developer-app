import { createContext, useContext, useState } from "react";
import type { ReactNode, PropsWithChildren } from "react";
import type { LucideIcon } from "lucide-react";
import { Plus } from "lucide-react";
import Card from "@components/Card";

type FileInputContextType = {
    id: string;
    onChange?: (files: FileList | null) => void;
    accept?: string;
    multiple?: boolean;
    preview?: boolean;
};

const FileInputContext = createContext<FileInputContextType | null>(null);

function useFileInput() {
    const ctx = useContext(FileInputContext);
    if (!ctx) throw new Error("FileInput must be used inside FileInput.Root");
    return ctx;
}

function Root({
    id,
    onChange,
    accept,
    multiple,
    preview = false,
    children,
}: PropsWithChildren<FileInputContextType>) {
    return (
        <FileInputContext.Provider value={{ id, onChange, accept, multiple, preview }}>
            <Card>
                <div className="flex flex-col gap-1 h-full">
                    {children}
                </div>
            </Card>
        </FileInputContext.Provider>
    );
}

function Label({ children }: { children: ReactNode }) {
    const { id } = useFileInput();
    return (
        <label htmlFor={id} className="text-badge-neutral-text">
            {children}
        </label>
    );
}

function Field({
    placeholder = "Añadir archivo",
    hint = "Haz click o arrastra un archivo aquí",
    icon: Icon = Plus,
    minHeight = "min-h-44",
}: {
    placeholder?: string;
    hint?: string;
    icon?: LucideIcon;
    minHeight?: string;
}) {
    const { id, onChange, accept, multiple, preview } = useFileInput();
    const [isDragging, setIsDragging] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    function parseAcceptedTypes(accept?: string) {
        if (!accept) return null;
        return accept.split(",").map((t) => t.trim());
    }

    function isFileAccepted(file: File, acceptedTypes: string[] | null) {
        if (!acceptedTypes) return true;
        return acceptedTypes.some((type) => {
            if (type.startsWith(".")) return file.name.toLowerCase().endsWith(type.toLowerCase());
            if (type.endsWith("/*")) return file.type.startsWith(type.replace("/*", "/"));
            return file.type === type;
        });
    }

    function handleFiles(list: FileList | null) {
        const acceptedTypes = parseAcceptedTypes(accept);
        const arr = list ? Array.from(list).filter((f) => isFileAccepted(f, acceptedTypes)) : [];
        onChange?.(arr.length > 0 ? list : null);
        if (preview && arr[0]?.type.startsWith("image/")) {
            setPreviewUrl(URL.createObjectURL(arr[0]));
        } else {
            setPreviewUrl(null);
        }
    }

    const dropzoneClasses = isDragging
        ? "border-(--color-accent-border-hover) bg-(--color-accent-bg-hover)"
        : "border-(--color-border-inside-card) bg-(--color-input-inside-card)";

    return (
        <div className="flex-1 flex flex-col">
            <label
                htmlFor={id}
                className="group mt-1 block cursor-pointer h-full"
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
            >
                <input
                    id={id}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    className="sr-only"
                    onChange={(e) => handleFiles(e.target.files)}
                />

                <div
                    className={`
                        relative flex flex-1 w-full
                        ${previewUrl ? minHeight : "h-full"}
                        items-center justify-center
                        overflow-hidden rounded-lg border border-dashed
                        transition-colors
                        group-hover:border-accent-border-hover
                        group-hover:bg-accent-bg-hover
                        ${dropzoneClasses}
                    `}
                >
                    {previewUrl ? (
                        <img src={previewUrl} alt="preview" className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-2 px-6 py-8 text-center h-full w-full">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-accent-border bg-accent-bg transition-colors group-hover:border-accent-border-hover group-hover:bg-accent-bg-hover">
                                <Icon className="h-4 w-4 text-accent-icon" strokeWidth={1.75} />
                            </div>
                            <span className="text-sm text-badge-neutral-text opacity-90">{placeholder}</span>
                            <span className="text-xs text-badge-neutral-text opacity-70">{hint}</span>
                        </div>
                    )}
                </div>
            </label>
        </div>
    );
}

function Helper({ children }: { children: ReactNode }) {
    return <span className="text-xs text-badge-neutral-text opacity-80">{children}</span>;
}

function ErrorMessage({ children }: { children: ReactNode }) {
    return <span className="text-xs text-(--color-error-message)">{children}</span>;
}

function SuccessMessage({ children }: { children: ReactNode }) {
    return <span className="text-xs text-(--color-success-message)">{children}</span>;
}

export const FileInput = {
    Root,
    Label,
    Field,
    Helper,
    Error: ErrorMessage,
    Success: SuccessMessage,
};