import React, { useState } from 'react';
import AvisoPrivacidad from './AvisoPrivacidad';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaTiktok, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
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

    // ✅ FUNCIONES QUE LEE DIRECTAMENTE DE localStorage
    const getTitulo = () => {
        return 'SNTSS';
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
        return '© 2026 SNTSS SNTSS / ';
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
            background: 'var(--sn-glass-bg)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--sn-glass-border)',
            borderTopLeftRadius: '2.5rem',
            borderTopRightRadius: '2.5rem',
            borderBottom: 'none',
            color: 'var(--sn-text)',
            marginTop: 'auto',
            position: 'relative',
            zIndex: 1,
            overflow: 'hidden',
            boxShadow: '0 -12px 35px -8px rgba(15, 23, 42, 0.08)',
        },
        wave: {
            position: 'relative',
            top: '-1px',
            lineHeight: 0,
        },
        content: {
            padding: '2rem 1.5rem 2rem 1.5rem',
            textAlign: 'center',
            maxWidth: '1280px',
            margin: '0 auto',
            position: 'relative',
            zIndex: 1,
        },
        mainInfo: {
            marginBottom: '1.5rem',
        },
        title: {
            fontSize: '1.6rem',
            fontWeight: 700,
            color: 'var(--sn-text)',
            marginBottom: '0.5rem',
        },
        slogan: {
            color: '#2563EB',
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
            color: 'var(--sn-text-muted)',
        },
        contactItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
        },
        socials: {
            display: 'flex',
            justifyContent: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
            marginBottom: '1.5rem',
        },
        socialLink: {
            color: '#475569',
            transition: 'all 0.3s ease',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.9)',
            border: '1px solid rgba(255,255,255,0.95)',
            boxShadow: '0 4px 10px -2px rgba(15,23,42,0.1)',
            cursor: 'pointer',
            width: '38px',
            height: '38px',
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
            color: 'var(--sn-text-muted)',
            textDecoration: 'none',
            fontSize: '0.85rem',
            transition: 'color 0.3s ease',
        },
        separator: {
            color: '#2563EB',
        },
        copy: {
            fontSize: '0.75rem',
            color: 'var(--sn-text-light)',
            borderTop: '1px solid var(--sn-glass-border)',
            paddingTop: '1rem',
        },
        legend: {
            color: '#2563EB',
            marginLeft: '5px',
        },
        didactic: {
            fontSize: '0.7rem',
            color: 'var(--sn-text-light)',
            marginTop: '0.75rem',
            fontStyle: 'italic',
        },
    };

    const socialStyles = `
        .social-fb:hover {
            color: #fff !important;
            background-color: #1877f2 !important;
            transform: translateY(-5px) scale(1.1);
        }
        .social-tw:hover {
            color: #fff !important;
            background-color: #1da1f2 !important;
            transform: translateY(-5px) scale(1.1);
        }
        .social-ig:hover {
            color: #fff !important;
            background-color: #e4405f !important;
            transform: translateY(-5px) scale(1.1);
        }
        .social-yt:hover {
            color: #fff !important;
            background-color: #ff0000 !important;
            transform: translateY(-5px) scale(1.1);
        }
        .social-tt:hover {
            color: #fff !important;
            background-color: #000000 !important;
            transform: translateY(-5px) scale(1.1);
        }
        .footer-link:hover {
            color: #2563EB !important;
        }
    `;

    // ✅ REDES SOCIALES FIJAS (estilo mockup)
    const redes = [
        { red: 'facebook', url: '#' },
        { red: 'twitter', url: '#' },
        { red: 'instagram', url: '#' },
        { red: 'youtube', url: '#' },
        { red: 'tiktok', url: '#' }
    ];
    const iconosRedes = {
        facebook: <FaFacebook size={18} />,
        twitter: <FaTwitter size={18} />,
        instagram: <FaInstagram size={18} />,
        youtube: <FaYoutube size={18} />,
        tiktok: <FaTiktok size={18} />
    };
    const clasesRedes = {
        facebook: 'social-fb',
        twitter: 'social-tw',
        instagram: 'social-ig',
        youtube: 'social-yt',
        tiktok: 'social-tt'
    };

    return (
        <>
            <style>{socialStyles}</style>
            <footer style={styles.footer}>
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
                    
                    {/* ✅ REDES SOCIALES FIJAS (estilo mockup) */}
                    <div style={styles.socials}>
                        {redes.map(({ red, url }) => (
                            <a 
                                key={red} 
                                href={url} 
                                style={styles.socialLink} 
                                className={clasesRedes[red] || 'social-fb'}
                                aria-label={red}
                            >
                                {iconosRedes[red] || <FaFacebook size={18} />}
                            </a>
                        ))}
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
                    <p style={styles.didactic}>
                        Este sitio es un proyecto didáctico desarrollado con fines exclusivamente académicos y escolares.
                    </p>
                    <AvisoPrivacidad show={showAvisoPrivacidad} onHide={() => setShowAvisoPrivacidad(false)} />
                </div>
            </footer>
        </>
    );
};

export default Footer;