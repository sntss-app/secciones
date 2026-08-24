import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
    FaBars, 
    FaTimes, 
    FaUserCircle, 
    FaSignOutAlt, 
    FaSignInAlt, 
    FaUserPlus,
    FaHouseUser,
    FaCalculator,
    FaNewspaper,
    FaFacebook,
    FaTwitter,
    FaInstagram,
    FaYoutube,
    FaTiktok,
    FaWhatsapp,
    FaUser
} from 'react-icons/fa';
import { getSeccionUsuario, getRedesSociales } from '../utils/sectionHelpers';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    // Estado para la sección, logo y redes
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

    const handleLogout = () => {
        localStorage.removeItem('matricula');
        localStorage.removeItem('nombre');
        localStorage.removeItem('correo');
        localStorage.removeItem('roleIds');
        localStorage.removeItem('roleNames');
        localStorage.removeItem('status');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('seccionUsuario');
        setIsLoggedIn(false);
        setSeccionUsuario(null);
        setLogo('/images/seccionesLogo/logoD.png');
        setRedesSociales({});
        navigate('/login');
    };

    const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
    const closeMobileMenu = () => setMobileMenuOpen(false);

    // Mapeo de iconos para redes sociales
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
        if (!isLoggedIn || !seccionUsuario?.romano) {
            return 'SNTSS';
        }
        return `SNTSS ${seccionUsuario.romano}`;
    };

    const getSubtitulo = () => {
        if (seccionUsuario?.nombre) {
            return seccionUsuario.nombre;
        }
        return 'Trabajadores del Seguro Social';
    };

    const redes = isLoggedIn ? redesSociales : {};
    const tieneRedes = Object.keys(redes).length > 0;

    return (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-2 relative z-50">
            {/* Header Cápsula Flotante (Sección 5) */}
            <header className="bg-white/90 backdrop-blur-md rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between ui-shadow border border-white/80 transition-all duration-300">
                
                {/* Logo e Identidad Dinámica */}
                <Link to="/" className="flex items-center space-x-3 text-decoration-none group" onClick={closeMobileMenu}>
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-emerald-500 p-0.5 bg-white flex-shrink-0 shadow-sm overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105">
                        <img 
                            src={logo} 
                            alt={getTitulo()}
                            className="w-full h-full rounded-full object-cover"
                            onError={(e) => {
                                e.target.src = '/images/seccionesLogo/logoD.png';
                            }}
                        />
                    </div>
                    <div>
                        <h1 className="text-lg sm:text-xl font-black text-[#486DAA] tracking-tight leading-none m-0">
                            {getTitulo()}
                        </h1>
                        <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 mt-1 leading-tight tracking-tight m-0">
                            <span className="text-emerald-500 font-black">◆</span> Sindicato Nacional de<br/>
                            <span className="text-emerald-500 font-black">◆</span> {getSubtitulo()}
                        </p>
                    </div>
                </Link>

                {/* Menú Central Estilo Cápsula */}
                <nav className="hidden md:flex items-center bg-slate-100/90 p-1.5 rounded-full space-x-1 border border-slate-200/50">
                    <Link 
                        to="/dashboard" 
                        className={`flex items-center space-x-2 px-5 py-2 rounded-full text-xs font-bold text-decoration-none transition-all duration-200 ${
                            location.pathname === '/dashboard' || location.pathname === '/' 
                                ? 'bg-[#486DAA] text-white shadow-md shadow-[#486DAA]/30' 
                                : 'text-slate-600 hover:text-[#486DAA] hover:bg-white/60'
                        }`}
                    >
                        <FaHouseUser className="text-xs" />
                        <span>Inicio</span>
                    </Link>

                    <Link 
                        to="/noticias" 
                        className={`flex items-center space-x-2 px-5 py-2 rounded-full text-xs font-bold text-decoration-none transition-all duration-200 ${
                            location.pathname.startsWith('/noticias')
                                ? 'bg-[#486DAA] text-white shadow-md shadow-[#486DAA]/30' 
                                : 'text-slate-600 hover:text-[#486DAA] hover:bg-white/60'
                        }`}
                    >
                        <FaNewspaper className="text-xs" />
                        <span>Noticias</span>
                    </Link>

                    {isLoggedIn && (
                        <Link 
                            to="/perfil" 
                            className={`flex items-center space-x-2 px-5 py-2 rounded-full text-xs font-bold text-decoration-none transition-all duration-200 ${
                                location.pathname === '/perfil' 
                                    ? 'bg-[#486DAA] text-white shadow-md shadow-[#486DAA]/30' 
                                    : 'text-slate-600 hover:text-[#486DAA] hover:bg-white/60'
                            }`}
                        >
                            <FaUser className="text-xs" />
                            <span>Mi Perfil</span>
                        </Link>
                    )}
                </nav>

                {/* Acciones de Sesión y Redes Sociales */}
                <div className="hidden lg:flex items-center space-x-3">
                    {/* Redes dinámicas */}
                    <div className="flex items-center space-x-1.5 pr-2 border-r border-slate-200">
                        {tieneRedes ? (
                            Object.entries(redes).slice(0, 3).map(([red, url]) => (
                                <a 
                                    key={red} 
                                    href={url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-[#486DAA] hover:text-white flex items-center justify-center transition duration-200 text-xs text-decoration-none"
                                    aria-label={red}
                                >
                                    {iconosRedes[red] || <FaFacebook size={14} />}
                                </a>
                            ))
                        ) : (
                            <>
                                <a href="https://www.facebook.com/SNTSSOFICIAL" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-[#486DAA] hover:text-white flex items-center justify-center transition duration-200 text-xs text-decoration-none">
                                    <FaFacebook size={14} />
                                </a>
                                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-[#486DAA] hover:text-white flex items-center justify-center transition duration-200 text-xs text-decoration-none">
                                    <FaTwitter size={14} />
                                </a>
                            </>
                        )}
                    </div>

                    {/* Botones de Auth */}
                    {!isLoggedIn ? (
                        <div className="flex items-center space-x-2">
                            <Link 
                                to="/login" 
                                className="inline-flex items-center space-x-1.5 bg-[#486DAA] text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm hover:bg-[#355386] transition text-decoration-none"
                            >
                                <FaSignInAlt className="text-xs" />
                                <span>Ingresar</span>
                            </Link>
                            <Link 
                                to="/registro" 
                                className="inline-flex items-center space-x-1.5 bg-slate-100 text-slate-700 hover:text-[#486DAA] hover:bg-slate-200 text-xs font-bold px-4 py-2 rounded-full transition text-decoration-none border border-slate-200"
                            >
                                <FaUserPlus className="text-xs" />
                                <span>Registro</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center space-x-1.5 bg-[#486DAA]/10 text-[#486DAA] px-3 py-1.5 rounded-full text-xs font-bold">
                                <FaUserCircle />
                                <span className="max-w-[110px] truncate">{userName}</span>
                            </span>
                            <button 
                                onClick={handleLogout} 
                                className="inline-flex items-center space-x-1 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-full text-xs font-bold border border-red-200 transition"
                                title="Cerrar sesión"
                            >
                                <FaSignOutAlt className="text-xs" />
                                <span className="hidden xl:inline">Salir</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Botón Menú Móvil */}
                <button 
                    onClick={toggleMobileMenu} 
                    className="text-[#486DAA] text-xl md:hidden p-2 rounded-full hover:bg-slate-100 transition border-0 bg-transparent"
                    aria-label="Abrir menú"
                >
                    {mobileMenuOpen ? <FaTimes /> : <FaBars />}
                </button>
            </header>

            {/* Menú Desplegable Móvil */}
            {mobileMenuOpen && (
                <div className="md:hidden mt-3 bg-white/95 backdrop-blur-md rounded-3xl p-5 ui-shadow border border-white space-y-2 animate__animated animate__fadeIn">
                    <Link 
                        to="/dashboard" 
                        onClick={closeMobileMenu}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold text-decoration-none ${
                            location.pathname === '/dashboard' || location.pathname === '/' 
                                ? 'bg-[#486DAA] text-white shadow-sm' 
                                : 'text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                        <FaHouseUser />
                        <span>Inicio</span>
                    </Link>

                    <Link 
                        to="/noticias" 
                        onClick={closeMobileMenu}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold text-decoration-none ${
                            location.pathname.startsWith('/noticias')
                                ? 'bg-[#486DAA] text-white shadow-sm' 
                                : 'text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                        <FaNewspaper />
                        <span>Proceso y Noticias</span>
                    </Link>

                    {isLoggedIn ? (
                        <>
                            <Link 
                                to="/perfil" 
                                onClick={closeMobileMenu}
                                className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-100 text-decoration-none"
                            >
                                <FaUserCircle className="text-[#486DAA]" />
                                <span>Mi Perfil ({userName})</span>
                            </Link>
                            <button 
                                onClick={() => { handleLogout(); closeMobileMenu(); }} 
                                className="w-full flex items-center justify-center space-x-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-4 py-3 rounded-2xl text-xs font-bold border border-red-200 transition mt-2"
                            >
                                <FaSignOutAlt />
                                <span>Cerrar sesión</span>
                            </button>
                        </>
                    ) : (
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                            <Link 
                                to="/login" 
                                onClick={closeMobileMenu}
                                className="flex items-center justify-center space-x-1.5 bg-[#486DAA] text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-sm text-decoration-none"
                            >
                                <FaSignInAlt />
                                <span>Ingresar</span>
                            </Link>
                            <Link 
                                to="/registro" 
                                onClick={closeMobileMenu}
                                className="flex items-center justify-center space-x-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-2.5 rounded-2xl text-xs font-bold text-decoration-none"
                            >
                                <FaUserPlus />
                                <span>Registro</span>
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Navbar;