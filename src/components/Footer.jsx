import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaTiktok, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
    const currentYear = new Date().getFullYear();

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
            background: 'linear-gradient(135deg, #FFD700, #FFB347)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.5rem',
        },
        slogan: {
            color: '#FFD700',
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
            marginBottom: '1.5rem',
        },
        socialLink: {
            color: 'white',
            transition: 'all 0.3s ease',
            display: 'inline-block',
            padding: '8px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.05)',
            cursor: 'pointer',
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
            color: '#FFD700',
        },
        copy: {
            fontSize: '0.75rem',
            color: '#888',
            borderTop: '1px solid rgba(255,215,0,0.2)',
            paddingTop: '1rem',
        },
        legend: {
            color: '#FFD700',
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
        .footer-link:hover {
            color: #FFD700 !important;
        }
    `;

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
                        <h3 style={styles.title}>SNTSS Sección XXXIII</h3>
                        <p style={styles.slogan}>"Unidad y Fortaleza Sindical"</p>
                        <div style={styles.contactInfo}>
                            <span style={styles.contactItem}>
                                <FaPhone /> (55) 0000-0000
                            </span>
                            <span style={styles.contactItem}>
                                <FaEnvelope /> info@sntss-secciones.org
                            </span>
                            <span style={styles.contactItem}>
                                <FaMapMarkerAlt /> C. Florines 9, Amp Simón Bolívar, Venustiano Carranza, 15420 Ciudad de México, CDMX
                            </span>
                        </div>
                    </div>
                    
                    <div style={styles.socials}>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={styles.socialLink} className="social-fb">
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
                    </div>
                    
                    <div style={styles.linksRow}>
                        <a href="#" style={styles.footerLink} className="footer-link">Aviso de privacidad</a>
                        <span style={styles.separator}>|</span>
                        <a href="#" style={styles.footerLink} className="footer-link">Términos y condiciones</a>
                        <span style={styles.separator}>|</span>
                        <a href="#" style={styles.footerLink} className="footer-link">Contáctanos</a>
                    </div>
                    
                    <p style={styles.copy}>
                        © {currentYear} SNTSS Sección XXXIII / 
                        <strong style={styles.legend}> Logic Legends 💀</strong>
                    </p>
                </div>
            </footer>
        </>
    );
};

export default Footer;