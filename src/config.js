// src/config.js
export const apiUrl = (endpoint) => {
    // Directo a producción
    const baseUrl = 'https://sntss-secciones.org/api';
    
    return `${baseUrl}${endpoint}`;
};