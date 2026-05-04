import { Link } from "react-router";
import { ArrowLeft, Euro } from "lucide-react";
import Card from "@components/Card";
import { Input } from "@components/Input";
import TopBar from "@components/TopBar/TopBar";
import PrimaryButton from "@components/PrimaryButton";
import { FileInput } from "@components/FileInput";
import { useState } from "react";
import Divider from "@components/Divider";

export default function NewGame() {
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");

    return (
        <>
            <TopBar />
            <div className="p-6 flex flex-col gap-4">
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
                        <Input.Root id="title" type="text" variant="inside card" value={title} onChange={setTitle}>
                            <Input.Label>Título</Input.Label>
                            <Input.Field placeholder="Ingresa el título de tu juego" />
                        </Input.Root>
                    </Card>
                    <Card className="flex-1">
                        <Input.Root id="price" type="number" variant="inside card" value={price} onChange={setPrice}>
                            <Input.Label>Precio</Input.Label>
                            <Input.Field placeholder="0" icon={Euro} />
                        </Input.Root>
                    </Card>
                    <Card className="flex-3">
                        <Input.Root id="discount" type="text" variant="inside card">
                            <Input.Label>Géneros</Input.Label>
                            <Input.Field placeholder="Indica los géneros de tu juego" />
                        </Input.Root>
                    </Card>
                </div>
                {/* Description */}
                <Card>
                    <Input.Root id="description" type="text" variant="inside card" size="large" value={description} onChange={setDescription}>
                        <Input.Label>Descripción</Input.Label>
                        <Input.Field placeholder="Explica brevemente tu juego, sus características y mecánicas." />
                    </Input.Root>
                </Card>
                {/* ArtWork */}
                <Divider title="Artworks" />
                <div className="inline-flex gap-4">
                    <FileInput.Root id="capsule" accept="image/*" preview>
                        <FileInput.Label>Capsule</FileInput.Label>
                        <FileInput.Field placeholder="Añadir imagen" hint="" />
                    </FileInput.Root>
                    <FileInput.Root id="header" accept="image/*" preview>
                        <FileInput.Label>Header</FileInput.Label>
                        <FileInput.Field placeholder="Añadir imagen" hint="" />
                    </FileInput.Root>
                    <FileInput.Root id="main" accept="image/*" preview>
                        <FileInput.Label>Main</FileInput.Label>
                        <FileInput.Field placeholder="Añadir imagen" hint="" />
                    </FileInput.Root>
                </div>
                {/* Submit Button */}
                <PrimaryButton className="self-end max-w-fit">
                    Crear Juego
                </PrimaryButton>
            </div>
        </>
    )
}