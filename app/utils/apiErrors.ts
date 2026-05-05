export function getApiErrorMessage(
    status: number,
    overrides: Partial<Record<number, string>> = {},
    fallback = "Ha ocurrido un error inesperado."
): string {
    const defaultMessages: Partial<Record<number, string>> = {
        400: "Los datos enviados son incorrectos.",
        401: "No tienes permisos para realizar esta acción.",
        403: "No tienes permisos para realizar esta acción.",
        404: "El recurso no existe o fue eliminado.",
        409: "Conflicto: el recurso ya existe o no se puede completar la operación.",
        500: "Error interno del servidor. Inténtalo más tarde.",
    };

    return overrides[status] ?? defaultMessages[status] ?? fallback;
}
