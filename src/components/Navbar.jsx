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

// ✅ IMPORTAR CSS EXTERNO
import '../css/Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    
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

    useEffect(() => {
        const seccion = getSeccionUsuario();
        console.log('📌 Navbar - Sección obtenida:', seccion);
        console.log('📌 Navbar - Redes:', seccion?.redes);
        
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

    const iconosRedes = {
        facebook: <FaFacebook size={20} />,
        x: <FaTwitter size={20} />,
        twitter: <FaTwitter size={20} />,
        instagram: <FaInstagram size={20} />,
        youtube: <FaYoutube size={20} />,
        tiktok: <FaTiktok size={20} />,
        whatsapp: <FaWhatsapp size={20} />
    };

    const clasesRedes = {
        facebook: 'navbar-social-fb',
        x: 'navbar-social-tw',
        twitter: 'navbar-social-tw',
        instagram: 'navbar-social-ig',
        youtube: 'navbar-social-yt',
        tiktok: 'navbar-social-tt',
        whatsapp: 'navbar-social-wa'
    };

    const getTitulo = () => {
        if (!isLoggedIn) {
            return 'SNTSS';
        }
        if (seccionUsuario?.romano) {
            return `SNTSS Sección ${seccionUsuario.romano}`;
        }
        return 'SNTSS';
    };

    const getBadge = () => {
        if (!isLoggedIn) {
            return 'Sindicato Nacional de Trabajadores del Seguro Social';
        }
        return seccionUsuario?.nombre || 'Sindicato Nacional de Trabajadores del Seguro Social';
    };

    const getSubtitulo = () => {
        if (!isLoggedIn) {
            return '📘 Proyecto didáctico - Fines académicos y escolares';
        }
        if (seccionUsuario?.slogan) {
            return `"${seccionUsuario.slogan}"`;
        }
        if (seccionUsuario?.nombre) {
            return `"${seccionUsuario.nombre}"`;
        }
        return '📘 Proyecto didáctico - Fines académicos y escolares';
    };

    const redes = isLoggedIn ? redesSociales : {};
    const tieneRedes = Object.keys(redes).length > 0;

    return (
        <nav className={`navbar-container ${scrolled ? 'navbar-container-scrolled' : ''}`}>
            <div className="navbar-inner">
                {/* LOGO */}
                <Link to="/" className="navbar-logo-container">
                    <div className="navbar-logo-badge">
                        <img 
                            src={logo} 
                            alt={getTitulo()}
                            className="navbar-logo-img"
                            onError={(e) => {
                                e.target.src = '/images/seccionesLogo/logoD.png';
                            }}
                        />
                    </div>
                    <div className="navbar-title-container">
                        <span className="navbar-title">
                            {getTitulo()}
                        </span>
                        <span className="navbar-badge">
                            <span className="navbar-diamond">◆</span> {getBadge()}
                        </span>
                        <span className="navbar-subtitle">
                            <span className="navbar-diamond">◆</span> {getSubtitulo()}
                        </span>
                    </div>
                </Link>

                {/* REDES SOCIALES */}
                <div className="navbar-socials">
                    {tieneRedes ? (
                        Object.entries(redes).map(([red, url]) => (
                            <a 
                                key={red} 
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className={`navbar-social-link ${clasesRedes[red] || 'navbar-social-fb'}`}
                                aria-label={red}
                            >
                                {iconosRedes[red] || <FaFacebook size={20} />}
                            </a>
                        ))
                    ) : (
                        <>
                            <a href="https://www.facebook.com/SNTSSOFICIAL" target="_blank" rel="noopener noreferrer" className="navbar-social-link navbar-social-fb">
                                <FaFacebook size={20} />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="navbar-social-link navbar-social-tw">
                                <FaTwitter size={20} />
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="navbar-social-link navbar-social-ig">
                                <FaInstagram size={20} />
                            </a>
                            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="navbar-social-link navbar-social-yt">
                                <FaYoutube size={20} />
                            </a>
                            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="navbar-social-link navbar-social-tt">
                                <FaTiktok size={20} />
                            </a>
                        </>
                    )}
                </div>

                {/* Desktop Links */}
                <div className="navbar-desktop-links">
                    {!isLoggedIn ? (
                        <>
                            <Link to="/login" className="navbar-link">
                                <FaSignInAlt /> Iniciar sesión
                            </Link>
                            <Link to="/registro" className="navbar-link">
                                <FaUserPlus /> Registrarse
                            </Link>
                        </>
                    ) : (
                        <>
                            <span className="navbar-user-name">
                                <FaUserCircle /> {userName}
                            </span>
                            <button onClick={handleLogout} className="navbar-logout-btn">
                                <FaSignOutAlt /> Cerrar sesión
                            </button>
                        </>
                    )}
                </div>

                {/* Mobile Menu Icon */}
                <div className="navbar-mobile-icon" onClick={toggleMobileMenu}>
                    {mobileMenuOpen ? <FaTimes /> : <FaBars />}
                </div>

                {/* Mobile Menu */}
                <div className={`navbar-mobile-menu ${mobileMenuOpen ? 'navbar-mobile-menu-open' : ''}`}>
                    {!isLoggedIn ? (
                        <>
                            <Link to="/login" className="navbar-mobile-link" onClick={closeMobileMenu}>
                                <FaSignInAlt /> Iniciar sesión
                            </Link>
                            <Link to="/registro" className="navbar-mobile-link" onClick={closeMobileMenu}>
                                <FaUserPlus /> Registrarse
                            </Link>
                        </>
                    ) : (
                        <>
                            <span className="navbar-mobile-user">
                                <FaUserCircle /> {userName}
                            </span>
                            <button onClick={() => { handleLogout(); closeMobileMenu(); }} className="navbar-mobile-logout">
                                <FaSignOutAlt /> Cerrar sesión
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;