import React, { useState } from 'react';
import AvisoPrivacidad from './AvisoPrivacidad';
import { 
    FaFacebook, 
    FaTwitter, 
    FaInstagram, 
    FaYoutube, 
    FaTiktok, 
    FaWhatsapp, 
    FaEnvelope, 
    FaPhone, 
    FaMapMarkerAlt 
} from 'react-icons/fa';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const [showAvisoPrivacidad, setShowAvisoPrivacidad] = useState(false);

    // Obtener sección desde localStorage
    const getSeccionUsuario = () => {
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

    const getRedesSociales = () => {
        const seccion = getSeccionUsuario();
        return seccion?.redes || {};
    };

    const iconosRedes = {
        facebook: <FaFacebook size={16} />,
        x: <FaTwitter size={16} />,
        twitter: <FaTwitter size={16} />,
        instagram: <FaInstagram size={16} />,
        youtube: <FaYoutube size={16} />,
        tiktok: <FaTiktok size={16} />,
        whatsapp: <FaWhatsapp size={16} />
    };

    const getTitulo = () => {
        const isLoggedIn = Boolean(localStorage.getItem('matricula'));
        if (!isLoggedIn) {
            return 'SNTSS';
        }
        const seccion = getSeccionUsuario();
        if (!seccion?.romano) {
            return 'SNTSS';
        }
        return `SNTSS ${seccion.romano}`;
    };

    const getSlogan = () => {
        const isLoggedIn = Boolean(localStorage.getItem('matricula'));
        if (!isLoggedIn) {
            return '"Todos Juntos, Todos Fuertes"';
        }
        const seccion = getSeccionUsuario();
        if (seccion?.slogan) {
            return `"${seccion.slogan}"`;
        }
        if (seccion?.nombre) {
            return `"${seccion.nombre}"`;
        }
        return '"Todos Juntos, Todos Fuertes"';
    };

    const getDireccion = () => {
        const isLoggedIn = Boolean(localStorage.getItem('matricula'));
        if (!isLoggedIn) {
            return 'Zamora 107, Colonia Condesa, Cuauhtémoc, 06140 Ciudad de México, CDMX';
        }
        const seccion = getSeccionUsuario();
        if (seccion?.direccion) {
            return seccion.direccion;
        }
        return 'Zamora 107, Colonia Condesa, Cuauhtémoc, 06140 Ciudad de México, CDMX';
    };

    const redes = getRedesSociales();
    const tieneRedes = Object.keys(redes).length > 0;

    return (
        <>
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 mt-auto">
                {/* FOOTER ESTILO SECCIÓN 5 (#486DAA con bordes redondeados) */}
                <footer className="bg-[#486DAA] text-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 relative overflow-hidden w-full ui-shadow">
                    
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pb-8 border-b border-white/20">
                        
                        {/* Columna Izquierda: Identidad y Contacto */}
                        <div className="lg:col-span-7 space-y-3">
                            <h4 className="text-3xl font-black tracking-tight m-0">{getTitulo()}</h4>
                            <p className="text-xs font-bold text-emerald-300 m-0">-{getSlogan()}</p>
                            
                            <div className="space-y-2 text-xs text-blue-100/90 pt-2 font-medium">
                                <div className="flex items-center space-x-2">
                                    <FaPhone className="text-emerald-300 w-4 flex-shrink-0" />
                                    <span>(55) 0000-0000</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <FaEnvelope className="text-emerald-300 w-4 flex-shrink-0" />
                                    <span>info@sntss-secciones.org</span>
                                </div>
                                <div className="flex items-start space-x-2 pt-1">
                                    <FaMapMarkerAlt className="text-emerald-300 w-4 mt-0.5 flex-shrink-0" />
                                    <span className="max-w-md leading-relaxed">{getDireccion()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Columna Derecha: Redes y Enlaces Legales */}
                        <div className="lg:col-span-5 flex flex-col items-start lg:items-end space-y-6">
                            <div>
                                <p className="text-xs font-bold text-blue-100 mb-2.5 text-left lg:text-right">Síguenos en</p>
                                <div className="flex flex-wrap gap-2.5">
                                    {tieneRedes ? (
                                        Object.entries(redes).map(([red, url]) => (
                                            <a 
                                                key={red}
                                                href={url} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-[#486DAA] transition text-sm text-decoration-none"
                                                aria-label={red}
                                            >
                                                {iconosRedes[red] || <FaFacebook size={16} />}
                                            </a>
                                        ))
                                    ) : (
                                        <>
                                            <a href="https://www.facebook.com/SNTSSOFICIAL" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-[#486DAA] transition text-sm text-decoration-none">
                                                <FaFacebook size={16} />
                                            </a>
                                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-[#486DAA] transition text-sm text-decoration-none">
                                                <FaTwitter size={16} />
                                            </a>
                                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-[#486DAA] transition text-sm text-decoration-none">
                                                <FaInstagram size={16} />
                                            </a>
                                            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-[#486DAA] transition text-sm text-decoration-none">
                                                <FaYoutube size={16} />
                                            </a>
                                            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white text-[#486DAA] flex items-center justify-center hover:bg-emerald-400 hover:text-white transition text-sm text-decoration-none">
                                                <FaTiktok size={16} />
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 text-[11px] text-blue-100/80 font-medium">
                                <button 
                                    onClick={() => setShowAvisoPrivacidad(true)} 
                                    className="bg-transparent border-0 text-blue-100/80 hover:text-white p-0 cursor-pointer transition underline-offset-2 hover:underline"
                                >
                                    Aviso de privacidad
                                </button>
                                <span>|</span>
                                <span className="hover:text-white transition cursor-pointer">
                                    Términos y condiciones
                                </span>
                                <span>|</span>
                                <a 
                                    href="mailto:info@sntss-secciones.org" 
                                    className="text-blue-100/80 hover:text-white text-decoration-none transition"
                                >
                                    Contáctanos
                                </a>
                            </div>
                        </div>

                    </div>

                    {/* Copyright inferior */}
                    <div className="pt-6 text-center text-[11px] text-blue-100/70 font-medium">
                        <p className="m-0">© {currentYear} SNTSS | <span className="text-white">espigar.dev</span></p>
                    </div>

                </footer>
            </div>

            {/* Modal de Aviso de Privacidad existente */}
            <AvisoPrivacidad 
                show={showAvisoPrivacidad} 
                onHide={() => setShowAvisoPrivacidad(false)} 
            />
        </>
    );
};

export default Footer;