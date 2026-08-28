import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    FaCheckCircle, FaExclamationTriangle, FaClock, FaTimesCircle, 
    FaInfoCircle, FaFilePdf, FaSearch, FaArrowLeft, FaSave, FaSync, 
    FaUser, FaBuilding, FaIdCard, FaCalendarAlt, FaShieldAlt, FaEye,
    FaStar, FaRocket
} from 'react-icons/fa';
import { apiUrl } from '../config';
import { hasStoredRole, parseRoleIds } from '../utils/roles';

// ✅ IMPORTAR CSS EXTERNO
import '../css/AutoValidador.css';

const normalizeText = (value) => String(value ?? '').toLowerCase();

const getAssetUrl = (path) => {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    const endpoint = path.startsWith('/api/') ? path.replace(/^\/api/, '') : path;
    return apiUrl(endpoint.startsWith('/') ? endpoint : `/${endpoint}`);
};

const AutoValidador = () => {
    const navigate = useNavigate();
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [solicitudes, setSolicitudes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [verificandoPermisos, setVerificandoPermisos] = useState(() => !hasStoredRole(1, 'auto'));
    const [tienePermisoAuto, setTienePermisoAuto] = useState(() => hasStoredRole(1, 'auto'));
    const [filtro, setFiltro] = useState('todos');
    const [busqueda, setBusqueda] = useState('');
    const [validationDrafts, setValidationDrafts] = useState({});
    const [secciones, setSecciones] = useState([]);
    const [seccionSeleccionada, setSeccionSeleccionada] = useState(0);
    const [esSuperAdmin, setEsSuperAdmin] = useState(false);
    const [colorPrincipal, setColorPrincipal] = useState('#3EAEF4');

    const [paginaActual, setPaginaActual] = useState(1);
    const itemsPorPagina = 10;
    const [validandoId, setValidandoId] = useState(null);

    const [validadorData] = useState(() => ({
        matricula: localStorage.getItem('matricula') || '',
        nombre: localStorage.getItem('nombre') || 'Validador'
    }));

    const cargarSolicitudes = useCallback(async () => {
        setCargando(true);
        setErrorMsg('');
        try {
            const matricula = localStorage.getItem('matricula');
            const url = new URL(apiUrl('/listar_auto.php'));
            url.searchParams.append('validatorMatricula', matricula);
            
            if (esSuperAdmin && seccionSeleccionada > 0) {
                url.searchParams.append('seccion', seccionSeleccionada);
            }
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (response.ok && data.success) {
                setSolicitudes(data.requests || []);
                setEsSuperAdmin(data.validador?.esSuperAdmin || false);
                
                if (data.secciones) {
                    setSecciones(data.secciones);
                }

                if (data.validador?.idSeccion) {
                    const seccionEncontrada = data.secciones?.find(s => s.id === data.validador.idSeccion);
                    if (seccionEncontrada?.color_principal) {
                        setColorPrincipal(seccionEncontrada.color_principal);
                    }
                }
            } else {
                setErrorMsg(data.message || 'Error al cargar las solicitudes.');
            }
        } catch {
            setErrorMsg('Error de conexión con el servidor.');
        } finally {
            setCargando(false);
        }
    }, [esSuperAdmin, seccionSeleccionada]);

    useEffect(() => {
        const matricula = localStorage.getItem('matricula');
        if (!matricula) {
            navigate('/login');
            return;
        }
        if (hasStoredRole(1, 'auto')) {
            const loadTimer = setTimeout(cargarSolicitudes, 0);
            return () => clearTimeout(loadTimer);
        }

        let cancelado = false;
        const verificarPerfil = async () => {
            try {
                const response = await fetch(apiUrl(`/obtener_perfil.php?matricula=${encodeURIComponent(matricula)}`));
                const data = await response.json();
                const roleIds = response.ok && data.success ? parseRoleIds(data.usuario?.idRol) : [];
                const tieneRol = roleIds.includes('1');

                if (cancelado) return;
                setTienePermisoAuto(tieneRol);
                if (tieneRol) {
                    localStorage.setItem('idRol', data.usuario?.idRol || '');
                    await cargarSolicitudes();
                } else {
                    setCargando(false);
                    setTimeout(() => navigate('/dashboard'), 3000);
                }
            } catch {
                if (!cancelado) {
                    setTienePermisoAuto(false);
                    setCargando(false);
                }
            } finally {
                if (!cancelado) {
                    setVerificandoPermisos(false);
                }
            }
        };
        verificarPerfil();
        return () => { cancelado = true; };
    }, [cargarSolicitudes, navigate]);

    const solicitudesFiltradas = useMemo(() => {
        let filtradas = [...solicitudes];
        if (filtro !== 'todos') {
            filtradas = filtradas.filter(s => s.estatus === filtro);
        }
        if (busqueda.trim() !== '') {
            const term = busqueda.trim().toLowerCase();
            filtradas = filtradas.filter(s => 
                normalizeText(s.matricula).includes(term) ||
                normalizeText(s.nombre).includes(term) ||
                normalizeText(s.adscripcion).includes(term) ||
                normalizeText(s.categoria).includes(term)
            );
        }
        return filtradas;
    }, [filtro, busqueda, solicitudes]);

    const getDraftKey = (solicitud) => String(solicitud.id || solicitud.matricula);
    const getDraft = (solicitud) => {
        const key = getDraftKey(solicitud);
        return validationDrafts[key] || {
            estatus: solicitud.estatus || 'preregistro',
            observaciones: solicitud.observaciones || ''
        };
    };

    const updateDraft = (solicitud, field, value) => {
        const key = getDraftKey(solicitud);
        setValidationDrafts(prevDrafts => ({
            ...prevDrafts,
            [key]: {
                ...getDraft(solicitud),
                ...prevDrafts[key],
                [field]: value
            }
        }));
    };

    const handleValidar = async (solicitud) => {
        const draft = getDraft(solicitud);
        const estatus = draft.estatus;
        const observaciones = draft.observaciones.trim();

        setValidandoId(getDraftKey(solicitud));
        setErrorMsg('');
        setSuccessMsg('');

        if (!estatus) {
            setErrorMsg('Selecciona un estatus para la validación.');
            setValidandoId(null);
            return;
        }

        if (estatus === 'observaciones' && !observaciones) {
            setErrorMsg('Las observaciones son obligatorias cuando el estatus es "Observaciones".');
            setValidandoId(null);
            return;
        }

        try {
            const response = await fetch(apiUrl('/validar_auto.php'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: solicitud.id,
                    matricula: solicitud.matricula,
                    validatorMatricula: validadorData.matricula,
                    validatorNombre: validadorData.nombre,
                    estatus,
                    observaciones
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Error al validar la solicitud.');
            }

            setSuccessMsg('¡Validación guardada correctamente!');
            await cargarSolicitudes();
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setValidandoId(null);
        }
    };

    const getStatusInfo = (estatus) => {
        const map = {
            'preregistro': { color: '#6c757d', icon: <FaClock />, label: 'Preregistro', bg: 'linear-gradient(135deg, #6c757d, #495057)' },
            'aprobado': { color: '#28a745', icon: <FaCheckCircle />, label: 'Aprobado', bg: 'linear-gradient(135deg, #28a745, #20c997)' },
            'observaciones': { color: '#ffc107', icon: <FaExclamationTriangle />, label: 'Con observaciones', bg: 'linear-gradient(135deg, #ffc107, #fd7e14)' },
            'sinconcluir': { color: '#fd7e14', icon: <FaInfoCircle />, label: 'Registro inconcluso', bg: 'linear-gradient(135deg, #fd7e14, #dc3545)' },
            'denegado': { color: '#dc3545', icon: <FaTimesCircle />, label: 'Denegado', bg: 'linear-gradient(135deg, #dc3545, #c82333)' }
        };
        return map[estatus] || map['preregistro'];
    };

    const statusOptions = [
        { value: 'preregistro', label: '1 Preregistro' },
        { value: 'aprobado', label: '2 Validado' },
        { value: 'observaciones', label: '3 Con observaciones' },
        { value: 'sinconcluir', label: '4 Registro inconcluso' },
        { value: 'denegado', label: '5 Denegado' }
    ];

    const totalPaginas = Math.ceil(solicitudesFiltradas.length / itemsPorPagina);
    const paginaSegura = totalPaginas > 0 ? Math.min(paginaActual, totalPaginas) : 1;
    const indexUltimoSeguro = paginaSegura * itemsPorPagina;
    const indexPrimeroSeguro = indexUltimoSeguro - itemsPorPagina;
    const solicitudesPagina = solicitudesFiltradas.slice(indexPrimeroSeguro, indexUltimoSeguro);

    if (!validadorData.matricula) return null;

    if (verificandoPermisos) {
        return (
            <div className="autovalidador-container">
                <div className="autovalidador-loading">
                    <div className="autovalidador-spinner" role="status" />
                    <p className="autovalidador-loading-text">Verificando permisos...</p>
                </div>
            </div>
        );
    }

    if (!tienePermisoAuto) {
        return (
            <div className="autovalidador-container">
                <div className="autovalidador-denied">
                    <FaExclamationTriangle className="autovalidador-denied-icon" />
                    <h3 className="autovalidador-denied-title">Acceso Denegado</h3>
                    <p className="text-muted">No tienes permisos para acceder a esta sección. Solo validadores de crédito automotriz.</p>
                    <Link to="/dashboard" className="autovalidador-btn-outline" style={{ borderColor: '#dc3545', color: '#dc3545' }}>
                        <FaArrowLeft /> Volver
                    </Link>
                </div>
            </div>
        );
    }

    if (cargando) {
        return (
            <div className="autovalidador-container">
                <div className="autovalidador-loading">
                    <div className="autovalidador-spinner" role="status" />
                    <p className="autovalidador-loading-text">Cargando solicitudes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="autovalidador-wrapper">
            {/* Header Banner Sección 5 */}
            <div className="autovalidador-header ui-shadow">
                <div className="autovalidador-header-dots dot-matrix"></div>
                <div className="autovalidador-header-content">
                    <div className="autovalidador-header-left">
                        <Link to="/" className="autovalidador-back-btn">
                            <FaArrowLeft size={12} /> Volver al Inicio
                        </Link>
                        <div className="autovalidador-header-titles">
                            <span className="autovalidador-header-tag">Módulo de Control y Validación</span>
                            <h2 className="autovalidador-header-title">
                                Validador de Crédito Automotriz
                            </h2>
                            <p className="autovalidador-header-subtitle">
                                Gestiona, revisa expedientes y valida las solicitudes de crédito automotriz de los agremiados
                            </p>
                        </div>
                    </div>
                    <div className="autovalidador-header-right">
                        <span className="autovalidador-header-badge">
                            <FaShieldAlt style={{ marginRight: '6px' }} /> Panel de Validación
                        </span>
                    </div>
                </div>

                {/* Matriz decorativa de puntitos en esquina */}
                <div className="autovalidador-header-dots-matrix">
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

            {/* Alertas */}
            {errorMsg && (
                <div className="autovalidador-alert autovalidador-alert-danger">
                    <FaExclamationTriangle /> {errorMsg}
                    <button className="autovalidador-alert-close" onClick={() => setErrorMsg('')}>×</button>
                </div>
            )}
            {successMsg && (
                <div className="autovalidador-alert autovalidador-alert-success">
                    <FaCheckCircle /> {successMsg}
                    <button className="autovalidador-alert-close" onClick={() => setSuccessMsg('')}>×</button>
                </div>
            )}

            {/* Selector de secciones (solo superadmin) */}
            {esSuperAdmin && secciones.length > 0 && (
                <div className="autovalidador-selector-wrapper">
                    <div className="autovalidador-selector-container">
                        <select
                            className="autovalidador-select-styled"
                            style={{
                                borderRadius: '25px',
                                textAlign: 'center',
                                fontWeight: 'bold',
                                borderColor: colorPrincipal,
                            }}
                            value={seccionSeleccionada}
                            onChange={(e) => {
                                setSeccionSeleccionada(Number(e.target.value));
                                setPaginaActual(1);
                            }}
                        >
                            <option value="0">🌐 Todas las secciones</option>
                            {secciones.map(sec => (
                                <option key={sec.id} value={sec.id}>
                                    {sec.romano} - {sec.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Filtros y búsqueda */}
            <div className="autovalidador-filter-bar">
                <div className="row g-3 align-items-center">
                    <div className="col-md-5">
                        <div className="input-group">
                            <span className="input-group-text bg-white border-0" style={{ borderRadius: '25px 0 0 25px' }}>
                                <FaSearch style={{ color: colorPrincipal }} />
                            </span>
                            <input
                                type="text"
                                className="form-control border-0 shadow-none autovalidador-input-search"
                                style={{ borderRadius: '0 25px 25px 0' }}
                                placeholder="Buscar por matrícula, nombre, adscripción..."
                                value={busqueda}
                                onChange={(e) => {
                                    setBusqueda(e.target.value);
                                    setPaginaActual(1);
                                }}
                            />
                        </div>
                    </div>
                    <div className="col-md-3">
                        <select
                            className="autovalidador-select-styled"
                            style={{ 
                                borderRadius: '25px',
                                borderColor: `${colorPrincipal}40`,
                            }}
                            value={filtro}
                            onChange={(e) => {
                                setFiltro(e.target.value);
                                setPaginaActual(1);
                            }}
                        >
                            <option value="todos">📋 Todos</option>
                            <option value="preregistro">1️⃣ Preregistro</option>
                            <option value="aprobado">✅ Aprobado</option>
                            <option value="observaciones">⚠️ Con observaciones</option>
                            <option value="sinconcluir">📝 Incompleto</option>
                            <option value="denegado">❌ Denegado</option>
                        </select>
                    </div>
                    <div className="col-md-2">
                        <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaEye style={{ color: colorPrincipal }} /> {solicitudesFiltradas.length} solicitudes
                        </span>
                    </div>
                    <div className="col-md-2 text-end">
                        <button 
                            className="autovalidador-btn-outline-warning"
                            onClick={cargarSolicitudes}
                        >
                            <FaSync /> Actualizar
                        </button>
                    </div>
                </div>
            </div>

            {/* Cards de solicitudes */}
            <div className="row g-4">
                {solicitudesPagina.length === 0 ? (
                    <div className="col-12">
                        <div className="autovalidador-empty-state">
                            <FaInfoCircle className="autovalidador-empty-icon" />
                            <h4 className="autovalidador-empty-title">No hay solicitudes para mostrar</h4>
                            <p className="text-muted">Los registros aparecerán aquí cuando los agremiados soliciten su crédito</p>
                        </div>
                    </div>
                ) : (
                    solicitudesPagina.map((solicitud, idx) => {
                        const draft = getDraft(solicitud);
                        const statusInfo = getStatusInfo(solicitud.estatus);
                        const isSaving = validandoId === getDraftKey(solicitud);
                        const seccionColor = solicitud.seccion_color || '#3EAEF4';

                        return (
                            <div className="col-12 col-xl-6" key={solicitud.id || solicitud.matricula || idx}>
                                <div 
                                    className="autovalidador-card"
                                    style={{ borderColor: `${seccionColor}20` }}
                                >
                                    {/* Card Header */}
                                    <div className="autovalidador-card-header" style={{ borderBottom: `2px solid ${seccionColor}30` }}>
                                        <div>
                                            <small style={{ color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem' }}>Solicitud #{indexPrimeroSeguro + idx + 1}</small>
                                            <h6 className="mb-0" style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B' }}>
                                                {solicitud.nombre ? solicitud.nombre.replace(/\//g, ' ') : 'Sin nombre'}
                                            </h6>
                                        </div>
                                        <span className="autovalidador-badge" style={{ background: statusInfo.bg }}>
                                            {statusInfo.icon} {statusInfo.label}
                                        </span>
                                    </div>

                                    {/* Card Body */}
                                    <div className="autovalidador-card-body">
                                        <div className="row g-3 mb-3">
                                            <div className="col-md-6">
                                                <div className="autovalidador-info-row">
                                                    <FaIdCard style={{ color: seccionColor }} /> Matrícula
                                                </div>
                                                <div className="autovalidador-info-value" style={{ color: seccionColor }}>
                                                    {solicitud.matricula}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="autovalidador-info-row">
                                                    <FaCalendarAlt style={{ color: seccionColor }} /> Fecha registro
                                                </div>
                                                <div className="autovalidador-info-value" style={{ color: seccionColor }}>
                                                    {solicitud.fecha || 'N/A'}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="autovalidador-info-row">
                                                    <FaBuilding style={{ color: seccionColor }} /> Adscripción
                                                </div>
                                                <div className="autovalidador-info-value" style={{ color: seccionColor }}>
                                                    {solicitud.adscripcion || 'N/A'}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="autovalidador-info-row">
                                                    <FaUser style={{ color: seccionColor }} /> Categoría
                                                </div>
                                                <div className="autovalidador-info-value" style={{ color: seccionColor }}>
                                                    {solicitud.categoria || 'N/A'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Documentos */}
                                        <div style={{ 
                                            borderTop: `1px solid ${seccionColor}30`, 
                                            paddingTop: '1rem', 
                                            marginBottom: '1rem' 
                                        }}>
                                            <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: seccionColor }}>
                                                📄 Documentos
                                            </div>
                                            <div className="d-flex flex-wrap gap-2">
                                                {solicitud.tarjetonPath && (
                                                    <a 
                                                        href={getAssetUrl(solicitud.tarjetonPath)} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="autovalidador-doc-link"
                                                        style={{ borderColor: seccionColor, color: seccionColor }}
                                                    >
                                                        <FaFilePdf /> Tarjetón
                                                    </a>
                                                )}
                                                {solicitud.inePath && (
                                                    <a 
                                                        href={getAssetUrl(solicitud.inePath)} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="autovalidador-doc-link"
                                                        style={{ borderColor: seccionColor, color: seccionColor }}
                                                    >
                                                        <FaFilePdf /> INE
                                                    </a>
                                                )}
                                                {!solicitud.tarjetonPath && !solicitud.inePath && (
                                                    <span className="text-muted small">Sin documentos cargados</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Última validación */}
                                        {solicitud.valido && (
                                            <div className="autovalidador-validation-info" style={{ borderColor: `${seccionColor}30`, background: `${seccionColor}10` }}>
                                                <strong style={{ color: seccionColor }}>Última validación:</strong> {solicitud.valido}
                                                {solicitud.fecha_validado && <span style={{ color: '#6c757d' }}> | {solicitud.fecha_validado}</span>}
                                            </div>
                                        )}

                                        {/* Observaciones */}
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label className="form-label fw-semibold" style={{ color: seccionColor }}>
                                                Observaciones
                                            </label>
                                            <textarea
                                                className="form-control autovalidador-textarea-styled"
                                                rows="3"
                                                style={{ borderColor: `${seccionColor}40` }}
                                                value={draft.observaciones}
                                                onChange={(e) => updateDraft(solicitud, 'observaciones', e.target.value)}
                                                placeholder="Describe qué documento debe corregir el usuario o deja una nota interna de la validación."
                                                disabled={isSaving}
                                                onFocus={(e) => e.target.style.borderColor = seccionColor}
                                                onBlur={(e) => e.target.style.borderColor = `${seccionColor}40`}
                                            />
                                            {draft.estatus === 'observaciones' && (
                                                <div className="autovalidador-observations-hint">
                                                    ⚡ Este estatus permite que el usuario vuelva a subir sus documentos en Crédito Auto.
                                                </div>
                                            )}
                                        </div>

                                        {/* Selector de estatus y botón guardar */}
                                        <div className="row g-2 align-items-end">
                                            <div className="col-md-7">
                                                <label className="form-label fw-semibold" style={{ color: seccionColor }}>
                                                    Validación
                                                </label>
                                                <select
                                                    className="form-select autovalidador-select-styled"
                                                    style={{ borderColor: `${seccionColor}40` }}
                                                    value={draft.estatus}
                                                    onChange={(e) => updateDraft(solicitud, 'estatus', e.target.value)}
                                                    disabled={isSaving}
                                                    onFocus={(e) => e.target.style.borderColor = seccionColor}
                                                    onBlur={(e) => e.target.style.borderColor = `${seccionColor}40`}
                                                >
                                                    {statusOptions.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-md-5">
                                                <button
                                                    type="button"
                                                    className="autovalidador-btn-primary"
                                                    style={{ background: `linear-gradient(135deg, ${seccionColor}, ${seccionColor}cc)` }}
                                                    onClick={() => handleValidar(solicitud)}
                                                    disabled={isSaving}
                                                >
                                                    <FaSave /> {isSaving ? 'Guardando...' : 'Guardar Validación'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Paginador */}
            {totalPaginas > 1 && (
                <nav className="mt-4">
                    <ul className="autovalidador-pagination">
                        <li>
                            <button 
                                className={`autovalidador-page-link ${paginaSegura === 1 ? 'autovalidador-page-link-disabled' : ''}`}
                                onClick={() => setPaginaActual(Math.max(1, paginaSegura - 1))}
                            >
                                Anterior
                            </button>
                        </li>
                        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(num => (
                            <li key={num}>
                                <button 
                                    className={`autovalidador-page-link ${paginaSegura === num ? 'autovalidador-page-link-active' : ''}`}
                                    onClick={() => setPaginaActual(num)}
                                    style={paginaSegura === num ? { backgroundColor: colorPrincipal, color: '#0A0F1E' } : {}}
                                >
                                    {num}
                                </button>
                            </li>
                        ))}
                        <li>
                            <button 
                                className={`autovalidador-page-link ${paginaSegura === totalPaginas ? 'autovalidador-page-link-disabled' : ''}`}
                                onClick={() => setPaginaActual(Math.min(totalPaginas, paginaSegura + 1))}
                            >
                                Siguiente
                            </button>
                        </li>
                    </ul>
                </nav>
            )}
        </div>
    );
};

export default AutoValidador;