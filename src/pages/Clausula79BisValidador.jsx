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
        console.log('📦 DATA COMPLETA:', data);  // ← LOG
        console.log('📦 REGISTROS:', data.registros);  // ← LOG
        console.log('📦 TOTAL:', data.total);  // ← LOG
        
        if (data.success) {
            setRegistros(data.registros || []);
            setRegistrosFiltrados(data.registros || []);
            console.log('✅ Registros guardados en estado:', data.registros?.length);  // ← LOG
            
            const drafts = {};
            (data.registros || []).forEach(r => {
                drafts[r.id] = {
                    estatus: r.estatus || 1,
                    observaciones: r.observaciones || ''
                };
            });
            setValidationDrafts(drafts);
            console.log('✅ Drafts guardados:', drafts);  // ← LOG
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
        console.log('🏁 Loading terminado');  // ← LOG
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

        // Confirmación
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

        // Mostrar loading
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

    const formatter = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0
    });

    // ========== ESTILOS MODERNOS ==========
    const styles = {
        container: {
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '2rem 1.5rem',
            background: '#f0f4f8',
            minHeight: 'calc(100vh - 200px)',
        },
        header: {
            background: 'linear-gradient(135deg, #0A0F1E 0%, #1a1f2e 50%, #0A0F1E 100%)',
            borderRadius: '20px',
            padding: '2.5rem 2rem',
            marginBottom: '2rem',
            borderBottom: '4px solid #8E44AD',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            position: 'relative',
            overflow: 'hidden',
        },
        headerGlow: {
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(142,68,173,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
        },
        headerContent: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            position: 'relative',
            zIndex: 2,
        },
        headerLeft: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
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
        },
        title: {
            fontSize: '2rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #fff 30%, #8E44AD 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0,
        },
        subtitle: {
            color: '#aab',
            fontSize: '0.95rem',
            margin: 0,
        },
        headerBadge: {
            display: 'inline-block',
            backgroundColor: '#8E44AD',
            color: 'white',
            padding: '0.3rem 1rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
        },
        filterBar: {
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
        },
        searchWrapper: {
            flex: 2,
            position: 'relative',
            minWidth: '200px',
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
        filterSelect: {
            padding: '0.7rem 1rem',
            fontSize: '0.95rem',
            border: '1px solid #ddd',
            borderRadius: '25px',
            outline: 'none',
            backgroundColor: '#f0f2f5',
            cursor: 'pointer',
            minWidth: '150px',
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
        },
        refreshButton: {
            backgroundColor: '#3EAEF4',
            color: '#0A0F1E',
            border: 'none',
            padding: '0.5rem 1.2rem',
            borderRadius: '25px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            height: '46px',
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: '1.5rem',
        },
        card: {
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.5)',
            transition: 'all 0.3s ease',
        },
        cardHeader: {
            background: 'linear-gradient(135deg, #0A0F1E, #1a1f2e)',
            color: 'white',
            padding: '1rem 1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
            borderBottom: '3px solid #8E44AD',
        },
        cardBody: {
            padding: '1.25rem',
        },
        badge: (bg, textColor = 'white') => ({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.25rem 0.8rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            background: bg,
            color: textColor,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }),
        infoRow: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#6c757d',
            fontSize: '0.8rem',
        },
        infoValue: {
            fontSize: '0.95rem',
            fontWeight: '600',
            color: '#0A0F1E',
            marginBottom: '0.2rem',
        },
        documentosRow: {
            display: 'flex',
            gap: '0.5rem',
            margin: '0.5rem 0',
            flexWrap: 'wrap',
        },
        docLink: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.3rem 0.8rem',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: '500',
            textDecoration: 'none',
            backgroundColor: 'rgba(220,53,69,0.08)',
            color: '#dc3545',
            border: '1px solid rgba(220,53,69,0.2)',
            transition: 'all 0.3s ease',
        },
        textarea: {
            width: '100%',
            padding: '0.6rem 1rem',
            fontSize: '0.9rem',
            border: '1px solid #ddd',
            borderRadius: '10px',
            outline: 'none',
            transition: 'all 0.3s ease',
            backgroundColor: 'white',
            resize: 'vertical',
            minHeight: '60px',
            fontFamily: 'inherit',
        },
        select: {
            width: '100%',
            padding: '0.6rem 1rem',
            fontSize: '0.9rem',
            border: '1px solid #ddd',
            borderRadius: '10px',
            outline: 'none',
            backgroundColor: 'white',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
        },
        btnSave: {
            backgroundColor: '#8E44AD',
            color: 'white',
            border: 'none',
            padding: '0.6rem 1rem',
            borderRadius: '10px',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            width: '100%',
        },
        emptyState: {
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.5)',
        },
        loadingSpinner: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '4rem',
            gap: '1rem',
            color: '#6c757d',
        },
        observacionesBox: {
            backgroundColor: '#fff3cd',
            padding: '0.5rem 0.8rem',
            borderRadius: '8px',
            fontSize: '0.8rem',
            borderLeft: '3px solid #ffc107',
            marginTop: '0.5rem',
        },
    };

    if (!validadorData.matricula) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingSpinner}>
                    <div className="spinner-border text-warning" role="status" />
                    <span>Verificando permisos...</span>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingSpinner}>
                    <div className="spinner-border text-warning" role="status" style={{ width: '2.5rem', height: '2.5rem' }} />
                    <span>Cargando registros...</span>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerGlow} />
                <div style={styles.headerContent}>
                    <div style={styles.headerLeft}>
                        <Link to="/dashboard" style={styles.backButton}>
                            <FaArrowLeft /> Volver
                        </Link>
                        <div>
                            <h1 style={styles.title}>
                                <FaShieldAlt style={{ color: '#8E44AD' }} /> Validador 79Bis
                            </h1>
                            <p style={styles.subtitle}>
                                Gestiona los registros del festejo de Intendencia y Limpieza
                            </p>
                        </div>
                    </div>
                    <div>
                        <span style={styles.headerBadge}>
                            <FaStar style={{ marginRight: '5px' }} /> {registrosFiltrados.length} registros
                        </span>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div style={styles.filterBar}>
                <div style={styles.searchWrapper}>
                    <FaSearch style={styles.searchIcon} />
                    <input
                        type="text"
                        style={styles.searchInput}
                        placeholder="Buscar por matrícula, nombre, adscripción..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        onFocus={(e) => {
                            e.target.style.borderColor = '#8E44AD';
                            e.target.style.boxShadow = '0 0 0 3px rgba(142,68,173,0.15)';
                            e.target.style.backgroundColor = 'white';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = '#ddd';
                            e.target.style.boxShadow = 'none';
                            e.target.style.backgroundColor = '#f0f2f5';
                        }}
                    />
                </div>

                <select
                    style={styles.filterSelect}
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

                <div style={styles.resultsBadge}>
                    <FaFilter style={{ color: '#8E44AD' }} /> {registrosFiltrados.length} registros
                </div>

                <button style={styles.refreshButton} onClick={cargarRegistros}>
                    <FaSync /> Actualizar
                </button>
            </div>

            {/* Grid de registros */}
            {registrosFiltrados.length === 0 ? (
                <div style={styles.emptyState}>
                    <FaInfoCircle style={{ fontSize: '4rem', color: '#8E44AD', marginBottom: '1rem', opacity: 0.3 }} />
                    <h4 style={{ color: '#0A0F1E' }}>No hay registros</h4>
                    <p style={{ color: '#6c757d' }}>No se encontraron registros que coincidan con los filtros.</p>
                </div>
            ) : (
                <div style={styles.grid}>
                    {registrosFiltrados.map((registro) => {
                        const draft = getDraft(registro.id);
                        const statusInfo = getStatusInfo(registro.estatus);
                        const isSaving = validandoId === registro.id;

                        return (
                            <div key={registro.id} style={styles.card}>
                                {/* Header */}
                                <div style={styles.cardHeader}>
                                    <div>
                                        <small className="text-white-50">Registro #{registro.id}</small>
                                        <h6 className="mb-0 text-white" style={{ fontSize: '1rem' }}>
                                            {registro.nombre || 'Sin nombre'}
                                        </h6>
                                    </div>
                                    <span style={styles.badge(statusInfo.bg, statusInfo.textColor)}>
                                        {statusInfo.icon} {statusInfo.label}
                                    </span>
                                </div>

                                {/* Body */}
                                <div style={styles.cardBody}>
                                    {/* Datos del trabajador */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem 1rem', marginBottom: '0.5rem' }}>
                                        <div>
                                            <div style={styles.infoRow}><FaIdCard /> Matrícula</div>
                                            <div style={styles.infoValue}>{registro.matricula}</div>
                                        </div>
                                        <div>
                                            <div style={styles.infoRow}><FaBuilding /> Adscripción</div>
                                            <div style={styles.infoValue}>{registro.adscripcion || 'N/A'}</div>
                                        </div>
                                        <div>
                                            <div style={styles.infoRow}><FaUser /> Categoría</div>
                                            <div style={styles.infoValue}>{registro.categoria || 'N/A'}</div>
                                        </div>
                                        <div>
                                            <div style={styles.infoRow}><FaCalendarAlt /> Registro</div>
                                            <div style={styles.infoValue}>
                                                {registro.fecha_registro ? new Date(registro.fecha_registro).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Teléfono y Correo */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem 1rem', marginBottom: '0.5rem' }}>
                                        <div>
                                            <div style={styles.infoRow}><FaPhone /> Teléfono</div>
                                            <div style={styles.infoValue}>{registro.telefono || 'N/A'}</div>
                                        </div>
                                        <div>
                                            <div style={styles.infoRow}><FaEnvelope /> Correo</div>
                                            <div style={styles.infoValue}>{registro.correo || 'N/A'}</div>
                                        </div>
                                    </div>

                                    {/* Acompañante */}
                                    {registro.tiene_acompanante == 1 && (
                                        <div style={{ marginBottom: '0.5rem' }}>
                                            <div style={styles.infoRow}><FaUserPlus /> Acompañante</div>
                                            <div style={styles.infoValue}>{registro.nombre_acompanante || 'No especificado'}</div>
                                        </div>
                                    )}

                                    {/* Documentos */}
                                    <div style={styles.documentosRow}>
                                        {registro.tarjeton_ruta ? (
                                            <a href={apiUrl(registro.tarjeton_ruta)} target="_blank" rel="noopener noreferrer" style={styles.docLink}>
                                                <FaFilePdf /> Tarjetón
                                            </a>
                                        ) : (
                                            <span style={{ ...styles.docLink, opacity: 0.5, cursor: 'default' }}>
                                                <FaFilePdf /> Sin tarjetón
                                            </span>
                                        )}
                                        {registro.ine_ruta ? (
                                            <a href={apiUrl(registro.ine_ruta)} target="_blank" rel="noopener noreferrer" style={styles.docLink}>
                                                <FaFilePdf /> INE
                                            </a>
                                        ) : (
                                            <span style={{ ...styles.docLink, opacity: 0.5, cursor: 'default' }}>
                                                <FaFilePdf /> Sin INE
                                            </span>
                                        )}
                                    </div>

                                    {/* Observaciones existentes */}
                                    {registro.observaciones && (
                                        <div style={styles.observacionesBox}>
                                            <strong>📝 Observaciones previas:</strong> {registro.observaciones}
                                        </div>
                                    )}

                                    {/* Área de validación */}
                                    <div style={{ marginTop: '0.8rem', borderTop: '1px solid #e9ecef', paddingTop: '0.8rem' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
                                            <div>
                                                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6c757d', display: 'block', marginBottom: '0.2rem' }}>
                                                    Observaciones
                                                </label>
                                                <textarea
                                                    style={styles.textarea}
                                                    rows="2"
                                                    placeholder="Observaciones para el trabajador..."
                                                    value={draft.observaciones}
                                                    onChange={(e) => updateDraft(registro.id, 'observaciones', e.target.value)}
                                                    disabled={isSaving}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6c757d', display: 'block', marginBottom: '0.2rem' }}>
                                                    Estatus
                                                </label>
                                                <select
                                                    style={styles.select}
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
                                            style={styles.btnSave}
                                            onClick={() => handleValidar(registro)}
                                            disabled={isSaving}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 4px 16px rgba(142,68,173,0.3)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
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