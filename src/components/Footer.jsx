import React, { useState } from 'react';
import AvisoPrivacidad from './AvisoPrivacidad';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaTiktok, FaWhatsapp, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

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
        facebook: 'social-fb',
        x: 'social-tw',
        twitter: 'social-tw',
        instagram: 'social-ig',
        youtube: 'social-yt',
        tiktok: 'social-tt',
        whatsapp: 'social-wa'
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

    const styles = {
        footer: {
            backgroundColor: '#0A0F1E',
            color: 'white',
            marginTop: 'auto',
            position: 'relative',
        },
        wave: {
            position: 'relative',
            top: '-1px',
            lineHeight: 0,
        },
        content: {
            padding: '2rem 1rem 2rem 1rem',
            textAlign: 'center',
        },
        mainInfo: {
            marginBottom: '1.5rem',
        },
        title: {
            fontSize: '1.8rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #9fd3f4, #1a41cf)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.5rem',
        },
        slogan: {
            color: '#3EAEF4',
            fontSize: '0.9rem',
            fontStyle: 'italic',
            marginBottom: '0.5rem',
        },
        contactInfo: {
            display: 'flex',
            justifyContent: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap',
            marginBottom: '1rem',
            fontSize: '0.85rem',
            color: '#aaa',
        },
        contactItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
        },
        socials: {
            display: 'flex',
            justifyContent: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap',
            marginBottom: '1.5rem',
        },
        socialLink: {
            color: 'white',
            transition: 'all 0.3s ease',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.05)',
            cursor: 'pointer',
            width: '44px',
            height: '44px',
            textDecoration: 'none',
        },
        linksRow: {
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
        },
        footerLink: {
            color: '#ccc',
            textDecoration: 'none',
            fontSize: '0.85rem',
            transition: 'color 0.3s ease',
        },
        separator: {
            color: '#3EAEF4',
        },
        copy: {
            fontSize: '0.75rem',
            color: '#888',
            borderTop: '1px solid rgba(255,215,0,0.2)',
            paddingTop: '1rem',
        },
        legend: {
            color: '#3EAEF4',
            marginLeft: '5px',
        },
    };

    const socialStyles = `
        .social-fb:hover {
            color: #1877f2 !important;
            transform: translateY(-5px) scale(1.1);
            background-color: rgba(24,119,242,0.2) !important;
        }
        .social-tw:hover {
            color: #1da1f2 !important;
            transform: translateY(-5px) scale(1.1);
            background-color: rgba(29,161,242,0.2) !important;
        }
        .social-ig:hover {
            color: #e4405f !important;
            transform: translateY(-5px) scale(1.1);
            background-color: rgba(228,64,95,0.2) !important;
        }
        .social-yt:hover {
            color: #ff0000 !important;
            transform: translateY(-5px) scale(1.1);
            background-color: rgba(255,0,0,0.2) !important;
        }
        .social-tt:hover {
            color: #00f2ea !important;
            transform: translateY(-5px) scale(1.1);
            background-color: rgba(0,242,234,0.2) !important;
        }
        .social-wa:hover {
            color: #25d366 !important;
            transform: translateY(-5px) scale(1.1);
            background-color: rgba(37,211,102,0.2) !important;
        }
        .footer-link:hover {
            color: #3EAEF4 !important;
        }
    `;

    // ✅ OBTENER REDES SOCIALES (SOLO UNA VEZ)
    const redes = getRedesSociales();
    const tieneRedes = Object.keys(redes).length > 0;

    return (
        <>
            <style>{socialStyles}</style>
            <footer style={styles.footer}>
                <div style={styles.wave}>
                    <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M0,64L80,69C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58L1440,64L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z" 
                              fill="#0A0F1E" fillOpacity="1"></path>
                    </svg>
                </div>
                <div style={styles.content}>
                    <div style={styles.mainInfo}>
                        <h3 style={styles.title}>{getTitulo()}</h3>
                        <p style={styles.slogan}>✨ {getSlogan()}</p>
                        <div style={styles.contactInfo}>
                            <span style={styles.contactItem}>
                                <FaPhone /> (55) 0000-0000
                            </span>
                            <span style={styles.contactItem}>
                                <FaEnvelope /> info@sntss-secciones.org
                            </span>
                            <span style={styles.contactItem}>
                                <FaMapMarkerAlt /> {getDireccion()}
                            </span>
                        </div>
                    </div>
                    
                    {/* ✅ REDES SOCIALES DINÁMICAS */}
                    <div style={styles.socials}>
                        {tieneRedes ? (
                            Object.entries(redes).map(([red, url]) => (
                                <a 
                                    key={red} 
                                    href={url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    style={styles.socialLink} 
                                    className={clasesRedes[red] || 'social-fb'}
                                    aria-label={red}
                                >
                                    {iconosRedes[red] || <FaFacebook size={24} />}
                                </a>
                            ))
                        ) : (
                            // ✅ FALLBACK: Redes sociales por defecto (CEN)
                            <>
                                <a href="https://www.facebook.com/SNTSSOFICIAL" target="_blank" rel="noopener noreferrer" style={styles.socialLink} className="social-fb">
                                    <FaFacebook size={24} />
                                </a>
                                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={styles.socialLink} className="social-tw">
                                    <FaTwitter size={24} />
                                </a>
                                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={styles.socialLink} className="social-ig">
                                    <FaInstagram size={24} />
                                </a>
                                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" style={styles.socialLink} className="social-yt">
                                    <FaYoutube size={24} />
                                </a>
                                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" style={styles.socialLink} className="social-tt">
                                    <FaTiktok size={24} />
                                </a>
                            </>
                        )}
                    </div>
                    
                    <div style={styles.linksRow}>
                        <a href="#" onClick={(e) => { e.preventDefault(); setShowAvisoPrivacidad(true); }} style={styles.footerLink}>
                            Aviso de privacidad
                        </a>
                        <span style={styles.separator}>|</span>
                        <a href="#" style={styles.footerLink} className="footer-link">Términos y condiciones</a>
                        <span style={styles.separator}>|</span>
                        <a href="#" style={styles.footerLink} className="footer-link">Contáctanos</a>
                    </div>
                    
                    <p style={styles.copy}>
                        {getCopyright()} 
                        <strong style={styles.legend}> espigar.dev</strong>
                    </p>
                    <AvisoPrivacidad show={showAvisoPrivacidad} onHide={() => setShowAvisoPrivacidad(false)} />
                </div>
            </footer>
        </>
    );
};

export default Footer;