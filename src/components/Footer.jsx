import React, { useState, useEffect } from 'react';
import AvisoPrivacidad from './AvisoPrivacidad';
import { 
    FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaTiktok, FaWhatsapp, 
    FaEnvelope, FaPhone, FaMapMarkerAlt, FaMap, FaTimes, FaExternalLinkAlt, 
    FaCar 
} from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ✅ IMPORTAR CSS EXTERNO
import '../css/Footer.css';

// 🔧 FIX para el icono del marcador de Leaflet (problema conocido con Vite/webpack)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const [showAvisoPrivacidad, setShowAvisoPrivacidad] = useState(false);
    const [seccionUsuario, setSeccionUsuario] = useState(null);
    const [mostrarMapa, setMostrarMapa] = useState(false);
    const [coordenadas, setCoordenadas] = useState(null);

    // ✅ FUNCIÓN PARA OBTENER LA SECCIÓN DIRECTAMENTE DE localStorage
    const getSeccionUsuario = () => {
        try {
            const seccionData = localStorage.getItem('seccionUsuario');
            if (seccionData) return JSON.parse(seccionData);
            return null;
        } catch (error) {
            console.error('Error obteniendo sección:', error);
            return null;
        }
    };

    // ✅ EFECTO PARA CARGAR SECCIÓN AL MONTAR
    useEffect(() => {
        const actualizarSeccion = () => {
            const seccion = getSeccionUsuario();
            setSeccionUsuario(seccion);
        };

        actualizarSeccion();
        window.addEventListener('storage', actualizarSeccion);
        window.addEventListener('seccionActualizada', actualizarSeccion);

        return () => {
            window.removeEventListener('storage', actualizarSeccion);
            window.removeEventListener('seccionActualizada', actualizarSeccion);
        };
    }, []);

    // ✅ MANEJAR CLIC EN EL BOTÓN DE MAPA (CON FALLBACK AL CEN)
    const handleMostrarMapa = () => {
        if (mostrarMapa) {
            setMostrarMapa(false);
            return;
        }

        // 1. Intentar con las coordenadas de la sección del usuario
        let lat = seccionUsuario?.latitud;
        let lng = seccionUsuario?.longitud;

        // 2. Si no hay sesión o no hay coordenadas, usar las del CEN (Zamora 107)
        if (!lat || !lng) {
            lat = 19.4158;   // Coordenadas del CEN (Zamora 107, Condesa)
            lng = -99.1787;
        }

        setCoordenadas({ 
            lat: parseFloat(lat), 
            lng: parseFloat(lng) 
        });
        setMostrarMapa(true);
    };

    // ✅ OBTENER CORREO Y TELÉFONO DE LA SECCIÓN
    const getContacto = () => {
        return {
            correo: seccionUsuario?.correo || 'info@sntss-secciones.org',
            telefono: seccionUsuario?.telefono || '(55) 0000-0000'
        };
    };

    // ✅ FUNCIÓN PARA OBTENER REDES SOCIALES
    const getRedesSociales = () => {
        return seccionUsuario?.redes || {};
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

    // ✅ FUNCIONES QUE LEE DIRECTAMENTE DE LA VARIABLE DE ESTADO
    const getTitulo = () => {
        const isLoggedIn = Boolean(localStorage.getItem('matricula'));
        if (!isLoggedIn) return 'SNTSS';
        if (!seccionUsuario?.romano) return 'SNTSS';
        return `SNTSS Sección ${seccionUsuario.romano}`;
    };

    const getSlogan = () => {
        const isLoggedIn = Boolean(localStorage.getItem('matricula'));
        if (!isLoggedIn) return '"Todos Juntos, Todos Fuertes"';
        if (seccionUsuario?.slogan) return `"${seccionUsuario.slogan}"`;
        if (seccionUsuario?.nombre) return seccionUsuario.nombre;
        return '"Todos Juntos, Todos Fuertes"';
    };

    const getCopyright = () => {
        const isLoggedIn = Boolean(localStorage.getItem('matricula'));
        let seccionTexto = 'SNTSS';
        if (isLoggedIn && seccionUsuario?.romano) {
            seccionTexto = `Sección ${seccionUsuario.romano}`;
        }
        return `© ${currentYear} SNTSS ${seccionTexto} /`;
    };

    const getDireccion = () => {
        const isLoggedIn = Boolean(localStorage.getItem('matricula'));
        if (!isLoggedIn) {
            return 'Zamora 107, Colonia Condesa, Cuauhtémoc, 06140 Ciudad de México, CDMX';
        }
        if (seccionUsuario?.direccion) {
            return seccionUsuario.direccion;
        }
        return 'Zamora 107, Colonia Condesa, Cuauhtémoc, 06140 Ciudad de México, CDMX';
    };

    // ✅ OBTENER CONTACTO Y REDES SOCIALES
    const contacto = getContacto();
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
                                <span>{contacto.telefono}</span>
                            </div>
                            <div className="footer-contact-item">
                                <FaEnvelope className="footer-contact-icon" />
                                <span>{contacto.correo}</span>
                            </div>

                            {/* ✅ DIRECCIÓN CON BOTONES (SIEMPRE VISIBLE) */}
                            <div className="footer-contact-item footer-address-item">
                                <FaMapMarkerAlt className="footer-contact-icon" />
                                <span>{getDireccion()}</span>
                                
                                <div className="footer-map-actions">
                                    <button 
                                        className="footer-map-btn"
                                        onClick={handleMostrarMapa}
                                        title="Ver ubicación en el mapa"
                                    >
                                        {mostrarMapa ? (
                                            <><FaTimes /> Cerrar mapa</>
                                        ) : (
                                            <><FaMap /> Ver mapa</>
                                        )}
                                    </button>

                                    <a 
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(getDireccion())}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="footer-map-btn footer-map-btn-outline"
                                        title="Abrir en Google Maps"
                                    >
                                        <FaExternalLinkAlt /> Google Maps
                                    </a>

                                    {/* ✅ Botón para abrir en Waze */}
                                    <a 
                                        href={`https://waze.com/ul?q=${encodeURIComponent(getDireccion())}&navigate=yes`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="footer-map-btn footer-map-btn-waze"
                                        title="Abrir en Waze"
                                    >
                                        <FaCar /> Waze
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* ✅ MAPA DE LEAFLET (SOLO SE MUESTRA CUANDO SE ABRE) */}
                        {mostrarMapa && coordenadas && (
                            <div className="footer-map-container">
                                <MapContainer 
                                    center={[coordenadas.lat, coordenadas.lng]} 
                                    zoom={16} 
                                    style={{ height: '220px', width: '100%', borderRadius: '12px' }}
                                    scrollWheelZoom={false}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <Marker position={[coordenadas.lat, coordenadas.lng]}>
                                        <Popup>
                                            <strong>
                                                {seccionUsuario?.romano 
                                                    ? `SNTSS Sección ${seccionUsuario.romano}` 
                                                    : 'SNTSS - Comité Ejecutivo Nacional'
                                                }
                                            </strong><br />
                                            {getDireccion()}
                                        </Popup>
                                    </Marker>
                                </MapContainer>
                                <p className="footer-map-attribution">
                                    🗺️ Mapa por OpenStreetMap · Geocodificación por Nominatim API
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Columna Derecha: Redes Sociales y Enlaces Legales */}
                    <div className="footer-col-side">
                        <p className="footer-social-heading">Síguenos en</p>
                        
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

                <AvisoPrivacidad show={showAvisoPrivacidad} onHide={() => setShowAvisoPrivacidad(false)} />
            </footer>
        </div>
    );
};

export default Footer;