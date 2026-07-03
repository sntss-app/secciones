import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaCar, FaNewspaper, FaInfoCircle, FaCalculator, FaSignInAlt, 
    FaGift, FaShieldAlt, FaChartLine, FaCheckCircle, FaUser,
    FaThumbtack, FaEye, FaCalendarAlt
} from 'react-icons/fa';
import { apiUrl } from '../config';
import { Modal } from 'react-bootstrap';
import { hasStoredRole, parseRoleIds } from '../utils/roles';

// Estilos en línea mejorados
const styles = {
    container: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem 1.5rem',
        minHeight: 'calc(100vh - 200px)', // Para que el footer se pegue abajo
    },
    heroSection: {
        background: 'linear-gradient(135deg, #0A0F1E 0%, #1a1f2e 50%, #0A0F1E 100%)',
        borderRadius: '20px',
        padding: '3rem 2rem',
        marginBottom: '2rem',
        textAlign: 'center',
        color: 'white',
        borderBottom: '4px solid #3EAEF4',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        position: 'relative',
        overflow: 'hidden',
    },
    heroTitle: {
        fontSize: '2.8rem',
        fontWeight: 'bold',
        background: 'linear-gradient(135deg, #fff 30%, #3EAEF4 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '0.5rem',
        letterSpacing: '-0.5px',
    },
    heroSubtitle: {
        fontSize: '1.2rem',
        color: '#ccc',
        marginBottom: '1.5rem',
    },
    heroBtn: {
        backgroundColor: '#3EAEF4',
        color: '#0A0F1E',
        padding: '0.75rem 2rem',
        borderRadius: '30px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '1rem',
        transition: 'all 0.3s ease',
        border: 'none',
        cursor: 'pointer',
    },
    actionGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
    },
    actionCard: {
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        transition: 'all 0.3s ease',
        textDecoration: 'none',
        color: 'inherit',
        display: 'block',
        border: '1px solid #e9ecef',
        position: 'relative',
        overflow: 'hidden',
    },
    actionCardIcon: {
        fontSize: '2rem',
        color: '#3EAEF4',
        marginBottom: '0.3rem',
    },
    actionCardTitle: {
        fontSize: '1rem',
        fontWeight: 'bold',
        marginBottom: '0.2rem',
        color: '#0A0F1E',
    },
    actionCardDescription: {
        fontSize: '0.8rem',
        color: '#6c757d',
        margin: 0,
    },
    grid2cols: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '2rem',
        marginBottom: '2rem',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        border: '1px solid #e9ecef',
        transition: 'all 0.3s ease',
        height: '100%',
    },
    cardTitle: {
        fontSize: '1.1rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: '#0A0F1E',
        borderBottom: '2px solid #3EAEF4',
        paddingBottom: '0.5rem',
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
    },
    noticiaTitulo: {
        fontSize: '0.95rem',
        fontWeight: 'bold',
        marginBottom: '0.3rem',
        color: '#0A0F1E',
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
        gap: '1rem',
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
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        border: '1px solid #e9ecef',
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        height: '100%',
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
    },
    btnPrimary: {
        backgroundColor: '#3EAEF4',
        color: '#0A0F1E',
        border: 'none',
        padding: '0.6rem 1.2rem',
        borderRadius: '12px',
        fontWeight: 'bold',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        textDecoration: 'none',
        fontSize: '0.9rem',
    },
    modalHeader: {
        background: 'linear-gradient(90deg, #003c82, #00a8ff)',
        color: 'white',
        borderBottom: 'none',
        borderRadius: '16px 16px 0 0',
        padding: '1.5rem',
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
    },
    badgeRol: {
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        backgroundColor: '#3EAEF4',
        color: '#0A0F1E',
        marginBottom: '0.5rem',
    },
};

