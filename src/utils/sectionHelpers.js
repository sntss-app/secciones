export const getSeccionUsuario = () => {
    try {
        const seccionData = localStorage.getItem('seccionUsuario');
        if (seccionData) {
            return JSON.parse(seccionData);
        }
        return null;
    } catch (error) {
        console.error('Error obteniendo sección:', error);
        return null;
    }
};

export const getRedesSociales = () => {
    const seccion = getSeccionUsuario();
    // La API usa `redes_sociales`, mientras que la sesión normalizada usa
    // `redes`. Aceptamos ambos formatos para no activar el fallback al
    // restaurar o actualizar una sesión existente.
    const redes = seccion?.redes ?? seccion?.redes_sociales;

    if (!redes) return {};

    try {
        const redesNormalizadas = typeof redes === 'string' ? JSON.parse(redes) : redes;
        if (!redesNormalizadas || typeof redesNormalizadas !== 'object' || Array.isArray(redesNormalizadas)) {
            return {};
        }

        return Object.fromEntries(
            Object.entries(redesNormalizadas).filter(([, url]) =>
                typeof url === 'string' && url.trim().length > 0
            )
        );
    } catch (error) {
        console.error('Error obteniendo redes sociales:', error);
        return {};
    }
};
