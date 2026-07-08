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

    // ========== ESTILOS MODERNOS ==========
    const styles = {
        container: {
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '1.5rem',
            background: '#f0f4f8',
            minHeight: 'calc(100vh - 200px)',
            '@media (max-width: 768px)': {
                padding: '1rem 0.8rem',
            },
        },
        header: {
            background: 'linear-gradient(135deg, #0A0F1E 0%, #1a1f2e 50%, #0A0F1E 100%)',
            borderRadius: '20px',
            padding: '2.5rem 2rem',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            borderBottom: '4px solid #3EAEF4',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            position: 'relative',
            overflow: 'hidden',
            '@media (max-width: 768px)': {
                padding: '1.5rem',
                flexDirection: 'column',
                textAlign: 'center',
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
        headerTitle: {
            fontSize: '2rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #fff 30%, #3EAEF4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            position: 'relative',
            zIndex: 2,
            '@media (max-width: 768px)': {
                fontSize: '1.5rem',
                justifyContent: 'center',
            },
        },
        headerSubtitle: {
            color: '#aab',
            fontSize: '0.95rem',
            margin: 0,
            position: 'relative',
            zIndex: 2,
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
            fontSize: '0.8rem',
            fontWeight: 'bold',
            marginTop: '0.3rem',
            position: 'relative',
            zIndex: 2,
        },
        btnOutline: {
            backgroundColor: 'transparent',
            color: '#3EAEF4',
            border: '2px solid #3EAEF4',
            padding: '0.5rem 1.5rem',
            borderRadius: '30px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            position: 'relative',
            zIndex: 2,
            '@media (max-width: 768px)': {
                width: '100%',
                justifyContent: 'center',
            },
        },
        filterBar: {
            backgroundColor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2rem',
            border: '1px solid rgba(255,255,255,0.5)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        },
        // Card moderna con glassmorphism
        card: {
            backgroundColor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            height: '100%',
            border: '1px solid rgba(255,255,255,0.5)',
            overflow: 'hidden',
        },
        cardHover: {
            transform: 'translateY(-6px)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.1)',
            borderColor: '#3EAEF4',
        },
        cardHeader: {
            background: 'linear-gradient(135deg, #0A0F1E, #1a1f2e)',
            color: 'white',
            borderBottom: '3px solid #3EAEF4',
            padding: '1rem 1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
        },
        cardBody: {
            padding: '1.5rem',
        },
        badge: (bg) => ({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.3rem 0.9rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            background: bg,
            color: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }),
        infoRow: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#6c757d',
            fontSize: '0.8rem',
            fontWeight: '500',
        },
        infoValue: {
            fontSize: '0.95rem',
            fontWeight: '600',
            color: '#0A0F1E',
        },
        btnPrimary: {
            background: 'linear-gradient(135deg, #3EAEF4, #2d8fd4)',
            color: '#0A0F1E',
            border: 'none',
            padding: '0.6rem 1.5rem',
            borderRadius: '25px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            width: '100%',
            justifyContent: 'center',
        },
        btnPrimaryHover: {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 16px rgba(62,174,244,0.3)',
        },
        btnSuccess: {
            background: 'linear-gradient(135deg, #28a745, #20c997)',
            color: 'white',
            border: 'none',
            padding: '0.6rem 1.5rem',
            borderRadius: '25px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            width: '100%',
            justifyContent: 'center',
        },
        selectStyled: {
            border: '1px solid #ddd',
            borderRadius: '12px',
            padding: '0.6rem 1rem',
            width: '100%',
            outline: 'none',
            backgroundColor: 'white',
            cursor: 'pointer',
            transition: 'border-color 0.3s ease',
        },
        textareaStyled: {
            border: '1px solid #ddd',
            borderRadius: '12px',
            padding: '0.6rem 1rem',
            width: '100%',
            outline: 'none',
            transition: 'border-color 0.3s ease',
            resize: 'vertical',
            minHeight: '80px',
        },
        inputSearch: {
            border: '1px solid #ddd',
            borderRadius: '25px',
            padding: '0.6rem 1.2rem',
            width: '100%',
            outline: 'none',
            transition: 'all 0.3s ease',
            backgroundColor: 'white',
        },
    };

    if (!validadorData.matricula) return null;

    if (verificandoPermisos) {
        return (
            <div style={styles.container}>
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <div className="spinner-border text-warning" role="status" style={{ width: '3rem', height: '3rem' }}></div>
                    <p className="mt-3 text-muted">Verificando permisos...</p>
                </div>
            </div>
        );
    }

    if (!tienePermisoAuto) {
        return (
            <div style={styles.container}>
                <div style={{ 
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    padding: '3rem',
                    textAlign: 'center',
                    border: '1px solid rgba(255,0,0,0.2)',
                }}>
                    <FaExclamationTriangle style={{ fontSize: '3rem', color: '#dc3545', marginBottom: '1rem' }} />
                    <h3 style={{ color: '#dc3545' }}>Acceso Denegado</h3>
                    <p className="text-muted">No tienes permisos para acceder a esta sección. Solo validadores de crédito automotriz.</p>
                    <Link to="/dashboard" style={styles.btnOutline}>Volver</Link>
                </div>
            </div>
        );
    }

    if (cargando) {
        return (
            <div style={styles.container}>
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <div className="spinner-border text-warning" role="status" style={{ width: '3rem', height: '3rem' }}></div>
                    <p className="mt-3 text-muted">Cargando solicitudes...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header con glow */}
            <div style={styles.header}>
                <div style={styles.headerGlow} />
                <div>
                    <h2 style={styles.headerTitle}>
                        <FaShieldAlt style={{ color: '#3EAEF4' }} /> Validador de Crédito Automotriz
                    </h2>
                    <p style={styles.headerSubtitle}>
                        Gestiona y valida las solicitudes de los agremiados
                    </p>
                    <span style={styles.headerBadge}>
                        <FaStar style={{ marginRight: '5px' }} /> Panel de Validación
                    </span>
                </div>
                <Link to="/dashboard" style={styles.btnOutline}>
                    <FaArrowLeft /> Volver
                </Link>
            </div>

            {/* Alertas */}
            {errorMsg && (
                <div className="alert alert-danger alert-dismissible fade show" style={{ borderRadius: '12px' }}>
                    <FaExclamationTriangle className="me-2" /> {errorMsg}
                    <button type="button" className="btn-close" onClick={() => setErrorMsg('')}></button>
                </div>
            )}
            {successMsg && (
                <div className="alert alert-success alert-dismissible fade show" style={{ borderRadius: '12px' }}>
                    <FaCheckCircle className="me-2" /> {successMsg}
                    <button type="button" className="btn-close" onClick={() => setSuccessMsg('')}></button>
                </div>
            )}

            {/* Filtros y búsqueda */}
            <div style={styles.filterBar}>
                <div className="row g-3 align-items-center">
                    <div className="col-md-5">
                        <div className="input-group">
                            <span className="input-group-text bg-white border-0" style={{ borderRadius: '25px 0 0 25px' }}>
                                <FaSearch style={{ color: '#3EAEF4' }} />
                            </span>
                            <input
                                type="text"
                                className="form-control border-0 shadow-none"
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
                            className="form-select"
                            style={{ borderRadius: '25px' }}
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
                            <FaEye style={{ color: '#3EAEF4' }} /> {solicitudesFiltradas.length} solicitudes
                        </span>
                    </div>
                    <div className="col-md-2 text-end">
                        <button 
                            className="btn btn-outline-warning btn-sm" 
                            style={{ borderRadius: '25px', fontWeight: 'bold' }}
                            onClick={cargarSolicitudes}
                        >
                            <FaSync className="me-1" /> Actualizar
                        </button>
                    </div>
                </div>
            </div>

            {/* Cards de solicitudes */}
            <div className="row g-4">
                {solicitudesPagina.length === 0 ? (
                    <div className="col-12">
                        <div style={{
                            background: 'rgba(255,255,255,0.9)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '16px',
                            padding: '4rem 2rem',
                            textAlign: 'center',
                            border: '1px solid rgba(255,255,255,0.5)',
                        }}>
                            <FaInfoCircle style={{ fontSize: '3rem', color: '#3EAEF4', marginBottom: '1rem' }} />
                            <h4 style={{ color: '#0A0F1E' }}>No hay solicitudes para mostrar</h4>
                            <p className="text-muted">Los registros aparecerán aquí cuando los agremiados soliciten su crédito</p>
                        </div>
                    </div>
                ) : (
                    solicitudesPagina.map((solicitud, idx) => {
                        const draft = getDraft(solicitud);
                        const statusInfo = getStatusInfo(solicitud.estatus);
                        const isSaving = validandoId === getDraftKey(solicitud);

                        return (
                            <div className="col-12 col-xl-6" key={solicitud.id || solicitud.matricula || idx}>
                                <div 
                                    style={styles.card}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-6px)';
                                        e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.1)';
                                        e.currentTarget.style.borderColor = '#3EAEF4';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
                                    }}
                                >
                                    {/* Card Header */}
                                    <div style={styles.cardHeader}>
                                        <div>
                                            <small className="text-white-50">Solicitud #{indexPrimeroSeguro + idx + 1}</small>
                                            <h6 className="mb-0 text-white" style={{ fontSize: '1rem' }}>
                                                {solicitud.nombre ? solicitud.nombre.replace(/\//g, ' ') : 'Sin nombre'}
                                            </h6>
                                        </div>
                                        <span style={styles.badge(statusInfo.bg)}>
                                            {statusInfo.icon} {statusInfo.label}
                                        </span>
                                    </div>

                                    {/* Card Body */}
                                    <div style={styles.cardBody}>
                                        {/* Datos del solicitante */}
                                        <div className="row g-3 mb-3">
                                            <div className="col-md-6">
                                                <div style={styles.infoRow}>
                                                    <FaIdCard /> Matrícula
                                                </div>
                                                <div style={styles.infoValue}>{solicitud.matricula}</div>
                                            </div>
                                            <div className="col-md-6">
                                                <div style={styles.infoRow}>
                                                    <FaCalendarAlt /> Fecha registro
                                                </div>
                                                <div style={styles.infoValue}>{solicitud.fecha || 'N/A'}</div>
                                            </div>
                                            <div className="col-md-6">
                                                <div style={styles.infoRow}>
                                                    <FaBuilding /> Adscripción
                                                </div>
                                                <div style={styles.infoValue}>{solicitud.adscripcion || 'N/A'}</div>
                                            </div>
                                            <div className="col-md-6">
                                                <div style={styles.infoRow}>
                                                    <FaUser /> Categoría
                                                </div>
                                                <div style={styles.infoValue}>{solicitud.categoria || 'N/A'}</div>
                                            </div>
                                        </div>

                                        {/* Documentos */}
                                        <div style={{ borderTop: '1px solid #e9ecef', paddingTop: '1rem', marginBottom: '1rem' }}>
                                            <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#0A0F1E' }}>
                                                📄 Documentos
                                            </div>
                                            <div className="d-flex flex-wrap gap-2">
                                                {solicitud.tarjetonPath && (
                                                    <a 
                                                        href={getAssetUrl(solicitud.tarjetonPath)} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="btn btn-outline-primary btn-sm rounded-pill"
                                                        style={{ fontWeight: '500' }}
                                                    >
                                                        <FaFilePdf className="me-1" /> Tarjetón
                                                    </a>
                                                )}
                                                {solicitud.inePath && (
                                                    <a 
                                                        href={getAssetUrl(solicitud.inePath)} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="btn btn-outline-primary btn-sm rounded-pill"
                                                        style={{ fontWeight: '500' }}
                                                    >
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
                                            <div style={{
                                                background: '#f8f9fa',
                                                borderRadius: '10px',
                                                padding: '0.6rem 1rem',
                                                marginBottom: '1rem',
                                                fontSize: '0.85rem',
                                                border: '1px solid #e9ecef',
                                            }}>
                                                <strong style={{ color: '#0A0F1E' }}>Última validación:</strong> {solicitud.valido}
                                                {solicitud.fecha_validado && <span style={{ color: '#6c757d' }}> | {solicitud.fecha_validado}</span>}
                                            </div>
                                        )}

                                        {/* Observaciones */}
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label className="form-label fw-semibold" style={{ color: '#0A0F1E' }}>
                                                Observaciones
                                            </label>
                                            <textarea
                                                className="form-control"
                                                rows="3"
                                                style={styles.textareaStyled}
                                                value={draft.observaciones}
                                                onChange={(e) => updateDraft(solicitud, 'observaciones', e.target.value)}
                                                placeholder="Describe qué documento debe corregir el usuario o deja una nota interna de la validación."
                                                disabled={isSaving}
                                                onFocus={(e) => e.target.style.borderColor = '#3EAEF4'}
                                                onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                            />
                                            {draft.estatus === 'observaciones' && (
                                                <div className="form-text text-warning mt-1" style={{ fontSize: '0.8rem' }}>
                                                    ⚡ Este estatus permite que el usuario vuelva a subir sus documentos en Crédito Auto.
                                                </div>
                                            )}
                                        </div>

                                        {/* Selector de estatus y botón guardar */}
                                        <div className="row g-2 align-items-end">
                                            <div className="col-md-7">
                                                <label className="form-label fw-semibold" style={{ color: '#0A0F1E' }}>
                                                    Validación
                                                </label>
                                                <select
                                                    className="form-select"
                                                    style={styles.selectStyled}
                                                    value={draft.estatus}
                                                    onChange={(e) => updateDraft(solicitud, 'estatus', e.target.value)}
                                                    disabled={isSaving}
                                                    onFocus={(e) => e.target.style.borderColor = '#3EAEF4'}
                                                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
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
                                                    style={styles.btnPrimary}
                                                    onClick={() => handleValidar(solicitud)}
                                                    disabled={isSaving}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(62,174,244,0.3)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = 'none';
                                                    }}
                                                >
                                                    <FaSave className="me-1" />
                                                    {isSaving ? 'Guardando...' : 'Guardar Validación'}
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
                    <ul className="pagination justify-content-center" style={{ gap: '0.3rem' }}>
                        <li className={`page-item ${paginaSegura === 1 ? 'disabled' : ''}`}>
                            <button 
                                className="page-link rounded-pill" 
                                style={{ border: 'none', background: 'rgba(255,255,255,0.8)', fontWeight: '500' }}
                                onClick={() => setPaginaActual(Math.max(1, paginaSegura - 1))}
                            >
                                Anterior
                            </button>
                        </li>
                        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(num => (
                            <li key={num} className={`page-item ${paginaSegura === num ? 'active' : ''}`}>
                                <button 
                                    className="page-link rounded-pill" 
                                    style={paginaSegura === num ? 
                                        { backgroundColor: '#3EAEF4', borderColor: '#3EAEF4', color: '#0A0F1E', fontWeight: 'bold' } : 
                                        { border: 'none', background: 'rgba(255,255,255,0.8)', color: '#0A0F1E' }
                                    }
                                    onClick={() => setPaginaActual(num)}
                                >
                                    {num}
                                </button>
                            </li>
                        ))}
                        <li className={`page-item ${paginaSegura === totalPaginas ? 'disabled' : ''}`}>
                            <button 
                                className="page-link rounded-pill" 
                                style={{ border: 'none', background: 'rgba(255,255,255,0.8)', fontWeight: '500' }}
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