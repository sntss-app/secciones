import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaArrowLeft, FaSearch, FaPlusCircle, FaMinusCircle, 
    FaFileAlt, FaTimes, FaInfoCircle, FaRocket, FaStar,
    FaListAlt, FaTag, FaBookOpen, FaDownload, FaFilePdf
} from 'react-icons/fa';
import { apiUrl } from '../config';
import { Modal } from 'react-bootstrap';

// ✅ IMPORTAR CSS EXTERNO
import '../css/Conceptos.css';

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

    if (loading) {
        return (
            <div className="conceptos-container">
                <div className="conceptos-loading">
                    <div className="conceptos-spinner" role="status" />
                    <p className="conceptos-loading-text">Cargando conceptos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="conceptos-wrapper">
            {/* Header Banner Sección 5 */}
            <div className="conceptos-header ui-shadow">
                <div className="conceptos-header-dots dot-matrix"></div>
                <div className="conceptos-header-content">
                    <div className="conceptos-header-left">
                        <Link to="/" className="conceptos-back-button">
                            <FaArrowLeft size={12} /> Volver al Inicio
                        </Link>
                        <div className="conceptos-header-titles">
                            <span className="conceptos-header-tag">Guía Informativa</span>
                            <h1 className="conceptos-title">
                                Conceptos del Tarjetón
                            </h1>
                            <p className="conceptos-subtitle">
                                Consulta la descripción y detalles de cada concepto que aparece en tu tarjetón de pago
                            </p>
                        </div>
                    </div>
                    <div className="conceptos-header-right">
                        <span className="conceptos-header-badge">
                            <FaBookOpen style={{ marginRight: '6px' }} /> {conceptosFiltrados.length} conceptos
                        </span>
                    </div>
                </div>

                {/* Matriz decorativa de puntitos en esquina */}
                <div className="conceptos-header-dots-matrix">
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

            {/* Buscador */}
            <div className="conceptos-search-bar">
                <div className="conceptos-search-wrapper">
                    <FaSearch className="conceptos-search-icon" />
                    <input
                        type="text"
                        className="conceptos-search-input"
                        placeholder="Buscar por número, título o descripción..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="conceptos-results-badge">
                    <FaListAlt style={{ color: '#3EAEF4' }} /> {conceptosFiltrados.length} conceptos
                </div>
                {searchTerm && (
                    <button 
                        className="conceptos-clear-button"
                        onClick={() => setSearchTerm('')}
                    >
                        <FaTimes /> Limpiar
                    </button>
                )}
            </div>

            {/* Grid */}
            <div className="conceptos-grid-2cols">
                {/* Columna: Aportaciones */}
                <div className="conceptos-col-aportaciones">
                    <h3 className="conceptos-section-title">
                        <FaPlusCircle style={{ color: '#28a745' }} /> Conceptos de Aportación
                    </h3>
                    {aportaciones.length > 0 ? (
                        aportaciones.map(concepto => (
                            <div 
                                key={concepto.id}
                                className="conceptos-item"
                                onClick={() => abrirDetalle(concepto)}
                            >
                                <div className="conceptos-item-icon">
                                    <FaPlusCircle style={{ color: '#28a745' }} />
                                </div>
                                <div className="conceptos-item-info">
                                    <div className="conceptos-item-numero">Concepto {concepto.numero}</div>
                                    <div className="conceptos-item-titulo">{concepto.titulo}</div>
                                    {concepto.descripcion && (
                                        <div className="conceptos-item-descripcion">{concepto.descripcion}</div>
                                    )}
                                </div>
                                <FaInfoCircle className="conceptos-item-info-icon" />
                            </div>
                        ))
                    ) : (
                        <p className="conceptos-text-muted">No hay conceptos de aportación.</p>
                    )}
                </div>

                {/* Columna: Descuentos */}
                <div className="conceptos-col-descuentos">
                    <h3 className="conceptos-section-title">
                        <FaMinusCircle style={{ color: '#dc3545' }} /> Conceptos de Descuento
                    </h3>
                    {descuentos.length > 0 ? (
                        descuentos.map(concepto => (
                            <div 
                                key={concepto.id}
                                className="conceptos-item"
                                onClick={() => abrirDetalle(concepto)}
                            >
                                <div className="conceptos-item-icon">
                                    <FaMinusCircle style={{ color: '#dc3545' }} />
                                </div>
                                <div className="conceptos-item-info">
                                    <div className="conceptos-item-numero">Concepto {concepto.numero}</div>
                                    <div className="conceptos-item-titulo">{concepto.titulo}</div>
                                    {concepto.descripcion && (
                                        <div className="conceptos-item-descripcion">{concepto.descripcion}</div>
                                    )}
                                </div>
                                <FaInfoCircle className="conceptos-item-info-icon" />
                            </div>
                        ))
                    ) : (
                        <p className="conceptos-text-muted">No hay conceptos de descuento.</p>
                    )}
                </div>
            </div>

            {/* Empty State */}
            {conceptosFiltrados.length === 0 && (
                <div className="conceptos-empty-state">
                    <FaFileAlt className="conceptos-empty-icon" />
                    <h4 className="conceptos-empty-title">No se encontraron conceptos</h4>
                    <p className="conceptos-text-muted">No hay conceptos que coincidan con tu búsqueda.</p>
                    <button 
                        className="conceptos-empty-link"
                        onClick={() => setSearchTerm('')}
                    >
                        Ver todos los conceptos
                    </button>
                </div>
            )}

            {/* Modal */}
            <Modal show={showModal} onHide={cerrarDetalle} centered size="lg" className="conceptos-modal-custom">
                <Modal.Header closeButton className="conceptos-modal-header">
                    <Modal.Title className="conceptos-modal-title">
                        <FaTag style={{ color: '#486DAA', marginRight: '10px' }} /> Detalle del Concepto
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="conceptos-modal-body">
                    {conceptoSeleccionado && (
                        <>
                            <div className="conceptos-modal-numero">Concepto {conceptoSeleccionado.numero}</div>
                            <h3 className="conceptos-modal-titulo">{conceptoSeleccionado.titulo}</h3>
                            <span 
                                className={`conceptos-modal-categoria ${
                                    conceptoSeleccionado.categoria === 'aportacion' 
                                        ? 'conceptos-modal-categoria-aportacion' 
                                        : 'conceptos-modal-categoria-descuento'
                                }`}
                            >
                                {conceptoSeleccionado.categoria === 'aportacion' ? 
                                    <><FaPlusCircle /> Aportación</> : 
                                    <><FaMinusCircle /> Descuento</>
                                }
                            </span>
                            {conceptoSeleccionado.descripcion ? (
                                <div className="conceptos-modal-descripcion">{conceptoSeleccionado.descripcion}</div>
                            ) : (
                                <p className="conceptos-text-muted">No hay descripción disponible para este concepto.</p>
                            )}

                            <a 
                                href="/recursos/conceptos.pdf" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="conceptos-download-button"
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