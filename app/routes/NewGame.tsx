import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Euro } from "lucide-react";
import Card from "@components/Card";
import { Input } from "@components/Input";
import PrimaryButton from "@components/PrimaryButton";
import { FileInput } from "@components/FileInput";
import Divider from "@components/Divider";
import GenreSelector from "@components/GenreSelector/GenreSelector";
import useNewGameForm from "@/hooks/useNewGameForm";
import { apiClient } from "@services/ApiClient";

export default function NewGame() {
    const navigate = useNavigate();
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        title,
        price,
        description,
        genres,
        errors,
        setTitle,
        setPrice,
        setDescription,
        setGenres,
        setCapsuleFile,
        setHeaderFile,
        setMainFile,
        handleSubmit,
    } = useNewGameForm(async (data) => {
        setSubmitError(null);
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append("Title", data.title);
            formData.append("Description", data.description);
            formData.append("Price", data.price.toString());

            data.genres.forEach((genre) => {
                formData.append("Genres", genre);
            });

            formData.append("CapsulePicture", data.capsuleFile!);
            formData.append("HeaderPicture", data.headerFile!);
            formData.append("MainPicture", data.mainFile!);

            const response = await apiClient.post("/games", formData);

            if (!response.ok) {
                let errorMessage = "No se pudo crear el juego. Revisa los datos e inténtalo de nuevo.";
                switch (response.status) {
                    case 400:
                        errorMessage = "Los datos enviados son incorrectos o están incompletos.";
                        break;
                    case 401:
                    case 403:
                        errorMessage = "No tienes permisos suficientes para crear un juego.";
                        break;
                    case 404:
                        errorMessage = "El servicio de juegos no está disponible en este momento (404).";
                        break;
                    case 409:
                        errorMessage = "Ya existe un juego registrado con ese mismo título.";
                        break;
                    case 413:
                        errorMessage = "Las imágenes que intentas subir son demasiado pesadas.";
                        break;
                    case 415:
                        errorMessage = "Formato de archivo no soportado (415).";
                        break;
                    case 500:
                        errorMessage = "Error interno del servidor. Por favor, inténtalo más tarde.";
                        break;
                }
                throw new Error(errorMessage);
            }

            navigate("/panel");

        } catch (error) {
            setSubmitError(error instanceof Error
                ? error.message
                : "Ocurrió un error inesperado al conectar con el servidor.");
        } finally {
            setIsSubmitting(false);
        }
    });

    return (
        <form className="px-6 py-4 flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Title */}
            <Link
                to="/panel"
                className="group inline-flex items-center w-fit text-slate-600 dark:text-white/60 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors duration-300"
            >
                <div className="flex items-center w-0 overflow-hidden opacity-0 -translate-x-4 transition-all duration-300 ease-out group-hover:w-6 group-hover:opacity-100 group-hover:translate-x-0">
                    <ArrowLeft size={16} />
                </div>
                <span>Volver al Panel</span>
            </Link>
            <h2>Crear Juego</h2>

            {/* Game Title And Price */}
            <Divider title="Información básica" />
            <div className="flex gap-4 mt-2">
                <Card className="flex-2">
                    <Input.Root
                        id="title"
                        type="text"
                        variant="inside card"
                        value={title}
                        onChange={setTitle}
                    >
                        <Input.Label>Título</Input.Label>
                        <Input.Field
                            placeholder="Ingresa el título de tu juego"
                            error={errors.title}
                        />
                        <Input.Helper>Entre 1 y 24 caracteres.</Input.Helper>
                    </Input.Root>
                </Card>
                <Card className="flex-1">
                    <Input.Root
                        id="price"
                        type="number"
                        variant="inside card"
                        value={price}
                        onChange={setPrice}
                    >
                        <Input.Label>Precio</Input.Label>
                        <Input.Field placeholder="0" icon={Euro} error={errors.price} />
                    </Input.Root>
                </Card>
                <Card className="flex-3">
                    <GenreSelector
                        selectedIds={genres}
                        onChange={setGenres}
                        error={errors.genres}
                    />
                </Card>
            </div>

            {/* Description */}
            <Card>
                <Input.Root
                    id="description"
                    type="text"
                    variant="inside card"
                    size="large"
                    value={description}
                    onChange={setDescription}
                >
                    <Input.Label>Descripción</Input.Label>
                    <Input.Field
                        placeholder="Explica brevemente tu juego, sus características y mecánicas."
                        error={errors.description}
                    />
                </Input.Root>
            </Card>

            {/* ArtWork */}
            <Divider title="Artworks" />
            <div className="inline-flex gap-4">
                <FileInput.Root
                    id="capsule"
                    accept="image/*"
                    preview
                    onChange={(files) => setCapsuleFile(files?.[0] ?? null)}
                >
                    <FileInput.Label>Capsule</FileInput.Label>
                    <FileInput.Field
                        placeholder="Añadir imagen"
                        hint=""
                        error={errors.capsule}
                    />
                </FileInput.Root>
                <FileInput.Root
                    id="header"
                    accept="image/*"
                    preview
                    onChange={(files) => setHeaderFile(files?.[0] ?? null)}
                >
                    <FileInput.Label>Header</FileInput.Label>
                    <FileInput.Field
                        placeholder="Añadir imagen"
                        hint=""
                        error={errors.header}
                    />
                </FileInput.Root>
                <FileInput.Root
                    id="main"
                    accept="image/*"
                    preview
                    onChange={(files) => setMainFile(files?.[0] ?? null)}
                >
                    <FileInput.Label>Main</FileInput.Label>
                    <FileInput.Field
                        placeholder="Añadir imagen"
                        hint=""
                        error={errors.main}
                    />
                </FileInput.Root>
            </div>

            {/* Submit Section */}
            <Divider />
            <div className="flex flex-col gap-4">
                <p>
                    Asegúrate de que toda la información sea correcta antes de crear tu
                    juego. Podrás editar los detalles más adelante, pero esto puede tardar
                    un poco en actualizarse en la tienda.
                </p>

                {submitError && (
                    <div className="rounded-lg border border-error-border bg-error-bg p-3 text-sm text-error-text">
                        {submitError}
                    </div>
                )}

                <PrimaryButton className="max-w-fit" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creando juego..." : "Crear Juego"}
                </PrimaryButton>
            </div>
        </form>
    );
}