export const apiUrl = (endpoint) => {
    const baseUrl = 'https://sntss-secciones.org';
    
    // Si la ruta está vacía o es null, devolver vacío
    if (!endpoint) return '';
    
    // Si la ruta ya es una URL completa, devolverla tal cual
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
        return endpoint;
    }
    
    // Si la ruta empieza con /api, usarla directamente
    if (endpoint.startsWith('/api/')) {
        return `${baseUrl}${endpoint}`;
    }
    
    // Si la ruta no empieza con /api, agregarlo
    if (endpoint.startsWith('/')) {
        return `${baseUrl}/api${endpoint}`;
    }
    
    // Si no empieza con /, agregarlo
    return `${baseUrl}/api/${endpoint}`;
};

export const GA_MEASUREMENT_ID = 'G-D0FPD0NC2W';
