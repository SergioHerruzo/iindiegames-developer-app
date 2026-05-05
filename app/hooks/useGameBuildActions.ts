import { useEffect, useRef, useState } from "react";
import { apiClient } from "@services/ApiClient";
import { getApiErrorMessage } from "@/utils/apiErrors";

type UploadProgress = {
    done: number;
    total: number;
};

type UseGameBuildActionsResult = {
    versionName: string;
    versionNameError: string | null;
    onVersionNameChange: (value: string) => void;

    isSaving: boolean;
    saveError: string | null;
    saveSuccess: boolean;
    handleSave: () => Promise<void>;

    showDeleteConfirm: boolean;
    setShowDeleteConfirm: (value: boolean) => void;
    isDeleting: boolean;
    deleteError: string | null;
    handleDelete: () => Promise<void>;

    folderInputRef: React.RefObject<HTMLInputElement | null>;
    selectedFiles: File[];
    folderName: string | null;
    isUploading: boolean;
    uploadProgress: UploadProgress | null;
    uploadError: string | null;
    uploadSuccess: boolean;
    handleFolderChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleUpload: () => Promise<void>;

    isCompleting: boolean;
    completeError: string | null;
    completeSuccess: boolean;
    handleComplete: () => Promise<void>;
};

export default function useGameBuildActions(
    buildId: string | undefined,
    initialVersionName: string,
    onDeleteSuccess: () => void,
    onUploadSuccess: () => void
): UseGameBuildActionsResult {
    const [versionName, setVersionName] = useState("");
    const [versionNameError, setVersionNameError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const folderInputRef = useRef<HTMLInputElement>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [folderName, setFolderName] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const [isCompleting, setIsCompleting] = useState(false);
    const [completeError, setCompleteError] = useState<string | null>(null);
    const [completeSuccess, setCompleteSuccess] = useState(false);

    // Init local state once build loads
    const [initialized, setInitialized] = useState(false);
    useEffect(() => {
        if (initialVersionName && !initialized) {
            setVersionName(initialVersionName);
            setInitialized(true);
        }
    }, [initialVersionName, initialized]);

    const onVersionNameChange = (value: string) => {
        setVersionName(value);
        setSaveSuccess(false);
    };

    const handleSave = async () => {
        if (!buildId) return;

        if (!versionName.trim()) {
            setVersionNameError("El nombre de la versión es obligatorio.");
            return;
        }

        setVersionNameError(null);
        setSaveError(null);
        setSaveSuccess(false);
        setIsSaving(true);

        try {
            const response = await apiClient.put(`/game-builds/${buildId}`, {
                versionName: versionName.trim(),
            });

            if (!response.ok) {
                throw new Error(
                    getApiErrorMessage(
                        response.status,
                        {
                            400: "Los datos enviados son incorrectos.",
                            401: "No tienes permisos para editar esta build.",
                            403: "No tienes permisos para editar esta build.",
                            404: "La build no existe o fue eliminada.",
                            409: "Ya existe una build con ese nombre de versión.",
                            500: "Error interno del servidor. Inténtalo más tarde.",
                        },
                        "No se pudo guardar los cambios."
                    )
                );
            }

            setSaveSuccess(true);
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : "Error inesperado.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!buildId) return;

        setIsDeleting(true);
        setDeleteError(null);

        try {
            const response = await apiClient.delete(`/game-builds/${buildId}`);

            if (!response.ok) {
                throw new Error(
                    getApiErrorMessage(
                        response.status,
                        {
                            401: "No tienes permisos para eliminar esta build.",
                            403: "No tienes permisos para eliminar esta build.",
                            404: "La build no existe o ya fue eliminada.",
                            500: "Error interno del servidor. Inténtalo más tarde.",
                        },
                        "No se pudo eliminar la build."
                    )
                );
            }

            onDeleteSuccess();
        } catch (err) {
            setDeleteError(err instanceof Error ? err.message : "Error inesperado.");
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;

        const root = files[0].webkitRelativePath.split("/")[0];
        setFolderName(root);
        setSelectedFiles(files);
        setUploadError(null);
        setUploadSuccess(false);
        setUploadProgress(null);
    };

    const handleUpload = async () => {
        if (!buildId) return;
        if (!selectedFiles.length) return;

        setIsUploading(true);
        setUploadError(null);
        setUploadSuccess(false);
        setUploadProgress({ done: 0, total: selectedFiles.length });

        try {
            const filePaths = selectedFiles.map((file) =>
                file.webkitRelativePath.split("/").slice(1).join("/")
            );

            const response = await apiClient.post(`/game-builds/${buildId}/upload`, { filePaths });

            if (!response.ok) {
                throw new Error(
                    getApiErrorMessage(
                        response.status,
                        {
                            400: "Los datos enviados son incorrectos.",
                            401: "No tienes permisos para subir archivos a esta build.",
                            403: "No tienes permisos para subir archivos a esta build.",
                            404: "La build no existe o fue eliminada.",
                            500: "Error interno del servidor. Inténtalo más tarde.",
                        },
                        "No se pudieron obtener las URLs de subida."
                    )
                );
            }

            const uploadInfos = (await response.json()) as { originalFilePath: string; uploadUrl: string }[];

            const fileMap = new Map(
                selectedFiles.map((file) => [file.webkitRelativePath.split("/").slice(1).join("/"), file])
            );

            let done = 0;
            for (const info of uploadInfos) {
                const file = fileMap.get(info.originalFilePath);
                if (!file) continue;

                const arrayBuffer = await file.arrayBuffer();
                const putRes = await fetch(info.uploadUrl, {
                    method: "PUT",
                    body: arrayBuffer,
                });

                if (!putRes.ok) throw new Error(`Error subiendo ${info.originalFilePath}.`);

                done++;
                setUploadProgress({ done, total: selectedFiles.length });
            }

            setUploadSuccess(true);
            setSelectedFiles([]);
            setFolderName(null);
            if (folderInputRef.current) folderInputRef.current.value = "";

            onUploadSuccess();
        } catch (err) {
            setUploadError(err instanceof Error ? err.message : "Error inesperado.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleComplete = async () => {
        if (!buildId) return;

        setIsCompleting(true);
        setCompleteError(null);
        setCompleteSuccess(false);

        try {
            const response = await apiClient.post(`/game-builds/${buildId}/complete`, {});

            if (!response.ok) {
                throw new Error(
                    getApiErrorMessage(
                        response.status,
                        {
                            400: "La build no puede completarse en su estado actual.",
                            401: "No tienes permisos para completar esta build.",
                            403: "No tienes permisos para completar esta build.",
                            404: "La build no existe o fue eliminada.",
                            500: "Error interno del servidor. Inténtalo más tarde.",
                        },
                        "No se pudo completar la build."
                    )
                );
            }

            setCompleteSuccess(true);
        } catch (err) {
            setCompleteError(err instanceof Error ? err.message : "Error inesperado.");
        } finally {
            setIsCompleting(false);
        }
    };

    return {
        versionName,
        versionNameError,
        onVersionNameChange,

        isSaving,
        saveError,
        saveSuccess,
        handleSave,

        showDeleteConfirm,
        setShowDeleteConfirm,
        isDeleting,
        deleteError,
        handleDelete,

        folderInputRef,
        selectedFiles,
        folderName,
        isUploading,
        uploadProgress,
        uploadError,
        uploadSuccess,
        handleFolderChange,
        handleUpload,

        isCompleting,
        completeError,
        completeSuccess,
        handleComplete,
    };
}
