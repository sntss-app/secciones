import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCar, FaNewspaper, FaInfoCircle, FaCalculator, FaSignInAlt, FaGift, FaShieldAlt, FaChartLine } from 'react-icons/fa';
import { apiUrl } from '../config';
import { Modal, Button } from 'react-bootstrap';

const Dashboard = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState('');
    const [noticias, setNoticias] = useState([]);
    const [loadingNoticias, setLoadingNoticias] = useState(true);
    
    // Estados para el modal y la calculadora de auto
    const [showModal, setShowModal] = useState(false);
    const [c02, setC02] = useState('');
    const [c11, setC11] = useState('');
    const [montoAuto, setMontoAuto] = useState(null);
    const [mostrarResultado, setMostrarResultado] = useState(false);

    // Verificar sesión
    useEffect(() => {
        const matricula = localStorage.getItem('matricula');
        const nombre = localStorage.getItem('nombre');
        
        if (matricula) {
            setIsLoggedIn(true);
            setUserName(nombre || matricula);
        }
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

    const styles = {
        container: {
            width: '100%',
            margin: '0 auto',
            padding: '2rem',
        },
        heroSection: {
            background: 'linear-gradient(135deg, #0A0F1E 0%, #1a1f2e 100%)',
            borderRadius: '16px',
            padding: '3rem 2rem',
            marginBottom: '2rem',
            textAlign: 'center',
            color: 'white',
            borderBottom: '4px solid #FFD700',
        },
        heroTitle: {
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
        },
        heroSubtitle: {
            fontSize: '1.1rem',
            color: '#ccc',
            marginBottom: '1.5rem',
        },
        loginPrompt: {
            backgroundColor: '#FFD700',
            color: '#0A0F1E',
            padding: '0.75rem 1.5rem',
            borderRadius: '25px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none',
            fontWeight: 'bold',
        },
        grid2cols: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem',
        },
        card: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s ease',
            cursor: 'pointer',
        },
        cardTitle: {
            fontSize: '1.3rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
        },
        cardBody: {
            color: '#666',
            lineHeight: '1.6',
        },
        noticiaCard: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '1rem',
        },
        noticiaTitulo: {
            fontSize: '1.1rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
        },
        noticiaResumen: {
            color: '#666',
            fontSize: '0.9rem',
        },
        sidebar: {
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid #e9ecef',
        },
        sidebarTitle: {
            fontSize: '1.2rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            borderBottom: '2px solid #FFD700',
            paddingBottom: '0.5rem',
        },
        listaReglas: {
            listStyle: 'none',
            padding: 0,
        },
        listaReglasItem: {
            padding: '0.5rem 0',
            borderBottom: '1px solid #e9ecef',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
        },
        calculadoraCard: {
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            padding: '1rem',
            border: '1px solid #e9ecef',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textAlign: 'center',
        },
        calculadoraIcon: {
            fontSize: '2rem',
            color: '#FFD700',
            marginBottom: '0.5rem',
        },
        calculadoraTitle: {
            fontSize: '0.9rem',
            fontWeight: 'bold',
            marginBottom: '0.25rem',
        },
        calculadoraDescription: {
            fontSize: '0.75rem',
            color: '#666',
            marginBottom: '0.5rem',
        },
        calculadoraBtn: {
            backgroundColor: '#FFD700',
            color: '#0A0F1E',
            border: 'none',
            padding: '0.25rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            cursor: 'pointer',
        },
        modalHeader: {
            background: 'linear-gradient(90deg, #003c82, #00a8ff)',
            color: 'white',
            borderBottom: 'none',
        },
        btnCalcular: {
            backgroundColor: '#FFD700',
            color: '#0A0F1E',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontWeight: 'bold',
            width: '100%',
        },
        resultadoContainer: {
            backgroundColor: '#e9ecef',
            borderRadius: '8px',
            padding: '1rem',
            textAlign: 'center',
            marginTop: '1rem',
        },
    };

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
                {!isLoggedIn && (
                    <Link to="/login" style={styles.loginPrompt}>
                        <FaSignInAlt /> Inicia sesión para acceder a más beneficios
                    </Link>
                )}
            </div>

            {/* Grid de 2 columnas: Contenido principal + Sidebar */}
            <div style={styles.grid2cols}>
                {/* Columna izquierda: Cards de funcionalidades */}
                <div>
                    <div style={styles.card}>
                        <div style={styles.cardTitle}>
                            <FaCar style={{ color: '#FFD700' }} /> Crédito Automotriz
                        </div>
                        <div style={styles.cardBody}>
                            Financiamiento para tu auto nuevo o seminuevo con tasas preferenciales para agremiados.
                            {!isLoggedIn && (
                                <div style={{ marginTop: '1rem', color: '#FFD700', fontSize: '0.85rem' }}>
                                    🔒 Inicia sesión para solicitar tu crédito
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Calculadora Card - ahora usa React Bootstrap */}
                    <div style={styles.calculadoraCard} onClick={abrirModal}>
                        <div style={styles.calculadoraIcon}>
                            <FaCar />
                        </div>
                        <h3 style={styles.calculadoraTitle}>PRÉSTAMO DE AUTO</h3>
                        <p style={styles.calculadoraDescription}>Financiamiento para la compra de tu vehículo</p>
                        <button type="button" style={styles.calculadoraBtn}>
                            <FaCalculator /> Calcular
                        </button>
                    </div>

                    <div style={styles.card}>
                        <div style={styles.cardTitle}>
                            <FaNewspaper style={{ color: '#FFD700' }} /> Noticias y Avisos
                        </div>
                        <div style={styles.cardBody}>
                            {loadingNoticias ? (
                                <p>Cargando noticias...</p>
                            ) : (
                                noticias.map((noticia, idx) => (
                                    <div key={idx} style={styles.noticiaCard}>
                                        <div style={styles.noticiaTitulo}>{noticia.titulo}</div>
                                        <div style={styles.noticiaResumen}>
                                            {noticia.resumen?.substring(0, 100)}...
                                        </div>
                                        <small style={{ color: '#999' }}>
                                            📅 {noticia.fecha} | 👁️ {noticia.vistas} vistas
                                        </small>
                                    </div>
                                ))
                            )}
                            {!isLoggedIn && noticias.length > 0 && (
                                <div style={{ marginTop: '1rem', color: '#FFD700', fontSize: '0.85rem' }}>
                                    🔒 Inicia sesión para ver todas las noticias y documentos
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Columna derecha: Sidebar con reglas y simulador */}
                <div style={styles.sidebar}>
                    <div style={styles.sidebarTitle}>
                        <FaInfoCircle /> ¿Cómo participar?
                    </div>
                    <ul style={styles.listaReglas}>
                        <li style={styles.listaReglasItem}>
                            <FaShieldAlt style={{ color: '#FFD700' }} /> Ser agremiado activo
                        </li>
                        <li style={styles.listaReglasItem}>
                            <FaChartLine style={{ color: '#FFD700' }} /> Tener mínimo 1 año de antigüedad
                        </li>
                        <li style={styles.listaReglasItem}>
                            <FaGift style={{ color: '#FFD700' }} /> Participar en la rifa de créditos automotrices
                        </li>
                    </ul>
                    
                    {!isLoggedIn ? (
                        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#FFD70020', borderRadius: '8px', textAlign: 'center' }}>
                            <p style={{ fontWeight: 'bold' }}>✨ Beneficios exclusivos para agremiados ✨</p>
                            <p style={{ fontSize: '0.85rem' }}>Préstamos, rifas, sorteos y más</p>
                            <Link to="/registro" style={{ ...styles.loginPrompt, backgroundColor: '#FFD700', marginTop: '0.5rem' }}>
                                Regístrate aquí
                            </Link>
                        </div>
                    ) : (
                        <div style={{ marginTop: '1rem' }}>
                            <Link to="/registro-credito" style={styles.loginPrompt}>
                                Solicitar crédito
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal con React Bootstrap */}
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
                                <span className="d-block fs-3 fw-semibold" style={{ color: '#003c82' }}>
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