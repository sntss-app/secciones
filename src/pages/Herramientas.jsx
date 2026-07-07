import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaArrowLeft, FaCalculator, FaBuilding, FaHouseUser, FaCar, 
    FaPiggyBank, FaGift, FaFileContract, FaClock, FaUmbrellaBeach,
    FaFilePdf, FaExternalLinkAlt, FaCalendarAlt, FaFileAlt,
    FaStar, FaRocket
} from 'react-icons/fa';
import { Modal } from 'react-bootstrap';

// Importar componentes de calculadoras
import CreditoHipotecario from '../components/calculadoras/CreditoHipotecario';
import CreditoMedianoPlazo from '../components/calculadoras/CreditoMedianoPlazo';
import PrestamoAuto from '../components/calculadoras/PrestamoAuto';
import FondoAhorro from '../components/calculadoras/FondoAhorro';
import Aguinaldo from '../components/calculadoras/Aguinaldo';
import Clausula97 from '../components/calculadoras/Clausula97';
import HorasExtras from '../components/calculadoras/HorasExtras';
import Vacaciones from '../components/calculadoras/Vacaciones';

const Herramientas = () => {
    const [showModal, setShowModal] = useState(false);
    const [calculadoraActiva, setCalculadoraActiva] = useState(null);

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

    // Calculadoras con íconos más detallados
    const calculadoras = [
        { id: 'hipotecario', icon: <FaBuilding />, titulo: 'Crédito Hipotecario', descripcion: 'Calcula tu crédito para vivienda', color: '#4A90D9', bg: 'linear-gradient(135deg, #4A90D9 0%, #357ABD 100%)' },
        { id: 'mediano-plazo', icon: <FaHouseUser />, titulo: 'Crédito a Mediano Plazo', descripcion: 'Financiamiento para remodelación', color: '#5B86E5', bg: 'linear-gradient(135deg, #5B86E5 0%, #36D1DC 100%)' },
        { id: 'auto', icon: <FaCar />, titulo: 'Préstamo de Auto', descripcion: 'Financiamiento para tu vehículo', color: '#F2994A', bg: 'linear-gradient(135deg, #F2994A 0%, #F2C94C 100%)' },
        { id: 'fondo-ahorro', icon: <FaPiggyBank />, titulo: 'Fondo de Ahorro', descripcion: '2do de Julio - Calcula tu ahorro anual', color: '#27AE60', bg: 'linear-gradient(135deg, #27AE60 0%, #2ECC71 100%)' },
        { id: 'aguinaldo', icon: <FaGift />, titulo: 'Aguinaldo', descripcion: 'Calcula el monto de tu aguinaldo', color: '#E74C3C', bg: 'linear-gradient(135deg, #E74C3C 0%, #F39C12 100%)' },
        { id: 'clausula97', icon: <FaFileContract />, titulo: 'Cláusula 97 CCT', descripcion: 'Préstamo de hasta 4 meses de sueldo', color: '#8E44AD', bg: 'linear-gradient(135deg, #8E44AD 0%, #9B59B6 100%)' },
        { id: 'horas-extras', icon: <FaClock />, titulo: 'Horas Extras', descripcion: 'Calcula el pago de horas extras', color: '#E67E22', bg: 'linear-gradient(135deg, #E67E22 0%, #F39C12 100%)' },
        { id: 'vacaciones', icon: <FaUmbrellaBeach />, titulo: 'Pago de Vacaciones', descripcion: 'Calcula el pago de tus vacaciones', color: '#1ABC9C', bg: 'linear-gradient(135deg, #1ABC9C 0%, #16A085 100%)' },
    ];

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
            externo: false
        },
        { 
            id: 'estatutos', 
            icon: <FaFileAlt />, 
            titulo: 'Estatutos SNTSS', 
            descripcion: 'Descarga los Estatutos del SNTSS', 
            link: '/recursos/Estatutos.pdf',
            externo: false
        },
        { 
            id: 'conceptos', 
            icon: <FaFileContract />, 
            titulo: 'Conceptos del Tarjetón', 
            descripcion: 'Explicación de los conceptos del tarjetón', 
            link: '/conceptos',
            externo: false
        },
        { 
            id: 'calendario', 
            icon: <FaCalendarAlt />, 
            titulo: 'Calendario de Pagos', 
            descripcion: 'Fechas de pago quincenal', 
            link: '/calendario',
            externo: false
        },
    ];

    const styles = {
        container: {
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '2rem 1.5rem',
            minHeight: 'calc(100vh - 200px)',
            background: '#f0f4f8',
        },
        // Header con gradiente
        headerWrapper: {
            background: 'linear-gradient(135deg, #0A0F1E 0%, #1a1f2e 50%, #0A0F1E 100%)',
            borderRadius: '20px',
            padding: '2.5rem 2rem',
            marginBottom: '2.5rem',
            position: 'relative',
            overflow: 'hidden',
            borderBottom: '4px solid #3EAEF4',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        },
        headerGlow: {
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(62,174,244,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
        },
        headerContent: {
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            position: 'relative',
            zIndex: 2,
            flexWrap: 'wrap',
        },
        backButton: {
            color: 'white',
            backgroundColor: 'rgba(255,255,255,0.1)',
            padding: '0.8rem 1.2rem',
            borderRadius: '12px',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none',
            fontSize: '0.95rem',
            fontWeight: '500',
        },
        headerTitle: {
            fontSize: '2.5rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #fff 30%, #3EAEF4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
        },
        headerSubtitle: {
            color: '#aab',
            fontSize: '1.1rem',
            marginTop: '0.5rem',
            position: 'relative',
            zIndex: 2,
        },
        // Badge flotante
        badge: {
            display: 'inline-block',
            backgroundColor: '#3EAEF4',
            color: '#0A0F1E',
            padding: '0.3rem 1rem',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            marginTop: '0.5rem',
        },
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
        // Card moderna con efecto glass
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
        cardHover: {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
            borderColor: '#3EAEF4',
        },
        // Efecto de brillo en hover
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
        cardBadge: {
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            color: '#0A0F1E',
            fontSize: '0.6rem',
            fontWeight: 'bold',
            padding: '0.2rem 0.7rem',
            borderRadius: '20px',
            boxShadow: '0 2px 8px rgba(255,215,0,0.3)',
        },
        // Cards de recursos
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
        linkCardHover: {
            transform: 'translateY(-6px)',
            boxShadow: '0 12px 36px rgba(0,0,0,0.1)',
            borderColor: '#3EAEF4',
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
        modalHeader: {
            background: 'linear-gradient(135deg, #0A0F1E, #1a1f2e)',
            color: 'white',
            borderBottom: '3px solid #3EAEF4',
            borderRadius: '16px 16px 0 0',
            padding: '1.5rem 2rem',
        },
        // Responsive
        '@media (max-width: 768px)': {
            headerTitle: {
                fontSize: '1.8rem',
            },
            grid: {
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            },
        },
        '@media (max-width: 480px)': {
            headerContent: {
                flexDirection: 'column',
                alignItems: 'flex-start',
            },
            grid: {
                gridTemplateColumns: '1fr',
            },
        },
    };

    return (
        <div style={styles.container}>
            {/* Header con gradiente y glow */}
            <div style={styles.headerWrapper}>
                <div style={styles.headerGlow} />
                <div style={styles.headerContent}>
                    <Link to="/dashboard" style={styles.backButton}>
                        <FaArrowLeft /> Volver
                    </Link>
                    <div>
                        <h1 style={styles.headerTitle}>
                            <FaRocket style={{ color: '#3EAEF4' }} /> Herramientas
                        </h1>
                        <p style={styles.headerSubtitle}>
                            Calculadoras y recursos útiles para el trabajador
                        </p>
                        <span style={styles.badge}>
                            <FaStar style={{ marginRight: '5px' }} /> 8 herramientas disponibles
                        </span>
                    </div>
                </div>
            </div>

            {/* Sección: Calculadoras */}
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
                            e.currentTarget.querySelector('.card-glow').style.opacity = '1';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
                            e.currentTarget.querySelector('.card-glow').style.opacity = '0';
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

            {/* Sección: Recursos */}
            <div style={styles.sectionTitle}>
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

            {/* Modal de calculadora */}
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

export default Herramientas;