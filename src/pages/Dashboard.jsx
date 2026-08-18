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

const Dashboard = () => {
    // ===== ESTADOS =====
    const [isLoggedIn] = useState(() => Boolean(localStorage.getItem('matricula')));
    const [userName] = useState(() => localStorage.getItem('nombre') || localStorage.getItem('matricula') || '');
    
    // ✅ OBTENER LA SECCIÓN DEL USUARIO DESDE localStorage
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
                    
                    // ✅ GUARDAR LA SECCIÓN EN localStorage CON TODOS LOS CAMPOS
                    if (data.usuario.idSeccion) {
                        // Recuperar la sección guardada para conservar logo y banner
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
                            slogan: data.usuario.seccion_slogan || seccionGuardada?.slogan || null,  // ✅ AGREGADO
                            direccion: data.usuario.seccion_direccion || seccionGuardada?.direccion || null,  // ✅ AGREGADO
                            color: data.usuario.seccion_color || seccionGuardada?.color || '#2563EB',
                            logo: data.usuario.seccion_logo || assets.logo,
                            banner: data.usuario.seccion_banner || assets.banner,
                            // No borrar las redes recibidas en Login al refrescar
                            // el perfil; obtener_perfil.php también las devuelve.
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
    ];

    // ✅ Degradados y sombras alternados (como el mockup: azul / esmeralda / naranja)
    const iconVariants = [
        { bg: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', shadow: '0 10px 22px -3px rgba(37, 99, 235, 0.38)', arrow: '#2563EB', arrowHover: '#1D4ED8' },
        { bg: 'linear-gradient(135deg, #34D399 0%, #059669 100%)', shadow: '0 10px 22px -3px rgba(16, 185, 129, 0.38)', arrow: '#059669', arrowHover: '#047857' },
        { bg: 'linear-gradient(135deg, #FB923C 0%, #EA580C 100%)', shadow: '0 10px 22px -3px rgba(249, 115, 22, 0.38)', arrow: '#EA580C', arrowHover: '#C2410C' },
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

    // ===== RENDER DE PESTAÑAS =====
    const renderTabCalculadoras = () => (
        <div>
            {/* ===== TÍTULO DE SECCIÓN (como el mockup) ===== */}
            <div style={styles.sectionTitle}>
                <div style={styles.sectionIconBox}>
                    <FaCalculator />
                </div>
                <h2 style={styles.sectionTitleText}>Calculadoras Financieras</h2>
                <div style={styles.sectionTitleLine} />
            </div>

            {/* ===== GRID DE CALCULADORAS (tarjetas glass del mockup) ===== */}
            <div style={styles.grid}>
                {calculadoras.map((calc, idx) => {
                    const variant = iconVariants[idx % 3];
                    return (
                        <div 
                            key={calc.id}
                            style={styles.card}
                            onClick={() => abrirCalculadora(calc.id)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-6px)';
                                e.currentTarget.style.boxShadow = '0 20px 40px -8px rgba(30,41,59,0.15)';
                                const glow = e.currentTarget.querySelector('.card-glow');
                                if (glow) glow.style.opacity = '1';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 8px 25px -5px rgba(30,41,59,0.06)';
                                const glow = e.currentTarget.querySelector('.card-glow');
                                if (glow) glow.style.opacity = '0';
                            }}
                        >
                            <div className="card-glow" style={styles.cardGlow} />
                            <div style={styles.cardDots} className="dot-pattern" />
                            <div style={{ ...styles.cardIconWrapper, background: variant.bg, boxShadow: variant.shadow }}>
                                {calc.icon}
                            </div>
                            <h3 style={styles.cardTitle}>{calc.titulo}</h3>
                            <p style={styles.cardDescription}>{calc.descripcion}</p>
                            <div 
                                style={styles.cardArrow}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = variant.arrowHover;
                                    e.currentTarget.style.color = '#fff';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(37,99,235,0.06)';
                                    e.currentTarget.style.color = variant.arrow;
                                }}
                            >
                                <FaArrowRight size={13} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ===== TÍTULO DE SECCIÓN RECURSOS ===== */}
            <div style={{ ...styles.sectionTitle, marginTop: '2.5rem' }}>
                <div style={styles.sectionIconBox}>
                    <FaFilePdf />
                </div>
                <h2 style={styles.sectionTitleText}>Recursos y Documentos</h2>
                <div style={styles.sectionTitleLine} />
            </div>
            <div style={styles.grid}>
                {recursos.map((recurso, idx) => {
                    const variant = iconVariants[(idx + 1) % 3];
                    return (
                        <a
                            key={recurso.id}
                            href={recurso.link}
                            target={recurso.externo ? '_blank' : '_self'}
                            rel={recurso.externo ? 'noopener noreferrer' : ''}
                            style={styles.linkCard}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-6px)';
                                e.currentTarget.style.boxShadow = '0 20px 40px -8px rgba(30,41,59,0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 8px 25px -5px rgba(30,41,59,0.06)';
                            }}
                        >
                            <div style={{ ...styles.linkIcon, color: variant.arrow }}>{recurso.icon}</div>
                            <h3 style={styles.linkTitle}>{recurso.titulo}</h3>
                            <p style={styles.linkDescription}>{recurso.descripcion}</p>
                            {recurso.externo && (
                                <span style={styles.linkExternal}>
                                    <FaExternalLinkAlt /> Abrir en nueva ventana
                                </span>
                            )}
                        </a>
                    );
                })}
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
                        <FaNewspaper style={{ color: 'var(--sn-primary)' }} /> Noticias y Avisos
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
                                            loading="lazy"
                                            style={{
                                                width: '100%',
                                                height: '140px',
                                                objectFit: 'cover',
                                                borderRadius: '12px',
                                                marginBottom: '0.5rem',
                                                backgroundColor: 'var(--sn-surface-soft)',
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
                            <div style={{ marginTop: '0.5rem', color: 'var(--sn-primary)', fontSize: '0.85rem' }}>
                                🔒 Inicia sesión para ver todas las noticias
                            </div>
                        )}
                    </div>
                    <div style={styles.cardTitleNoticias}>
                        <FaNewspaper style={{ color: 'var(--sn-primary)' }} /> Las puedes visualizar en la sección de noticias y avisos
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
                        color: 'var(--sn-text-muted)', 
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
                                backgroundColor: 'var(--sn-glass-card-bg)',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                                borderRadius: '12px',
                                padding: '0.7rem 1rem',
                                border: '1px solid var(--sn-glass-card-border)',
                                transition: 'all 0.3s ease',
                                opacity: 0.8,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}>
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--sn-text)' }}>
                                        {item.titulo}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--sn-text-muted)' }}>
                                        {item.descripcion}
                                    </div>
                                </div>
                                <span style={{
                                    backgroundColor: '#F59E0B',
                                    color: '#fff',
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
                        backgroundColor: 'rgba(37,99,235,0.06)',
                        borderRadius: '12px',
                        border: '1px dashed var(--sn-primary)',
                        textAlign: 'center',
                    }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--sn-text-muted)' }}>
                            🔔 <Link to="/contacto" style={{ color: 'var(--sn-primary)', fontWeight: '600', textDecoration: 'none' }}>Contáctanos</Link> para más información
                        </span>
                    </div>

                    <div style={{ ...styles.sidebarTitle, marginTop: '1.5rem' }}>
                        <FaInfoCircle /> ¿Cómo participar?
                    </div>
                    <ul style={styles.listaReglas}>
                        <li style={styles.listaReglasItem}>
                            <FaShieldAlt style={{ color: 'var(--sn-primary)' }} /> Ser agremiado de base.
                        </li>
                        <li style={styles.listaReglasItem}>
                            <FaChartLine style={{ color: 'var(--sn-primary)' }} /> Se evalua la antiguedad segun el proceso.
                        </li>
                        <li style={styles.listaReglasItem}>
                            <FaGift style={{ color: 'var(--sn-primary)' }} /> Inscribirse en las rifas.
                        </li>
                    </ul>
                    
                    {!isLoggedIn ? (
                        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'rgba(37,99,235,0.1)', borderRadius: '12px', textAlign: 'center' }}>
                            <p style={{ fontWeight: 'bold', marginBottom: '0.3rem', color: 'var(--sn-text)' }}>✨ Beneficios exclusivos ✨</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--sn-text-muted)' }}>Préstamos, rifas, sorteos y más</p>
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
                <div style={{ ...styles.actionCardIcon, color: '#2563EB' }}><FaCar /></div>
                <h3 style={styles.actionCardTitle}>🚗 Preregistro a la rifa de auto</h3>
                <p style={styles.actionCardDescription}>Participa en la rifa para obtener un crédito automotriz.</p>
            </Link>

            {/* ===== NOTICIAS ===== */}
            <Link to="/noticias" style={styles.actionCard}>
                <div style={{ ...styles.actionCardIcon, color: '#3B82F6' }}><FaNewspaper /></div>
                <h3 style={styles.actionCardTitle}>📰 Noticias y avisos</h3>
                <p style={styles.actionCardDescription}>Mantente informado con las últimas noticias.</p>
            </Link>

            {/* ===== CLÁUSULA 79BIS - Registro (Siempre visible) ===== */}
            <Link to="/clausula79bis" style={styles.actionCard}>
                <div style={{ ...styles.actionCardIcon, color: '#7C3AED' }}><FaGift /></div>
                <h3 style={styles.actionCardTitle}>🎉 Cláusula 79Bis</h3>
                <p style={styles.actionCardDescription}>Registro para el festejo de Intendencia y Limpieza.</p>
            </Link>

            {/* ===== VALIDADOR AUTO (solo rol auto) ===== */}
            {hasAutoValidatorRole && (
                <Link to="/validador-auto" style={{ ...styles.actionCard, borderColor: '#F59E0B' }}>
                    <div style={{ ...styles.actionCardIcon, color: '#F59E0B' }}><FaCheckCircle /></div>
                    <h3 style={styles.actionCardTitle}>🔍 Validador Auto</h3>
                    <p style={styles.actionCardDescription}>Gestiona solicitudes de crédito.</p>
                </Link>
            )}

            {/* ===== CREAR NOTICIA (solo rol noticias) ===== */}
            {hasNewsValidatorRole && (
                <Link to="/noticias/crear" style={{ ...styles.actionCard, borderColor: '#10B981' }}>
                    <div style={{ ...styles.actionCardIcon, color: '#10B981' }}><FaNewspaper /></div>
                    <h3 style={styles.actionCardTitle}>✍️ Crear Noticia</h3>
                    <p style={styles.actionCardDescription}>Publica nuevas noticias.</p>
                </Link>
            )}

            {/* ===== VALIDADOR 79BIS (solo rol clausula79bis) ===== */}
            {hasClausula79BisValidatorRole && (
                <>
                    <Link to="/clausula79bis/validador" style={{ ...styles.actionCard, borderColor: '#7C3AED' }}>
                        <div style={{ ...styles.actionCardIcon, color: '#7C3AED' }}><FaShieldAlt /></div>
                        <h3 style={styles.actionCardTitle}>🔍 Validador 79Bis</h3>
                        <p style={styles.actionCardDescription}>Gestiona los registros del festejo.</p>
                    </Link>

                    {/* ===== ENTRADA 79BIS (solo rol clausula79bis) ===== */}
                    <Link to="/clausula79bis/entrada" style={{ ...styles.actionCard, borderColor: '#2563EB' }}>
                        <div style={{ ...styles.actionCardIcon, color: '#2563EB' }}><FaQrcode /></div>
                        <h3 style={styles.actionCardTitle}>🎟️ Entrada 79Bis</h3>
                        <p style={styles.actionCardDescription}>Control de asistencia del evento.</p>
                    </Link>

                    {/* ===== ESTADÍSTICAS 79BIS (solo rol clausula79bis) ===== */}
                    <Link to="/clausula79bis/estadisticas" style={{ ...styles.actionCard, borderColor: '#10B981' }}>
                        <div style={{ ...styles.actionCardIcon, color: '#10B981' }}><FaChartPie /></div>
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
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '1.5rem 1.5rem 2rem 1.5rem',
            minHeight: 'calc(100vh - 200px)',
            position: 'relative',
            zIndex: 1,
            '@media (max-width: 768px)': {
                padding: '1rem 0.8rem',
            },
        },

        // ===== HERO (2 tarjetas como el mockup) =====
        heroGrid: {
            display: 'grid',
            gridTemplateColumns: '5fr 7fr',
            gap: '1.5rem',
            marginBottom: '2.5rem',
            '@media (max-width: 992px)': {
                gridTemplateColumns: '1fr',
            },
        },
        heroCard: {
            background: 'var(--sn-glass-bg)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--sn-glass-border)',
            borderRadius: '24px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '240px',
            boxShadow: '0 12px 35px -8px rgba(15,23,42,0.08), inset 0 1px 2px rgba(255,255,255,0.95)',
            '@media (max-width: 480px)': {
                padding: '1.5rem',
                minHeight: 'auto',
            },
        },
        heroCardDots: {
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            width: '6rem',
            height: '6rem',
            opacity: 0.3,
            pointerEvents: 'none',
        },
        heroBadge: {
            display: 'inline-block',
            backgroundColor: 'rgba(37,99,235,0.1)',
            color: '#1D4ED8',
            fontSize: '0.65rem',
            fontWeight: 700,
            padding: '0.3rem 0.75rem',
            borderRadius: '999px',
            marginBottom: '0.75rem',
            border: '1px solid rgba(37,99,235,0.25)',
            alignSelf: 'flex-start',
        },
        heroTitle: {
            fontSize: '2rem',
            fontWeight: 700,
            color: 'var(--sn-text)',
            margin: 0,
            letterSpacing: '-0.5px',
            '@media (max-width: 480px)': {
                fontSize: '1.6rem',
            },
        },
        heroSubtitle: {
            fontSize: '0.9rem',
            color: 'var(--sn-text-muted)',
            margin: '0.5rem 0 0 0',
            lineHeight: 1.6,
            fontWeight: 500,
        },
        heroSeccion: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            marginTop: '0.75rem',
            padding: '0.4rem 1rem',
            borderRadius: '10px',
            transition: 'all 0.3s ease',
            fontSize: '0.8rem',
            fontWeight: 600,
            '@media (max-width: 480px)': {
                fontSize: '0.75rem',
            },
        },
        heroRoles: {
            display: 'flex',
            gap: '0.3rem',
            flexWrap: 'wrap',
            marginTop: '0.75rem',
        },
        badgeRol: {
            display: 'inline-block',
            padding: '0.1rem 0.5rem',
            borderRadius: '12px',
            fontSize: '0.6rem',
            fontWeight: 'bold',
            backgroundColor: 'rgba(37,99,235,0.12)',
            color: '#1D4ED8',
            border: '1px solid rgba(37,99,235,0.2)',
        },
        heroBtnContainer: {
            display: 'flex',
            gap: '0.4rem',
            flexWrap: 'wrap',
            marginTop: '1.5rem',
        },
        heroBtn: {
            backgroundColor: 'var(--sn-primary)',
            color: '#fff',
            padding: '0.55rem 1.25rem',
            borderRadius: '999px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.85rem',
            transition: 'all 0.3s ease',
            border: 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            boxShadow: '0 10px 22px -3px rgba(37,99,235,0.38)',
        },
        heroDotsGrid: {
            position: 'absolute',
            bottom: '1rem',
            right: '1.25rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.4rem',
            opacity: 0.4,
            pointerEvents: 'none',
        },
        heroDotsDot: {
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#2563EB',
        },
        heroBannerCard: {
            background: 'var(--sn-glass-bg)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--sn-glass-border)',
            borderRadius: '24px',
            overflow: 'hidden',
            position: 'relative',
            minHeight: '240px',
            boxShadow: '0 12px 35px -8px rgba(15,23,42,0.08)',
            '@media (max-width: 480px)': {
                minHeight: '180px',
            },
        },
        heroBannerImg: {
            width: '100%',
            height: '100%',
            minHeight: '240px',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform 0.5s ease',
            '@media (max-width: 480px)': {
                minHeight: '180px',
            },
        },
        heroBannerOverlay: {
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15,23,42,0.35), transparent)',
            pointerEvents: 'none',
        },

        // ===== TABS (pastilla glass) =====
        tabsContainer: {
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '2.5rem',
        },
        tabsPill: {
            display: 'flex',
            gap: '0.4rem',
            padding: '0.4rem',
            background: 'var(--sn-glass-bg)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--sn-glass-border)',
            borderRadius: '999px',
            boxShadow: '0 8px 25px -5px rgba(30,41,59,0.08)',
            '@media (max-width: 480px)': {
                width: '100%',
                borderRadius: '20px',
            },
        },
        tab: (activa) => ({
            flex: 1,
            padding: '0.65rem 1.75rem',
            borderRadius: '999px',
            border: 'none',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            background: activa ? 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' : 'transparent',
            color: activa ? '#fff' : 'var(--sn-text-muted)',
            boxShadow: activa ? '0 8px 20px -4px rgba(37,99,235,0.45)' : 'none',
            whiteSpace: 'nowrap',
            '@media (max-width: 480px)': {
                padding: '0.6rem 0.5rem',
                fontSize: '0.8rem',
            },
        }),

        // ===== TÍTULOS DE SECCIÓN =====
        sectionTitle: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem',
        },
        sectionIconBox: {
            width: '36px',
            height: '36px',
            borderRadius: '12px',
            backgroundColor: '#2563EB',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            boxShadow: '0 8px 22px -3px rgba(37,99,235,0.35)',
            flexShrink: 0,
        },
        sectionTitleText: {
            fontSize: '1.35rem',
            fontWeight: 700,
            color: 'var(--sn-text)',
            margin: 0,
            '@media (max-width: 480px)': {
                fontSize: '1.1rem',
            },
        },
        sectionTitleLine: {
            flex: 1,
            height: '2px',
            borderRadius: '2px',
            background: 'linear-gradient(90deg, rgba(37,99,235,0.4), transparent)',
            marginLeft: '0.5rem',
        },

        // ===== GRID Y TARJETAS =====
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '1rem',
            '@media (max-width: 480px)': {
                gridTemplateColumns: '1fr',
            },
        },
        card: {
            background: 'var(--sn-glass-card-bg)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--sn-glass-card-border)',
            borderRadius: '24px',
            padding: '1.75rem 1.5rem',
            boxShadow: '0 8px 25px -5px rgba(30,41,59,0.06)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
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
            background: 'radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)',
            opacity: 0,
            transition: 'opacity 0.4s ease',
            pointerEvents: 'none',
        },
        cardDots: {
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            width: '3rem',
            height: '3rem',
            opacity: 0.2,
            pointerEvents: 'none',
        },
        cardIconWrapper: {
            width: '64px',
            height: '64px',
            margin: '0 auto 1rem',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            color: '#fff',
            transition: 'all 0.3s ease',
        },
        cardTitle: {
            fontSize: '1rem',
            fontWeight: 700,
            marginBottom: '0.3rem',
            color: 'var(--sn-text)',
        },
        cardDescription: {
            fontSize: '0.8rem',
            color: 'var(--sn-text-muted)',
            lineHeight: 1.6,
            margin: 0,
        },
        cardArrow: {
            position: 'absolute',
            bottom: '1rem',
            right: '1rem',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: '1px solid rgba(37,99,235,0.35)',
            backgroundColor: 'rgba(37,99,235,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
        },
        linkCard: {
            background: 'var(--sn-glass-card-bg)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--sn-glass-card-border)',
            borderRadius: '24px',
            padding: '1.75rem 1.5rem',
            boxShadow: '0 8px 25px -5px rgba(30,41,59,0.06)',
            transition: 'all 0.3s ease',
            textAlign: 'center',
            textDecoration: 'none',
            color: 'inherit',
            display: 'block',
            position: 'relative',
            overflow: 'hidden',
        },
        linkIcon: {
            fontSize: '2.5rem',
            marginBottom: '0.8rem',
            display: 'block',
        },
        linkTitle: {
            fontSize: '1rem',
            fontWeight: 700,
            marginBottom: '0.3rem',
            color: 'var(--sn-text)',
        },
        linkDescription: {
            fontSize: '0.85rem',
            color: 'var(--sn-text-muted)',
            margin: 0,
        },
        linkExternal: {
            color: 'var(--sn-primary)',
            fontSize: '0.7rem',
            marginTop: '0.5rem',
            display: 'inline-block',
        },

        // ===== ACCIONES =====
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
            background: 'var(--sn-glass-card-bg)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--sn-glass-card-border)',
            borderRadius: '24px',
            padding: '1.75rem 1.5rem',
            boxShadow: '0 8px 25px -5px rgba(30,41,59,0.06)',
            transition: 'all 0.3s ease',
            textDecoration: 'none',
            color: 'inherit',
            display: 'block',
            position: 'relative',
            overflow: 'hidden',
            textAlign: 'center',
            '@media (max-width: 480px)': {
                padding: '1.2rem',
            },
        },
        actionCardIcon: {
            fontSize: '2.2rem',
            marginBottom: '0.8rem',
            display: 'block',
        },
        actionCardTitle: {
            fontSize: '1rem',
            fontWeight: 700,
            marginBottom: '0.3rem',
            color: 'var(--sn-text)',
        },
        actionCardDescription: {
            fontSize: '0.85rem',
            color: 'var(--sn-text-muted)',
            margin: 0,
            lineHeight: 1.5,
        },

        // ===== NOTICIAS / SIDEBAR =====
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
        cardNoticias: {
            background: 'var(--sn-glass-card-bg)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--sn-glass-card-border)',
            borderRadius: '24px',
            padding: '1.5rem',
            boxShadow: '0 8px 25px -5px rgba(30,41,59,0.06)',
            transition: 'all 0.3s ease',
            height: '100%',
            '@media (max-width: 480px)': {
                padding: '1rem',
            },
        },
        cardTitleNoticias: {
            fontSize: '1.1rem',
            fontWeight: 700,
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--sn-text)',
            borderBottom: '2px solid var(--sn-primary)',
            paddingBottom: '0.5rem',
            '@media (max-width: 480px)': {
                fontSize: '1rem',
            },
        },
        cardBody: {
            color: 'var(--sn-text-muted)',
            lineHeight: '1.6',
        },
        noticiaCard: {
            backgroundColor: 'var(--sn-surface)',
            borderRadius: '16px',
            padding: '1rem',
            marginBottom: '1rem',
            transition: 'all 0.3s ease',
            border: '1px solid var(--sn-glass-border)',
            '@media (max-width: 480px)': {
                padding: '0.8rem',
            },
        },
        noticiaTitulo: {
            fontSize: '0.95rem',
            fontWeight: 700,
            marginBottom: '0.3rem',
            color: 'var(--sn-text)',
            '@media (max-width: 480px)': {
                fontSize: '0.85rem',
            },
        },
        noticiaResumen: {
            color: 'var(--sn-text-muted)',
            fontSize: '0.8rem',
            marginBottom: '0.3rem',
        },
        noticiaMeta: {
            fontSize: '0.7rem',
            color: 'var(--sn-text-light)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem 1rem',
            alignItems: 'center',
        },
        noticiaBadge: {
            backgroundColor: 'var(--sn-primary)',
            color: '#fff',
            fontSize: '0.6rem',
            fontWeight: 'bold',
            padding: '0.1rem 0.5rem',
            borderRadius: '10px',
        },
        sidebar: {
            background: 'var(--sn-glass-card-bg)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--sn-glass-card-border)',
            borderRadius: '24px',
            padding: '1.5rem',
            boxShadow: '0 8px 25px -5px rgba(30,41,59,0.06)',
            height: '100%',
            '@media (max-width: 480px)': {
                padding: '1rem',
            },
        },
        sidebarTitle: {
            fontSize: '1rem',
            fontWeight: 700,
            marginBottom: '1rem',
            borderBottom: '2px solid var(--sn-primary)',
            paddingBottom: '0.5rem',
            color: 'var(--sn-text)',
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
            borderBottom: '1px solid var(--sn-glass-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
            color: 'var(--sn-text-muted)',
            '@media (max-width: 480px)': {
                fontSize: '0.8rem',
            },
        },

        // ===== MODAL =====
        modalHeader: {
            background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
            color: 'white',
            borderBottom: '3px solid #3B82F6',
            borderRadius: '16px 16px 0 0',
            padding: '1.5rem 2rem',
        },
    };

    // ✅ Determinar la URL del banner según la sesión
    const getBannerUrl = () => {
        // Si hay sección y tiene banner
        if (seccionUsuario?.banner) {
            console.log('📸 Banner de sección:', seccionUsuario.banner);
            return seccionUsuario.banner;
        }
        // Si no, usar el banner por defecto
        console.log('📸 Banner por defecto');
        return '/images/seccionesBanner/bannerD.jpg';
    };

    // ✅ Determinar el título del banner
    const getBannerTitle = () => {
        if (seccionUsuario?.romano) {
            return `SNTSS Sección ${seccionUsuario.romano}`;
        }
        return 'SNTSS - CEN';
    };

    // ✅ Determinar el subtítulo del banner
    const getBannerSubtitle = () => {
        if (seccionUsuario?.nombre) {
            return `"${seccionUsuario.nombre}"`;
        }
        return '"Todos Juntos, Todos Fuertes"';
    };

    // ✅ Determinar el color del banner
    const getBannerColor = () => {
        return seccionUsuario?.color || '#2563EB';
    };

    // ✅ Color de la sección (fallback azul del nuevo diseño)
    const colorSeccion = seccionUsuario?.color || '#2563EB';

    return (
        <>
            {/* ================= CAPAS DE FONDO DECORATIVAS (como el mockup) ================= */}
            <div className="sn-decor" aria-hidden="true">
                {/* Resplandores ambientales (radial-gradients, sin filtros pesados) */}
                <div style={{
                    position: 'absolute',
                    top: '-80px',
                    left: '25%',
                    width: '600px',
                    height: '600px',
                    background: 'radial-gradient(circle, rgba(147,197,253,0.4) 0%, transparent 70%)',
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '40px',
                    right: '-80px',
                    width: '500px',
                    height: '500px',
                    background: 'radial-gradient(circle, rgba(110,231,183,0.35) 0%, transparent 70%)',
                }} />

                {/* Onda azul curva (izquierda central) */}
                <svg style={{
                    position: 'absolute',
                    top: '28%',
                    left: '-48px',
                    width: '380px',
                    height: '380px',
                    opacity: 0.8,
                }} viewBox="0 0 200 200" fill="none">
                    <path d="M -50 100 C 20 180, 120 40, 200 120 C 220 140, 240 180, 250 200 L -50 200 Z" fill="rgba(147,197,253,0.5)"/>
                </svg>

                {/* Círculos flotantes (izquierda) */}
                <div style={{
                    position: 'absolute',
                    top: '32%',
                    left: '6%',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(96,165,250,0.3)',
                }} />
                <div style={{
                    position: 'absolute',
                    top: '36%',
                    left: '4%',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(125,211,252,0.5)',
                }} />

                {/* Composición geométrica verde (derecha central) */}
                <div style={{
                    position: 'absolute',
                    top: '25%',
                    right: '-4%',
                    width: '384px',
                    height: '384px',
                    opacity: 0.6,
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        right: '40px',
                        width: '288px',
                        height: '288px',
                        border: '28px solid rgba(110,231,183,0.4)',
                        borderRadius: '50%',
                    }} />
                    <div style={{
                        position: 'absolute',
                        top: '48px',
                        right: '80px',
                        width: '192px',
                        height: '192px',
                        backgroundColor: 'rgba(110,231,183,0.4)',
                        borderTopLeftRadius: '999px',
                        borderTopRightRadius: '999px',
                        transform: 'rotate(-45deg)',
                    }} />
                    <div style={{
                        position: 'absolute',
                        top: '144px',
                        right: '32px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(52,211,153,0.4)',
                    }} />
                    <div style={{
                        position: 'absolute',
                        top: '176px',
                        right: '80px',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(16,185,129,0.3)',
                    }} />
                </div>

                {/* Figuras naranjas y cápsula (inferior derecha) */}
                <div style={{
                    position: 'absolute',
                    bottom: '18%',
                    right: '2%',
                    width: '256px',
                    height: '256px',
                    opacity: 0.75,
                }}>
                    <div style={{
                        position: 'absolute',
                        bottom: '32px',
                        right: '48px',
                        width: '32px',
                        height: '112px',
                        background: 'linear-gradient(to top, rgba(251,146,60,0.8), rgba(252,211,77,0.8))',
                        borderRadius: '999px',
                        transform: 'rotate(35deg)',
                    }} />
                    <div style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '16px',
                        width: '96px',
                        height: '96px',
                        border: '6px solid rgba(251,146,60,0.5)',
                        borderRadius: '50%',
                    }} />
                    <div style={{
                        position: 'absolute',
                        bottom: '64px',
                        right: '128px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(251,146,60,0.7)',
                    }} />
                </div>

                {/* Círculo azul traslúcido (inferior izquierda) */}
                <div style={{
                    position: 'absolute',
                    bottom: '-50px',
                    left: '-30px',
                    width: '320px',
                    height: '320px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(147,197,253,0.4)',
                }} />

                {/* Matrices de puntos */}
                <div style={{
                    position: 'absolute',
                    top: '48px',
                    left: '32px',
                    width: '192px',
                    height: '192px',
                    opacity: 0.6,
                }} className="dot-pattern" />
                <div style={{
                    position: 'absolute',
                    top: '40%',
                    left: '2%',
                    width: '160px',
                    height: '208px',
                    opacity: 0.35,
                }} className="dot-pattern" />
                <div style={{
                    position: 'absolute',
                    top: '48%',
                    right: '3%',
                    width: '96px',
                    height: '192px',
                    opacity: 0.3,
                }} className="dot-pattern" />
                <div style={{
                    position: 'absolute',
                    bottom: '96px',
                    left: '48px',
                    width: '224px',
                    height: '224px',
                    opacity: 0.4,
                }} className="dot-pattern" />
            </div>

            <div style={styles.container}>
                {/* ===== HERO: 2 TARJETAS (como el mockup) ===== */}
                <section style={styles.heroGrid}>
                    {/* Card izquierda: Sección Sindical / Ingresar */}
                    <div style={styles.heroCard} className="group">
                        <div style={styles.heroCardDots} className="dot-pattern" />
                        <div>
                            <span style={{
                                ...styles.heroBadge,
                                backgroundColor: `${colorSeccion}15`,
                                color: colorSeccion,
                                border: `1px solid ${colorSeccion}40`,
                            }}>
                                {isLoggedIn ? `Sección ${seccionUsuario?.romano || ''} Sindical` : 'Sección Sindical'}
                            </span>
                            <h2 style={styles.heroTitle}>
                                {isLoggedIn ? `¡Bienvenido, ${userName}!` : 'SNTSS'}
                            </h2>
                            <p style={styles.heroSubtitle}>
                                Comité Ejecutivo Seccional al Servicio de los trabajadores
                            </p>

                            {/* ✅ MOSTRAR LA SECCIÓN DEL USUARIO DEBAJO DEL NOMBRE (solo si está logueado) */}
                            {isLoggedIn && seccionUsuario && (
                                <div style={{
                                    ...styles.heroSeccion,
                                    backgroundColor: `${colorSeccion}15`,
                                    borderLeft: `4px solid ${colorSeccion}`,
                                    color: colorSeccion,
                                }}>
                                    <FaBuilding size={14} />
                                    <span>
                                        Sección {seccionUsuario.romano} - {seccionUsuario.nombre}
                                    </span>
                                    <FaCheckCircle size={12} style={{ opacity: 0.7 }} />
                                </div>
                            )}

                            {isLoggedIn && rolesDisponibles.length > 0 && (
                                <div style={styles.heroRoles}>
                                    {rolesDisponibles.map((rol, idx) => (
                                        <span key={idx} style={styles.badgeRol}>
                                            🛡️ {rol}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={styles.heroBtnContainer}>
                            {isLoggedIn ? (
                                <Link to="/perfil" style={styles.heroBtn}>
                                    <FaUser size={14} /> Mi Perfil
                                </Link>
                            ) : (
                                <Link to="/login" style={styles.heroBtn}>
                                    <FaSignInAlt size={14} /> Ingresar al Portal
                                </Link>
                            )}
                        </div>

                        {/* Matriz de puntitos esquina inferior */}
                        <div style={styles.heroDotsGrid}>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <span key={i} style={styles.heroDotsDot} />
                            ))}
                        </div>
                    </div>

                    {/* Card derecha: Banner */}
                    <div style={styles.heroBannerCard} className="group">
                        <img 
                            src={getBannerUrl()}
                            alt={getBannerTitle()}
                            loading="lazy"
                            style={styles.heroBannerImg}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = `
                                    <div style="
                                        width: 100%;
                                        height: 100%;
                                        min-height: 240px;
                                        background: linear-gradient(135deg, #172554 0%, #1E3A8A 50%, #172554 100%);
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        flex-direction: column;
                                        border-bottom: 4px solid ${getBannerColor()};
                                        padding: 1rem;
                                        text-align: center;
                                    ">
                                        <div style="font-size: 3.5rem;">🏛️</div>
                                        <h2 style="color: white; margin: 0.3rem 0 0 0; font-size: 1.3rem;">
                                            ${getBannerTitle()}
                                        </h2>
                                        <p style="color: ${getBannerColor()}; margin: 0.2rem 0 0 0; font-size: 0.9rem; font-style: italic;">
                                            ${getBannerSubtitle()}
                                        </p>
                                    </div>
                                `;
                            }}
                        />
                        <div style={styles.heroBannerOverlay} />
                    </div>
                </section>

                {/* ===== PASTILLA DE TABS (como el mockup) ===== */}
                <div style={styles.tabsContainer}>
                    <div style={styles.tabsPill}>
                        <button 
                            style={styles.tab(tabActiva === 'calculadoras')}
                            onClick={() => setTabActiva('calculadoras')}
                        >
                            <FaCalculator /> Calculadoras
                        </button>
                        <button 
                            style={styles.tab(tabActiva === 'proceso')}
                            onClick={() => setTabActiva('proceso')}
                        >
                            <FaNewspaper /> Proceso y Noticias
                        </button>
                    </div>
                </div>

                {/* ===== CONTENIDO DE LAS TABS ===== */}
                {tabActiva === 'calculadoras' ? renderTabCalculadoras() : renderTabProceso()}

                {/* ===== MODAL DE CALCULADORA ===== */}
                <Modal show={showModal} onHide={cerrarCalculadora} centered size="lg">
                    <Modal.Header closeButton style={styles.modalHeader}>
                        <Modal.Title>
                            <FaCalculator style={{ marginRight: '10px', color: '#93C5FD' }} /> 
                            {calculadoraActiva && calculadoras.find(c => c.id === calculadoraActiva)?.titulo || 'Calculadora'}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ padding: '2rem', background: 'var(--sn-surface-soft)' }}>
                        {renderCalculadora()}
                    </Modal.Body>
                </Modal>
            </div>
        </>
    );
};

export default Dashboard;