import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaArrowLeft, FaSearch, FaPlusCircle, FaMinusCircle, 
    FaFileAlt, FaTimes, FaInfoCircle, FaRocket, FaStar,
    FaListAlt, FaTag, FaBookOpen, FaDownload, FaFilePdf
} from 'react-icons/fa';
import { apiUrl } from '../config';
import { Modal } from 'react-bootstrap';

const Conceptos = () => {
    const [conceptos, setConceptos] = useState([]);
    const [conceptosFiltrados, setConceptosFiltrados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [conceptoSeleccionado, setConceptoSeleccionado] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const cargarConceptos = async () => {
        setLoading(true);
        try {
            const response = await fetch(apiUrl('/api_conceptos.php'));
            const data = await response.json();
            if (data.success) {
                setConceptos(data.conceptos || []);
                setConceptosFiltrados(data.conceptos || []);
            } else {
                console.error('Error en la respuesta:', data.message);
            }
        } catch (error) {
            console.error('Error cargando conceptos:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarConceptos();
    }, []);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setConceptosFiltrados(conceptos);
            return;
        }
        const term = searchTerm.trim().toLowerCase();
        const filtrados = conceptos.filter(c => 
            c.numero.toLowerCase().includes(term) ||
            c.titulo.toLowerCase().includes(term) ||
            (c.descripcion && c.descripcion.toLowerCase().includes(term))
        );
        setConceptosFiltrados(filtrados);
    }, [searchTerm, conceptos]);

    const abrirDetalle = (concepto) => {
        setConceptoSeleccionado(concepto);
        setShowModal(true);
    };

    const cerrarDetalle = () => {
        setShowModal(false);
        setConceptoSeleccionado(null);
    };

    const aportaciones = conceptosFiltrados.filter(c => c.categoria === 'aportacion');
    const descuentos = conceptosFiltrados.filter(c => c.categoria === 'descuento');

    // ========== ESTILOS MODERNOS CON RESPONSIVE ==========
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
        // Header con glow
        header: {
            background: 'linear-gradient(135deg, #0A0F1E 0%, #1a1f2e 50%, #0A0F1E 100%)',
            borderRadius: '20px',
            padding: '2.5rem 2rem',
            marginBottom: '2rem',
            borderBottom: '4px solid #3EAEF4',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            position: 'relative',
            overflow: 'hidden',
            '@media (max-width: 768px)': {
                padding: '1.5rem 1.2rem',
            },
            '@media (max-width: 480px)': {
                padding: '1.2rem 0.8rem',
            },
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
            '@media (max-width: 768px)': {
                flexDirection: 'column',
                textAlign: 'center',
                gap: '0.8rem',
            },
        },
        headerLeft: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            '@media (max-width: 768px)': {
                flexDirection: 'column',
                justifyContent: 'center',
            },
        },
        backButton: {
            color: 'white',
            backgroundColor: 'rgba(255,255,255,0.1)',
            padding: '0.7rem 1.2rem',
            borderRadius: '12px',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: '500',
            '@media (max-width: 768px)': {
                width: '100%',
                justifyContent: 'center',
            },
        },
        title: {
            fontSize: '2rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #fff 30%, #3EAEF4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            '@media (max-width: 768px)': {
                fontSize: '1.5rem',
                justifyContent: 'center',
            },
            '@media (max-width: 480px)': {
                fontSize: '1.2rem',
            },
        },
        subtitle: {
            color: '#aab',
            fontSize: '0.95rem',
            margin: 0,
            '@media (max-width: 768px)': {
                fontSize: '0.85rem',
            },
        },
        headerBadge: {
            display: 'inline-block',
            backgroundColor: '#3EAEF4',
            color: '#0A0F1E',
            padding: '0.3rem 1rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
        },
        // Search Bar
        searchBar: {
            display: 'flex',
            gap: '0.8rem',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '1rem 1.5rem',
            border: '1px solid rgba(255,255,255,0.5)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            '@media (max-width: 768px)': {
                flexDirection: 'column',
                padding: '1rem',
            },
        },
        searchInputWrapper: {
            flex: 1,
            position: 'relative',
            minWidth: '200px',
            '@media (max-width: 768px)': {
                width: '100%',
            },
        },
        searchIcon: {
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#999',
            fontSize: '0.9rem',
        },
        searchInput: {
            width: '100%',
            padding: '0.7rem 1rem 0.7rem 2.5rem',
            fontSize: '0.95rem',
            border: '1px solid #ddd',
            borderRadius: '25px',
            outline: 'none',
            transition: 'all 0.3s ease',
            backgroundColor: '#f0f2f5',
            height: '46px',
        },
        resultsBadge: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1.2rem',
            borderRadius: '20px',
            background: '#f0f2f5',
            color: '#6c757d',
            fontSize: '0.9rem',
            fontWeight: '500',
            whiteSpace: 'nowrap',
            '@media (max-width: 768px)': {
                width: '100%',
                justifyContent: 'center',
            },
        },
        clearButton: {
            background: 'transparent',
            border: '1px solid #ddd',
            borderRadius: '20px',
            padding: '0.4rem 1rem',
            fontSize: '0.8rem',
            color: '#6c757d',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            '@media (max-width: 768px)': {
                width: '100%',
                justifyContent: 'center',
            },
        },
        // ===== CONTENEDOR FLEX RESPONSIVE =====
        grid2cols: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2rem',
            '@media (max-width: 992px)': {
                gap: '1.5rem',
            },
        },
        colAportaciones: {
            flex: '1 1 calc(50% - 1rem)',
            minWidth: '250px',
            order: 1,
            '@media (max-width: 992px)': {
                flex: '1 1 100%',
                order: 1,
            },
        },
        colDescuentos: {
            flex: '1 1 calc(50% - 1rem)',
            minWidth: '250px',
            order: 2,
            '@media (max-width: 992px)': {
                flex: '1 1 100%',
                order: 2,
            },
        },
        sectionTitle: {
            fontSize: '1.2rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: '3px solid #3EAEF4',
            color: '#0A0F1E',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            '@media (max-width: 480px)': {
                fontSize: '1rem',
            },
        },
        // Concept Item
        conceptItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.8rem 1rem',
            backgroundColor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.5)',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            marginBottom: '0.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            '@media (max-width: 480px)': {
                padding: '0.6rem 0.8rem',
                gap: '0.5rem',
            },
        },
        conceptIcon: {
            fontSize: '1.2rem',
            flexShrink: 0,
            width: '32px',
            textAlign: 'center',
            '@media (max-width: 480px)': {
                fontSize: '1rem',
                width: '24px',
            },
        },
        conceptInfo: {
            flex: 1,
            minWidth: 0,
        },
        conceptNumero: {
            fontSize: '0.7rem',
            color: '#6c757d',
            fontWeight: '600',
            letterSpacing: '0.5px',
        },
        conceptTitulo: {
            fontSize: '0.9rem',
            fontWeight: '500',
            color: '#0A0F1E',
            '@media (max-width: 480px)': {
                fontSize: '0.8rem',
            },
        },
        conceptDescripcion: {
            fontSize: '0.75rem',
            color: '#6c757d',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            '@media (max-width: 480px)': {
                fontSize: '0.7rem',
            },
        },
        emptyState: {
            textAlign: 'center',
            padding: '4rem 2rem',
            color: '#6c757d',
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.5)',
        },
        // ===== MODAL MODERNO =====
        modalHeader: {
            background: 'linear-gradient(135deg, #0A0F1E, #1a1f2e)',
            color: 'white',
            borderBottom: '3px solid #3EAEF4',
            borderRadius: '16px 16px 0 0',
            padding: '1.5rem 2rem',
        },
        modalBody: {
            padding: '2rem',
            background: '#f8fafc',
            borderRadius: '0 0 16px 16px',
        },
        modalNumero: {
            fontSize: '0.85rem',
            color: '#6c757d',
            fontWeight: '600',
            letterSpacing: '0.5px',
            marginBottom: '0.2rem',
        },
        modalTitulo: {
            fontSize: '1.8rem',
            fontWeight: 'bold',
            color: '#0A0F1E',
            marginBottom: '0.5rem',
            '@media (max-width: 480px)': {
                fontSize: '1.3rem',
            },
        },
        modalCategoria: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.25rem 0.75rem',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: '600',
            marginBottom: '1rem',
        },
        modalDescripcion: {
            fontSize: '1rem',
            lineHeight: '1.8',
            color: '#333',
            whiteSpace: 'pre-wrap',
            '@media (max-width: 480px)': {
                fontSize: '0.9rem',
            },
        },
        // ===== BOTÓN DE DESCARGA =====
        downloadButton: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            padding: '0.6rem 1.5rem',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textDecoration: 'none',
            marginTop: '1.5rem',
            width: '100%',
            justifyContent: 'center',
        },
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <div className="spinner-border text-warning" role="status" style={{ width: '3rem', height: '3rem' }} />
                    <p className="mt-3 text-muted">Cargando conceptos...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header con glow */}
            <div style={styles.header}>
                <div style={styles.headerGlow} />
                <div style={styles.headerContent}>
                    <div style={styles.headerLeft}>
                        <Link to="/herramientas" style={styles.backButton}>
                            <FaArrowLeft /> Volver
                        </Link>
                        <div>
                            <h1 style={styles.title}>
                                <FaRocket style={{ color: '#3EAEF4' }} /> Conceptos del Tarjetón
                            </h1>
                            <p style={styles.subtitle}>
                                Consulta la descripción de cada concepto que aparece en tu tarjetón de pago
                            </p>
                        </div>
                    </div>
                    <div>
                        <span style={styles.headerBadge}>
                            <FaBookOpen style={{ marginRight: '5px' }} /> {conceptosFiltrados.length} conceptos
                        </span>
                    </div>
                </div>
            </div>

            {/* Buscador */}
            <div style={styles.searchBar}>
                <div style={styles.searchInputWrapper}>
                    <FaSearch style={styles.searchIcon} />
                    <input
                        type="text"
                        style={styles.searchInput}
                        placeholder="Buscar por número, título o descripción..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={(e) => {
                            e.target.style.borderColor = '#3EAEF4';
                            e.target.style.boxShadow = '0 0 0 3px rgba(62,174,244,0.15)';
                            e.target.style.backgroundColor = 'white';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = '#ddd';
                            e.target.style.boxShadow = 'none';
                            e.target.style.backgroundColor = '#f0f2f5';
                        }}
                    />
                </div>
                <div style={styles.resultsBadge}>
                    <FaListAlt style={{ color: '#3EAEF4' }} /> {conceptosFiltrados.length} conceptos
                </div>
                {searchTerm && (
                    <button 
                        style={styles.clearButton}
                        onClick={() => setSearchTerm('')}
                    >
                        <FaTimes /> Limpiar
                    </button>
                )}
            </div>

            {/* ===== GRID FLEX RESPONSIVE ===== */}
            <div style={styles.grid2cols}>
                {/* Columna: Aportaciones */}
                <div style={styles.colAportaciones}>
                    <h3 style={styles.sectionTitle}>
                        <FaPlusCircle style={{ color: '#28a745' }} /> Conceptos de Aportación
                    </h3>
                    {aportaciones.length > 0 ? (
                        aportaciones.map(concepto => (
                            <div 
                                key={concepto.id}
                                style={styles.conceptItem}
                                onClick={() => abrirDetalle(concepto)}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateX(4px)';
                                    e.currentTarget.style.borderColor = '#3EAEF4';
                                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(62,174,244,0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateX(0)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                                }}
                            >
                                <div style={styles.conceptIcon}>
                                    <FaPlusCircle style={{ color: '#28a745' }} />
                                </div>
                                <div style={styles.conceptInfo}>
                                    <div style={styles.conceptNumero}>Concepto {concepto.numero}</div>
                                    <div style={styles.conceptTitulo}>{concepto.titulo}</div>
                                    {concepto.descripcion && (
                                        <div style={styles.conceptDescripcion}>{concepto.descripcion}</div>
                                    )}
                                </div>
                                <FaInfoCircle style={{ color: '#3EAEF4', fontSize: '0.9rem', flexShrink: 0 }} />
                            </div>
                        ))
                    ) : (
                        <p className="text-muted">No hay conceptos de aportación.</p>
                    )}
                </div>

                {/* Columna: Descuentos */}
                <div style={styles.colDescuentos}>
                    <h3 style={styles.sectionTitle}>
                        <FaMinusCircle style={{ color: '#dc3545' }} /> Conceptos de Descuento
                    </h3>
                    {descuentos.length > 0 ? (
                        descuentos.map(concepto => (
                            <div 
                                key={concepto.id}
                                style={styles.conceptItem}
                                onClick={() => abrirDetalle(concepto)}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateX(4px)';
                                    e.currentTarget.style.borderColor = '#3EAEF4';
                                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(62,174,244,0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateX(0)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                                }}
                            >
                                <div style={styles.conceptIcon}>
                                    <FaMinusCircle style={{ color: '#dc3545' }} />
                                </div>
                                <div style={styles.conceptInfo}>
                                    <div style={styles.conceptNumero}>Concepto {concepto.numero}</div>
                                    <div style={styles.conceptTitulo}>{concepto.titulo}</div>
                                    {concepto.descripcion && (
                                        <div style={styles.conceptDescripcion}>{concepto.descripcion}</div>
                                    )}
                                </div>
                                <FaInfoCircle style={{ color: '#3EAEF4', fontSize: '0.9rem', flexShrink: 0 }} />
                            </div>
                        ))
                    ) : (
                        <p className="text-muted">No hay conceptos de descuento.</p>
                    )}
                </div>
            </div>

            {/* Empty State */}
            {conceptosFiltrados.length === 0 && (
                <div style={styles.emptyState}>
                    <FaFileAlt style={{ fontSize: '4rem', color: '#3EAEF4', marginBottom: '1rem', opacity: 0.3 }} />
                    <h4 style={{ color: '#0A0F1E' }}>No se encontraron conceptos</h4>
                    <p style={{ color: '#6c757d' }}>No hay conceptos que coincidan con tu búsqueda.</p>
                    <button 
                        className="btn btn-link"
                        onClick={() => setSearchTerm('')}
                        style={{ color: '#3EAEF4', fontWeight: 'bold', textDecoration: 'none' }}
                    >
                        Ver todos los conceptos
                    </button>
                </div>
            )}

            {/* ===== MODAL DE DETALLE MODERNO ===== */}
            <Modal show={showModal} onHide={cerrarDetalle} centered size="lg">
                <Modal.Header closeButton style={styles.modalHeader}>
                    <Modal.Title>
                        <FaTag style={{ color: '#3EAEF4', marginRight: '10px' }} /> Detalle del Concepto
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={styles.modalBody}>
                    {conceptoSeleccionado && (
                        <>
                            <div style={styles.modalNumero}>Concepto {conceptoSeleccionado.numero}</div>
                            <h3 style={styles.modalTitulo}>{conceptoSeleccionado.titulo}</h3>
                            <span 
                                style={{
                                    ...styles.modalCategoria,
                                    backgroundColor: conceptoSeleccionado.categoria === 'aportacion' ? '#d4edda' : '#f8d7da',
                                    color: conceptoSeleccionado.categoria === 'aportacion' ? '#155724' : '#721c24',
                                }}
                            >
                                {conceptoSeleccionado.categoria === 'aportacion' ? 
                                    <><FaPlusCircle /> Aportación</> : 
                                    <><FaMinusCircle /> Descuento</>
                                }
                            </span>
                            {conceptoSeleccionado.descripcion ? (
                                <div style={styles.modalDescripcion}>{conceptoSeleccionado.descripcion}</div>
                            ) : (
                                <p className="text-muted">No hay descripción disponible para este concepto.</p>
                            )}

                            {/* ===== BOTÓN DE DESCARGA PDF ===== */}
                            <a 
                                href="/recursos/conceptos.pdf" 
                                target="_blank"
                                rel="noopener noreferrer"
                                style={styles.downloadButton}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#218838';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(40,167,69,0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#28a745';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <FaFilePdf /> Descargar PDF completo de conceptos
                            </a>
                        </>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Conceptos;