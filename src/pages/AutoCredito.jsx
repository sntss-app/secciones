import { useCallback, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    FaCar, FaFilePdf, FaUser, FaCalculator, FaCheckCircle, 
    FaExclamationTriangle, FaArrowLeft, FaInfoCircle, FaSync, 
    FaTimesCircle, FaClock, FaIdCard, FaBuilding, FaUserAlt 
} from 'react-icons/fa';
import { apiUrl } from '../config';

// Estilos en línea
const styles = {
    container: {
        maxWidth: '900px',
        margin: '0 auto',
        padding: '2rem 1rem',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        border: 'none',
    },
    cardHeader: {
        background: 'linear-gradient(135deg, #0A0F1E 0%, #1a1f2e 100%)',
        padding: '1.5rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        borderBottom: '4px solid #3EAEF4',
    },
    cardHeaderTitle: {
        fontSize: '1.5rem',
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
    cardBody: {
        padding: '2rem',
    },
    userCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        border: '1px solid #e9ecef',
    },
    userCardHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1rem',
        paddingBottom: '0.5rem',
        borderBottom: '2px solid #3EAEF4',
    },
    userCardTitle: {
        fontSize: '1rem',
        fontWeight: 'bold',
        color: '#0A0F1E',
        margin: 0,
    },
    userDataGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.5rem 1.5rem',
    },
    userDataItem: {
        display: 'flex',
        flexDirection: 'column',
    },
    userDataLabel: {
        fontSize: '0.7rem',
        fontWeight: '600',
        color: '#6c757d',
        textTransform: 'uppercase',
        letterSpacing: '0.3px',
    },
    userDataValue: {
        fontSize: '0.95rem',
        fontWeight: '600',
        color: '#0A0F1E',
        margin: 0,
    },
    statusCard: (color) => ({
        borderRadius: '16px',
        marginBottom: '1.5rem',
        border: `2px solid ${color}`,
        overflow: 'hidden',
    }),
    statusHeader: (color) => ({
        backgroundColor: color,
        color: 'white',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontWeight: 'bold',
    }),
    statusBody: {
        padding: '1.5rem',
        backgroundColor: '#f8f9fa',
    },
    calcCard: {
        borderRadius: '16px',
        marginBottom: '1.5rem',
        border: '2px solid #3EAEF4',
        overflow: 'hidden',
    },
    calcHeader: {
        backgroundColor: '#3EAEF4',
        color: '#0A0F1E',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontWeight: 'bold',
    },
    calcBody: {
        padding: '1.5rem',
        backgroundColor: '#fff',
    },
    docCard: {
        borderRadius: '16px',
        marginBottom: '1.5rem',
        border: '1px solid #e9ecef',
        overflow: 'hidden',
    },
    docHeader: {
        backgroundColor: '#6c757d',
        color: 'white',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontWeight: 'bold',
    },
    docBody: {
        padding: '1.5rem',
        backgroundColor: '#fff',
    },
    inputGroup: {
        marginBottom: '1rem',
    },
    label: {
        display: 'block',
        fontWeight: '600',
        fontSize: '0.85rem',
        color: '#333',
        marginBottom: '0.3rem',
    },
    input: {
        width: '100%',
        padding: '0.6rem 1rem',
        fontSize: '1rem',
        border: '1px solid #ddd',
        borderRadius: '12px',
        transition: 'all 0.3s ease',
        outline: 'none',
        backgroundColor: 'white',
    },
    inputFocus: {
        borderColor: '#3EAEF4',
        boxShadow: '0 0 0 3px rgba(255,215,0,0.15)',
    },
    inputReadOnly: {
        backgroundColor: '#e9ecef',
        color: '#495057',
        cursor: 'not-allowed',
    },
    btnPrimary: {
        backgroundColor: '#3EAEF4',
        color: '#0A0F1E',
        border: 'none',
        padding: '0.7rem 1.5rem',
        borderRadius: '12px',
        fontWeight: 'bold',
        fontSize: '1rem',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
    },
    btnSuccess: {
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        padding: '0.7rem 1.5rem',
        borderRadius: '12px',
        fontWeight: 'bold',
        fontSize: '1rem',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        width: '100%',
    },
    btnOutline: {
        backgroundColor: 'transparent',
        color: '#6c757d',
        border: '1px solid #ddd',
        padding: '0.7rem 1.5rem',
        borderRadius: '12px',
        fontWeight: 'bold',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        textDecoration: 'none',
    },
    btnSecondary: {
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        padding: '0.7rem 1.5rem',
        borderRadius: '12px',
        fontWeight: 'bold',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
    },
    flexRow: {
        display: 'flex',
        gap: '0.5rem',
        marginTop: '1rem',
    },
    flexGrow: {
        flex: 1,
    },
    fileInput: {
        width: '100%',
        padding: '0.6rem 1rem',
        fontSize: '1rem',
        border: '1px solid #ddd',
        borderRadius: '12px',
        transition: 'all 0.3s ease',
        outline: 'none',
        backgroundColor: 'white',
        cursor: 'pointer',
    },
    alertError: {
        backgroundColor: '#fee2e2',
        color: '#dc2626',
        padding: '0.75rem 1rem',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.9rem',
    },
    alertSuccess: {
        backgroundColor: '#d4edda',
        color: '#155724',
        padding: '0.75rem 1rem',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.9rem',
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
    }),
    smallText: {
        fontSize: '0.75rem',
        color: '#6c757d',
        marginTop: '0.2rem',
        display: 'block',
    },
    resultBox: {
        backgroundColor: '#e9ecef',
        borderRadius: '12px',
        padding: '1rem',
        textAlign: 'center',
        marginTop: '1rem',
    },
    resultMonto: {
        fontSize: '1.8rem',
        fontWeight: 'bold',
        color: '#0A0F1E',
    },
};

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

    const [tarjetonFile, setTarjetonFile] = useState(null);
    const [ineFile, setIneFile] = useState(null);
    const [tarjetonName, setTarjetonName] = useState('');
    const [ineName, setIneName] = useState('');

    const [c02, setC02] = useState('');
    const [c11, setC11] = useState('');
    const [montoAuto, setMontoAuto] = useState(null);
    const [mostrarResultado, setMostrarResultado] = useState(false);

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
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
        }
    }, []);

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
            <div style={styles.statusCard(color)}>
                <div style={styles.statusHeader(color)}>
                    {statusInfo.icon} {statusInfo.label}
                </div>
                <div style={styles.statusBody}>
                    <p className="mb-2">{statusInfo.text}</p>
                    
                    {registroExistente.observaciones && (
                        <div className="alert alert-warning mt-2">
                            <strong>Observaciones:</strong>
                            <p className="mb-0">{registroExistente.observaciones}</p>
                        </div>
                    )}
                    
                    <div className="mt-2">
                        <span style={styles.badge(color)}>
                            Status: {registroExistente.estatus}
                        </span>
                        <span style={{ ...styles.badge('#e9ecef'), color: '#333', marginLeft: '0.5rem' }}>
                            Registrado: {registroExistente.fecha}
                        </span>
                        {registroExistente.fecha_validado && (
                            <span style={{ ...styles.badge('#e9ecef'), color: '#333', marginLeft: '0.5rem' }}>
                                Validado: {registroExistente.fecha_validado}
                            </span>
                        )}
                    </div>

                    {registroExistente.estatus === 'observaciones' && (
                        <button 
                            className="btn btn-warning btn-sm mt-3"
                            onClick={handleReintentar}
                            style={{ borderRadius: '12px' }}
                        >
                            <FaSync className="me-1" /> Reintentar registro
                        </button>
                    )}
                </div>
            </div>
        );
    };

    if (cargandoRegistro) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-warning" role="status"></div>
                <p className="mt-3">Verificando tu registro...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.cardHeader}>
                    <h3 style={styles.cardHeaderTitle}>
                        <FaCar /> Crédito Automotriz
                    </h3>
                    <Link to="/dashboard" style={styles.btnOutline}>
                        <FaArrowLeft className="me-1" /> Volver
                    </Link>
                </div>
                <div style={styles.cardBody}>
                    {errorMsg && (
                        <div style={styles.alertError}>
                            <FaExclamationTriangle /> {errorMsg}
                            <button type="button" style={{ background: 'none', border: 'none', marginLeft: 'auto', color: 'inherit' }} onClick={() => setErrorMsg('')}>✕</button>
                        </div>
                    )}
                    {successMsg && (
                        <div style={styles.alertSuccess}>
                            <FaCheckCircle /> {successMsg}
                        </div>
                    )}

                    {registroExistente && renderStatus()}

                    {(!registroExistente || registroExistente.estatus === 'observaciones') && (
                        <form onSubmit={handleSubmit}>
                            {/* Datos del usuario */}
                            <div style={styles.userCard}>
                                <div style={styles.userCardHeader}>
                                    <FaUserAlt style={{ color: '#3EAEF4' }} />
                                    <h5 style={styles.userCardTitle}>Tus datos</h5>
                                </div>
                                <div style={styles.userDataGrid}>
                                    <div style={styles.userDataItem}>
                                        <span style={styles.userDataLabel}><FaIdCard className="me-1" /> Matrícula</span>
                                        <span style={styles.userDataValue}>{userData.matricula}</span>
                                    </div>
                                    <div style={styles.userDataItem}>
                                        <span style={styles.userDataLabel}><FaUser className="me-1" /> Nombre</span>
                                        <span style={styles.userDataValue}>{userData.nombre}</span>
                                    </div>
                                    <div style={styles.userDataItem}>
                                        <span style={styles.userDataLabel}><FaBuilding className="me-1" /> Adscripción</span>
                                        <span style={styles.userDataValue}>{userData.adscripcion || 'N/A'}</span>
                                    </div>
                                    <div style={styles.userDataItem}>
                                        <span style={styles.userDataLabel}><FaUserAlt className="me-1" /> Categoría</span>
                                        <span style={styles.userDataValue}>{userData.categoria || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Calculadora */}
                            <div style={styles.calcCard}>
                                <div style={styles.calcHeader}>
                                    <FaCalculator /> Debes calcular el monto de tu préstamo antes de subir tus documentos.
                                </div>
                                <div style={styles.calcBody}>
                                    <p className="text-muted small mb-3">
                                        El cálculo se basa en los conceptos 002 y 011 de tu tarjetón. 
                                        Se suma el 20% de prestaciones y se multiplica por 24 veces.
                                    </p>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label style={styles.label}>Concepto 002 (quincenal)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                style={styles.input}
                                                value={c02}
                                                onChange={(e) => setC02(e.target.value)}
                                                placeholder="Ej: 2437.73"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label style={styles.label}>Concepto 011 (quincenal)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                style={styles.input}
                                                value={c11}
                                                onChange={(e) => setC11(e.target.value)}
                                                placeholder="Ej: 2002.60"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        style={styles.btnPrimary}
                                        onClick={calcularAuto}
                                        className="mt-3"
                                        onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 4px 12px rgba(255,215,0,0.3)'; }}
                                        onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}
                                    >
                                        <FaCalculator /> Calcular
                                    </button>

                                    {mostrarResultado && montoAuto !== null && (
                                        <div style={styles.resultBox}>
                                            <p className="fw-bold mb-1">Monto del préstamo para auto:</p>
                                            <div style={styles.resultMonto}>
                                                {formatter.format(montoAuto)}
                                            </div>
                                            <small className="text-muted">
                                                Por 24 veces el sueldo mensual integrado (incluye 20% de prestaciones)
                                            </small>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Documentos */}
                            <div style={styles.docCard}>
                                <div style={styles.docHeader}>
                                    <FaFilePdf /> Documentos requeridos
                                </div>
                                <div style={styles.docBody}>
                                    <p className="text-muted small">
                                        Sube los siguientes documentos en formato <strong>PDF</strong>.
                                        Tamaño máximo: <strong>5MB</strong> por archivo.
                                    </p>
                                    
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>📄 Último tarjetón de pago</label>
                                        <input
                                            type="file"
                                            style={styles.fileInput}
                                            accept=".pdf"
                                            onChange={(e) => handleFileChange(e, 'tarjeton')}
                                            disabled={loading}
                                            required
                                        />
                                        {tarjetonName && (
                                            <small className="text-success">✅ {tarjetonName}</small>
                                        )}
                                    </div>

                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>🪪 Identificación oficial (INE)</label>
                                        <input
                                            type="file"
                                            style={styles.fileInput}
                                            accept=".pdf"
                                            onChange={(e) => handleFileChange(e, 'ine')}
                                            disabled={loading}
                                            required
                                        />
                                        {ineName && (
                                            <small className="text-success">✅ {ineName}</small>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div style={styles.flexRow}>
                                <button
                                    type="submit"
                                    style={{ ...styles.btnSuccess, ...styles.flexGrow }}
                                    disabled={loading}
                                    onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 4px 12px rgba(40,167,69,0.3)'; }}
                                    onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}
                                >
                                    {loading ? 'Guardando...' : 'Guardar solicitud'}
                                </button>
                                <Link to="/dashboard" style={styles.btnOutline}>
                                    Cancelar
                                </Link>
                            </div>
                        </form>
                    )}

                    {registroExistente && registroExistente.estatus !== 'observaciones' && (
                        <div className="text-center mt-3">
                            <Link to="/dashboard" style={styles.btnPrimary}>
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