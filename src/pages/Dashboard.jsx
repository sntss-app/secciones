import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaCar, FaNewspaper, FaInfoCircle, FaCalculator, FaSignInAlt, 
    FaGift, FaShieldAlt, FaChartLine, FaCheckCircle, FaUser,
    FaThumbtack, FaEye, FaCalendarAlt, FaTools, FaStar, FaRocket,
    FaBuilding, FaHouseUser, FaPiggyBank, FaFileContract, FaClock,
    FaUmbrellaBeach, FaClipboardList, FaFilePdf, FaExternalLinkAlt, FaFileAlt,
    FaQrcode, FaChartPie, FaArrowRight
} from 'react-icons/fa';
import { apiUrl } from '../config';
import { Modal } from 'react-bootstrap';
import { hasStoredRole, getStoredRoleIds } from '../utils/roles';
import { getSectionAssets } from '../utils/sectionAssets';

// ===== IMPORTAR COMPONENTES DE CALCULADORAS =====
import CreditoHipotecario from '../components/calculadoras/CreditoHipotecario';
import CreditoMedianoPlazo from '../components/calculadoras/CreditoMedianoPlazo';
import PrestamoAuto from '../components/calculadoras/PrestamoAuto';
import FondoAhorro from '../components/calculadoras/FondoAhorro';
import Aguinaldo from '../components/calculadoras/Aguinaldo';
import Clausula97 from '../components/calculadoras/Clausula97';
import HorasExtras from '../components/calculadoras/HorasExtras';
import Vacaciones from '../components/calculadoras/Vacaciones';

// ✅ IMPORTAR CSS EXTERNO
import '../css/Dashboard.css';

