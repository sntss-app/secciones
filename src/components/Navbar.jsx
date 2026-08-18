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
        facebook: <FaFacebook size={18} />,
        x: <FaTwitter size={18} />,
        twitter: <FaTwitter size={18} />,
        instagram: <FaInstagram size={18} />,
        youtube: <FaYoutube size={18} />,
        tiktok: <FaTiktok size={18} />,
        whatsapp: <FaWhatsapp size={18} />
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

    // Estilos de redes sociales y enlaces (iguales al footer)
    const socialStyles = `
        .social-fb:hover {
            color: #fff !important;
            background-color: #1877f2 !important;
            transform: translateY(-3px) scale(1.1);
        }
        .social-tw:hover {
            color: #fff !important;
            background-color: #1da1f2 !important;
            transform: translateY(-3px) scale(1.1);
        }
        .social-ig:hover {
            color: #fff !important;
            background-color: #e4405f !important;
            transform: translateY(-3px) scale(1.1);
        }
        .social-yt:hover {
            color: #fff !important;
            background-color: #ff0000 !important;
            transform: translateY(-3px) scale(1.1);
        }
        .social-tt:hover {
            color: #fff !important;
            background-color: #000000 !important;
            transform: translateY(-3px) scale(1.1);
        }
        .social-wa:hover {
            color: #fff !important;
            background-color: #25d366 !important;
            transform: translateY(-3px) scale(1.1);
        }
        .nav-link:hover {
            color: #2563EB !important;
        }
        .nav-link:hover i, .nav-link:hover svg {
            color: #2563EB !important;
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
                font-size: 1.05rem !important;
            }
            .navbar-logo {
                height: 42px !important;
                width: 42px !important;
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
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            padding: '0.8rem 1.5rem',
            background: 'transparent',
            transition: 'all 0.3s ease',
        },
        container: {
            width: '100%',
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            background: 'var(--sn-glass-bg)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--sn-glass-border)',
            borderRadius: '1.25rem',
            boxShadow: scrolled
                ? '0 12px 35px -8px rgba(15, 23, 42, 0.15), inset 0 1px 2px rgba(255,255,255,0.95)'
                : '0 8px 25px -5px rgba(30, 41, 59, 0.08), inset 0 1px 2px rgba(255,255,255,0.95)',
            padding: '0.8rem 1.25rem',
            transition: 'all 0.3s ease',
        },
        logoContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            cursor: 'pointer',
        },
        logo: {
            height: '48px',
            width: '48px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid #fff',
            boxShadow: '0 0 0 2px #2563EB, 0 6px 14px -4px rgba(37,99,235,0.45)',
            background: 'linear-gradient(135deg, #1D4ED8, #0EA5E9)',
        },
        titleContainer: {
            display: 'flex',
            flexDirection: 'column',
        },
        title: {
            fontSize: '1.3rem',
            fontWeight: 700,
            color: 'var(--sn-text)',
            letterSpacing: '0.5px',
            margin: 0,
            lineHeight: 1.1,
        },
        badge: {
            fontSize: '0.65rem',
            color: 'var(--sn-text-muted)',
            fontWeight: 500,
            marginTop: '2px',
        },
        socials: {
            display: 'flex',
            justifyContent: 'center',
            gap: '0.55rem',
            alignItems: 'center',
            flexWrap: 'wrap',
        },
        socialLink: {
            color: '#475569',
            transition: 'all 0.3s ease',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.9)',
            border: '1px solid rgba(255,255,255,0.95)',
            boxShadow: '0 4px 10px -2px rgba(15,23,42,0.1)',
            textDecoration: 'none',
            cursor: 'pointer',
            width: '34px',
            height: '34px',
        },
        desktopLinks: {
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'center',
        },
        mobileMenuIcon: {
            display: 'none',
            fontSize: '1.6rem',
            cursor: 'pointer',
            color: '#2563EB',
        },
        mobileMenu: {
            display: 'none',
            flexDirection: 'column',
            width: '100%',
            background: 'var(--sn-glass-bg)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--sn-glass-border)',
            borderRadius: '1rem',
            padding: '1rem',
            marginTop: '0.75rem',
            gap: '0.5rem',
        },
        mobileMenuOpen: {
            display: 'flex',
        },
        link: {
            color: 'var(--sn-text-muted)',
            textDecoration: 'none',
            fontSize: '0.95rem',
            fontWeight: 500,
            padding: '0.5rem 1.1rem',
            borderRadius: '999px',
            transition: 'all 0.3s ease',
            backgroundColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            border: '1px solid transparent',
        },
        logoutButton: {
            backgroundColor: '#DC2626',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1.2rem',
            borderRadius: '999px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 18px -4px rgba(220,38,38,0.4)',
        },
        userName: {
            color: '#2563EB',
            fontWeight: 600,
            marginRight: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.95rem',
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
                                    {iconosRedes[red] || <FaFacebook size={18} />}
                                </a>
                            ))
                        ) : (
                            // ✅ FALLBACK: Redes del CEN (sección 39)
                            <>
                                <a href="https://www.facebook.com/SNTSSOFICIAL" target="_blank" rel="noopener noreferrer" style={styles.socialLink} className="social-fb">
                                    <FaFacebook size={18} />
                                </a>
                                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={styles.socialLink} className="social-tw">
                                    <FaTwitter size={18} />
                                </a>
                                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={styles.socialLink} className="social-ig">
                                    <FaInstagram size={18} />
                                </a>
                                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" style={styles.socialLink} className="social-yt">
                                    <FaYoutube size={18} />
                                </a>
                                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" style={styles.socialLink} className="social-tt">
                                    <FaTiktok size={18} />
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