import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    FaCheckCircle, FaExclamationTriangle, FaClock, FaTimesCircle, 
    FaInfoCircle, FaFilePdf, FaSearch, FaArrowLeft, FaSave, FaSync, 
    FaUser, FaBuilding, FaIdCard, FaCalendarAlt, FaShieldAlt, FaEye 
} from 'react-icons/fa';
import { apiUrl } from '../config';
import { hasStoredRole, parseRoleIds } from '../utils/roles';

const normalizeText = (value) => String(value ?? '').toLowerCase();

const getAssetUrl = (path) => {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    const endpoint = path.startsWith('/api/') ? path.replace(/^\/api/, '') : path;
    return apiUrl(endpoint.startsWith('/') ? endpoint : `/${endpoint}`);
};

// Estilos en línea para el componente
const styles = {
    container: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '1.5rem',
    },
    header: {
        background: 'linear-gradient(135deg, #0A0F1E 0%, #1a1f2e 100%)',
        borderRadius: '16px',
        padding: '2rem 2rem',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        borderBottom: '4px solid #3EAEF4',
    },
    headerTitle: {
        fontSize: '1.8rem',
        fontWeight: 'bold',
        background: 'linear-gradient(135deg, #fff 30%, #3EAEF4 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    headerSubtitle: {
        color: '#aaa',
        fontSize: '0.9rem',
        margin: 0,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        height: '100%',
        border: 'none',
    },
    cardHover: {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 24px rgba(0,0,0,0.12)',
    },
    cardHeader: {
        background: 'linear-gradient(90deg, #0A0F1E, #1a1f2e)',
        color: 'white',
        borderBottom: '3px solid #3EAEF4',
        borderRadius: '16px 16px 0 0',
        padding: '1rem 1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem',
    },
    badge: (color) => ({
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.3rem 0.8rem',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        backgroundColor: color,
        color: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }),
    filterBar: {
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1.5rem',
        border: '1px solid #e9ecef',
    },
    btnPrimary: {
        backgroundColor: '#3EAEF4',
        color: '#0A0F1E',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '25px',
        fontWeight: 'bold',
        transition: 'all 0.3s ease',
    },
    btnSuccess: {
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '25px',
        fontWeight: 'bold',
        transition: 'all 0.3s ease',
    },
    btnOutline: {
        backgroundColor: 'transparent',
        color: '#3EAEF4',
        border: '2px solid #3EAEF4',
        padding: '0.5rem 1rem',
        borderRadius: '25px',
        fontWeight: 'bold',
        transition: 'all 0.3s ease',
    },
    inputSearch: {
        border: '1px solid #ddd',
        borderRadius: '25px',
        padding: '0.5rem 1rem',
        width: '100%',
        outline: 'none',
        transition: 'border-color 0.3s ease',
    },
    selectStyled: {
        border: '1px solid #ddd',
        borderRadius: '25px',
        padding: '0.5rem 1rem',
        width: '100%',
        outline: 'none',
        backgroundColor: 'white',
        cursor: 'pointer',
    },
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
            const response = await fetch(apiUrl('/listar_auto.php'));
            const data = await response.json();
            
            if (response.ok && data.success) {
                const requests = data.requests || [];
                setSolicitudes(requests);
                setValidationDrafts(prevDrafts => {
                    const nextDrafts = {};
                    requests.forEach(solicitud => {
                        const key = String(solicitud.id || solicitud.matricula);
                        nextDrafts[key] = prevDrafts[key] || {
                            estatus: solicitud.estatus || 'preregistro',
                            observaciones: solicitud.observaciones || ''
                        };
                    });
                    return nextDrafts;
                });
            } else {
                setErrorMsg(data.message || 'Error al cargar las solicitudes.');
            }
        } catch {
            setErrorMsg('Error de conexión con el servidor.');
        } finally {
            setCargando(false);
        }
    }, []);

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
            'preregistro': { color: '#6c757d', icon: <FaClock />, label: '1 Preregistro' },
            'aprobado': { color: '#28a745', icon: <FaCheckCircle />, label: '2 Validado' },
            'observaciones': { color: '#ffc107', icon: <FaExclamationTriangle />, label: '3 Con observaciones' },
            'sinconcluir': { color: '#fd7e14', icon: <FaInfoCircle />, label: '4 Registro inconcluso' },
            'denegado': { color: '#dc3545', icon: <FaTimesCircle />, label: '5 Denegado' }
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
            <div className="container py-5 text-center">
                <div className="spinner-border text-warning" role="status"></div>
                <p className="mt-3">Verificando permisos...</p>
            </div>
        );
    }

    if (!tienePermisoAuto) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger">
                    <FaExclamationTriangle className="me-2" />
                    No tienes permisos para acceder a esta sección. Solo validadores de crédito automotriz.
                </div>
            </div>
        );
    }

    if (cargando) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-warning" role="status"></div>
                <p className="mt-3">Cargando solicitudes...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header con estilo cholo */}
            <div style={styles.header}>
                <div>
                    <h2 style={styles.headerTitle}>
                        <FaShieldAlt /> Validador de Crédito Automotriz
                    </h2>
                    <p style={styles.headerSubtitle}>
                        Gestiona y valida las solicitudes de los agremiados
                    </p>
                </div>
                <Link to="/dashboard" style={styles.btnOutline}>
                    <FaArrowLeft className="me-2" /> Volver al Dashboard
                </Link>
            </div>

            {errorMsg && (
                <div className="alert alert-danger alert-dismissible fade show">
                    <FaExclamationTriangle className="me-2" /> {errorMsg}
                    <button type="button" className="btn-close" onClick={() => setErrorMsg('')}></button>
                </div>
            )}
            {successMsg && (
                <div className="alert alert-success alert-dismissible fade show">
                    <FaCheckCircle className="me-2" /> {successMsg}
                    <button type="button" className="btn-close" onClick={() => setSuccessMsg('')}></button>
                </div>
            )}

            {/* Filtros y búsqueda */}
            <div style={styles.filterBar} className="row align-items-center g-3">
                <div className="col-md-5">
                    <div className="input-group">
                        <span className="input-group-text bg-white border-0"><FaSearch className="text-warning" /></span>
                        <input
                            type="text"
                            className="form-control border-0 shadow-none"
                            style={{ borderRadius: '25px' }}
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
                        className="form-select"
                        style={{ borderRadius: '25px' }}
                        value={filtro}
                        onChange={(e) => {
                            setFiltro(e.target.value);
                            setPaginaActual(1);
                        }}
                    >
                        <option value="todos">Todos los estatus</option>
                        <option value="preregistro">1 Preregistro</option>
                        <option value="aprobado">2 Validado</option>
                        <option value="observaciones">3 Con observaciones</option>
                        <option value="sinconcluir">4 Incompleto</option>
                        <option value="denegado">5 Denegado</option>
                    </select>
                </div>
                <div className="col-md-2">
                    <span className="text-muted">
                        <FaEye className="me-1" /> {solicitudesFiltradas.length} solicitudes
                    </span>
                </div>
                <div className="col-md-2 text-end">
                    <button className="btn btn-outline-warning btn-sm" onClick={cargarSolicitudes}>
                        <FaSync className="me-1" /> Actualizar
                    </button>
                </div>
            </div>

            {/* Cards de solicitudes */}
            <div className="row g-4">
                {solicitudesPagina.length === 0 ? (
                    <div className="col-12">
                        <div className="border rounded-4 p-5 text-center text-muted bg-light">
                            <FaInfoCircle className="fs-1 mb-3 text-warning" />
                            <p className="fs-5">No hay solicitudes para mostrar</p>
                            <small>Los registros aparecerán aquí cuando los agremiados soliciten su crédito</small>
                        </div>
                    </div>
                ) : (
                    solicitudesPagina.map((solicitud, idx) => {
                        const draft = getDraft(solicitud);
                        const statusInfo = getStatusInfo(solicitud.estatus);
                        const isSaving = validandoId === getDraftKey(solicitud);

                        return (
                            <div className="col-12 col-xl-6" key={solicitud.id || solicitud.matricula || idx}>
                                <div style={styles.card}>
                                    {/* Card Header */}
                                    <div style={styles.cardHeader}>
                                        <div>
                                            <small className="text-white-50">Solicitud #{indexPrimeroSeguro + idx + 1}</small>
                                            <h6 className="mb-0 text-white">{solicitud.nombre || 'Sin nombre'}</h6>
                                        </div>
                                        <span style={styles.badge(statusInfo.color)}>
                                            {statusInfo.icon} {statusInfo.label}
                                        </span>
                                    </div>

                                    {/* Card Body */}
                                    <div className="card-body p-4">
                                        {/* Datos del solicitante */}
                                        <div className="row g-3 mb-3">
                                            <div className="col-md-6">
                                                <div className="d-flex align-items-center gap-2 text-muted small">
                                                    <FaIdCard /> Matrícula
                                                </div>
                                                <div className="fw-semibold">{solicitud.matricula}</div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="d-flex align-items-center gap-2 text-muted small">
                                                    <FaCalendarAlt /> Fecha registro
                                                </div>
                                                <div className="fw-semibold">{solicitud.fecha || 'N/A'}</div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="d-flex align-items-center gap-2 text-muted small">
                                                    <FaBuilding /> Adscripción
                                                </div>
                                                <div>{solicitud.adscripcion || 'N/A'}</div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="d-flex align-items-center gap-2 text-muted small">
                                                    <FaUser /> Categoría
                                                </div>
                                                <div>{solicitud.categoria || 'N/A'}</div>
                                            </div>
                                        </div>

                                        {/* Documentos */}
                                        <div className="border-top pt-3 mb-3">
                                            <div className="fw-semibold mb-2">📄 Documentos</div>
                                            <div className="d-flex flex-wrap gap-2">
                                                {solicitud.tarjetonPath && (
                                                    <a href={getAssetUrl(solicitud.tarjetonPath)} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm rounded-pill">
                                                        <FaFilePdf className="me-1" /> Tarjetón
                                                    </a>
                                                )}
                                                {solicitud.inePath && (
                                                    <a href={getAssetUrl(solicitud.inePath)} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm rounded-pill">
                                                        <FaFilePdf className="me-1" /> INE
                                                    </a>
                                                )}
                                                {!solicitud.tarjetonPath && !solicitud.inePath && (
                                                    <span className="text-muted small">Sin documentos cargados</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Última validación */}
                                        {solicitud.valido && (
                                            <div className="bg-light rounded-3 p-2 mb-3 small">
                                                <strong>Última validación:</strong> {solicitud.valido}
                                                {solicitud.fecha_validado && <span> | {solicitud.fecha_validado}</span>}
                                            </div>
                                        )}

                                        {/* Observaciones */}
                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">Observaciones</label>
                                            <textarea
                                                className="form-control"
                                                rows="3"
                                                style={{ borderRadius: '12px' }}
                                                value={draft.observaciones}
                                                onChange={(e) => updateDraft(solicitud, 'observaciones', e.target.value)}
                                                placeholder="Describe qué documento debe corregir el usuario o deja una nota interna de la validación."
                                                disabled={isSaving}
                                            />
                                            {draft.estatus === 'observaciones' && (
                                                <div className="form-text text-warning mt-1">
                                                    ⚡ Este estatus permite que el usuario vuelva a subir sus documentos en Crédito Auto.
                                                </div>
                                            )}
                                        </div>

                                        {/* Selector de estatus y botón guardar */}
                                        <div className="row g-2 align-items-end">
                                            <div className="col-md-7">
                                                <label className="form-label fw-semibold">Validación</label>
                                                <select
                                                    className="form-select"
                                                    style={{ borderRadius: '12px' }}
                                                    value={draft.estatus}
                                                    onChange={(e) => updateDraft(solicitud, 'estatus', e.target.value)}
                                                    disabled={isSaving}
                                                >
                                                    {statusOptions.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-md-5 d-grid">
                                                <button
                                                    type="button"
                                                    className="btn"
                                                    style={{
                                                        backgroundColor: '#3EAEF4',
                                                        color: '#0A0F1E',
                                                        fontWeight: 'bold',
                                                        borderRadius: '12px',
                                                        padding: '0.6rem',
                                                        border: 'none',
                                                        transition: 'all 0.3s ease',
                                                    }}
                                                    onClick={() => handleValidar(solicitud)}
                                                    disabled={isSaving}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.transform = 'translateY(-2px)';
                                                        e.target.style.boxShadow = '0 4px 12px rgba(255,215,0,0.3)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.transform = 'translateY(0)';
                                                        e.target.style.boxShadow = 'none';
                                                    }}
                                                >
                                                    <FaSave className="me-1" />
                                                    {isSaving ? 'Guardando...' : 'Guardar'}
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
                    <ul className="pagination justify-content-center">
                        <li className={`page-item ${paginaSegura === 1 ? 'disabled' : ''}`}>
                            <button className="page-link rounded-pill" onClick={() => setPaginaActual(Math.max(1, paginaSegura - 1))}>
                                Anterior
                            </button>
                        </li>
                        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(num => (
                            <li key={num} className={`page-item ${paginaSegura === num ? 'active' : ''}`}>
                                <button className="page-link rounded-pill" style={paginaSegura === num ? { backgroundColor: '#3EAEF4', borderColor: '#3EAEF4', color: '#0A0F1E' } : {}} onClick={() => setPaginaActual(num)}>
                                    {num}
                                </button>
                            </li>
                        ))}
                        <li className={`page-item ${paginaSegura === totalPaginas ? 'disabled' : ''}`}>
                            <button className="page-link rounded-pill" onClick={() => setPaginaActual(Math.min(totalPaginas, paginaSegura + 1))}>
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