const Dashboard = () => {
    const [isLoggedIn] = useState(() => Boolean(localStorage.getItem('matricula')));
    const [userName] = useState(() => localStorage.getItem('nombre') || localStorage.getItem('matricula') || '');
    const [noticias, setNoticias] = useState([]);
    const [loadingNoticias, setLoadingNoticias] = useState(true);
    const [hasAutoValidatorRole, setHasAutoValidatorRole] = useState(() => hasStoredRole(1, 'auto'));
    const [hasNewsValidatorRole, setHasNewsValidatorRole] = useState(() => hasStoredRole(2, 'noticias'));
    
    // Estados para el modal y la calculadora de auto
    const [showModal, setShowModal] = useState(false);
    const [c02, setC02] = useState('');
    const [c11, setC11] = useState('');
    const [montoAuto, setMontoAuto] = useState(null);
    const [mostrarResultado, setMostrarResultado] = useState(false);

    useEffect(() => {
        const matricula = localStorage.getItem('matricula');
        if (!matricula || hasStoredRole(1, 'auto')) return;

        const cargarRolesPerfil = async () => {
            try {
                const response = await fetch(apiUrl(`/obtener_perfil.php?matricula=${encodeURIComponent(matricula)}`));
                const data = await response.json();

                if (response.ok && data.success) {
                    const roleIds = parseRoleIds(data.usuario?.idRol);
                    setHasAutoValidatorRole(roleIds.includes('1'));
                    setHasNewsValidatorRole(roleIds.includes('2'));
                    localStorage.setItem('idRol', data.usuario?.idRol || '');
                }
            } catch (error) {
                console.error('Error cargando roles del perfil:', error);
            }
        };

        cargarRolesPerfil();
    }, []);

    // Cargar noticias públicas
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

    // Función para formatear moneda
    const formatter = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2
    });

    // Calcular préstamo de auto
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

    // Abrir modal y limpiar resultados previos
    const abrirModal = () => {
        setC02('');
        setC11('');
        setMostrarResultado(false);
        setMontoAuto(null);
        setShowModal(true);
    };

    const rolesDisponibles = [];
    if (hasAutoValidatorRole) rolesDisponibles.push('Validador Auto');
    if (hasNewsValidatorRole) rolesDisponibles.push('Editor Noticias');

    return (
        <div style={styles.container}>
            {/* Hero Section */}
            <div style={styles.heroSection}>
                <h1 style={styles.heroTitle}>
                    {isLoggedIn ? `¡Bienvenido, ${userName}!` : 'SNTSS Sección XXXIII'}
                </h1>
                <p style={styles.heroSubtitle}>
                    Tu sindicato al servicio de los trabajadores del Seguro Social
                </p>
                
                {/* Roles del usuario */}
                {isLoggedIn && rolesDisponibles.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                        {rolesDisponibles.map((rol, idx) => (
                            <span key={idx} style={{ ...styles.badgeRol, marginRight: '0.5rem' }}>
                                🛡️ {rol}
                            </span>
                        ))}
                    </div>
                )}
                
                {/* Botón de perfil (solo visible cuando está logueado) */}
                {isLoggedIn && (
                    <Link to="/perfil" style={{ ...styles.heroBtn, backgroundColor: '#3EAEF4', marginTop: '0.5rem' }}>
                        <FaUser className="me-2" /> Ver mi perfil
                    </Link>
                )}
                
                {!isLoggedIn && (
                    <Link to="/login" style={styles.heroBtn}>
                        <FaSignInAlt /> Inicia sesión para acceder a los beneficios
                    </Link>
                )}
            </div>

            {/* Cards de acción (incluyendo calculadora) */}
            <div style={styles.actionGrid}>
                <Link to="/registro-auto" style={styles.actionCard}>
                    <div style={styles.actionCardIcon}>
                        <FaCar />
                    </div>
                    <h3 style={styles.actionCardTitle}>🚗 Preregistro a la rifa de auto</h3>
                    <p style={styles.actionCardDescription}>
                        Participa en la rifa para obtener un crédito automotriz.
                    </p>
                </Link>
                <Link to="/noticias" style={styles.actionCard}>
                    <div style={styles.actionCardIcon}>
                        <FaNewspaper />
                    </div>
                    <h3 style={styles.actionCardTitle}>📰 Noticias y avisos</h3>
                    <p style={styles.actionCardDescription}>
                        Mantente informado con las últimas noticias.
                    </p>
                </Link>
                <div style={{ ...styles.actionCard, cursor: 'pointer' }} onClick={abrirModal}>
                    <div style={{ ...styles.actionCardIcon, color: '#FFC107' }}>
                        <FaCalculator />
                    </div>
                    <h3 style={styles.actionCardTitle}>💰 Calculadora de auto</h3>
                    <p style={styles.actionCardDescription}>
                        El calculo del financiamiento automotriz es aproximado.
                    </p>
                </div>
                {hasAutoValidatorRole && (
                    <Link to="/validador-auto" style={{ ...styles.actionCard, borderColor: '#FFC107' }}>
                        <div style={{ ...styles.actionCardIcon, color: '#FFC107' }}>
                            <FaCheckCircle />
                        </div>
                        <h3 style={styles.actionCardTitle}>🔍 Validador Auto</h3>
                        <p style={styles.actionCardDescription}>
                            Gestiona solicitudes de crédito.
                        </p>
                    </Link>
                )}
                {hasNewsValidatorRole && (
                    <Link to="/noticias/crear" style={{ ...styles.actionCard, borderColor: '#28a745' }}>
                        <div style={{ ...styles.actionCardIcon, color: '#28a745' }}>
                            <FaNewspaper />
                        </div>
                        <h3 style={styles.actionCardTitle}>✍️ Crear Noticia</h3>
                        <p style={styles.actionCardDescription}>
                            Publica nuevas noticias.
                        </p>
                    </Link>
                )}
            </div>

            {/* Grid de 2 columnas: Contenido principal + Sidebar */}
            <div style={styles.grid2cols}>
                {/* Columna izquierda */}
                <div>

                    {/* Noticias */}
                    <div style={{ ...styles.card, marginTop: '1.5rem' }}>
                        <div style={styles.cardTitle}>
                            <FaNewspaper style={{ color: '#3EAEF4' }} /> Noticias y Avisos
                        </div>
                        <div style={styles.cardBody}>
                            {loadingNoticias ? (
                                <p className="text-muted">Cargando noticias...</p>
                            ) : noticias.length > 0 ? (
                                noticias.map((noticia, idx) => (
                                    <div key={idx} style={styles.noticiaCard}>
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
                    </div>
                </div>

                {/* Columna derecha: Sidebar */}
                <div style={styles.sidebar}>
                    <div style={styles.sidebarTitle}>
                        <FaInfoCircle /> ¿Cómo participar?
                    </div>
                    <ul style={styles.listaReglas}>
                        <li style={styles.listaReglasItem}>
                            <FaShieldAlt style={{ color: '#3EAEF4' }} /> Ser agremiado de base.
                        </li>
                        <li style={styles.listaReglasItem}>
                            <FaChartLine style={{ color: '#3EAEF4' }} /> 5 años de antigüedad
                        </li>
                        <li style={styles.listaReglasItem}>
                            <FaGift style={{ color: '#3EAEF4' }} /> Participar en la rifa de créditos
                        </li>
                    </ul>
                    
                    {!isLoggedIn ? (
                        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#3EAEF420', borderRadius: '12px', textAlign: 'center' }}>
                            <p style={{ fontWeight: 'bold', marginBottom: '0.3rem' }}>✨ Beneficios exclusivos ✨</p>
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

            {/* Modal de la calculadora */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton style={styles.modalHeader}>
                    <Modal.Title>
                        <FaCar className="me-2" /> PRÉSTAMO DE AUTO
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: '1.5rem' }}>
                    <p className="text-muted mb-3" style={{ textAlign: 'justify' }}>
                        Determina el monto de financiamiento para tu vehículo basado en tu capacidad de pago.
                        El cálculo considera tu sueldo base (Concepto 002) y otros ingresos reflejados en tu tarjetón.
                    </p>
                    
                    <div className="mb-3">
                        <button className="btn btn-link text-decoration-none p-0" type="button" data-bs-toggle="collapse" data-bs-target="#reqAuto" style={{ color: '#003c82', fontWeight: '600' }}>
                            📄 Ver Requisitos
                        </button>
                        <div className="collapse mt-2" id="reqAuto">
                            <div className="card card-body bg-light">
                                <h6 style={{ color: '#003c82', fontWeight: '700', borderBottom: '2px solid rgba(0, 60, 130, 0.2)', paddingBottom: '5px', marginBottom: '10px' }}>
                                    ✅ Requisitos:
                                </h6>
                                <ul className="mb-0">
                                    <li>Ser trabajador de base</li>
                                    <li>Contar con al menos 3 años de antigüedad</li>
                                    <li>Presentar los 2 últimos tarjetones de pago</li>
                                    <li>Llenar la solicitud correspondiente</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mb-3">
                        <label className="form-label fw-bold">Concepto 002 (quincenal):</label>
                        <input 
                            type="number" 
                            step="0.01" 
                            className="form-control" 
                            value={c02}
                            onChange={(e) => setC02(e.target.value)}
                            placeholder="Ej: 2437.73"
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="form-label fw-bold">Concepto 011 (quincenal):</label>
                        <input 
                            type="number" 
                            step="0.01" 
                            className="form-control" 
                            value={c11}
                            onChange={(e) => setC11(e.target.value)}
                            placeholder="Ej: 2002.60"
                        />
                    </div>
                    
                    <button type="button" style={styles.btnCalcular} onClick={calcularAuto}>
                        <FaCalculator /> Calcular Préstamo
                    </button>
                    
                    {mostrarResultado && montoAuto !== null && (
                        <div className="mt-4">
                            <p className="fw-bold mb-2 text-center">Monto del préstamo para auto:</p>
                            <div style={styles.resultadoContainer}>
                                <span className="d-block text-primary fw-bold fs-5">Por 24 veces el sueldo mensual integrado</span>
                                <span style={styles.resultadoMonto}>
                                    {formatter.format(montoAuto)}
                                </span>
                                <p className="text-muted text-center mt-3 small mb-0">
                                    * El cálculo incluye el 20% de prestaciones sobre el sueldo mensual.
                                </p>
                            </div>
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Dashboard;