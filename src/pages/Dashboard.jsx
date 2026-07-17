import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaCar, FaNewspaper, FaInfoCircle, FaCalculator, FaSignInAlt, 
    FaGift, FaShieldAlt, FaChartLine, FaCheckCircle, FaUser,
    FaThumbtack, FaEye, FaCalendarAlt, FaTools, FaStar, FaRocket,
    FaBuilding, FaHouseUser, FaPiggyBank, FaFileContract, FaClock,
    FaUmbrellaBeach, FaClipboardList, FaFilePdf, FaExternalLinkAlt, FaFileAlt,
    FaQrcode, FaChartPie  // ← AGREGAR ESTOS
} from 'react-icons/fa';
import { apiUrl } from '../config';
import { Modal } from 'react-bootstrap';
import { hasStoredRole, getStoredRoleIds } from '../utils/roles';

// ===== IMPORTAR COMPONENTES DE CALCULADORAS =====
import CreditoHipotecario from '../components/calculadoras/CreditoHipotecario';
import CreditoMedianoPlazo from '../components/calculadoras/CreditoMedianoPlazo';
import PrestamoAuto from '../components/calculadoras/PrestamoAuto';
import FondoAhorro from '../components/calculadoras/FondoAhorro';
import Aguinaldo from '../components/calculadoras/Aguinaldo';
import Clausula97 from '../components/calculadoras/Clausula97';
import HorasExtras from '../components/calculadoras/HorasExtras';
//import Vacaciones from '../components/calculadoras/Vacaciones';