const Dashboard = () => {
    // ===== ESTADOS =====
    const [isLoggedIn] = useState(() => Boolean(localStorage.getItem('matricula')));
    const [userName] = useState(() => localStorage.getItem('nombre') || localStorage.getItem('matricula') || '');
    
    const [seccionUsuario, setSeccionUsuario] = useState(() => {
        try {
            const seccionData = localStorage.getItem('seccionUsuario');
            if (seccionData) {
                return JSON.parse(seccionData);
            }
            return null;
        } catch {
            return null;
        }
    });
    
    const [noticias, setNoticias] = useState([]);
    const [loadingNoticias, setLoadingNoticias] = useState(true);
    const [tabActiva, setTabActiva] = useState('cen');
    
    const [hasAutoValidatorRole, setHasAutoValidatorRole] = useState(() => {
        const roleIds = getStoredRoleIds();
        return roleIds.includes(1);
    });
    const [hasNewsValidatorRole, setHasNewsValidatorRole] = useState(() => {
        const roleIds = getStoredRoleIds();
        return roleIds.includes(2);
    });
    
    const [showModal, setShowModal] = useState(false);
    const [calculadoraActiva, setCalculadoraActiva] = useState(null);
    const [c02, setC02] = useState('');
    const [c11, setC11] = useState('');
    const [montoAuto, setMontoAuto] = useState(null);
    const [mostrarResultado, setMostrarResultado] = useState(false);
    const [hasClausula79BisValidatorRole, setHasClausula79BisValidatorRole] = useState(() => {
        const roleIds = getStoredRoleIds();
        return roleIds.includes(3);
    });

    // ===== EFECTOS =====
    useEffect(() => {
        const matricula = localStorage.getItem('matricula');
        if (!matricula) return;

        const cargarRolesPerfil = async () => {
            try {
                const response = await fetch(apiUrl(`/obtener_perfil.php?matricula=${encodeURIComponent(matricula)}`));
                const data = await response.json();

                if (response.ok && data.success && data.usuario) {
                    const roleIds = data.usuario?.roleIds || [];
                    localStorage.setItem('roleIds', JSON.stringify(roleIds));
                    localStorage.setItem('roleNames', JSON.stringify(data.usuario?.roleNames || []));
                    
                    setHasAutoValidatorRole(roleIds.includes(1));
                    setHasNewsValidatorRole(roleIds.includes(2));
                    setHasClausula79BisValidatorRole(roleIds.includes(3));
                    
                    if (data.usuario.idSeccion) {
                        let seccionGuardada = null;
                        try {
                            seccionGuardada = JSON.parse(localStorage.getItem('seccionUsuario'));
                        } catch {
                            seccionGuardada = null;
                        }
                        
                        const assets = getSectionAssets(data.usuario.idSeccion);
                        const seccionData = {
                            id: data.usuario.idSeccion,
                            romano: data.usuario.seccion_romano || seccionGuardada?.romano || 'N/A',
                            nombre: data.usuario.seccion_nombre || seccionGuardada?.nombre || 'Sin sección',
                            slogan: data.usuario.seccion_slogan || seccionGuardada?.slogan || null,
                            direccion: data.usuario.seccion_direccion || seccionGuardada?.direccion || null,
                            color: data.usuario.seccion_color || seccionGuardada?.color || '#3EAEF4',
                            logo: data.usuario.seccion_logo || assets.logo,
                            banner: data.usuario.seccion_banner || assets.banner,
                            redes: data.usuario.redes_sociales ?? seccionGuardada?.redes ?? seccionGuardada?.redes_sociales ?? {}
                        };
                        localStorage.setItem('seccionUsuario', JSON.stringify(seccionData));
                        setSeccionUsuario(seccionData);
                    }
                }
            } catch (error) {
                console.error('Error cargando roles del perfil:', error);
            }
        };

        cargarRolesPerfil();
    }, []);

    useEffect(() => {
        const cargarNoticias = async () => {
            try {
                const response = await fetch(apiUrl('/listar_noticias.php?includeHidden=0'));
                const data = await response.json();
                if (data.success && data.noticias) {
                    setNoticias(data.noticias.slice(0, 3));
                }
            } catch (error) {
                console.error('Error cargando noticias:', error);
            } finally {
                setLoadingNoticias(false);
            }
        };
        cargarNoticias();
    }, []);

    // ===== FUNCIONES =====
    const formatter = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2
    });

    const calcularAuto = () => {
        const c02Num = parseFloat(c02);
        const c11Num = parseFloat(c11);
        
        if (isNaN(c02Num) || isNaN(c11Num)) {
            alert('Por favor ingresa ambos conceptos (002 y 011).');
            return;
        }
        
        const sumaQuincenal = c02Num + c11Num;
        const mensualBase = sumaQuincenal * 2;
        const mensualIntegrado = mensualBase * 1.20;
        const monto = mensualIntegrado * 24;
        setMontoAuto(monto);
        setMostrarResultado(true);
    };

    const abrirModal = () => {
        setC02('');
        setC11('');
        setMostrarResultado(false);
        setMontoAuto(null);
        setShowModal(true);
    };

    const abrirCalculadora = (tipo) => {
        setCalculadoraActiva(tipo);
        setShowModal(true);
    };

    const cerrarCalculadora = () => {
        setShowModal(false);
        setCalculadoraActiva(null);
    };

    const renderCalculadora = () => {
        switch(calculadoraActiva) {
            case 'hipotecario': return <CreditoHipotecario />;
            case 'mediano-plazo': return <CreditoMedianoPlazo />;
            case 'auto': return <PrestamoAuto />;
            case 'fondo-ahorro': return <FondoAhorro />;
            case 'aguinaldo': return <Aguinaldo />;
            case 'clausula97': return <Clausula97 />;
            case 'horas-extras': return <HorasExtras />;
            case 'vacaciones': return <Vacaciones />;
            default: return null;
        }
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http://') || path.startsWith('https://')) {
            return path;
        }
        if (path.startsWith('/api')) {
            return apiUrl(path.replace('/api', ''));
        }
        return apiUrl(path);
    };

    const rolesDisponibles = [];
    if (hasAutoValidatorRole) rolesDisponibles.push('Validador Auto');
    if (hasNewsValidatorRole) rolesDisponibles.push('Editor Noticias');
    if (hasAutoValidatorRole) rolesDisponibles.push('Validador Clausula 79Bis');

    // ===== CALCULADORAS =====
    const calculadoras = [
        { id: 'hipotecario', icon: <FaBuilding />, titulo: 'Crédito Hipotecario', descripcion: 'Calcula tu crédito para vivienda', color: '#4A90D9', bg: 'linear-gradient(135deg, #4A90D9 0%, #357ABD 100%)' },
        { id: 'mediano-plazo', icon: <FaHouseUser />, titulo: 'Crédito a Mediano Plazo', descripcion: 'Financiamiento para remodelación', color: '#5B86E5', bg: 'linear-gradient(135deg, #5B86E5 0%, #36D1DC 100%)' },
        { id: 'auto', icon: <FaCar />, titulo: 'Préstamo de Auto', descripcion: 'Financiamiento para tu vehículo', color: '#F2994A', bg: 'linear-gradient(135deg, #F2994A 0%, #F2C94C 100%)' },
        { id: 'fondo-ahorro', icon: <FaPiggyBank />, titulo: 'Fondo de Ahorro', descripcion: '2do de Julio - Calcula tu ahorro anual', color: '#27AE60', bg: 'linear-gradient(135deg, #27AE60 0%, #2ECC71 100%)' },
        { id: 'aguinaldo', icon: <FaGift />, titulo: 'Aguinaldo', descripcion: 'Calcula el monto de tu aguinaldo', color: '#E74C3C', bg: 'linear-gradient(135deg, #E74C3C 0%, #F39C12 100%)' },
        { id: 'clausula97', icon: <FaFileContract />, titulo: 'Cláusula 97 CCT', descripcion: 'Préstamo de hasta 4 meses de sueldo', color: '#8E44AD', bg: 'linear-gradient(135deg, #8E44AD 0%, #9B59B6 100%)' },
        { id: 'horas-extras', icon: <FaClock />, titulo: 'Horas Extras', descripcion: 'Calcula el pago de horas extras', color: '#E67E22', bg: 'linear-gradient(135deg, #E67E22 0%, #F39C12 100%)' }
        // { id: 'vacaciones', icon: <FaUmbrellaBeach />, titulo: 'Vacaciones', descripcion: 'Calcula tu pago de vacaciones y prima', color: '#1ABC9C', bg: 'linear-gradient(135deg, #1ABC9C 0%, #16A085 100%)' },
    ];

    // ===== RECURSOS =====
    const recursos = [
        { 
            id: 'tarjeton-activo', 
            icon: <FaFilePdf />, 
            titulo: 'Tarjetón Activo', 
            descripcion: 'Descarga tu tarjetón de pago', 
            link: 'https://rh.imss.gob.mx/Personal/TarjetonDigital/',
            externo: true
        },
        { 
            id: 'tarjeton-jubilado', 
            icon: <FaFilePdf />, 
            titulo: 'Tarjetón Jubilado', 
            descripcion: 'Descarga tu tarjetón de pago', 
            link: 'https://rh.imss.gob.mx/Personal/tarjetonjubilados/(S(nhc3ujvy5iov2kxgmtpzwbe4))/default.aspx',
            externo: true
        },
        { 
            id: 'contrato-colectivo', 
            icon: <FaFileAlt />, 
            titulo: 'Contrato Colectivo', 
            descripcion: 'Descarga el CCT completo', 
            link: '/recursos/Cct.pdf',
            externo: true
        },
        { 
            id: 'estatutos', 
            icon: <FaFileAlt />, 
            titulo: 'Estatutos SNTSS', 
            descripcion: 'Descarga los Estatutos del SNTSS', 
            link: '/recursos/Estatutos.pdf',
            externo: true
        },
        { 
            id: 'conceptos', 
            icon: <FaFileContract />, 
            titulo: 'Conceptos del Tarjetón', 
            descripcion: 'Explicación de los conceptos del tarjetón', 
            link: '/conceptos',
            externo: false
        },
    ];

    // ===== RENDER DE PESTAÑA CEN =====
    const renderTabCEN = () => (
        <div className="dashboard-tab-content">
            <div className="dashboard-section-header">
                <div className="dashboard-section-icon-box" style={{ background: 'rgba(231, 76, 60, 0.12)', color: '#E74C3C' }}>
                    <FaNewspaper />
                </div>
                <h3 className="dashboard-section-heading">Noticias del Comité Ejecutivo Nacional</h3>
                <div className="dashboard-section-emerald-bar" style={{ background: '#E74C3C' }}></div>
                <div className="dashboard-section-dot-matrix dot-matrix"></div>
            </div>
            
            <div className="dashboard-cen-aviso ui-shadow">
                <FaInfoCircle className="dashboard-cen-aviso-icon" />
                <div>
                    <strong className="dashboard-cen-aviso-title">Información oficial del CEN</strong>
                    <p className="dashboard-cen-aviso-text">
                        Aquí encontrarás comunicados, convocatorias y noticias de carácter nacional emitidas por el Comité Ejecutivo Nacional.
                    </p>
                </div>
            </div>

            <div className="dashboard-grid-noticias-cen">
                <div className="dashboard-card-noticia-cen">
                    <div className="dashboard-card-noticia-cen-icon">
                        <FaRocket style={{ fontSize: '2.5rem', color: '#3EAEF4' }} />
                    </div>
                    <h3 className="dashboard-card-noticia-cen-title">Próximos eventos nacionales</h3>
                    <p className="dashboard-card-noticia-cen-desc">
                        Mantente al tanto de los eventos y reuniones nacionales del SNTSS.
                    </p>
                    <div className="dashboard-card-noticia-cen-meta">
                        <span>📅 Fecha por definir</span>
                    </div>
                </div>

                <div className="dashboard-card-noticia-cen">
                    <div className="dashboard-card-noticia-cen-icon">
                        <FaShieldAlt style={{ fontSize: '2.5rem', color: '#E74C3C' }} />
                    </div>
                    <h3 className="dashboard-card-noticia-cen-title">Comunicados oficiales</h3>
                    <p className="dashboard-card-noticia-cen-desc">
                        Consulta los comunicados y circulares emitidos por la dirigencia nacional.
                    </p>
                    <div className="dashboard-card-noticia-cen-meta">
                        <span>📄 Última actualización: 2026</span>
                    </div>
                </div>

                <div className="dashboard-card-noticia-cen">
                    <div className="dashboard-card-noticia-cen-icon">
                        <FaFileContract style={{ fontSize: '2.5rem', color: '#27AE60' }} />
                    </div>
                    <h3 className="dashboard-card-noticia-cen-title">Convocatorias nacionales</h3>
                    <p className="dashboard-card-noticia-cen-desc">
                        Participa en las convocatorias y procesos a nivel nacional.
                    </p>
                    <div className="dashboard-card-noticia-cen-meta">
                        <span>📌 Próximamente</span>
                    </div>
                </div>
            </div>

            {!isLoggedIn && (
                <div className="dashboard-cen-login-message">
                    <p className="dashboard-cen-login-text">
                        🔒 <Link to="/login" className="dashboard-cen-login-link">Inicia sesión</Link> para ver las convocatorias y noticias de tu sección.
                    </p>
                </div>
            )}
        </div>
    );

    // ===== RENDER DE PESTAÑA CALCULADORAS =====
    const renderTabCalculadoras = () => (
        <div className="dashboard-tab-content">
            {/* ✅ NUEVA CARD: CHATBOT DELEGADO VIRTUAL */}
            <div className="dashboard-chatbot-card ui-shadow ui-shadow-hover">
                <div className="dashboard-chatbot-card-dots dot-matrix"></div>
                <div className="dashboard-chatbot-card-content">
                    <div className="dashboard-chatbot-card-icon-wrapper">
                        <div className="dashboard-chatbot-card-icon">
                            <span role="img" aria-label="robot">🤖</span>
                        </div>
                    </div>
                    <div className="dashboard-chatbot-card-text">
                        <h3 className="dashboard-chatbot-card-title">Dele-Bot SNTSS</h3>
                        <p className="dashboard-chatbot-card-desc">
                            Consulta los Estatutos del Sindicato de forma rápida e inteligente. 
                            Resuelve tus dudas sobre derechos, obligaciones y estructura sindical.
                        </p>
                        <div className="dashboard-chatbot-card-tags">
                            <span className="dashboard-chatbot-tag">📜 Estatutos</span>
                            <span className="dashboard-chatbot-tag">⚖️ Derechos</span>
                            <span className="dashboard-chatbot-tag">🏛️ Estructura</span>
                        </div>
                    </div>
                    <Link to="/chatbot" className="dashboard-chatbot-card-btn">
                        <span>Hablar con el Delegado</span>
                        <FaArrowRight />
                    </Link>
                </div>
            </div>

            {/* Encabezado Calculadoras */}
            <div className="dashboard-section-header">
                <div className="dashboard-section-icon-box">
                    <FaCalculator />
                </div>
                <h3 className="dashboard-section-heading">Calculadoras Financieras</h3>
                <div className="dashboard-section-emerald-bar"></div>
                <div className="dashboard-section-dot-matrix dot-matrix"></div>
            </div>
            
            {/* Grid de Calculadoras */}
            <div className="dashboard-grid-calculadoras">
                {calculadoras.map((calc) => (
                    <div 
                        key={calc.id}
                        className="dashboard-card-calc ui-shadow ui-shadow-hover"
                        onClick={() => abrirCalculadora(calc.id)}
                    >
                        <div className="dashboard-card-calc-dots dot-matrix"></div>
                        <div className="dashboard-card-calc-icon-circle" style={{ background: calc.bg }}>
                            {calc.icon}
                        </div>
                        <h4 className="dashboard-card-calc-title">{calc.titulo}</h4>
                        <p className="dashboard-card-calc-desc">{calc.descripcion}</p>
                        <button className="dashboard-card-calc-arrow-btn" aria-label={`Abrir ${calc.titulo}`}>
                            <FaArrowRight size={11} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Encabezado Recursos */}
            <div className="dashboard-section-header" style={{ marginTop: '3.5rem' }}>
                <div className="dashboard-section-icon-box" style={{ background: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)' }}>
                    <FaFilePdf />
                </div>
                <h3 className="dashboard-section-heading">Recursos y Documentos</h3>
                <div className="dashboard-section-emerald-bar"></div>
                <div className="dashboard-section-dot-matrix dot-matrix"></div>
            </div>

            {/* Grid de Recursos */}
            <div className="dashboard-grid-calculadoras">
                {recursos.map((recurso) => (
                    <a
                        key={recurso.id}
                        href={recurso.link}
                        target={recurso.externo ? '_blank' : '_self'}
                        rel={recurso.externo ? 'noopener noreferrer' : ''}
                        className="dashboard-card-calc dashboard-card-recurso ui-shadow ui-shadow-hover"
                    >
                        <div className="dashboard-card-calc-dots dot-matrix"></div>
                        <div className="dashboard-card-recurso-icon-circle">
                            {recurso.icon}
                        </div>
                        <h4 className="dashboard-card-calc-title">{recurso.titulo}</h4>
                        <p className="dashboard-card-calc-desc">{recurso.descripcion}</p>
                        <span className="dashboard-card-calc-arrow-btn">
                            {recurso.externo ? <FaExternalLinkAlt size={10} /> : <FaArrowRight size={11} />}
                        </span>
                    </a>
                ))}
            </div>
        </div>
    );

    // ===== RENDER DE PESTAÑA PROCESO (SECCIÓN) =====
    const renderTabProceso = () => (
        <div className="dashboard-tab-content">
            <div className="dashboard-grid-2cols">
                <div className="dashboard-col-noticias">
                    <div className="dashboard-card-noticias ui-shadow">
                        <div className="dashboard-card-title-noticias">
                            <FaNewspaper style={{ color: '#486DAA' }} /> Noticias y Avisos de tu Sección
                        </div>
                        <div className="dashboard-card-body">
                            {loadingNoticias ? (
                                <p className="dashboard-text-muted">Cargando noticias...</p>
                            ) : noticias.length > 0 ? (
                                noticias.map((noticia, idx) => (
                                    <div key={idx} className="dashboard-noticia-card">
                                        {noticia.imagen && (
                                            <img 
                                                src={getImageUrl(noticia.imagen)} 
                                                alt={noticia.titulo} 
                                                className="dashboard-noticia-imagen"
                                                onError={(e) => { 
                                                    e.target.style.display = 'none'; 
                                                }}
                                            />
                                        )}
                                        <div className="dashboard-noticia-titulo">{noticia.titulo}</div>
                                        <div className="dashboard-noticia-resumen">
                                            {noticia.resumen?.substring(0, 100)}...
                                        </div>
                                        <div className="dashboard-noticia-meta">
                                            <span><FaCalendarAlt /> {noticia.fecha}</span>
                                            <span><FaEye /> {noticia.vistas} vistas</span>
                                            {noticia.fijada && <span className="dashboard-noticia-badge">📌 Fijada</span>}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="dashboard-text-muted">No hay noticias disponibles para tu sección.</p>
                            )}
                        </div>
                        <div className="dashboard-card-footer-noticias">
                            <FaNewspaper style={{ color: '#486DAA' }} /> Las puedes visualizar en la sección de noticias y avisos
                        </div>
                    </div>
                </div>

                <div className="dashboard-col-sidebar">
                    <div className="dashboard-sidebar ui-shadow">
                        <div className="dashboard-sidebar-title">
                            <FaInfoCircle style={{ color: '#486DAA' }} /> Convocatorias y Procesos de tu Sección
                        </div>
                        <p className="dashboard-sidebar-desc">
                            En este espacio podrás consultar y descargar las convocatorias y los requisitos para participar en los procesos de tu sección.
                        </p>

                        <div className="dashboard-convocatorias-list">
                            {[
                                { titulo: 'Convocatoria al crédito hipotecario 2026-1', descripcion: 'Próximamente • Fecha por definir' },
                                { titulo: 'Convocatoria al festejo de la clausula 78, Personal de enfermería 2026-2', descripcion: 'Próximamente • Fecha por definir' },
                                { titulo: 'Registro para RIFA DE PROPUESTAS 2026', descripcion: 'Próximamente • Fecha por definir' },
                            ].map((item, index) => (
                                <div key={index} className="dashboard-convocatoria-item">
                                    <div>
                                        <div className="dashboard-convocatoria-titulo">{item.titulo}</div>
                                        <div className="dashboard-convocatoria-desc">{item.descripcion}</div>
                                    </div>
                                    <span className="dashboard-convocatoria-badge">🚀 Próximo</span>
                                </div>
                            ))}
                        </div>

                        <div className="dashboard-convocatoria-contacto">
                            <span className="dashboard-convocatoria-contacto-text">
                                🔔 <Link to="/contacto" className="dashboard-convocatoria-contacto-link">Contáctanos</Link> para más información
                            </span>
                        </div>

                        <div className="dashboard-sidebar-title" style={{ marginTop: '1.5rem' }}>
                            <FaInfoCircle style={{ color: '#486DAA' }} /> ¿Cómo participar?
                        </div>
                        <ul className="dashboard-lista-reglas">
                            <li className="dashboard-lista-reglas-item">
                                <FaShieldAlt style={{ color: '#10B981' }} /> Ser agremiado de base.
                            </li>
                            <li className="dashboard-lista-reglas-item">
                                <FaChartLine style={{ color: '#10B981' }} /> Se evalua la antiguedad segun el proceso.
                            </li>
                            <li className="dashboard-lista-reglas-item">
                                <FaGift style={{ color: '#10B981' }} /> Inscribirse en las rifas.
                            </li>
                        </ul>
                        
                        {!isLoggedIn ? (
                            <div className="dashboard-beneficios-box">
                                <p className="dashboard-beneficios-title">✨ Beneficios exclusivos ✨</p>
                                <p className="dashboard-beneficios-text">Préstamos, rifas, sorteos y más</p>
                                <Link to="/registro" className="dashboard-hero-btn" style={{ marginTop: '0.5rem', fontSize: '0.85rem', padding: '0.5rem 1.5rem' }}>
                                    Regístrate aquí
                                </Link>
                            </div>
                        ) : (
                            <div style={{ marginTop: '1rem' }}>
                                <Link to="/registro-credito" className="dashboard-hero-btn">
                                    Solicitar crédito
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="dashboard-action-grid" style={{ marginTop: '2rem' }}>
                <Link to="/registro-auto" className="dashboard-action-card ui-shadow ui-shadow-hover">
                    <div className="dashboard-action-card-icon" style={{ color: '#486DAA' }}><FaCar /></div>
                    <h3 className="dashboard-action-card-title">🚗 Preregistro a la rifa de auto</h3>
                    <p className="dashboard-action-card-description">Participa en la rifa para obtener un crédito automotriz.</p>
                </Link>

                <Link to="/noticias" className="dashboard-action-card ui-shadow ui-shadow-hover">
                    <div className="dashboard-action-card-icon" style={{ color: '#5B86E5' }}><FaNewspaper /></div>
                    <h3 className="dashboard-action-card-title">📰 Noticias y avisos</h3>
                    <p className="dashboard-action-card-description">Mantente informado con las últimas noticias.</p>
                </Link>

                <Link to="/clausula79bis" className="dashboard-action-card ui-shadow ui-shadow-hover">
                    <div className="dashboard-action-card-icon" style={{ color: '#8E44AD' }}><FaGift /></div>
                    <h3 className="dashboard-action-card-title">🎉 Cláusula 79Bis</h3>
                    <p className="dashboard-action-card-description">Registro para el festejo de Intendencia y Limpieza.</p>
                </Link>

                {hasAutoValidatorRole && (
                    <Link to="/validador-auto" className="dashboard-action-card ui-shadow ui-shadow-hover" style={{ borderColor: '#FFC107' }}>
                        <div className="dashboard-action-card-icon" style={{ color: '#FFC107' }}><FaCheckCircle /></div>
                        <h3 className="dashboard-action-card-title">🔍 Validador Auto</h3>
                        <p className="dashboard-action-card-description">Gestiona solicitudes de crédito.</p>
                    </Link>
                )}

                {hasNewsValidatorRole && (
                    <Link to="/noticias/crear" className="dashboard-action-card ui-shadow ui-shadow-hover" style={{ borderColor: '#28a745' }}>
                        <div className="dashboard-action-card-icon" style={{ color: '#28a745' }}><FaNewspaper /></div>
                        <h3 className="dashboard-action-card-title">✍️ Crear Noticia</h3>
                        <p className="dashboard-action-card-description">Publica nuevas noticias.</p>
                    </Link>
                )}

                {hasClausula79BisValidatorRole && (
                    <>
                        <Link to="/clausula79bis/validador" className="dashboard-action-card ui-shadow ui-shadow-hover" style={{ borderColor: '#8E44AD' }}>
                            <div className="dashboard-action-card-icon" style={{ color: '#8E44AD' }}><FaShieldAlt /></div>
                            <h3 className="dashboard-action-card-title">🔍 Validador 79Bis</h3>
                            <p className="dashboard-action-card-description">Gestiona los registros del festejo.</p>
                        </Link>

                        <Link to="/clausula79bis/entrada" className="dashboard-action-card ui-shadow ui-shadow-hover" style={{ borderColor: '#3EAEF4' }}>
                            <div className="dashboard-action-card-icon" style={{ color: '#3EAEF4' }}><FaQrcode /></div>
                            <h3 className="dashboard-action-card-title">🎟️ Entrada 79Bis</h3>
                            <p className="dashboard-action-card-description">Control de asistencia del evento.</p>
                        </Link>

                        <Link to="/clausula79bis/estadisticas" className="dashboard-action-card ui-shadow ui-shadow-hover" style={{ borderColor: '#28a745' }}>
                            <div className="dashboard-action-card-icon" style={{ color: '#28a745' }}><FaChartPie /></div>
                            <h3 className="dashboard-action-card-title">📊 Estadísticas 79Bis</h3>
                            <p className="dashboard-action-card-description">Dashboard del evento con gráficas.</p>
                        </Link>
                    </>
                )}
            </div>
        </div>
    );

    // ✅ Determinar la URL del banner según la sesión
    const getBannerUrl = () => {
        if (seccionUsuario?.banner) {
            return seccionUsuario.banner;
        }
        return '/images/seccionesBanner/bannerD.jpg';
    };

    const getBannerTitle = () => {
        if (seccionUsuario?.romano) {
            return `SNTSS Sección ${seccionUsuario.romano}`;
        }
        return 'SNTSS - CEN';
    };

    const getBannerSubtitle = () => {
        if (seccionUsuario?.nombre) {
            return `"${seccionUsuario.nombre}"`;
        }
        return '"Todos Juntos, Todos Fuertes"';
    };

    const getBannerColor = () => {
        return seccionUsuario?.color || '#3EAEF4';
    };

    return (
        <div className="dashboard-wrapper">
            {/* ===== BANNER TOP (2 CARDS: INFORMACIÓN + IMAGEN SECCIÓN) ===== */}
            <section className="dashboard-top-grid">
                {/* Card Izquierda: Ingresar al Portal / Perfil */}
                <div className="dashboard-top-card-info ui-shadow">
                    <div className="dashboard-top-card-dots dot-matrix"></div>
                    
                    <div className="dashboard-top-card-header-block">
                        {/* <span className="dashboard-top-badge">
                            {isLoggedIn && seccionUsuario ? `Sección ${seccionUsuario.romano || ''}` : 'Sección Sindical'}
                        </span> */}
                        <h2 className="dashboard-top-title">
                            {isLoggedIn && seccionUsuario?.romano ? `SNTSS Sección ${seccionUsuario.romano}` : 'SNTSS'}
                        </h2>
                        <p className="dashboard-top-subtitle">
                            {isLoggedIn ? (seccionUsuario?.slogan ? `"${seccionUsuario.slogan}"` : 'Comité Ejecutivo Seccional al Servicio de los trabajadores') : 'Comité Ejecutivo Nacional al Servicio de los trabajadores'}
                        </p>
                        
                        {isLoggedIn && (
                            <div className="dashboard-top-user-greeting">
                                <span className="dashboard-top-user-name">
                                    <FaCheckCircle style={{ color: '#10B981', marginRight: '5px' }} />
                                    ¡Hola, <strong>{userName}</strong>!
                                </span>
                                {rolesDisponibles.length > 0 && (
                                    <div className="dashboard-top-roles-list">
                                        {rolesDisponibles.map((rol, idx) => (
                                            <span key={idx} className="dashboard-top-badge-rol">
                                                🛡️ {rol}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="dashboard-top-card-action">
                        {isLoggedIn ? (
                            <Link to="/perfil" className="dashboard-top-btn-primary">
                                <FaUser size={12} />
                                <span>Mi Perfil</span>
                            </Link>
                        ) : (
                            <Link to="/login" className="dashboard-top-btn-primary">
                                <FaSignInAlt size={12} />
                                <span>Ingresar al Portal</span>
                            </Link>
                        )}
                    </div>

                    {/* Matriz decorativa de puntitos en esquina */}
                    <div className="dashboard-top-card-dots-matrix">
                        <span className="dot-blue"></span>
                        <span className="dot-blue"></span>
                        <span className="dot-blue"></span>
                        <span className="dot-blue"></span>
                        <span className="dot-emerald"></span>
                        <span className="dot-emerald"></span>
                        <span className="dot-emerald"></span>
                        <span className="dot-emerald"></span>
                    </div>
                </div>

                {/* Card Derecha: Imagen Banner Dinámico */}
                <div className="dashboard-top-card-banner ui-shadow">
                    <img 
                        src={getBannerUrl()}
                        alt={getBannerTitle()}
                        className="dashboard-top-banner-img"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `
                                <div class="dashboard-banner-fallback" style="border-bottom: 4px solid ${getBannerColor()}">
                                    <div style="font-size: 3.5rem;">🏛️</div>
                                    <h2 style="color: #486DAA; margin: 0.3rem 0 0 0; font-size: 1.3rem;">
                                        ${getBannerTitle()}
                                    </h2>
                                    <p style="color: #64748B; margin: 0.2rem 0 0 0; font-size: 0.9rem; font-style: italic;">
                                        ${getBannerSubtitle()}
                                    </p>
                                </div>
                            `;
                        }}
                    />
                </div>
            </section>

            {/* ===== SELECTOR CENTRAL (PILLS SECCIÓN 5) ===== */}
            <div className="dashboard-tabs-wrapper">
                <div className="dashboard-tabs-pill-container ui-shadow">
                    <button 
                        className={`dashboard-tab-pill ${tabActiva === 'cen' ? 'dashboard-tab-pill-active' : 'dashboard-tab-pill-inactive'}`}
                        onClick={() => setTabActiva('cen')}
                    >
                        <FaNewspaper /> 
                        <span>Comite Ejecutivo Nacional</span>
                    </button>
                    
                    <button 
                        className={`dashboard-tab-pill ${tabActiva === 'calculadoras' ? 'dashboard-tab-pill-active' : 'dashboard-tab-pill-inactive'}`}
                        onClick={() => setTabActiva('calculadoras')}
                    >
                        <FaCalculator /> 
                        <span>Calculadoras y Herramientas</span>
                    </button>
                    
                    <button 
                        className={`dashboard-tab-pill ${tabActiva === 'proceso' ? 'dashboard-tab-pill-active' : 'dashboard-tab-pill-inactive'}`}
                        onClick={() => {
                            if (!isLoggedIn) {
                                window.location.href = '/login';
                                return;
                            }
                            setTabActiva('proceso');
                        }}
                    >
                        <FaClipboardList /> 
                        <span>Convocatorias y Noticias de tu sección</span>
                    </button>
                </div>
            </div>

            {/* ===== CONTENIDO DE LAS TABS ===== */}
            {tabActiva === 'cen' ? renderTabCEN() : 
             tabActiva === 'calculadoras' ? renderTabCalculadoras() : 
             renderTabProceso()}

            {/* ===== MODAL ===== */}
            <Modal show={showModal} onHide={cerrarCalculadora} centered size="lg" className="dashboard-modal-custom">
                <Modal.Header closeButton className="dashboard-modal-header">
                    <Modal.Title className="dashboard-modal-title">
                        <FaCalculator style={{ marginRight: '10px', color: '#486DAA' }} /> 
                        {calculadoraActiva && calculadoras.find(c => c.id === calculadoraActiva)?.titulo || 'Calculadora'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="dashboard-modal-body">
                    {renderCalculadora()}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Dashboard;