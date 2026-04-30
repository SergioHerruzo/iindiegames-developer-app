export const VALIDATION_RULES = {
    TITLE_MIN_LENGTH: 1,
    TITLE_MAX_LENGTH: 64,
    DESCRIPTION_MIN_LENGTH: 10,
    DESCRIPTION_MAX_LENGTH: 4096,
    PRICE_MIN: 0,
    DISCOUNT_MIN: 0,
    DISCOUNT_MAX: 100,
    ARTWORKS_REQUIRED: 3,
} as const;

export function validateTitle(title: string): { valid: boolean; message?: string } {
    const length = title.trim().length;
    if (length < VALIDATION_RULES.TITLE_MIN_LENGTH) {
        return { valid: false, message: "El título es requerido." };
    }
    if (length > VALIDATION_RULES.TITLE_MAX_LENGTH) {
        return { valid: false, message: `El título no puede exceder ${VALIDATION_RULES.TITLE_MAX_LENGTH} caracteres.` };
    }
    return { valid: true };
}

export function validateDescription(description: string): { valid: boolean; message?: string } {
    const length = description.trim().length;
    if (length < VALIDATION_RULES.DESCRIPTION_MIN_LENGTH) {
        return { valid: false, message: "La descripción debe tener al menos 10 caracteres." };
    }
    if (length > VALIDATION_RULES.DESCRIPTION_MAX_LENGTH) {
        return { valid: false, message: `La descripción no puede exceder ${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} caracteres.` };
    }
    return { valid: true };
}

export function validatePrice(price: string): { valid: boolean; message?: string } {
    if (price.trim() === "") {
        return { valid: false, message: "Debes indicar un precio válido." };
    }
    const priceNumber = Number(price);
    if (!Number.isFinite(priceNumber) || priceNumber < VALIDATION_RULES.PRICE_MIN) {
        return { valid: false, message: "El precio debe ser un número válido mayor o igual a 0." };
    }
    return { valid: true };
}

export function validateDiscount(discount: string): { valid: boolean; message?: string } {
    if (discount.trim() === "") {
        return { valid: false, message: "Debes indicar un descuento válido." };
    }
    const discountNumber = Number(discount);
    if (!Number.isFinite(discountNumber) || discountNumber < VALIDATION_RULES.DISCOUNT_MIN || discountNumber > VALIDATION_RULES.DISCOUNT_MAX) {
        return { valid: false, message: `El descuento debe estar entre 0 y 100.` };
    }
    return { valid: true };
}

export function validateArtworks(artworkCount: number): { valid: boolean; message?: string } {
    if (artworkCount < VALIDATION_RULES.ARTWORKS_REQUIRED) {
        return { valid: false, message: "Debes subir los tres artworks antes de publicar." };
    }
    return { valid: true };
}

export function validateAllForPublish(
    title: string,
    description: string,
    price: string,
    discount: string,
    artworkCount: number
): { valid: boolean; message?: string } {
    const validations = [
        validateTitle(title),
        validateDescription(description),
        validatePrice(price),
        validateDiscount(discount),
        validateArtworks(artworkCount),
    ];

    const firstError = validations.find((v) => !v.valid);
    return firstError || { valid: true };
}