const Dashboard = () => {
    // ===== ESTADOS =====
    const [isLoggedIn] = useState(() => Boolean(localStorage.getItem('matricula')));
    const [userName] = useState(() => localStorage.getItem('nombre') || localStorage.getItem('matricula') || '');
    const [noticias, setNoticias] = useState([]);
    const [loadingNoticias, setLoadingNoticias] = useState(true);
    const [tabActiva, setTabActiva] = useState('calculadoras');
    
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
        return roleIds.includes(3); // ID 3 = clausula79bis
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
                    setHasClausula79BisValidatorRole(roleIds.includes(3)); // ← AGREGAR
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
            //case 'vacaciones': return <Vacaciones />;
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

    // ===== CALCULADORAS =====
    const calculadoras = [
        { id: 'hipotecario', icon: <FaBuilding />, titulo: 'Crédito Hipotecario', descripcion: 'Calcula tu crédito para vivienda', color: '#4A90D9', bg: 'linear-gradient(135deg, #4A90D9 0%, #357ABD 100%)' },
        { id: 'mediano-plazo', icon: <FaHouseUser />, titulo: 'Crédito a Mediano Plazo', descripcion: 'Financiamiento para remodelación', color: '#5B86E5', bg: 'linear-gradient(135deg, #5B86E5 0%, #36D1DC 100%)' },
        { id: 'auto', icon: <FaCar />, titulo: 'Préstamo de Auto', descripcion: 'Financiamiento para tu vehículo', color: '#F2994A', bg: 'linear-gradient(135deg, #F2994A 0%, #F2C94C 100%)' },
        { id: 'fondo-ahorro', icon: <FaPiggyBank />, titulo: 'Fondo de Ahorro', descripcion: '2do de Julio - Calcula tu ahorro anual', color: '#27AE60', bg: 'linear-gradient(135deg, #27AE60 0%, #2ECC71 100%)' },
        { id: 'aguinaldo', icon: <FaGift />, titulo: 'Aguinaldo', descripcion: 'Calcula el monto de tu aguinaldo', color: '#E74C3C', bg: 'linear-gradient(135deg, #E74C3C 0%, #F39C12 100%)' },
        { id: 'clausula97', icon: <FaFileContract />, titulo: 'Cláusula 97 CCT', descripcion: 'Préstamo de hasta 4 meses de sueldo', color: '#8E44AD', bg: 'linear-gradient(135deg, #8E44AD 0%, #9B59B6 100%)' },
        { id: 'horas-extras', icon: <FaClock />, titulo: 'Horas Extras', descripcion: 'Calcula el pago de horas extras', color: '#E67E22', bg: 'linear-gradient(135deg, #E67E22 0%, #F39C12 100%)' },
        //{ id: 'vacaciones', icon: <FaUmbrellaBeach />, titulo: 'Pago de Vacaciones', descripcion: 'Calcula el pago de tus vacaciones', color: '#1ABC9C', bg: 'linear-gradient(135deg, #1ABC9C 0%, #16A085 100%)' },
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
        // { 
        //     id: 'calendario', 
        //     icon: <FaCalendarAlt />, 
        //     titulo: 'Calendario de Pagos', 
        //     descripcion: 'Fechas de pago quincenal', 
        //     link: '/calendario',
        //     externo: false
        // },
    ];

    // ===== RENDER DE PESTAÑAS =====
    const renderTabCalculadoras = () => (
        <div>
            <div style={styles.sectionTitle}>
                <FaCalculator style={{ color: '#3EAEF4' }} /> Calculadoras
                <span style={styles.sectionTitleLine} />
            </div>
            <div style={styles.grid}>
                {calculadoras.map((calc) => (
                    <div 
                        key={calc.id}
                        style={styles.card}
                        onClick={() => abrirCalculadora(calc.id)}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                            e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.12)';
                            e.currentTarget.style.borderColor = '#3EAEF4';
                            const glow = e.currentTarget.querySelector('.card-glow');
                            if (glow) glow.style.opacity = '1';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
                            const glow = e.currentTarget.querySelector('.card-glow');
                            if (glow) glow.style.opacity = '0';
                        }}
                    >
                        <div className="card-glow" style={styles.cardGlow} />
                        <div style={{ ...styles.cardIconWrapper, background: calc.bg }}>
                            {calc.icon}
                        </div>
                        <h3 style={styles.cardTitle}>{calc.titulo}</h3>
                        <p style={styles.cardDescription}>{calc.descripcion}</p>
                    </div>
                ))}
            </div>

            <div style={{ ...styles.sectionTitle}}>
                <FaFilePdf style={{ color: '#E74C3C' }} /> Recursos y Documentos
                <span style={styles.sectionTitleLine} />
            </div>
            <div style={styles.grid}>
                {recursos.map((recurso) => (
                    <a
                        key={recurso.id}
                        href={recurso.link}
                        target={recurso.externo ? '_blank' : '_self'}
                        rel={recurso.externo ? 'noopener noreferrer' : ''}
                        style={styles.linkCard}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-6px)';
                            e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,0,0,0.1)';
                            e.currentTarget.style.borderColor = '#3EAEF4';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
                            e.currentTarget.style.borderColor = '#e9ecef';
                        }}
                    >
                        <span style={styles.linkIcon}>{recurso.icon}</span>
                        <h3 style={styles.linkTitle}>{recurso.titulo}</h3>
                        <p style={styles.linkDescription}>{recurso.descripcion}</p>
                        {recurso.externo && (
                            <span style={styles.linkExternal}>
                                <FaExternalLinkAlt /> Abrir en nueva ventana
                            </span>
                        )}
                    </a>
                ))}
            </div>
        </div>
    );

    const renderTabProceso = () => (
    <div>
        {/* ===== GRID RESPONSIVE CON FLEXBOX (Noticias + Sidebar) ===== */}
        <div style={styles.grid2cols}>
            {/* Columna: Noticias */}
            <div style={styles.colNoticias}>
                <div style={styles.cardNoticias}>
                    <div style={styles.cardTitleNoticias}>
                        <FaNewspaper style={{ color: '#3EAEF4' }} /> Noticias y Avisos
                    </div>
                    <div style={styles.cardBody}>
                        {loadingNoticias ? (
                            <p className="text-muted">Cargando noticias...</p>
                        ) : noticias.length > 0 ? (
                            noticias.map((noticia, idx) => (
                                <div key={idx} style={styles.noticiaCard}>
                                    {noticia.imagen && (
                                        <img 
                                            src={getImageUrl(noticia.imagen)} 
                                            alt={noticia.titulo} 
                                            style={{
                                                width: '100%',
                                                height: '140px',
                                                objectFit: 'cover',
                                                borderRadius: '8px',
                                                marginBottom: '0.5rem',
                                                backgroundColor: '#e9ecef',
                                            }}
                                            onError={(e) => { 
                                                e.target.style.display = 'none'; 
                                            }}
                                        />
                                    )}
                                    <div style={styles.noticiaTitulo}>{noticia.titulo}</div>
                                    <div style={styles.noticiaResumen}>
                                        {noticia.resumen?.substring(0, 100)}...
                                    </div>
                                    <div style={styles.noticiaMeta}>
                                        <span><FaCalendarAlt /> {noticia.fecha}</span>
                                        <span><FaEye /> {noticia.vistas} vistas</span>
                                        {noticia.fijada && <span style={styles.noticiaBadge}>📌 Fijada</span>}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted">No hay noticias disponibles.</p>
                        )}
                        {!isLoggedIn && noticias.length > 0 && (
                            <div style={{ marginTop: '0.5rem', color: '#3EAEF4', fontSize: '0.85rem' }}>
                                🔒 Inicia sesión para ver todas las noticias
                            </div>
                        )}
                    </div>
                    <div style={styles.cardTitleNoticias}>
                        <FaNewspaper style={{ color: '#3EAEF4' }} /> Las puedes visualizar en la sección de noticias y avisos
                    </div>
                </div>
            </div>

            {/* Columna: Sidebar */}
            <div style={{ ...styles.colSidebar}}>
                <div style={styles.sidebar}>
                    <div style={styles.sidebarTitle}>
                        <FaInfoCircle /> Convocatorias y Procesos
                    </div>
                    <p style={{ 
                        fontSize: '0.85rem', 
                        color: '#6c757d', 
                        marginBottom: '1rem',
                        lineHeight: '1.5'
                    }}>
                        En este espacio podrás consultar y descargar las convocatorias y los requisitos para participar en los procesos de tu sección.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {[
                            { titulo: 'Convocatoria al crédito hipotecario 2026-1', descripcion: 'Próximamente • Fecha por definir' },
                            { titulo: 'Convocatoria al festejo de la clausula 78, Personal de enfermería 2026-2', descripcion: 'Próximamente • Fecha por definir' },
                            { titulo: 'Registro para RIFA DE PROPUESTAS 2026', descripcion: 'Próximamente • Fecha por definir' },
                        ].map((item, index) => (
                            <div key={index} style={{
                                backgroundColor: 'rgba(255,255,255,0.8)',
                                borderRadius: '12px',
                                padding: '0.7rem 1rem',
                                border: '1px solid #e9ecef',
                                transition: 'all 0.3s ease',
                                opacity: 0.7,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}>
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '0.85rem', color: '#0A0F1E' }}>
                                        {item.titulo}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#6c757d' }}>
                                        {item.descripcion}
                                    </div>
                                </div>
                                <span style={{
                                    backgroundColor: '#ffc107',
                                    color: '#0A0F1E',
                                    padding: '0.15rem 0.6rem',
                                    borderRadius: '12px',
                                    fontSize: '0.55rem',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                }}>
                                    🚀 Próximo
                                </span>
                            </div>
                        ))}
                    </div>

                    <div style={{
                        marginTop: '0.8rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: 'rgba(62,174,244,0.05)',
                        borderRadius: '12px',
                        border: '1px dashed #3EAEF4',
                        textAlign: 'center',
                    }}>
                        <span style={{ fontSize: '0.7rem', color: '#6c757d' }}>
                            🔔 <Link to="/contacto" style={{ color: '#3EAEF4', fontWeight: '600', textDecoration: 'none' }}>Contáctanos</Link> para más información
                        </span>
                    </div>

                    <div style={styles.sidebarTitle, { marginTop: '1.5rem' }}>
                        <FaInfoCircle /> ¿Cómo participar?
                    </div>
                    <ul style={styles.listaReglas}>
                        <li style={styles.listaReglasItem}>
                            <FaShieldAlt style={{ color: '#3EAEF4' }} /> Ser agremiado de base.
                        </li>
                        <li style={styles.listaReglasItem}>
                            <FaChartLine style={{ color: '#3EAEF4' }} /> Se evalua la antiguedad segun el proceso.
                        </li>
                        <li style={styles.listaReglasItem}>
                            <FaGift style={{ color: '#3EAEF4' }} /> Inscribirse en las rifas.
                        </li>
                    </ul>
                    
                    {!isLoggedIn ? (
                        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'rgba(62,174,244,0.12)', borderRadius: '12px', textAlign: 'center' }}>
                            <p style={{ fontWeight: 'bold', marginBottom: '0.3rem', color: '#0A0F1E' }}>✨ Beneficios exclusivos ✨</p>
                            <p style={{ fontSize: '0.85rem', color: '#6c757d' }}>Préstamos, rifas, sorteos y más</p>
                            <Link to="/registro" style={{ ...styles.heroBtn, marginTop: '0.5rem', fontSize: '0.85rem', padding: '0.5rem 1.5rem' }}>
                                Regístrate aquí
                            </Link>
                        </div>
                    ) : (
                        <div style={{ marginTop: '1rem' }}>
                            <Link to="/registro-credito" style={styles.heroBtn}>
                                Solicitar crédito
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>  

        {/* ===== CARDS DE ACCIÓN (DESPUÉS) ===== */}
        <div style={{ ...styles.actionGrid, marginTop: '2rem' }}>
            {/* ===== CRÉDITO AUTO ===== */}
            <Link to="/registro-auto" style={styles.actionCard}>
                <div style={{ ...styles.actionCardIcon, color: '#4A90D9' }}><FaCar /></div>
                <h3 style={styles.actionCardTitle}>🚗 Preregistro a la rifa de auto</h3>
                <p style={styles.actionCardDescription}>Participa en la rifa para obtener un crédito automotriz.</p>
            </Link>

            {/* ===== NOTICIAS ===== */}
            <Link to="/noticias" style={styles.actionCard}>
                <div style={{ ...styles.actionCardIcon, color: '#5B86E5' }}><FaNewspaper /></div>
                <h3 style={styles.actionCardTitle}>📰 Noticias y avisos</h3>
                <p style={styles.actionCardDescription}>Mantente informado con las últimas noticias.</p>
            </Link>

            {/* ===== CLÁUSULA 79BIS - Registro (Siempre visible) ===== */}
            <Link to="/clausula79bis" style={styles.actionCard}>
                <div style={{ ...styles.actionCardIcon, color: '#8E44AD' }}><FaGift /></div>
                <h3 style={styles.actionCardTitle}>🎉 Cláusula 79Bis</h3>
                <p style={styles.actionCardDescription}>Registro para el festejo de Intendencia y Limpieza.</p>
            </Link>

            {/* ===== VALIDADOR AUTO (solo rol auto) ===== */}
            {hasAutoValidatorRole && (
                <Link to="/validador-auto" style={{ ...styles.actionCard, borderColor: '#FFC107' }}>
                    <div style={{ ...styles.actionCardIcon, color: '#FFC107' }}><FaCheckCircle /></div>
                    <h3 style={styles.actionCardTitle}>🔍 Validador Auto</h3>
                    <p style={styles.actionCardDescription}>Gestiona solicitudes de crédito.</p>
                </Link>
            )}

            {/* ===== CREAR NOTICIA (solo rol noticias) ===== */}
            {hasNewsValidatorRole && (
                <Link to="/noticias/crear" style={{ ...styles.actionCard, borderColor: '#28a745' }}>
                    <div style={{ ...styles.actionCardIcon, color: '#28a745' }}><FaNewspaper /></div>
                    <h3 style={styles.actionCardTitle}>✍️ Crear Noticia</h3>
                    <p style={styles.actionCardDescription}>Publica nuevas noticias.</p>
                </Link>
            )}

            {/* ===== VALIDADOR 79BIS (solo rol clausula79bis) ===== */}
            {hasClausula79BisValidatorRole && (
                <>
                    <Link to="/clausula79bis/validador" style={{ ...styles.actionCard, borderColor: '#8E44AD' }}>
                        <div style={{ ...styles.actionCardIcon, color: '#8E44AD' }}><FaShieldAlt /></div>
                        <h3 style={styles.actionCardTitle}>🔍 Validador 79Bis</h3>
                        <p style={styles.actionCardDescription}>Gestiona los registros del festejo.</p>
                    </Link>

                    {/* ===== ENTRADA 79BIS (solo rol clausula79bis) ===== */}
                    <Link to="/clausula79bis/entrada" style={{ ...styles.actionCard, borderColor: '#3EAEF4' }}>
                        <div style={{ ...styles.actionCardIcon, color: '#3EAEF4' }}><FaQrcode /></div>
                        <h3 style={styles.actionCardTitle}>🎟️ Entrada 79Bis</h3>
                        <p style={styles.actionCardDescription}>Control de asistencia del evento.</p>
                    </Link>

                    {/* ===== ESTADÍSTICAS 79BIS (solo rol clausula79bis) ===== */}
                    <Link to="/clausula79bis/estadisticas" style={{ ...styles.actionCard, borderColor: '#28a745' }}>
                        <div style={{ ...styles.actionCardIcon, color: '#28a745' }}><FaChartPie /></div>
                        <h3 style={styles.actionCardTitle}>📊 Estadísticas 79Bis</h3>
                        <p style={styles.actionCardDescription}>Dashboard del evento con gráficas.</p>
                    </Link>
                </>
            )}
        </div>
    </div>
);

    

    // ===== ESTILOS =====
    const styles = {
        container: {
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '2rem 1.5rem',
            minHeight: 'calc(100vh - 200px)',
            background: '#f0f4f8',
            '@media (max-width: 768px)': {
                padding: '1rem 0.8rem',
            },
        },
        heroSection: {
            background: 'linear-gradient(135deg, #0A0F1E 0%, #1a1f2e 50%, #0A0F1E 100%)',
            borderRadius: '16px',
            padding: '1.2rem 1.5rem',
            marginBottom: '1.5rem',
            borderBottom: '3px solid #3EAEF4',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            position: 'relative',
            overflow: 'hidden',
            '@media (max-width: 768px)': {
                padding: '1rem',
                borderRadius: '12px',
            },
            '@media (max-width: 480px)': {
                padding: '0.8rem',
                marginBottom: '1rem',
            },
        },
        heroGlow: {
            position: 'absolute',
            top: '-30%',
            right: '-10%',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(62,174,244,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
        },
        heroContent: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.8rem',
            position: 'relative',
            zIndex: 2,
            '@media (max-width: 768px)': {
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '0.5rem',
            },
            '@media (max-width: 480px)': {
                gap: '0.3rem',
            },
        },
        heroLeft: {
            flex: 1,
            minWidth: '150px',
        },
        heroRight: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '0.3rem',
            '@media (max-width: 768px)': {
                alignItems: 'flex-start',
                width: '100%',
            },
        },
        heroTitle: {
            fontSize: '1.8rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #fff 30%, #3EAEF4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0,
            letterSpacing: '-0.5px',
            lineHeight: 1.2,
            '@media (max-width: 768px)': {
                fontSize: '1.4rem',
            },
            '@media (max-width: 480px)': {
                fontSize: '1.1rem',
            },
        },
        heroSubtitle: {
            fontSize: '0.85rem',
            color: '#aab',
            margin: '0.1rem 0 0 0',
            '@media (max-width: 768px)': {
                fontSize: '0.75rem',
            },
            '@media (max-width: 480px)': {
                fontSize: '0.7rem',
            },
        },
        heroRoles: {
            display: 'flex',
            gap: '0.3rem',
            flexWrap: 'wrap',
        },
        badgeRol: {
            display: 'inline-block',
            padding: '0.1rem 0.5rem',
            borderRadius: '12px',
            fontSize: '0.6rem',
            fontWeight: 'bold',
            backgroundColor: 'rgba(62,174,244,0.15)',
            color: '#3EAEF4',
            border: '1px solid rgba(62,174,244,0.2)',
            '@media (max-width: 480px)': {
                fontSize: '0.55rem',
                padding: '0.05rem 0.4rem',
            },
        },
        heroBtnContainer: {
            display: 'flex',
            gap: '0.4rem',
            flexWrap: 'wrap',
            '@media (max-width: 480px)': {
                width: '100%',
                gap: '0.3rem',
            },
        },
        heroBtn: {
            backgroundColor: '#3EAEF4',
            color: '#0A0F1E',
            padding: '0.3rem 0.9rem',
            borderRadius: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '0.75rem',
            transition: 'all 0.3s ease',
            border: 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            '@media (max-width: 480px)': {
                fontSize: '0.7rem',
                padding: '0.25rem 0.7rem',
                flex: 1,
                justifyContent: 'center',
            },
        },
        tabsContainer: {
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '2rem',
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '0.5rem',
            border: '1px solid rgba(255,255,255,0.5)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            '@media (max-width: 480px)': {
                flexDirection: 'column',
                gap: '0.3rem',
            },
        },
        tab: (activa) => ({
            flex: 1,
            padding: '0.8rem 1.5rem',
            borderRadius: '12px',
            border: 'none',
            fontSize: '0.95rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            background: activa ? 'linear-gradient(135deg, #3EAEF4, #2d8fd4)' : 'transparent',
            color: activa ? '#0A0F1E' : '#6c757d',
            boxShadow: activa ? '0 4px 16px rgba(62,174,244,0.3)' : 'none',
            '@media (max-width: 480px)': {
                width: '100%',
                padding: '0.6rem 1rem',
                fontSize: '0.85rem',
            },
        }),
        sectionTitle: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#0A0F1E',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            position: 'relative',
        },
        sectionTitleLine: {
            flex: 1,
            height: '2px',
            background: 'linear-gradient(90deg, #3EAEF4, transparent)',
            marginLeft: '1rem',
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem',
        },
        // ===== CARD PARA CALCULADORAS =====
        card: {
            backgroundColor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '1.8rem 1.5rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            cursor: 'pointer',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            border: '1px solid rgba(255,255,255,0.5)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
        },
        cardGlow: {
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(62,174,244,0.05) 0%, transparent 70%)',
            opacity: 0,
            transition: 'opacity 0.4s ease',
            pointerEvents: 'none',
        },
        cardIconWrapper: {
            width: '70px',
            height: '70px',
            margin: '0 auto 1rem',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            color: 'white',
            transition: 'all 0.3s ease',
        },
        cardTitle: {
            fontSize: '1.05rem',
            fontWeight: 'bold',
            marginBottom: '0.3rem',
            color: '#0A0F1E',
        },
        cardDescription: {
            fontSize: '0.85rem',
            color: '#6c757d',
            lineHeight: 1.5,
            margin: 0,
        },
        linkCard: {
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '1.8rem 1.5rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            border: '1px solid #e9ecef',
            textAlign: 'center',
            textDecoration: 'none',
            color: 'inherit',
            display: 'block',
            position: 'relative',
            overflow: 'hidden',
        },
        linkIcon: {
            fontSize: '2.5rem',
            color: '#3EAEF4',
            marginBottom: '0.8rem',
            display: 'block',
        },
        linkTitle: {
            fontSize: '1rem',
            fontWeight: 'bold',
            marginBottom: '0.3rem',
            color: '#0A0F1E',
        },
        linkDescription: {
            fontSize: '0.85rem',
            color: '#6c757d',
            margin: 0,
        },
        linkExternal: {
            color: '#3EAEF4',
            fontSize: '0.7rem',
            marginTop: '0.5rem',
            display: 'inline-block',
        },
        actionGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
            '@media (max-width: 480px)': {
                gridTemplateColumns: '1fr',
                gap: '1rem',
            },
        },
        actionCard: {
            backgroundColor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '1.8rem 1.5rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            textDecoration: 'none',
            color: 'inherit',
            display: 'block',
            border: '1px solid rgba(255,255,255,0.5)',
            position: 'relative',
            overflow: 'hidden',
            textAlign: 'center',
            '@media (max-width: 480px)': {
                padding: '1.2rem',
            },
        },
        actionCardIcon: {
            fontSize: '2.5rem',
            marginBottom: '0.8rem',
            display: 'block',
        },
        actionCardTitle: {
            fontSize: '1rem',
            fontWeight: 'bold',
            marginBottom: '0.3rem',
            color: '#0A0F1E',
        },
        actionCardDescription: {
            fontSize: '0.85rem',
            color: '#6c757d',
            margin: 0,
            lineHeight: 1.5,
        },
        // ===== GRID RESPONSIVE CON FLEXBOX =====
        grid2cols: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2rem',
            '@media (max-width: 768px)': {
                gap: '1.5rem',
            },
        },
        colNoticias: {
            flex: '1 1 calc(66% - 1rem)',
            minWidth: '280px',
            order: 1,
            '@media (max-width: 992px)': {
                flex: '1 1 100%',
                order: 1,
            },
        },
        colSidebar: {
            flex: '1 1 calc(34% - 1rem)',
            minWidth: '220px',
            order: 2,
            '@media (max-width: 992px)': {
                flex: '1 1 100%',
                order: 2,
            },
        },
        // ===== CARD PARA NOTICIAS =====
        cardNoticias: {
            backgroundColor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            border: '1px solid rgba(255,255,255,0.5)',
            transition: 'all 0.3s ease',
            height: '100%',
            '@media (max-width: 480px)': {
                padding: '1rem',
            },
        },
        cardTitleNoticias: {
            fontSize: '1.1rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#0A0F1E',
            borderBottom: '2px solid #3EAEF4',
            paddingBottom: '0.5rem',
            '@media (max-width: 480px)': {
                fontSize: '1rem',
            },
        },
        cardBody: {
            color: '#495057',
            lineHeight: '1.6',
        },
        noticiaCard: {
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1rem',
            transition: 'all 0.3s ease',
            border: '1px solid #e9ecef',
            '@media (max-width: 480px)': {
                padding: '0.8rem',
            },
        },
        noticiaTitulo: {
            fontSize: '0.95rem',
            fontWeight: 'bold',
            marginBottom: '0.3rem',
            color: '#0A0F1E',
            '@media (max-width: 480px)': {
                fontSize: '0.85rem',
            },
        },
        noticiaResumen: {
            color: '#6c757d',
            fontSize: '0.8rem',
            marginBottom: '0.3rem',
        },
        noticiaMeta: {
            fontSize: '0.7rem',
            color: '#adb5bd',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem 1rem',
            alignItems: 'center',
        },
        noticiaBadge: {
            backgroundColor: '#3EAEF4',
            color: '#0A0F1E',
            fontSize: '0.6rem',
            fontWeight: 'bold',
            padding: '0.1rem 0.5rem',
            borderRadius: '10px',
        },
        sidebar: {
            backgroundColor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid rgba(255,255,255,0.5)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            height: '100%',
            '@media (max-width: 480px)': {
                padding: '1rem',
            },
        },
        sidebarTitle: {
            fontSize: '1rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            borderBottom: '2px solid #3EAEF4',
            paddingBottom: '0.5rem',
            color: '#0A0F1E',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
        },
        listaReglas: {
            listStyle: 'none',
            padding: 0,
            margin: 0,
        },
        listaReglasItem: {
            padding: '0.5rem 0',
            borderBottom: '1px solid #e9ecef',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
            '@media (max-width: 480px)': {
                fontSize: '0.8rem',
            },
        },
        modalHeader: {
            background: 'linear-gradient(135deg, #282b34, #37383d)',
            color: 'white',
            borderBottom: '3px solid #3EAEF4',
            borderRadius: '16px 16px 0 0',
            padding: '1.5rem 2rem',
        },
        btnCalcular: {
            backgroundColor: '#3EAEF4',
            color: '#0A0F1E',
            border: 'none',
            padding: '0.6rem 1.2rem',
            borderRadius: '10px',
            fontWeight: 'bold',
            width: '100%',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            fontSize: '0.95rem',
        },
        resultadoContainer: {
            backgroundColor: '#e9ecef',
            borderRadius: '12px',
            padding: '1.25rem',
            textAlign: 'center',
            marginTop: '1rem',
            border: '1px solid #dee2e6',
        },
        resultadoMonto: {
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#003c82',
            '@media (max-width: 480px)': {
                fontSize: '1.5rem',
            },
        },
        bannerImage: {
            width: '100%',
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid rgba(255,255,255,0.1)',
            transition: 'all 0.3s ease',
        },
        bannerImageContent: {
            width: '100%',
            height: 'auto',
            display: 'block',
            objectFit: 'cover',
            maxHeight: '220px',
            backgroundColor: '#0A0F1E',
            '@media (max-width: 768px)': {
                maxHeight: '130px',
            },
            '@media (max-width: 480px)': {
                maxHeight: '90px',
            },
        },
    };

    return (
        <div style={styles.container}>
            {/* ===== HERO SECTION ===== */}
            <div style={styles.heroSection}>
                <div style={styles.heroGlow} />
                <div style={styles.heroContent}>
                    <div style={styles.heroLeft}>
                        <h1 style={styles.heroTitle}>
                            {isLoggedIn ? `¡Bienvenido, ${userName}!` : 'SNTSS Sección XXXIII'}
                        </h1>
                        <p style={styles.heroSubtitle}>
                            Comité Ejecutivo Seccional al Servicio de los trabajadores
                        </p>
                    </div>
                    
                    <div style={styles.heroRight}>
                        {isLoggedIn && rolesDisponibles.length > 0 && (
                            <div style={styles.heroRoles}>
                                {rolesDisponibles.map((rol, idx) => (
                                    <span key={idx} style={styles.badgeRol}>
                                        🛡️ {rol}
                                    </span>
                                ))}
                            </div>
                        )}
                        
                        <div style={styles.heroBtnContainer}>
                            {isLoggedIn && (
                                <Link to="/perfil" style={styles.heroBtn}>
                                    <FaUser size={14} /> Perfil
                                </Link>
                            )}
                            {!isLoggedIn && (
                                <Link to="/login" style={styles.heroBtn}>
                                    <FaSignInAlt size={14} /> Ingresar
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== BANNER CON IMAGEN ===== */}
            <div style={styles.bannerImage}>
                <img 
                    src="/recursos/banner-sntss.jpg" 
                    alt="SNTSS Sección XXXIII"
                    style={styles.bannerImageContent}
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                            <div style="
                                width: 100%;
                                height: 240px;
                                background: linear-gradient(135deg, #0A0F1E 0%, #1a1f2e 50%, #0A0F1E 100%);
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                flex-direction: column;
                                border-bottom: 4px solid #3EAEF4;
                                padding: 1rem;
                                text-align: center;
                            ">
                                <div style="font-size: 3.5rem;">🏛️</div>
                                <h2 style="color: white; margin: 0.3rem 0 0 0; font-size: 1.3rem;">SNTSS Sección XXXIII</h2>
                                <p style="color: #3EAEF4; margin: 0.2rem 0 0 0; font-size: 0.9rem; font-style: italic;">
                                    "Unidad y Fortaleza Sindical"
                                </p>
                            </div>
                        `;
                    }}
                />
            </div>

            {/* ===== TABS ===== */}
            <div style={styles.tabsContainer}>
                <button 
                    style={styles.tab(tabActiva === 'calculadoras')}
                    onClick={() => setTabActiva('calculadoras')}
                >
                    <FaCalculator /> Calculadoras y Herramientas
                </button>
                <button 
                    style={styles.tab(tabActiva === 'proceso')}
                    onClick={() => setTabActiva('proceso')}
                >
                    <FaClipboardList /> Proceso y Noticias
                </button>
            </div>

            {/* ===== CONTENIDO DE LAS TABS ===== */}
            {tabActiva === 'calculadoras' ? renderTabCalculadoras() : renderTabProceso()}

            {/* ===== MODAL DE CALCULADORA ===== */}
            <Modal show={showModal} onHide={cerrarCalculadora} centered size="lg">
                <Modal.Header closeButton style={styles.modalHeader}>
                    <Modal.Title>
                        <FaCalculator style={{ marginRight: '10px', color: '#3EAEF4' }} /> 
                        {calculadoraActiva && calculadoras.find(c => c.id === calculadoraActiva)?.titulo || 'Calculadora'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: '2rem', background: '#f8fafc' }}>
                    {renderCalculadora()}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Dashboard;