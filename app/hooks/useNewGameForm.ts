import { useState } from "react";
import type { SubmitEvent } from "react";

type NewGameFormData = {
    title: string;
    price: string;
    description: string;
    genres: string[];
    capsuleFile: File | null;
    headerFile: File | null;
    mainFile: File | null;
};

type NewGameFormErrors = {
    title: string | null;
    price: string | null;
    description: string | null;
    genres: string | null;
    capsule: string | null;
    header: string | null;
    main: string | null;
};

type TouchedFields = {
    title: boolean;
    price: boolean;
    description: boolean;
    genres: boolean;
    capsule: boolean;
    header: boolean;
    main: boolean;
};

const emptyErrors: NewGameFormErrors = {
    title: null,
    price: null,
    description: null,
    genres: null,
    capsule: null,
    header: null,
    main: null,
};

function validateTitle(value: string): string | null {
    const length = value.trim().length;
    if (length < 1 || length > 24) return "El título debe tener entre 1 y 24 caracteres.";
    return null;
}

function validatePrice(value: string): string | null {
    const parsed = Number.parseFloat(value);
    if (Number.isNaN(parsed) || parsed < 0) {
        return "El precio debe ser un número no negativo.";
    }
    return null;
}

function validateDescription(value: string): string | null {
    const length = value.trim().length;
    if (length < 4 || length > 4096) {
        return "La descripción debe tener entre 4 y 4096 caracteres.";
    }
    return null;
}

function validateGenres(value: string[]): string | null {
    if (value.length < 1) {
        return "Selecciona al menos un género.";
    }
    return null;
}

function validateFile(value: File | null, label: string): string | null {
    if (!value) return `La imagen ${label} es obligatoria.`;
    return null;
}

export default function useNewGameForm(onSubmit: (data: NewGameFormData) => void) {
    const [title, setTitleState] = useState("");
    const [price, setPriceState] = useState("");
    const [description, setDescriptionState] = useState("");
    const [genres, setGenresState] = useState<string[]>([]);
    const [capsuleFile, setCapsuleFileState] = useState<File | null>(null);
    const [headerFile, setHeaderFileState] = useState<File | null>(null);
    const [mainFile, setMainFileState] = useState<File | null>(null);
    const [errors, setErrors] = useState<NewGameFormErrors>(emptyErrors);
    const [touched, setTouched] = useState<TouchedFields>({
        title: false,
        price: false,
        description: false,
        genres: false,
        capsule: false,
        header: false,
        main: false,
    });

    const markTouched = (key: keyof TouchedFields) => {
        setTouched((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
    };

    const setFieldError = (key: keyof NewGameFormErrors, message: string | null) => {
        setErrors((prev) => ({ ...prev, [key]: message }));
    };

    const setTitle = (value: string) => {
        setTitleState(value);
        if (!touched.title) markTouched("title");
        setFieldError("title", validateTitle(value));
    };

    const setPrice = (value: string) => {
        setPriceState(value);
        if (!touched.price) markTouched("price");
        setFieldError("price", validatePrice(value));
    };

    const setDescription = (value: string) => {
        setDescriptionState(value);
        if (!touched.description) markTouched("description");
        setFieldError("description", validateDescription(value));
    };

    const setGenres = (value: string[]) => {
        setGenresState(value);
        if (!touched.genres) markTouched("genres");
        setFieldError("genres", validateGenres(value));
    };

    const setCapsuleFile = (value: File | null) => {
        setCapsuleFileState(value);
        if (!touched.capsule) markTouched("capsule");
        setFieldError("capsule", validateFile(value, "Capsule"));
    };

    const setHeaderFile = (value: File | null) => {
        setHeaderFileState(value);
        if (!touched.header) markTouched("header");
        setFieldError("header", validateFile(value, "Header"));
    };

    const setMainFile = (value: File | null) => {
        setMainFileState(value);
        if (!touched.main) markTouched("main");
        setFieldError("main", validateFile(value, "Main"));
    };

    const validate = () => {
        const nextErrors: NewGameFormErrors = {
            title: validateTitle(title),
            price: validatePrice(price),
            description: validateDescription(description),
            genres: validateGenres(genres),
            capsule: validateFile(capsuleFile, "Capsule"),
            header: validateFile(headerFile, "Header"),
            main: validateFile(mainFile, "Main"),
        };

        setErrors(nextErrors);

        return Object.values(nextErrors).every((value) => value === null);
    };

    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (validate()) {
            onSubmit({
                title,
                price,
                description,
                genres,
                capsuleFile,
                headerFile,
                mainFile,
            });
        }
    };

    return {
        title,
        price,
        description,
        genres,
        capsuleFile,
        headerFile,
        mainFile,
        errors,
        setTitle,
        setPrice,
        setDescription,
        setGenres,
        setCapsuleFile,
        setHeaderFile,
        setMainFile,
        validate,
        handleSubmit,
    };
}
