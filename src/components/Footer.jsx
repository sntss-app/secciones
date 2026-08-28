import React, { useState } from 'react';
import AvisoPrivacidad from './AvisoPrivacidad';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaTiktok, FaWhatsapp, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

// ✅ IMPORTAR CSS EXTERNO
import '../css/Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const [showAvisoPrivacidad, setShowAvisoPrivacidad] = useState(false);

    // ✅ FUNCIÓN PARA OBTENER LA SECCIÓN DIRECTAMENTE DE localStorage
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

    // ✅ FUNCIÓN PARA OBTENER REDES SOCIALES
    const getRedesSociales = () => {
        const seccion = getSeccionUsuario();
        return seccion?.redes || {};
    };

    // ✅ MAPEO DE ICONOS POR RED SOCIAL
    const iconosRedes = {
        facebook: <FaFacebook size={24} />,
        x: <FaTwitter size={24} />,
        twitter: <FaTwitter size={24} />,
        instagram: <FaInstagram size={24} />,
        youtube: <FaYoutube size={24} />,
        tiktok: <FaTiktok size={24} />,
        whatsapp: <FaWhatsapp size={24} />
    };

    // ✅ CLASES CSS PARA CADA RED SOCIAL
    const clasesRedes = {
        facebook: 'footer-social-fb',
        x: 'footer-social-tw',
        twitter: 'footer-social-tw',
        instagram: 'footer-social-ig',
        youtube: 'footer-social-yt',
        tiktok: 'footer-social-tt',
        whatsapp: 'footer-social-wa'
    };

    // ✅ FUNCIONES QUE LEE DIRECTAMENTE DE localStorage
    const getTitulo = () => {
        const isLoggedIn = Boolean(localStorage.getItem('matricula'));
        if (!isLoggedIn) {
            return 'SNTSS';
        }
        
        const seccion = getSeccionUsuario();
        if (!seccion?.romano) {
            return 'SNTSS';
        }
        return `SNTSS Sección ${seccion.romano}`;
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
            return seccion.nombre;
        }
        return '"Todos Juntos, Todos Fuertes"';
    };

    const getCopyright = () => {
        const isLoggedIn = Boolean(localStorage.getItem('matricula'));
        let seccionTexto = 'SNTSS';
        
        if (isLoggedIn) {
            const seccion = getSeccionUsuario();
            if (seccion?.romano) {
                seccionTexto = `Sección ${seccion.romano}`;
            }
        }
        
        return `© ${currentYear} SNTSS ${seccionTexto} /`;
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

    // ✅ OBTENER REDES SOCIALES (SOLO UNA VEZ)
    const redes = getRedesSociales();
    const tieneRedes = Object.keys(redes).length > 0;

    return (
        <div className="footer-wrapper">
            <footer className="footer-container">
                <div className="footer-grid">
                    {/* Columna Izquierda: Información de la Sección / CEN */}
                    <div className="footer-col-main">
                        <h3 className="footer-title">{getTitulo()}</h3>
                        <p className="footer-slogan">- {getSlogan()}</p>
                        
                        <div className="footer-contact-list">
                            <div className="footer-contact-item">
                                <FaPhone className="footer-contact-icon" />
                                <span>(55) 0000-0000</span>
                            </div>
                            <div className="footer-contact-item">
                                <FaEnvelope className="footer-contact-icon" />
                                <span>info@sntss-secciones.org</span>
                            </div>
                            <div className="footer-contact-item">
                                <FaMapMarkerAlt className="footer-contact-icon" />
                                <span>{getDireccion()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Columna Derecha: Redes Sociales y Enlaces Legales */}
                    <div className="footer-col-side">
                        <p className="footer-social-heading">Síguenos en</p>
                        
                        {/* ✅ REDES SOCIALES DINÁMICAS */}
                        <div className="footer-socials">
                            {tieneRedes ? (
                                Object.entries(redes).map(([red, url]) => (
                                    <a 
                                        key={red} 
                                        href={url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className={`footer-social-link ${clasesRedes[red] || 'footer-social-fb'}`}
                                        aria-label={red}
                                    >
                                        {iconosRedes[red] || <FaFacebook size={18} />}
                                    </a>
                                ))
                            ) : (
                                // ✅ FALLBACK: Redes sociales por defecto (CEN)
                                <>
                                    <a href="https://www.facebook.com/SNTSSOFICIAL" target="_blank" rel="noopener noreferrer" className="footer-social-link footer-social-fb" aria-label="Facebook">
                                        <FaFacebook size={18} />
                                    </a>
                                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer-social-link footer-social-tw" aria-label="Twitter">
                                        <FaTwitter size={18} />
                                    </a>
                                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-social-link footer-social-ig" aria-label="Instagram">
                                        <FaInstagram size={18} />
                                    </a>
                                    <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="footer-social-link footer-social-yt" aria-label="YouTube">
                                        <FaYoutube size={18} />
                                    </a>
                                    <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="footer-social-link footer-social-tt" aria-label="TikTok">
                                        <FaTiktok size={18} />
                                    </a>
                                </>
                            )}
                        </div>

                        <div className="footer-links-row">
                            <a href="#" onClick={(e) => { e.preventDefault(); setShowAvisoPrivacidad(true); }} className="footer-link">
                                Aviso de privacidad
                            </a>
                            <span className="footer-separator">|</span>
                            <a href="#" onClick={(e) => e.preventDefault()} className="footer-link">Términos y condiciones</a>
                            <span className="footer-separator">|</span>
                            <a href="#" onClick={(e) => e.preventDefault()} className="footer-link">Contáctanos</a>
                        </div>
                    </div>
                </div>

                {/* Barra Inferior: Copyright y Nota didáctica */}
                <div className="footer-bottom-bar">
                    <p className="footer-copy">
                        {getCopyright()} 
                        <strong className="footer-legend"> espigar.dev</strong>
                    </p>
                    <p className="footer-academic-note">
                        📘 Proyecto didáctico desarrollado con fines exclusivamente académicos y escolares.
                    </p>
                </div>

                {/* Modal Aviso de Privacidad */}
                <AvisoPrivacidad show={showAvisoPrivacidad} onHide={() => setShowAvisoPrivacidad(false)} />
            </footer>
        </div>
    );
};

export default Footer;