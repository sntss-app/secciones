import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
                if (data.secciones) setSecciones(data.secciones);
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
                const tieneRol = roleIds.includes('1') || roleIds.includes(1);

                if (cancelado) return;
                setTienePermisoAuto(tieneRol);
                if (tieneRol) {
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
    }, [navigate, cargarSolicitudes]);

    const handleDraftChange = (id, campo, valor) => {
        setValidationDrafts(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [campo]: valor
            }
        }));
    };

    const handleGuardarValidacion = async (solicitud) => {
        const draft = validationDrafts[solicitud.id] || {};
        const status = draft.status !== undefined ? draft.status : solicitud.status;
        const observaciones = draft.observaciones !== undefined ? draft.observaciones : (solicitud.observaciones || '');

        setValidandoId(solicitud.id);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            const response = await fetch(apiUrl('/validar_auto.php'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: solicitud.id,
                    status: status,
                    observaciones: observaciones,
                    validatorMatricula: validadorData.matricula
                })
            });

            const data = await response.json();

            if (data.success) {
                setSuccessMsg(`Solicitud #${solicitud.id} dictaminada correctamente.`);
                await cargarSolicitudes();
                setTimeout(() => setSuccessMsg(''), 3000);
            } else {
                throw new Error(data.message || 'Error al validar la solicitud.');
            }
        } catch (error) {
            setErrorMsg(error.message);
        } finally {
            setValidandoId(null);
        }
    };

    const solicitudesFiltradas = useMemo(() => {
        return solicitudes.filter(sol => {
            const matchStatus = filtro === 'todos' || String(sol.status) === String(filtro);
            const matchBusqueda = !busqueda.trim() || 
                normalizeText(sol.matricula).includes(normalizeText(busqueda)) ||
                normalizeText(sol.nombre).includes(normalizeText(busqueda)) ||
                normalizeText(sol.curp).includes(normalizeText(busqueda));
            return matchStatus && matchBusqueda;
        });
    }, [solicitudes, filtro, busqueda]);

    const totalPaginas = Math.ceil(solicitudesFiltradas.length / itemsPorPagina);
    const solicitudesPaginadas = solicitudesFiltradas.slice(
        (paginaActual - 1) * itemsPorPagina,
        paginaActual * itemsPorPagina
    );

    const formatearMoneda = (val) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val || 0);
    };

    if (verificandoPermisos) {
        return (
            <div className="text-center py-20 text-slate-400 font-medium text-xs">
                Verificando permisos de validador...
            </div>
        );
    }

    if (!tienePermisoAuto) {
        return (
            <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-[2.5rem] text-center ui-shadow border border-white">
                <FaExclamationTriangle className="text-4xl text-amber-500 mx-auto mb-3" />
                <h3 className="text-lg font-black text-[#486DAA]">Acceso Restringido</h3>
                <p className="text-xs text-slate-500 mt-2">No cuentas con el rol de Validador de Crédito Automotriz.</p>
                <Link to="/dashboard" className="mt-4 inline-block bg-[#486DAA] text-white px-6 py-2 rounded-full text-xs font-bold text-decoration-none">
                    Regresar al Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
            
            {/* Header Validador Auto */}
            <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 ui-shadow border border-white mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <Link to="/dashboard" className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-[#486DAA] hover:text-white flex items-center justify-center transition text-decoration-none">
                        <FaArrowLeft />
                    </Link>
                    <div>
                        <span className="inline-block bg-amber-100 text-amber-800 text-[10px] font-extrabold px-3 py-0.5 rounded-full mb-1">
                            Panel Administrativo
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black text-[#486DAA] tracking-tight m-0">
                            Validador de Crédito Automotriz
                        </h2>
                    </div>
                </div>

                <button 
                    onClick={cargarSolicitudes}
                    disabled={cargando}
                    className="inline-flex items-center space-x-2 bg-slate-100 hover:bg-[#486DAA] hover:text-white text-slate-700 font-bold px-5 py-2.5 rounded-full text-xs transition duration-200 border border-slate-200 cursor-pointer"
                >
                    <FaSync className={cargando ? 'animate-spin' : ''} />
                    <span>Actualizar</span>
                </button>
            </div>

            {/* Mensajes de feedback */}
            {successMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-700 mb-6 flex items-center space-x-2">
                    <FaCheckCircle />
                    <span>{successMsg}</span>
                </div>
            )}
            {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 mb-6">
                    {errorMsg}
                </div>
            )}

            {/* Barra de Filtros y Búsqueda */}
            <div className="bg-white rounded-[2rem] p-4 sm:p-6 ui-shadow border border-white mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="w-full sm:w-72 relative flex items-center">
                    <span className="absolute left-4 text-slate-400 text-sm"><FaSearch /></span>
                    <input 
                        type="text"
                        value={busqueda}
                        onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }}
                        placeholder="Buscar por matrícula o nombre..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-full py-2.5 pl-10 pr-4 text-xs font-medium text-slate-700 outline-none focus:border-[#486DAA]"
                    />
                </div>

                <div className="flex gap-2 flex-wrap">
                    {['todos', '0', '1', '2'].map((f) => {
                        const labels = { 'todos': 'Todos', '0': 'Pendientes', '1': 'Aprobados', '2': 'Rechazados' };
                        return (
                            <button
                                key={f}
                                onClick={() => { setFiltro(f); setPaginaActual(1); }}
                                className={`px-4 py-2 rounded-full font-bold text-xs border-0 cursor-pointer transition ${
                                    filtro === f 
                                        ? 'bg-[#486DAA] text-white shadow-md shadow-[#486DAA]/30' 
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {labels[f]}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Listado de Solicitudes */}
            {cargando ? (
                <div className="text-center py-16 text-slate-400 font-medium text-xs">
                    Cargando solicitudes...
                </div>
            ) : solicitudesPaginadas.length > 0 ? (
                <div className="space-y-4">
                    {solicitudesPaginadas.map((sol) => {
                        const draft = validationDrafts[sol.id] || {};
                        const currentStatus = draft.status !== undefined ? draft.status : sol.status;
                        const currentObs = draft.observaciones !== undefined ? draft.observaciones : (sol.observaciones || '');

                        return (
                            <div key={sol.id} className="bg-white rounded-[2rem] p-6 ui-shadow border border-slate-50 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <span className="font-mono font-black text-xs text-[#486DAA]">Folio #{sol.id}</span>
                                            <span className="text-xs font-bold text-slate-800">{sol.nombre}</span>
                                            <span className="text-[11px] text-slate-500">({sol.matricula})</span>
                                        </div>
                                        <div className="text-[10px] text-slate-400 mt-0.5">
                                            {sol.adscripcion || 'Sin adscripción'} • {sol.categoria || 'Sin categoría'}
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Monto Calculado:</span>
                                        <span className="text-sm font-black text-[#486DAA]">{formatearMoneda(sol.monto_maximo)}</span>
                                    </div>
                                </div>

                                {/* Enlaces a Documentos PDF */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                                    {[
                                        { label: 'Tarjetón', path: sol.tarjeton_path },
                                        { label: 'INE Frente', path: sol.ine_frente_path },
                                        { label: 'INE Reverso', path: sol.ine_reverso_path },
                                        { label: 'Comprobante', path: sol.comprobante_path }
                                    ].map((doc, i) => (
                                        doc.path ? (
                                            <a 
                                                key={i}
                                                href={getAssetUrl(doc.path)} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="p-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-[#486DAA] rounded-xl border border-slate-200 text-[11px] font-bold flex items-center justify-center space-x-1 text-decoration-none transition"
                                            >
                                                <FaFilePdf className="text-red-500" />
                                                <span>{doc.label}</span>
                                            </a>
                                        ) : (
                                            <span key={i} className="p-2 bg-slate-50 text-slate-400 rounded-xl border border-slate-100 text-[11px] text-center">
                                                Sin {doc.label}
                                            </span>
                                        )
                                    ))}
                                </div>

                                {/* Controles de Dictamen */}
                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
                                    <div className="sm:col-span-3">
                                        <select 
                                            value={currentStatus} 
                                            onChange={(e) => handleDraftChange(sol.id, 'status', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 px-3 text-xs font-bold text-slate-700 outline-none"
                                        >
                                            <option value="0">⏳ Pendiente</option>
                                            <option value="1">✅ Aprobar</option>
                                            <option value="2">❌ Rechazar</option>
                                        </select>
                                    </div>

                                    <div className="sm:col-span-7">
                                        <input 
                                            type="text" 
                                            value={currentObs}
                                            onChange={(e) => handleDraftChange(sol.id, 'observaciones', e.target.value)}
                                            placeholder="Observaciones para el agremiado..."
                                            className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 px-4 text-xs text-slate-700 outline-none"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <button 
                                            onClick={() => handleGuardarValidacion(sol)}
                                            disabled={validandoId === sol.id}
                                            className="w-full bg-[#486DAA] hover:bg-[#355386] text-white font-bold py-2 px-3 rounded-full text-xs transition border-0 cursor-pointer shadow-sm flex items-center justify-center space-x-1"
                                        >
                                            <FaSave />
                                            <span>{validandoId === sol.id ? 'Guardando...' : 'Dictaminar'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-[2.5rem] ui-shadow p-8 text-slate-400 font-medium text-xs">
                    No se encontraron solicitudes registradas con los filtros seleccionados.
                </div>
            )}

            {/* Paginación */}
            {totalPaginas > 1 && (
                <div className="flex justify-center space-x-2 mt-8">
                    <button 
                        onClick={() => setPaginaActual(p => Math.max(p - 1, 1))}
                        disabled={paginaActual === 1}
                        className="px-4 py-2 bg-white rounded-full text-xs font-bold text-slate-600 ui-shadow disabled:opacity-40 border-0 cursor-pointer"
                    >
                        Anterior
                    </button>
                    <span className="px-4 py-2 bg-[#486DAA] text-white rounded-full text-xs font-bold">
                        Página {paginaActual} de {totalPaginas}
                    </span>
                    <button 
                        onClick={() => setPaginaActual(p => Math.min(p + 1, totalPaginas))}
                        disabled={paginaActual === totalPaginas}
                        className="px-4 py-2 bg-white rounded-full text-xs font-bold text-slate-600 ui-shadow disabled:opacity-40 border-0 cursor-pointer"
                    >
                        Siguiente
                    </button>
                </div>
            )}

        </div>
    );
};

export default AutoValidador;