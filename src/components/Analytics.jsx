// src/components/Analytics.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';
import { GA_MEASUREMENT_ID } from '../config';

// Componente para trackear vistas de página
export const PageTracker = () => {
    const location = useLocation();

    useEffect(() => {
        // Enviar vista de página cuando cambia la ruta
        ReactGA.send({
            hitType: 'pageview',
            page: location.pathname + location.search,
            title: document.title,
        });
    }, [location]);

    return null;
};

// Función para inicializar Analytics
export const initAnalytics = () => {
    if (GA_MEASUREMENT_ID) {
        ReactGA.initialize(GA_MEASUREMENT_ID);
        console.log('📊 Google Analytics inicializado - ID:', GA_MEASUREMENT_ID);
        
        // Enviar la primera vista de página
        ReactGA.send({
            hitType: 'pageview',
            page: window.location.pathname + window.location.search,
            title: document.title,
        });
    } else {
        console.warn('⚠️ ID de Google Analytics no encontrado');
    }
};

// Eventos personalizados
export const trackEvent = (category, action, label = null, value = null) => {
    ReactGA.event({
        category: category,
        action: action,
        label: label,
        value: value,
    });
};

// Eventos predefinidos
export const trackLogin = (method = 'email') => {
    trackEvent('Usuario', 'Login exitoso', method);
};

export const trackRegister = (matricula) => {
    trackEvent('Usuario', 'Registro completado', matricula);
};

export const trackClausula79Bis = (action, matricula) => {
    trackEvent('Clausula79Bis', action, matricula);
};

export const trackNoticia = (action, titulo) => {
    trackEvent('Noticias', action, titulo);
};

export const trackCalculadora = (nombre) => {
    trackEvent('Calculadora', 'Usó calculadora', nombre);
};