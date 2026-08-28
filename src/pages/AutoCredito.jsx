import { useCallback, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    FaCar, FaFilePdf, FaUser, FaCalculator, FaCheckCircle, 
    FaExclamationTriangle, FaArrowLeft, FaInfoCircle, FaSync, 
    FaTimesCircle, FaClock, FaIdCard, FaBuilding, FaUserAlt,
    FaDownload
} from 'react-icons/fa';
import { apiUrl } from '../config';

// ✅ IMPORTAR CSS EXTERNO
import '../css/AutoCredito.css';

const AutoCredito = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    
    const [userData, setUserData] = useState(() => ({
        matricula: localStorage.getItem('matricula') || '',
        nombre: localStorage.getItem('nombre') || '',
        adscripcion: localStorage.getItem('adscripcion') || '',
        categoria: localStorage.getItem('categoria') || ''
    }));

    const [registroExistente, setRegistroExistente] = useState(null);
    const [cargandoRegistro, setCargandoRegistro] = useState(true);
    
    const [convocatoriaUrl, setConvocatoriaUrl] = useState(null);
    const [logoAutoUrl, setLogoAutoUrl] = useState(null);
    const [seccionInfo, setSeccionInfo] = useState(null);

    const [tarjetonFile, setTarjetonFile] = useState(null);
    const [ineFile, setIneFile] = useState(null);
    const [tarjetonName, setTarjetonName] = useState('');
    const [ineName, setIneName] = useState('');

    const [c02, setC02] = useState('');
    const [c11, setC11] = useState('');
    const [montoAuto, setMontoAuto] = useState(null);
    const [mostrarResultado, setMostrarResultado] = useState(false);

    const cargarRecursosProceso = useCallback(async (idSeccion) => {
        if (!idSeccion) return;
        try {
            const response = await fetch(apiUrl(`/obtener_recursos_proceso.php?idSeccion=${idSeccion}&proceso=auto`));
            const data = await response.json();
            if (data.success) {
                setConvocatoriaUrl(data.convocatoria_url || null);
                setLogoAutoUrl(data.logo_url || null);
            }
        } catch (error) {
            console.error('Error cargando recursos del proceso:', error);
        }
    }, []);

    const cargarDatosUsuario = useCallback(async (matricula) => {
        try {
            const response = await fetch(apiUrl(`/obtener_perfil.php?matricula=${matricula}`));
            const data = await response.json();
            if (data.success) {
                setUserData({
                    matricula: data.usuario.matricula,
                    nombre: data.usuario.nombre,
                    adscripcion: data.usuario.adscripcion || '',
                    categoria: data.usuario.categoria || ''
                });
                
                if (data.usuario.idSeccion) {
                    setSeccionInfo({
                        id: data.usuario.idSeccion,
                        romano: data.usuario.seccion_romano || 'N/A',
                        nombre: data.usuario.seccion_nombre || 'Sin sección',
                        color: data.usuario.seccion_color || '#3EAEF4'
                    });
                    
                    cargarRecursosProceso(data.usuario.idSeccion);
                }
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
        }
    }, [cargarRecursosProceso]);

    const verificarRegistro = useCallback(async (matricula) => {
        setCargandoRegistro(true);
        try {
            const response = await fetch(apiUrl(`/obtener_auto.php?matricula=${matricula}`));
            const data = await response.json();
            
            if (data.success && data.credit) {
                setRegistroExistente(data.credit);
            } else {
                setRegistroExistente(null);
            }
        } catch (error) {
            console.error('Error verificando registro:', error);
            setRegistroExistente(null);
        } finally {
            setCargandoRegistro(false);
        }
    }, []);

    useEffect(() => {
        const matricula = localStorage.getItem('matricula');
        if (!matricula) {
            navigate('/login');
            return;
        }

        const loadTimer = setTimeout(() => {
            cargarDatosUsuario(matricula);
            verificarRegistro(matricula);
        }, 0);

        return () => clearTimeout(loadTimer);
    }, [cargarDatosUsuario, navigate, verificarRegistro]);

    const formatter = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2
    });

    const calcularAuto = () => {
        const c02Num = parseFloat(c02);
        const c11Num = parseFloat(c11);
        
        if (isNaN(c02Num) || isNaN(c11Num)) {
            setErrorMsg('Por favor ingresa ambos conceptos (002 y 011).');
            return;
        }
        
        const sumaQuincenal = c02Num + c11Num;
        const mensualBase = sumaQuincenal * 2;
        const mensualIntegrado = mensualBase * 1.20;
        const monto = mensualIntegrado * 24;
        setMontoAuto(monto);
        setMostrarResultado(true);
        setErrorMsg('');
    };

    const handleFileChange = (e, tipo) => {
        const file = e.target.files[0];
        if (!file) return;

        if (tipo === 'tarjeton') {
            if (file.type !== 'application/pdf') {
                setErrorMsg('El tarjetón debe ser un archivo PDF.');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setErrorMsg('El tarjetón no debe superar los 5MB.');
                return;
            }
            setTarjetonFile(file);
            setTarjetonName(file.name);
        } else if (tipo === 'ine') {
            if (file.type !== 'application/pdf') {
                setErrorMsg('El INE debe ser un archivo PDF.');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setErrorMsg('El INE no debe superar los 5MB.');
                return;
            }
            setIneFile(file);
            setIneName(file.name);
        }
        setErrorMsg('');
    };

    const handleReintentar = () => {
        setTarjetonFile(null);
        setTarjetonName('');
        setIneFile(null);
        setIneName('');
        setRegistroExistente(null);
        setErrorMsg('');
        setSuccessMsg('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setLoading(true);

        if (!tarjetonFile || !ineFile) {
            setErrorMsg('Debes subir tanto el tarjetón como el INE.');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('matricula', userData.matricula);
        formData.append('tarjeton', tarjetonFile);
        formData.append('ine', ineFile);

        try {
            const response = await fetch(apiUrl('/registro_auto.php'), {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Error al guardar la solicitud.');
            }

            setSuccessMsg('¡Solicitud de crédito automotriz registrada exitosamente!');
            await verificarRegistro(userData.matricula);
            setTimeout(() => navigate('/dashboard'), 3000);
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusInfo = (estatus) => {
        const map = {
            'preregistro': { color: '#6c757d', icon: <FaClock />, label: 'Preregistro recibido', text: 'Tu solicitud está en revisión. Espera la validación de tu documentación.' },
            'aprobado': { color: '#28a745', icon: <FaCheckCircle />, label: 'Validado', text: '¡Felicidades! Tu crédito ha sido validado.' },
            'observaciones': { color: '#ffc107', icon: <FaExclamationTriangle />, label: 'Con observaciones', text: 'Tu documentación requiere correcciones.' },
            'sinconcluir': { color: '#fd7e14', icon: <FaInfoCircle />, label: 'Registro inconcluso', text: 'Tu registro está inconcluso.' },
            'denegado': { color: '#dc3545', icon: <FaTimesCircle />, label: 'Denegado', text: 'Tu solicitud ha sido denegada.' }
        };
        return map[estatus] || map['preregistro'];
    };

    const renderStatus = () => {
        if (!registroExistente) return null;

        const statusInfo = getStatusInfo(registroExistente.estatus);
        const color = statusInfo.color;

        return (
            <div className="autocredito-status-card" style={{ border: `2px solid ${color}` }}>
                <div className="autocredito-status-header" style={{ backgroundColor: color }}>
                    {statusInfo.icon} {statusInfo.label}
                </div>
                <div className="autocredito-status-body">
                    <p className="autocredito-mb-2">{statusInfo.text}</p>
                    
                    {registroExistente.observaciones && (
                        <div className="autocredito-alert-error" style={{ marginBottom: '0.5rem' }}>
                            <FaExclamationTriangle />
                            <strong>Observaciones:</strong>
                            <span>{registroExistente.observaciones}</span>
                        </div>
                    )}
                    
                    <div className="autocredito-mt-2">
                        <span className="autocredito-badge" style={{ backgroundColor: color }}>
                            Status: {registroExistente.estatus}
                        </span>
                        <span className="autocredito-badge autocredito-badge-dark" style={{ marginLeft: '0.5rem' }}>
                            Registrado: {registroExistente.fecha}
                        </span>
                        {registroExistente.fecha_validado && (
                            <span className="autocredito-badge autocredito-badge-dark" style={{ marginLeft: '0.5rem' }}>
                                Validado: {registroExistente.fecha_validado}
                            </span>
                        )}
                    </div>

                    {registroExistente.estatus === 'observaciones' && (
                        <button 
                            className="autocredito-btn-primary autocredito-mt-3"
                            onClick={handleReintentar}
                            style={{ padding: '0.3rem 1rem', fontSize: '0.85rem' }}
                        >
                            <FaSync /> Reintentar registro
                        </button>
                    )}
                </div>
            </div>
        );
    };

    if (cargandoRegistro) {
        return (
            <div className="autocredito-loading">
                <div className="autocredito-spinner" role="status" />
                <p className="autocredito-mt-3 autocredito-text-muted">Verificando tu registro...</p>
            </div>
        );
    }

    const colorPrincipal = seccionInfo?.color || '#3EAEF4';

    return (
        <div className="autocredito-wrapper">
            {/* Header Banner Sección 5 */}
            <div className="autocredito-header ui-shadow">
                <div className="autocredito-header-dots dot-matrix"></div>
                <div className="autocredito-header-content">
                    <div className="autocredito-header-left">
                        <Link to="/" className="autocredito-back-btn">
                            <FaArrowLeft size={12} /> Volver al Inicio
                        </Link>
                        <div className="autocredito-header-titles">
                            <span className="autocredito-header-tag">Programa de Financiamiento</span>
                            <h1 className="autocredito-header-title">
                                Preregistro a la Rifa de Crédito Automotriz
                            </h1>
                            <p className="autocredito-header-subtitle">
                                Registra tus datos y documentación para participar en la rifa de financiamiento de vehículo
                            </p>
                        </div>
                    </div>
                    <div className="autocredito-header-right">
                        {seccionInfo && (
                            <span className="autocredito-header-badge">
                                🚗 Sección {seccionInfo.romano}
                            </span>
                        )}
                    </div>
                </div>

                {/* Matriz decorativa de puntitos en esquina */}
                <div className="autocredito-header-dots-matrix">
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

            <div className="autocredito-card ui-shadow">
                <div className="autocredito-card-body">
                    {errorMsg && (
                        <div className="autocredito-alert-error">
                            <FaExclamationTriangle /> {errorMsg}
                            <button className="autocredito-alert-close" onClick={() => setErrorMsg('')}>✕</button>
                        </div>
                    )}
                    {successMsg && (
                        <div className="autocredito-alert-success">
                            <FaCheckCircle /> {successMsg}
                        </div>
                    )}

                    {seccionInfo && (
                        <div className="autocredito-seccion-banner">
                            {logoAutoUrl ? (
                                <img 
                                    src={logoAutoUrl} 
                                    alt={`Logo crédito auto ${seccionInfo.nombre}`}
                                    className="autocredito-seccion-logo"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            ) : (
                                <div className="autocredito-seccion-logo-fallback">
                                    <FaCar />
                                </div>
                            )}
                            <div className="autocredito-seccion-info">
                                <span className="autocredito-seccion-nombre">
                                    Crédito Automotriz - Sección {seccionInfo.romano}
                                </span>
                                <span className="autocredito-seccion-detalle">
                                    {seccionInfo.nombre}
                                </span>
                            </div>
                            <a 
                                href={convocatoriaUrl || '#'} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={`autocredito-convocatoria-btn ${!convocatoriaUrl ? 'autocredito-convocatoria-btn-disabled' : ''}`}
                            >
                                <FaDownload /> {convocatoriaUrl ? 'Descargar Convocatoria' : 'Convocatoria no disponible'}
                            </a>
                        </div>
                    )}

                    {registroExistente && renderStatus()}

                    {(!registroExistente || registroExistente.estatus === 'observaciones') && (
                        <form onSubmit={handleSubmit}>
                            <div className="autocredito-user-card">
                                <div className="autocredito-user-card-header">
                                    <FaUserAlt style={{ color: colorPrincipal }} />
                                    <h5 className="autocredito-user-card-title">Tus datos</h5>
                                </div>
                                <div className="autocredito-user-data-grid">
                                    <div className="autocredito-user-data-item">
                                        <span className="autocredito-user-data-label"><FaIdCard /> Matrícula</span>
                                        <span className="autocredito-user-data-value">{userData.matricula}</span>
                                    </div>
                                    <div className="autocredito-user-data-item">
                                        <span className="autocredito-user-data-label"><FaUser /> Nombre</span>
                                        <span className="autocredito-user-data-value">{userData.nombre}</span>
                                    </div>
                                    <div className="autocredito-user-data-item">
                                        <span className="autocredito-user-data-label"><FaBuilding /> Adscripción</span>
                                        <span className="autocredito-user-data-value">{userData.adscripcion || 'N/A'}</span>
                                    </div>
                                    <div className="autocredito-user-data-item">
                                        <span className="autocredito-user-data-label"><FaUserAlt /> Categoría</span>
                                        <span className="autocredito-user-data-value">{userData.categoria || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="autocredito-calc-card">
                                <div className="autocredito-calc-header">
                                    <FaCalculator /> Debes calcular el monto de tu préstamo antes de subir tus documentos.
                                </div>
                                <div className="autocredito-calc-body">
                                    <p className="autocredito-text-muted autocredito-mb-3" style={{ fontSize: '0.85rem' }}>
                                        El cálculo se basa en los conceptos 002 y 011 de tu tarjetón. 
                                        Se suma el 20% de prestaciones y se multiplica por 24 veces.
                                    </p>
                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                        <div style={{ flex: 1, minWidth: '200px' }}>
                                            <label className="autocredito-label">Concepto 002 (quincenal)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="autocredito-input"
                                                value={c02}
                                                onChange={(e) => setC02(e.target.value)}
                                                placeholder="Ej: 2437.73"
                                            />
                                        </div>
                                        <div style={{ flex: 1, minWidth: '200px' }}>
                                            <label className="autocredito-label">Concepto 011 (quincenal)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="autocredito-input"
                                                value={c11}
                                                onChange={(e) => setC11(e.target.value)}
                                                placeholder="Ej: 2002.60"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="autocredito-btn-primary autocredito-mt-3"
                                        onClick={calcularAuto}
                                    >
                                        <FaCalculator /> Calcular
                                    </button>

                                    {mostrarResultado && montoAuto !== null && (
                                        <div className="autocredito-result-box">
                                            <p className="autocredito-mb-2" style={{ fontWeight: 'bold' }}>Monto del préstamo para auto:</p>
                                            <div className="autocredito-result-monto">
                                                {formatter.format(montoAuto)}
                                            </div>
                                            <small className="autocredito-text-muted">
                                                Por 24 veces el sueldo mensual integrado (incluye 20% de prestaciones)
                                            </small>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="autocredito-doc-card">
                                <div className="autocredito-doc-header">
                                    <FaFilePdf /> Documentos requeridos
                                </div>
                                <div className="autocredito-doc-body">
                                    <p className="autocredito-text-muted" style={{ fontSize: '0.85rem' }}>
                                        Sube los siguientes documentos en formato <strong>PDF</strong>.
                                        Tamaño máximo: <strong>5MB</strong> por archivo.
                                    </p>
                                    
                                    <div className="autocredito-input-group">
                                        <label className="autocredito-label">📄 Último tarjetón de pago</label>
                                        <input
                                            type="file"
                                            className="autocredito-file-input"
                                            accept=".pdf"
                                            onChange={(e) => handleFileChange(e, 'tarjeton')}
                                            disabled={loading}
                                            required
                                        />
                                        {tarjetonName && (
                                            <small className="autocredito-text-success">✅ {tarjetonName}</small>
                                        )}
                                    </div>

                                    <div className="autocredito-input-group">
                                        <label className="autocredito-label">🪪 Identificación oficial (INE)</label>
                                        <input
                                            type="file"
                                            className="autocredito-file-input"
                                            accept=".pdf"
                                            onChange={(e) => handleFileChange(e, 'ine')}
                                            disabled={loading}
                                            required
                                        />
                                        {ineName && (
                                            <small className="autocredito-text-success">✅ {ineName}</small>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="autocredito-flex-row">
                                <button
                                    type="submit"
                                    className="autocredito-btn-success autocredito-flex-grow"
                                    disabled={loading}
                                >
                                    {loading ? 'Guardando...' : 'Guardar solicitud'}
                                </button>
                                <Link to="/dashboard" className="autocredito-btn-outline">
                                    Cancelar
                                </Link>
                            </div>
                        </form>
                    )}

                    {registroExistente && registroExistente.estatus !== 'observaciones' && (
                        <div className="autocredito-text-center autocredito-mt-3">
                            <Link to="/dashboard" className="autocredito-btn-primary">
                                Volver 
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AutoCredito;