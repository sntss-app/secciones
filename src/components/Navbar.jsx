import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
    FaBars, 
    FaTimes, 
    FaUserCircle, 
    FaSignOutAlt, 
    FaSignInAlt, 
    FaUserPlus,
    FaFacebook,
    FaTwitter,
    FaInstagram,
    FaYoutube,
    FaTiktok,
    FaWhatsapp
} from 'react-icons/fa';
import { getSeccionUsuario, getRedesSociales } from '../utils/sectionHelpers';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    
    // ✅ NUEVO: Estado para la sección y el logo
    const [seccionUsuario, setSeccionUsuario] = useState(null);
    const [logo, setLogo] = useState('/images/seccionesLogo/logoD.png');
    const [redesSociales, setRedesSociales] = useState({});

    useEffect(() => {
        const matricula = localStorage.getItem('matricula');
        const nombre = localStorage.getItem('nombre');
        
        if (matricula) {
            setIsLoggedIn(true);
            setUserName(nombre || matricula);
        } else {
            setIsLoggedIn(false);
            setUserName('');
        }
    }, [location]);

    // ✅ NUEVO: useEffect para cargar la sección, el logo y las redes
    useEffect(() => {
            const seccion = getSeccionUsuario();
            console.log('📌 Navbar - Sección obtenida:', seccion);  // DEBUG
            console.log('📌 Navbar - Redes:', seccion?.redes);      // DEBUG
            
            if (seccion) {
                setSeccionUsuario(seccion);
                setLogo(seccion.logo || '/images/seccionesLogo/logoD.png');
                setRedesSociales(getRedesSociales());
            } else {
                setSeccionUsuario(null);
                setLogo('/images/seccionesLogo/logoD.png');
                setRedesSociales({});
            }
        }, [location]);

        useEffect(() => {
            const handleScroll = () => {
                setScrolled(window.scrollY > 50);
            };
            window.addEventListener('scroll', handleScroll);
            return () => window.removeEventListener('scroll', handleScroll);
        }, []);

    const handleLogout = () => {
        localStorage.removeItem('matricula');
        localStorage.removeItem('nombre');
        localStorage.removeItem('correo');
        localStorage.removeItem('seccionUsuario');
        setIsLoggedIn(false);
        setSeccionUsuario(null);
        setLogo('/images/seccionesLogo/logoD.png');
        setRedesSociales({});
        navigate('/login');
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    // ✅ MAPEO DE ICONOS POR RED SOCIAL
    const iconosRedes = {
        facebook: <FaFacebook size={20} />,
        x: <FaTwitter size={20} />,
        twitter: <FaTwitter size={20} />,
        instagram: <FaInstagram size={20} />,
        youtube: <FaYoutube size={20} />,
        tiktok: <FaTiktok size={20} />,
        whatsapp: <FaWhatsapp size={20} />
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

    // Estilos iguales a los del footer
    const socialStyles = `
        .social-fb:hover {
            color: #1877f2 !important;
            transform: translateY(-3px) scale(1.1);
            background-color: rgba(24,119,242,0.2) !important;
        }
        .social-tw:hover {
            color: #1da1f2 !important;
            transform: translateY(-3px) scale(1.1);
            background-color: rgba(29,161,242,0.2) !important;
        }
        .social-ig:hover {
            color: #e4405f !important;
            transform: translateY(-3px) scale(1.1);
            background-color: rgba(228,64,95,0.2) !important;
        }
        .social-yt:hover {
            color: #ff0000 !important;
            transform: translateY(-3px) scale(1.1);
            background-color: rgba(255,0,0,0.2) !important;
        }
        .social-tt:hover {
            color: #00f2ea !important;
            transform: translateY(-3px) scale(1.1);
            background-color: rgba(0,242,234,0.2) !important;
        }
        .social-wa:hover {
            color: #25d366 !important;
            transform: translateY(-3px) scale(1.1);
            background-color: rgba(37,211,102,0.2) !important;
        }
        .nav-link:hover {
            color: #3EAEF4 !important;
        }
        @media (max-width: 768px) {
            .desktop-links {
                display: none !important;
            }
            .mobile-menu-icon {
                display: block !important;
            }
            .navbar-container {
                padding: 0.8rem 1rem !important;
            }
            .navbar-title {
                font-size: 1.1rem !important;
            }
            .navbar-logo {
                height: 45px !important;
                width: 45px !important;
            }
            .navbar-socials {
                display: none !important;
            }
        }
        @media (max-width: 480px) {
            .navbar-title {
                font-size: 0.9rem !important;
            }
            .navbar-badge {
                font-size: 0.6rem !important;
            }
        }
    `;

    const styles = {
        navbar: {
            backgroundColor: scrolled ? '#0A0F1E' : '#0A0F1E',
            borderBottom: '3px solid #3EAEF4',
            boxShadow: scrolled ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
            transition: 'all 0.3s ease',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            padding: '0.8rem 2rem',
        },
        container: {
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
        },
        logoContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            cursor: 'pointer',
        },
        logo: {
            height: '55px',
            width: '55px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid #3EAEF4',
            boxShadow: '0 0 0 2px #0A0F1E, 0 0 0 4px #3EAEF4',
        },
        titleContainer: {
            display: 'flex',
            flexDirection: 'column',
        },
        title: {
            fontSize: '1.4rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #fff 30%, #3EAEF4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '1px',
            margin: 0,
        },
        badge: {
            fontSize: '0.7rem',
            color: '#3EAEF4',
            fontWeight: '500',
            marginTop: '2px',
        },
        socials: {
            display: 'flex',
            justifyContent: 'center',
            gap: '0.8rem',
            alignItems: 'center',
            flexWrap: 'wrap',
        },
        socialLink: {
            color: 'white',
            transition: 'all 0.3s ease',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.05)',
            textDecoration: 'none',
            cursor: 'pointer',
            width: '36px',
            height: '36px',
        },
        desktopLinks: {
            display: 'flex',
            gap: '1.5rem',
            alignItems: 'center',
        },
        mobileMenuIcon: {
            display: 'none',
            fontSize: '1.8rem',
            cursor: 'pointer',
            color: '#3EAEF4',
        },
        mobileMenu: {
            display: 'none',
            flexDirection: 'column',
            width: '100%',
            backgroundColor: '#0A0F1E',
            padding: '1rem',
            marginTop: '1rem',
            borderTop: '1px solid rgba(255,215,0,0.2)',
        },
        mobileMenuOpen: {
            display: 'flex',
        },
        link: {
            color: 'white',
            textDecoration: 'none',
            fontSize: '1rem',
            fontWeight: '500',
            padding: '0.5rem 1rem',
            borderRadius: '25px',
            transition: 'all 0.3s ease',
            backgroundColor: 'rgba(255,215,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
        },
        logoutButton: {
            backgroundColor: '#DC2626',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1.2rem',
            borderRadius: '25px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        },
        userName: {
            color: '#3EAEF4',
            fontWeight: 'bold',
            marginRight: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
        },
    };

    // ✅ Determinar el título y badge según la sesión
    const getTitulo = () => {
        if (!isLoggedIn) {
            return 'SNTSS';
        }
        return `SNTSS Sección ${seccionUsuario?.romano || 'XXXIII'}`;
    };

    const getBadge = () => {
        if (!isLoggedIn) {
            return '"Sindicato Nacional de Trabajadores del Seguro Social"';
        }
        return seccionUsuario?.nombre || 'Sindicato Nacional de Trabajadores del Seguro Social';
    };

    // ✅ REDES SOCIALES DEL NAVBAR (dinámicas o fallback)
    const redes = isLoggedIn ? redesSociales : {};
    const tieneRedes = Object.keys(redes).length > 0;

    return (
        <>
            <style>{socialStyles}</style>
            <nav style={styles.navbar}>
                <div style={styles.container} className="navbar-container">
                    {/* ✅ LOGO DINÁMICO SEGÚN SECCIÓN */}
                    <div style={styles.logoContainer} onClick={() => navigate('/')}>
                        <img 
                            src={logo} 
                            alt={getTitulo()}
                            style={styles.logo} 
                            className="navbar-logo" 
                            onError={(e) => {
                                e.target.src = '/images/seccionesLogo/logoD.png';
                            }}
                        />
                        <div style={styles.titleContainer}>
                            <span style={styles.title} className="navbar-title">
                                {getTitulo()}
                            </span>
                            <span style={styles.badge} className="navbar-badge">
                                ✨ {getBadge()}
                            </span>
                        </div>
                    </div>

                    {/* ✅ REDES SOCIALES DINÁMICAS EN EL NAVBAR */}
                    <div style={styles.socials} className="navbar-socials">
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
                                    {iconosRedes[red] || <FaFacebook size={20} />}
                                </a>
                            ))
                        ) : (
                            // ✅ FALLBACK: Redes del CEN (sección 39)
                            <>
                                <a href="https://www.facebook.com/SNTSSOFICIAL" target="_blank" rel="noopener noreferrer" style={styles.socialLink} className="social-fb">
                                    <FaFacebook size={20} />
                                </a>
                                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={styles.socialLink} className="social-tw">
                                    <FaTwitter size={20} />
                                </a>
                                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={styles.socialLink} className="social-ig">
                                    <FaInstagram size={20} />
                                </a>
                                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" style={styles.socialLink} className="social-yt">
                                    <FaYoutube size={20} />
                                </a>
                                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" style={styles.socialLink} className="social-tt">
                                    <FaTiktok size={20} />
                                </a>
                            </>
                        )}
                    </div>

                    {/* Desktop Links */}
                    <div style={styles.desktopLinks} className="desktop-links">
                        {!isLoggedIn ? (
                            <>
                                <Link to="/login" style={styles.link} className="nav-link">
                                    <FaSignInAlt /> Iniciar sesión
                                </Link>
                                <Link to="/registro" style={styles.link} className="nav-link">
                                    <FaUserPlus /> Registrarse
                                </Link>
                            </>
                        ) : (
                            <>
                                <span style={styles.userName}>
                                    <FaUserCircle /> {userName}
                                </span>
                                <button onClick={handleLogout} style={styles.logoutButton}>
                                    <FaSignOutAlt /> Cerrar sesión
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Icon */}
                    <div style={styles.mobileMenuIcon} className="mobile-menu-icon" onClick={toggleMobileMenu}>
                        {mobileMenuOpen ? <FaTimes /> : <FaBars />}
                    </div>

                    {/* Mobile Menu */}
                    <div style={{ ...styles.mobileMenu, ...(mobileMenuOpen ? styles.mobileMenuOpen : {}) }} className="mobile-menu">
                        {!isLoggedIn ? (
                            <>
                                <Link to="/login" style={styles.link} onClick={closeMobileMenu} className="nav-link">
                                    <FaSignInAlt /> Iniciar sesión
                                </Link>
                                <Link to="/registro" style={styles.link} onClick={closeMobileMenu} className="nav-link">
                                    <FaUserPlus /> Registrarse
                                </Link>
                            </>
                        ) : (
                            <>
                                <span style={{ ...styles.userName, marginBottom: '1rem', textAlign: 'center' }}>
                                    <FaUserCircle /> {userName}
                                </span>
                                <button onClick={() => { handleLogout(); closeMobileMenu(); }} style={styles.logoutButton}>
                                    <FaSignOutAlt /> Cerrar sesión
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;
