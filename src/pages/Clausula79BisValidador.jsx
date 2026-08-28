import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaArrowLeft, FaSearch, FaCheckCircle, FaExclamationTriangle, 
    FaClock, FaInfoCircle, FaTimesCircle, FaSync, FaEye,
    FaFilePdf, FaSave, FaUser, FaIdCard, FaBuilding,
    FaPhone, FaEnvelope, FaUserPlus, FaCalendarAlt,
    FaShieldAlt, FaStar, FaRocket, FaFilter
} from 'react-icons/fa';
import { apiUrl } from '../config';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// ✅ IMPORTAR CSS EXTERNO
import '../css/Clausula79BisValidador.css';

const Clausula79BisValidador = () => {
    const [registros, setRegistros] = useState([]);
    const [registrosFiltrados, setRegistrosFiltrados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroEstatus, setFiltroEstatus] = useState('todos');
    const [busqueda, setBusqueda] = useState('');
    const [validandoId, setValidandoId] = useState(null);

    const [validadorData] = useState(() => ({
        matricula: localStorage.getItem('matricula') || '',
        nombre: localStorage.getItem('nombre') || 'Validador'
    }));

    const [validationDrafts, setValidationDrafts] = useState({});

    const cargarRegistros = async () => {
        setLoading(true);
        try {
            const response = await fetch(apiUrl('/clausula79bis_listar.php'));
            const data = await response.json();
            console.log('📦 DATA COMPLETA:', data);
            console.log('📦 REGISTROS:', data.registros);
            console.log('📦 TOTAL:', data.total);
            
            if (data.success) {
                setRegistros(data.registros || []);
                setRegistrosFiltrados(data.registros || []);
                console.log('✅ Registros guardados en estado:', data.registros?.length);
                
                const drafts = {};
                (data.registros || []).forEach(r => {
                    drafts[r.id] = {
                        estatus: r.estatus || 1,
                        observaciones: r.observaciones || ''
                    };
                });
                setValidationDrafts(drafts);
                console.log('✅ Drafts guardados:', drafts);
            }
        } catch (error) {
            console.error('Error cargando registros:', error);
            Swal.fire({
                title: '❌ Error',
                text: 'Error al cargar los registros',
                icon: 'error',
                confirmButtonColor: '#dc3545',
            });
        } finally {
            setLoading(false);
            console.log('🏁 Loading terminado');
        }
    };

    useEffect(() => {
        const matricula = localStorage.getItem('matricula');
        if (!matricula) {
            window.location.href = '/login';
            return;
        }
        cargarRegistros();
    }, []);

    useEffect(() => {
        console.log('🔄 Aplicando filtros...');
        console.log('📋 Registros antes de filtrar:', registros);
        console.log('🔍 Filtro estatus:', filtroEstatus);
        console.log('🔍 Búsqueda:', busqueda);
        
        let filtrados = [...registros];
        
        if (filtroEstatus !== 'todos') {
            filtrados = filtrados.filter(r => r.estatus === parseInt(filtroEstatus));
            console.log('📌 Filtrados por estatus:', filtrados);
        }
        
        if (busqueda.trim() !== '') {
            const term = busqueda.trim().toLowerCase();
            filtrados = filtrados.filter(r => 
                r.matricula.toLowerCase().includes(term) ||
                r.nombre?.toLowerCase().includes(term) ||
                r.adscripcion?.toLowerCase().includes(term) ||
                r.categoria?.toLowerCase().includes(term)
            );
            console.log('📌 Filtrados por búsqueda:', filtrados);
        }
        
        setRegistrosFiltrados(filtrados);
        console.log('✅ Registros filtrados final:', filtrados);
    }, [filtroEstatus, busqueda, registros]);

    const getStatusInfo = (estatus) => {
        const map = {
            1: { color: '#6c757d', icon: <FaClock />, label: 'Preregistro', bg: 'linear-gradient(135deg, #6c757d, #495057)', textColor: 'white' },
            2: { color: '#28a745', icon: <FaCheckCircle />, label: 'Aprobado', bg: 'linear-gradient(135deg, #28a745, #20c997)', textColor: 'white' },
            3: { color: '#ffc107', icon: <FaExclamationTriangle />, label: 'Observaciones', bg: 'linear-gradient(135deg, #ffc107, #fd7e14)', textColor: '#0A0F1E' },
            4: { color: '#fd7e14', icon: <FaInfoCircle />, label: 'Incompleto', bg: 'linear-gradient(135deg, #fd7e14, #dc3545)', textColor: 'white' },
            5: { color: '#dc3545', icon: <FaTimesCircle />, label: 'Denegado', bg: 'linear-gradient(135deg, #dc3545, #c82333)', textColor: 'white' }
        };
        return map[estatus] || map[1];
    };

    const getDraft = (id) => {
        return validationDrafts[id] || {
            estatus: 1,
            observaciones: ''
        };
    };

    const updateDraft = (id, field, value) => {
        setValidationDrafts(prev => ({
            ...prev,
            [id]: {
                ...getDraft(id),
                [field]: value
            }
        }));
    };

    const handleValidar = async (registro) => {
        const draft = getDraft(registro.id);
        const estatus = draft.estatus;
        const observaciones = draft.observaciones.trim();

        setValidandoId(registro.id);

        if (!estatus) {
            Swal.fire({
                title: '⚠️ Selecciona un estatus',
                text: 'Debes seleccionar un estatus para la validación.',
                icon: 'warning',
                confirmButtonColor: '#ffc107',
            });
            setValidandoId(null);
            return;
        }

        if (estatus === 3 && !observaciones) {
            Swal.fire({
                title: '⚠️ Observaciones requeridas',
                text: 'Cuando el estatus es "Observaciones", debes escribir un mensaje.',
                icon: 'warning',
                confirmButtonColor: '#ffc107',
            });
            setValidandoId(null);
            return;
        }

        const confirm = await Swal.fire({
            title: '¿Guardar validación?',
            html: `¿Estás seguro de guardar esta validación?<br><small style="color:#6c757d;">El usuario recibirá notificación del cambio.</small>`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3EAEF4',
            cancelButtonColor: '#6c757d',
            confirmButtonText: '✅ Sí, guardar',
            cancelButtonText: '❌ Cancelar',
        });

        if (!confirm.isConfirmed) {
            setValidandoId(null);
            return;
        }

        Swal.fire({
            title: 'Guardando validación...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            const response = await fetch(apiUrl('/clausula79bis_validar.php'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: registro.id,
                    estatus: estatus,
                    observaciones: observaciones,
                    validador_matricula: validadorData.matricula
                })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Error al validar');
            }

            await Swal.fire({
                title: '✅ ¡Validación guardada!',
                text: 'La validación se ha guardado correctamente.',
                icon: 'success',
                confirmButtonColor: '#28a745',
                timer: 2000,
                timerProgressBar: true,
            });

            cargarRegistros();

        } catch (error) {
            await Swal.fire({
                title: '❌ Error',
                text: error.message || 'Error al guardar la validación',
                icon: 'error',
                confirmButtonColor: '#dc3545',
            });
        } finally {
            setValidandoId(null);
        }
    };

    const getEstatusOptions = () => {
        return [
            { value: 1, label: '1 - Preregistro' },
            { value: 2, label: '2 - Aprobado' },
            { value: 3, label: '3 - Observaciones' },
            { value: 4, label: '4 - Incompleto' },
            { value: 5, label: '5 - Denegado' }
        ];
    };

    if (!validadorData.matricula) {
        return (
            <div className="clausulavalidador-container">
                <div className="clausulavalidador-loading">
                    <div className="clausulavalidador-spinner" role="status" />
                    <span>Verificando permisos...</span>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="clausulavalidador-container">
                <div className="clausulavalidador-loading">
                    <div className="clausulavalidador-spinner" role="status" />
                    <span>Cargando registros...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="clausulavalidador-wrapper">
            {/* Header Banner Sección 5 */}
            <div className="clausulavalidador-header ui-shadow">
                <div className="clausulavalidador-header-dots dot-matrix"></div>
                <div className="clausulavalidador-header-content">
                    <div className="clausulavalidador-header-left">
                        <Link to="/" className="clausulavalidador-back-button">
                            <FaArrowLeft size={12} /> Volver al Inicio
                        </Link>
                        <div className="clausulavalidador-header-titles">
                            <span className="clausulavalidador-header-tag">Control de Evento</span>
                            <h1 className="clausulavalidador-title">
                                Validador Cláusula 79Bis
                            </h1>
                            <p className="clausulavalidador-subtitle">
                                Gestiona y valida los expedientes de registro para el festejo institucional
                            </p>
                        </div>
                    </div>
                    <div className="clausulavalidador-header-right">
                        <span className="clausulavalidador-header-badge">
                            <FaShieldAlt style={{ marginRight: '6px' }} /> {registrosFiltrados.length} registros
                        </span>
                    </div>
                </div>

                {/* Matriz decorativa de puntitos en esquina */}
                <div className="clausulavalidador-header-dots-matrix">
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

            {/* Filtros */}
            <div className="clausulavalidador-filter-bar">
                <div className="clausulavalidador-search-wrapper">
                    <FaSearch className="clausulavalidador-search-icon" />
                    <input
                        type="text"
                        className="clausulavalidador-search-input"
                        placeholder="Buscar por matrícula, nombre, adscripción..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>

                <select
                    className="clausulavalidador-filter-select"
                    value={filtroEstatus}
                    onChange={(e) => setFiltroEstatus(e.target.value)}
                >
                    <option value="todos">📋 Todos los estatus</option>
                    <option value="1">⏳ Preregistro</option>
                    <option value="2">✅ Aprobado</option>
                    <option value="3">⚠️ Observaciones</option>
                    <option value="4">📝 Incompleto</option>
                    <option value="5">❌ Denegado</option>
                </select>

                <div className="clausulavalidador-results-badge">
                    <FaFilter style={{ color: '#8E44AD' }} /> {registrosFiltrados.length} registros
                </div>

                <button className="clausulavalidador-refresh-button" onClick={cargarRegistros}>
                    <FaSync /> Actualizar
                </button>
            </div>

            {/* Grid de registros */}
            {registrosFiltrados.length === 0 ? (
                <div className="clausulavalidador-empty-state">
                    <FaInfoCircle className="clausulavalidador-empty-icon" />
                    <h4 className="clausulavalidador-empty-title">No hay registros</h4>
                    <p className="clausulavalidador-empty-text">No se encontraron registros que coincidan con los filtros.</p>
                </div>
            ) : (
                <div className="clausulavalidador-grid">
                    {registrosFiltrados.map((registro) => {
                        const draft = getDraft(registro.id);
                        const statusInfo = getStatusInfo(registro.estatus);
                        const isSaving = validandoId === registro.id;

                        return (
                            <div key={registro.id} className="clausulavalidador-card">
                                {/* Header */}
                                <div className="clausulavalidador-card-header">
                                    <div>
                                        <small style={{ color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem' }}>Registro #{registro.id}</small>
                                        <h6 className="mb-0" style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B' }}>
                                            {registro.nombre || 'Sin nombre'}
                                        </h6>
                                    </div>
                                    <span className="clausulavalidador-badge" style={{ background: statusInfo.bg, color: statusInfo.textColor }}>
                                        {statusInfo.icon} {statusInfo.label}
                                    </span>
                                </div>

                                {/* Body */}
                                <div className="clausulavalidador-card-body">
                                    {/* Datos del trabajador */}
                                    <div className="clausulavalidador-grid-2cols">
                                        <div>
                                            <div className="clausulavalidador-info-row"><FaIdCard /> Matrícula</div>
                                            <div className="clausulavalidador-info-value">{registro.matricula}</div>
                                        </div>
                                        <div>
                                            <div className="clausulavalidador-info-row"><FaBuilding /> Adscripción</div>
                                            <div className="clausulavalidador-info-value">{registro.adscripcion || 'N/A'}</div>
                                        </div>
                                        <div>
                                            <div className="clausulavalidador-info-row"><FaUser /> Categoría</div>
                                            <div className="clausulavalidador-info-value">{registro.categoria || 'N/A'}</div>
                                        </div>
                                        <div>
                                            <div className="clausulavalidador-info-row"><FaCalendarAlt /> Registro</div>
                                            <div className="clausulavalidador-info-value">
                                                {registro.fecha_registro ? new Date(registro.fecha_registro).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Teléfono y Correo */}
                                    <div className="clausulavalidador-grid-2cols clausulavalidador-mt-1">
                                        <div>
                                            <div className="clausulavalidador-info-row"><FaPhone /> Teléfono</div>
                                            <div className="clausulavalidador-info-value">{registro.telefono || 'N/A'}</div>
                                        </div>
                                        <div>
                                            <div className="clausulavalidador-info-row"><FaEnvelope /> Correo</div>
                                            <div className="clausulavalidador-info-value">{registro.correo || 'N/A'}</div>
                                        </div>
                                    </div>

                                    {/* Acompañante */}
                                    {registro.tiene_acompanante == 1 && (
                                        <div className="clausulavalidador-mt-1">
                                            <div className="clausulavalidador-info-row"><FaUserPlus /> Acompañante</div>
                                            <div className="clausulavalidador-info-value">{registro.nombre_acompanante || 'No especificado'}</div>
                                        </div>
                                    )}

                                    {/* Documentos */}
                                    <div className="clausulavalidador-documentos-row">
                                        {registro.tarjeton_ruta ? (
                                            <a href={apiUrl(registro.tarjeton_ruta)} target="_blank" rel="noopener noreferrer" className="clausulavalidador-doc-link">
                                                <FaFilePdf /> Tarjetón
                                            </a>
                                        ) : (
                                            <span className="clausulavalidador-doc-link clausulavalidador-doc-link-disabled">
                                                <FaFilePdf /> Sin tarjetón
                                            </span>
                                        )}
                                        {registro.ine_ruta ? (
                                            <a href={apiUrl(registro.ine_ruta)} target="_blank" rel="noopener noreferrer" className="clausulavalidador-doc-link">
                                                <FaFilePdf /> INE
                                            </a>
                                        ) : (
                                            <span className="clausulavalidador-doc-link clausulavalidador-doc-link-disabled">
                                                <FaFilePdf /> Sin INE
                                            </span>
                                        )}
                                    </div>

                                    {/* Observaciones existentes */}
                                    {registro.observaciones && (
                                        <div className="clausulavalidador-observaciones-box">
                                            <strong>📝 Observaciones previas:</strong> {registro.observaciones}
                                        </div>
                                    )}

                                    {/* Área de validación */}
                                    <div className="clausulavalidador-border-top clausulavalidador-mt-2">
                                        <div className="clausulavalidador-grid-2cols-validacion">
                                            <div>
                                                <label className="clausulavalidador-label-small">
                                                    Observaciones
                                                </label>
                                                <textarea
                                                    className="clausulavalidador-textarea"
                                                    rows="2"
                                                    placeholder="Observaciones para el trabajador..."
                                                    value={draft.observaciones}
                                                    onChange={(e) => updateDraft(registro.id, 'observaciones', e.target.value)}
                                                    disabled={isSaving}
                                                />
                                            </div>
                                            <div>
                                                <label className="clausulavalidador-label-small">
                                                    Estatus
                                                </label>
                                                <select
                                                    className="clausulavalidador-select"
                                                    value={draft.estatus}
                                                    onChange={(e) => updateDraft(registro.id, 'estatus', parseInt(e.target.value))}
                                                    disabled={isSaving}
                                                >
                                                    {getEstatusOptions().map(opt => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <button
                                            className="clausulavalidador-btn-save"
                                            onClick={() => handleValidar(registro)}
                                            disabled={isSaving}
                                        >
                                            <FaSave /> {isSaving ? 'Guardando...' : 'Guardar Validación'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Clausula79BisValidador;