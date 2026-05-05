import { Loader, Trash2 } from "lucide-react";
import SecondaryButton from "@components/SecondaryButton";

type DeleteConfirmCardProps = {
    onConfirm: () => void;
    onCancel: () => void;
    isDeleting: boolean;
};

export default function DeleteConfirmCard({ onConfirm, onCancel, isDeleting }: DeleteConfirmCardProps) {
    return (
        <div className="rounded-xl border border-(--color-error-border) bg-(--color-error-bg) p-4 flex items-center justify-between gap-4">
            <p className="text-sm text-(--color-error-text)">
                ¿Seguro que quieres eliminar esta build? Esta acción no se puede deshacer.
            </p>
            <div className="inline-flex items-center gap-2 shrink-0">
                <SecondaryButton onClick={onCancel} disabled={isDeleting}>
                    Cancelar
                </SecondaryButton>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={isDeleting}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-light text-(--color-error-text) bg-(--color-error-bg) border border-(--color-error-border) cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                    {isDeleting
                        ? <Loader size={14} className="animate-spin" />
                        : <Trash2 size={14} strokeWidth={1.5} />
                    }
                    {isDeleting ? "Eliminando..." : "Sí, eliminar"}
                </button>
            </div>
        </div>
    );
}
