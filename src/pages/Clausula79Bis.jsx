import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    FaUser, FaIdCard, FaBuilding, FaPhone, FaEnvelope, FaFilePdf, 
    FaCheckCircle, FaExclamationTriangle, FaArrowLeft, FaSave,
    FaUserPlus, FaCalendarAlt, FaClock,
    FaInfoCircle, FaDownload, FaShieldAlt, FaStar,
    FaRocket, FaUsers, FaGift, FaSync
} from 'react-icons/fa';
import { apiUrl } from '../config';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const Clausula79Bis = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [registroExistente, setRegistroExistente] = useState(null);
    const [matricula, setMatricula] = useState('');
    const [usuario, setUsuario] = useState(null);
    const [cargandoRegistro, setCargandoRegistro] = useState(true);
    const [modoEdicion, setModoEdicion] = useState(false); // ← NUEVO

    // Estado del formulario
    const [formData, setFormData] = useState({
        telefono: '',
        correo: '',
        tiene_acompanante: false,
        nombre_acompanante: '',
    });

    // Estado de archivos
    const [tarjetonFile, setTarjetonFile] = useState(null);
    const [tarjetonName, setTarjetonName] = useState('');
    const [ineFile, setIneFile] = useState(null);
    const [ineName, setIneName] = useState('');

    // Categorías del festejo
    const categoriasFestejo = [
        'Intendencia',
        'Limpieza e Higiene',
        'Camilleria',
        'Transportes',
        'Conservacion',
        'Polivalentes',
        'y sus escalafones'
    ];

    // Cargar datos del usuario al montar
    useEffect(() => {
        const matriculaStorage = localStorage.getItem('matricula');
        if (!matriculaStorage) {
            navigate('/login');
            return;
        }
        setMatricula(matriculaStorage);
        cargarUsuario(matriculaStorage);
        verificarRegistro(matriculaStorage);
    }, []);

    const cargarUsuario = async (matricula) => {
        try {
            const response = await fetch(apiUrl(`/obtener_perfil.php?matricula=${encodeURIComponent(matricula)}`));
            const data = await response.json();
            if (data.success) {
                setUsuario(data.usuario);
                setFormData(prev => ({
                    ...prev,
                    telefono: data.usuario.telefono || '',
                    correo: data.usuario.correo || ''
                }));
            }
        } catch (error) {
            console.error('Error cargando usuario:', error);
        }
    };

    const verificarRegistro = async (matricula) => {
    setCargandoRegistro(true);
    try {
        const response = await fetch(apiUrl(`/clausula79bis_obtener.php?matricula=${encodeURIComponent(matricula)}`));
        const data = await response.json();
        console.log('📦 Respuesta obtener:', data);
        
        if (data.success && data.registro) {
            console.log('✅ ID del registro:', data.registro.id);
            console.log('✅ Registro completo:', data.registro);
            setRegistroExistente(data.registro);
            // ... resto
        }
    } catch (error) {
        console.error('Error verificando registro:', error);
        setRegistroExistente(null);
    } finally {
        setCargandoRegistro(false);
    }
};

    const getStatusInfo = (estatus) => {
        const map = {
            1: { color: '#6c757d', icon: <FaClock />, label: 'Preregistro', bg: 'linear-gradient(135deg, #6c757d, #495057)' },
            2: { color: '#28a745', icon: <FaCheckCircle />, label: '✅ Aprobado', bg: 'linear-gradient(135deg, #28a745, #20c997)' },
            3: { color: '#ffc107', icon: <FaExclamationTriangle />, label: 'Observaciones', bg: 'linear-gradient(135deg, #ffc107, #fd7e14)' },
            4: { color: '#fd7e14', icon: <FaInfoCircle />, label: 'Incompleto', bg: 'linear-gradient(135deg, #fd7e14, #dc3545)' },
            5: { color: '#dc3545', icon: <FaExclamationTriangle />, label: 'Denegado', bg: 'linear-gradient(135deg, #dc3545, #c82333)' }
        };
        return map[estatus] || map[1];
    };

    const handleTarjetonChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                Swal.fire({
                    title: '⚠️ Formato incorrecto',
                    text: 'El tarjetón debe ser un archivo PDF.',
                    icon: 'warning',
                    confirmButtonColor: '#ffc107',
                });
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                Swal.fire({
                    title: '⚠️ Archivo muy grande',
                    text: 'El tarjetón no debe superar los 5MB.',
                    icon: 'warning',
                    confirmButtonColor: '#ffc107',
                });
                return;
            }
            setTarjetonFile(file);
            setTarjetonName(file.name);
        }
    };

    const handleIneChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                Swal.fire({
                    title: '⚠️ Formato incorrecto',
                    text: 'El INE debe ser un archivo PDF.',
                    icon: 'warning',
                    confirmButtonColor: '#ffc107',
                });
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                Swal.fire({
                    title: '⚠️ Archivo muy grande',
                    text: 'El INE no debe superar los 5MB.',
                    icon: 'warning',
                    confirmButtonColor: '#ffc107',
                });
                return;
            }
            setIneFile(file);
            setIneName(file.name);
        }
    };

    const activarEdicion = () => {
        setModoEdicion(true);
        setTarjetonFile(null);
        setTarjetonName('');
        setIneFile(null);
        setIneName('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelarEdicion = () => {
        setModoEdicion(false);
        // Recargar datos originales
        if (registroExistente) {
            setFormData({
                telefono: registroExistente.telefono || '',
                correo: registroExistente.correo || '',
                tiene_acompanante: registroExistente.tiene_acompanante == 1,
                nombre_acompanante: registroExistente.nombre_acompanante || ''
            });
            if (registroExistente.tarjeton_ruta) setTarjetonName('Tarjetón cargado');
            if (registroExistente.ine_ruta) setIneName('INE cargado');
            setTarjetonFile(null);
            setIneFile(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setLoading(true);

        // Validaciones
        if (!formData.telefono || !/^\d{10}$/.test(formData.telefono)) {
            await Swal.fire({
                title: '⚠️ Teléfono inválido',
                text: 'El teléfono debe tener exactamente 10 dígitos numéricos.',
                icon: 'warning',
                confirmButtonColor: '#ffc107',
            });
            setLoading(false);
            return;
        }

        if (!formData.correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
            await Swal.fire({
                title: '⚠️ Correo inválido',
                text: 'Ingresa un correo electrónico válido.',
                icon: 'warning',
                confirmButtonColor: '#ffc107',
            });
            setLoading(false);
            return;
        }

        if (formData.tiene_acompanante && !formData.nombre_acompanante.trim()) {
            await Swal.fire({
                title: '⚠️ Acompañante',
                text: 'Ingresa el nombre del acompañante.',
                icon: 'warning',
                confirmButtonColor: '#ffc107',
            });
            setLoading(false);
            return;
        }

        if (!tarjetonFile && !registroExistente?.tarjeton_ruta) {
            await Swal.fire({
                title: '⚠️ Documento requerido',
                text: 'Debes subir tu último tarjetón de pago (PDF).',
                icon: 'warning',
                confirmButtonColor: '#ffc107',
            });
            setLoading(false);
            return;
        }

        if (!ineFile && !registroExistente?.ine_ruta) {
            await Swal.fire({
                title: '⚠️ Documento requerido',
                text: 'Debes subir tu INE (PDF).',
                icon: 'warning',
                confirmButtonColor: '#ffc107',
            });
            setLoading(false);
            return;
        }

        try {
            const payload = {
                matricula: matricula,
                telefono: formData.telefono,
                correo: formData.correo,
                tiene_acompanante: formData.tiene_acompanante ? 1 : 0,
                nombre_acompanante: formData.nombre_acompanante
            };

            console.log('📦 Payload inicial:', payload);
            console.log('📦 modoEdicion:', modoEdicion);
            console.log('📦 registroExistente:', registroExistente);

            // 🔥🔥🔥 NUEVA LÓGICA 🔥🔥🔥
            let endpoint = '/clausula79bis_guardar.php';
            let successMessage = '¡Registro aprobado!';

            // 🔥 SI HAY REGISTRO EXISTENTE, SIEMPRE USAR ACTUALIZAR
            if (registroExistente) {
                console.log('🔍 REGISTRO EXISTENTE - USANDO ACTUALIZAR');
                console.log('🔍 ID del registro:', registroExistente.id);
                
                // Si no tiene ID, intentar obtenerlo de otra manera
                const id = registroExistente.id || registroExistente.ID;
                if (!id) {
                    throw new Error('No se encontró el ID del registro');
                }
                
                payload.id = id;
                endpoint = '/clausula79bis_actualizar.php';
                successMessage = '¡Registro actualizado!';
                
                console.log('📦 Payload final con ID:', payload);
            }

            console.log('📤 Enviando a:', endpoint);
            console.log('📤 Payload:', JSON.stringify(payload, null, 2));

            // 🔥🔥🔥 LOGS DE VERIFICACIÓN 🔥🔥🔥
            console.log('🔥🔥🔥 ENDPOINT A USAR:', endpoint);
            console.log('🔥🔥🔥 MODO EDICION:', modoEdicion);
            console.log('🔥🔥🔥 REGISTRO EXISTENTE:', registroExistente);

            const response = await fetch(apiUrl(endpoint), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            console.log('📥 Respuesta:', data);

            if (!data.success) {
                throw new Error(data.message || 'Error al guardar el registro');
            }

            // Subir tarjetón si hay archivo nuevo
            if (tarjetonFile) {
                const formDataTarjeton = new FormData();
                formDataTarjeton.append('matricula', matricula);
                formDataTarjeton.append('tipo', '1');
                formDataTarjeton.append('tarjeton', tarjetonFile);

                await fetch(apiUrl('/clausula79bis_subir_documentos.php'), {
                    method: 'POST',
                    body: formDataTarjeton
                });
            }

            // Subir INE si hay archivo nuevo
            if (ineFile) {
                const formDataIne = new FormData();
                formDataIne.append('matricula', matricula);
                formDataIne.append('tipo', '2');
                formDataIne.append('ine', ineFile);

                await fetch(apiUrl('/clausula79bis_subir_documentos.php'), {
                    method: 'POST',
                    body: formDataIne
                });
            }

            // 🔥 ACTUALIZAR EL ESTADO DESPUÉS DE GUARDAR
            await verificarRegistro(matricula);
            setModoEdicion(false);

            await Swal.fire({
                title: '✅ ¡Éxito!',
                text: successMessage,
                icon: 'success',
                confirmButtonColor: '#28a745',
                timer: 3000,
                timerProgressBar: true,
            });

        } catch (error) {
            console.error('❌ Error:', error);
            await Swal.fire({
                title: '❌ Error',
                text: error.message,
                icon: 'error',
                confirmButtonColor: '#dc3545',
            });
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    // ========== ESTILOS ==========
    const styles = {
        container: {
            maxWidth: '900px',
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
            borderBottom: '4px solid #3EAEF4',
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
            background: 'radial-gradient(circle, rgba(62,174,244,0.1) 0%, transparent 70%)',
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
            background: 'linear-gradient(135deg, #fff 30%, #3EAEF4 100%)',
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
        categoriasBadge: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'rgba(62,174,244,0.15)',
            color: '#3EAEF4',
            padding: '0.3rem 1rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            marginTop: '0.5rem',
            border: '1px solid rgba(62,174,244,0.2)',
            flexWrap: 'wrap',
        },
        card: {
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.5)',
            marginBottom: '2rem',
        },
        cardBody: {
            padding: '2rem',
        },
        statusCard: {
            padding: '1.5rem',
            borderRadius: '16px',
            marginBottom: '1.5rem',
            border: '1px solid #e9ecef',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            background: 'linear-gradient(135deg, #f8f9fa, #fff)',
        },
        statusBadge: (bg) => ({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1.2rem',
            borderRadius: '20px',
            background: bg,
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }),
        grid2cols: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
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
        labelIcon: {
            color: '#3EAEF4',
            marginRight: '0.3rem',
        },
        input: {
            width: '100%',
            padding: '0.6rem 1rem',
            fontSize: '0.95rem',
            border: '1px solid #ddd',
            borderRadius: '10px',
            outline: 'none',
            backgroundColor: 'white',
            color: '#0A0F1E',
        },
        inputReadOnly: {
            backgroundColor: '#f8f9fa',
            cursor: 'not-allowed',
            color: '#495057',
        },
        inputEditable: {
            borderLeft: '3px solid #3EAEF4',
        },
        fileInput: {
            width: '100%',
            padding: '0.5rem',
            fontSize: '0.9rem',
            border: '1px solid #ddd',
            borderRadius: '10px',
            backgroundColor: 'white',
            cursor: 'pointer',
        },
        checkboxWrapper: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(255,255,255,0.8)',
            borderRadius: '12px',
            border: '1px solid #e9ecef',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            marginBottom: '1rem',
        },
        checkboxHidden: {
            display: 'none',
        },
        checkboxCustom: (checked) => ({
            width: '24px',
            height: '24px',
            borderRadius: '6px',
            backgroundColor: checked ? '#3EAEF4' : 'white',
            border: checked ? '2px solid #3EAEF4' : '2px solid #ddd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            flexShrink: 0,
            boxShadow: checked ? '0 2px 8px rgba(62,174,244,0.3)' : 'none',
        }),
        checkboxLabel: {
            fontSize: '0.95rem',
            fontWeight: '500',
            color: '#0A0F1E',
            cursor: 'pointer',
        },
        checkboxSubtext: {
            fontSize: '0.75rem',
            color: '#6c757d',
            marginTop: '0.1rem',
        },
        btnPrimary: {
            backgroundColor: '#3EAEF4',
            color: '#0A0F1E',
            border: 'none',
            padding: '0.8rem 1.5rem',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            width: '100%',
            boxShadow: '0 2px 8px rgba(62,174,244,0.2)',
        },
        btnDownload: {
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            padding: '0.8rem 1.5rem',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            width: '100%',
            boxShadow: '0 2px 8px rgba(40,167,69,0.2)',
        },
        btnReintentar: {
            backgroundColor: '#ffc107',
            color: '#0A0F1E',
            border: 'none',
            padding: '0.8rem 1.5rem',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            width: '100%',
            boxShadow: '0 2px 8px rgba(255,193,7,0.3)',
        },
        flexRow: {
            display: 'flex',
            gap: '0.5rem',
            marginTop: '1rem',
        },
        flexGrow: {
            flex: 1,
        },
        smallText: {
            fontSize: '0.75rem',
            color: '#6c757d',
            marginTop: '0.2rem',
            display: 'block',
        },
        fileStatus: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontSize: '0.75rem',
            color: '#28a745',
            marginTop: '0.3rem',
        },
        observacionesBox: {
            backgroundColor: '#fff3cd',
            padding: '1rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            borderLeft: '4px solid #ffc107',
        },
        btnCancelar: {
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '0.8rem 1.5rem',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
        },
    };

    if (cargandoRegistro) {
        return (
            <div style={styles.container}>
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <div className="spinner-border text-warning" role="status" style={{ width: '2.5rem', height: '2.5rem' }} />
                    <p className="mt-3 text-muted">Verificando tu registro...</p>
                </div>
            </div>
        );
    }

    // Si hay registro existente y estamos en modo edición O es observaciones
    if (registroExistente && (modoEdicion || registroExistente.estatus === 3)) {
        const statusInfo = getStatusInfo(registroExistente.estatus);
        
        return (
            <div style={styles.container}>
                <div style={styles.header}>
                    <div style={styles.headerGlow} />
                    <div style={styles.headerContent}>
                        <div style={styles.headerLeft}>
                            <Link to="/dashboard" style={styles.backButton}>
                                <FaArrowLeft /> Volver
                            </Link>
                            <div>
                                <h1 style={styles.title}>🎉 Cláusula 79Bis</h1>
                                <p style={styles.subtitle}>Festejo de:</p>
                                <div style={styles.categoriasBadge}>
                                    <FaUsers /> Intendencia • Limpieza e Higiene • Camilleria • Transportes • Conservacion • Polivalentes • y sus escalafones
                                </div>
                            </div>
                        </div>
                        <div>
                            <span style={styles.statusBadge(statusInfo.bg)}>
                                {statusInfo.icon} {statusInfo.label}
                            </span>
                        </div>
                    </div>
                </div>

                <div style={styles.card}>
                    <div style={styles.cardBody}>
                        {registroExistente.observaciones && (
                            <div style={styles.observacionesBox}>
                                <strong>📝 Observaciones del validador:</strong>
                                <p style={{ margin: '0.5rem 0 0 0' }}>{registroExistente.observaciones}</p>
                                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#856404' }}>
                                    ⚠️ Corrige los documentos y vuelve a enviar tu registro.
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={styles.grid2cols}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}><FaUser style={styles.labelIcon} /> Nombre</label>
                                    <input style={{ ...styles.input, ...styles.inputReadOnly }} value={usuario?.nombre || ''} readOnly />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}><FaIdCard style={styles.labelIcon} /> Matrícula</label>
                                    <input style={{ ...styles.input, ...styles.inputReadOnly }} value={matricula} readOnly />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}><FaBuilding style={styles.labelIcon} /> Adscripción</label>
                                    <input style={{ ...styles.input, ...styles.inputReadOnly }} value={usuario?.adscripcion || ''} readOnly />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Categoría</label>
                                    <input style={{ ...styles.input, ...styles.inputReadOnly }} value={usuario?.categoria || ''} readOnly />
                                </div>
                            </div>

                            <div style={styles.grid2cols}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>
                                        <FaPhone style={styles.labelIcon} /> Teléfono *
                                    </label>
                                    <input
                                        type="text"
                                        style={styles.input}
                                        placeholder="10 dígitos numéricos"
                                        value={formData.telefono}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '');
                                            setFormData({ ...formData, telefono: value.slice(0, 10) });
                                        }}
                                        disabled={loading}
                                        required
                                        maxLength={10}
                                    />
                                    <small style={styles.smallText}>📱 10 dígitos numéricos</small>
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>
                                        <FaEnvelope style={styles.labelIcon} /> Correo *
                                    </label>
                                    <input
                                        type="email"
                                        style={styles.input}
                                        placeholder="tu@email.com"
                                        value={formData.correo}
                                        onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Checkbox personalizado */}
                            <div 
                                style={styles.checkboxWrapper}
                                onClick={() => setFormData({ ...formData, tiene_acompanante: !formData.tiene_acompanante })}
                            >
                                <input
                                    type="checkbox"
                                    style={styles.checkboxHidden}
                                    id="tiene_acompanante"
                                    checked={formData.tiene_acompanante}
                                    onChange={() => {}}
                                />
                                <div style={styles.checkboxCustom(formData.tiene_acompanante)}>
                                    {formData.tiene_acompanante && <FaCheckCircle style={{ color: 'white', fontSize: '0.9rem' }} />}
                                </div>
                                <div>
                                    <div style={styles.checkboxLabel}>
                                        <FaUserPlus style={{ color: '#3EAEF4', marginRight: '0.3rem' }} />
                                        ¿Llevarás acompañante?
                                    </div>
                                    <div style={styles.checkboxSubtext}>Si asistes con alguien más, regístralo aquí</div>
                                </div>
                            </div>

                            {formData.tiene_acompanante && (
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}><FaUserPlus style={styles.labelIcon} /> Nombre del acompañante *</label>
                                    <input
                                        type="text"
                                        style={styles.input}
                                        placeholder="Nombre completo del acompañante"
                                        value={formData.nombre_acompanante}
                                        onChange={(e) => setFormData({ ...formData, nombre_acompanante: e.target.value })}
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            )}

                            <div style={styles.grid2cols}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}><FaFilePdf style={{ color: '#dc3545', marginRight: '0.3rem' }} /> Tarjetón de pago (PDF) *</label>
                                    <input
                                        type="file"
                                        style={styles.fileInput}
                                        accept=".pdf"
                                        onChange={handleTarjetonChange}
                                        disabled={loading}
                                        required={!registroExistente?.tarjeton_ruta}
                                    />
                                    {tarjetonName && <div style={styles.fileStatus}><FaCheckCircle /> {tarjetonName}</div>}
                                    <small style={styles.smallText}>📄 Máximo 5MB. Solo PDF.</small>
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}><FaFilePdf style={{ color: '#dc3545', marginRight: '0.3rem' }} /> INE (PDF) *</label>
                                    <input
                                        type="file"
                                        style={styles.fileInput}
                                        accept=".pdf"
                                        onChange={handleIneChange}
                                        disabled={loading}
                                        required={!registroExistente?.ine_ruta}
                                    />
                                    {ineName && <div style={styles.fileStatus}><FaCheckCircle /> {ineName}</div>}
                                    <small style={styles.smallText}>🪪 Máximo 5MB. Solo PDF.</small>
                                </div>
                            </div>

                            <div style={styles.flexRow}>
                                <button 
                                    type="submit" 
                                    style={{ ...styles.btnPrimary, ...styles.flexGrow }}
                                    disabled={loading}
                                >
                                    {loading ? 'Guardando...' : <><FaSave /> Actualizar Registro</>}
                                </button>
                                <button 
                                    type="button" 
                                    style={styles.btnCancelar}
                                    onClick={cancelarEdicion}
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // Si hay registro existente (aprobado), mostrar status
    if (registroExistente) {
        const statusInfo = getStatusInfo(registroExistente.estatus);
        const isAprobado = registroExistente.estatus === 2;
        const isObservaciones = registroExistente.estatus === 3;

        return (
            <div style={styles.container}>
                <div style={styles.header}>
                    <div style={styles.headerGlow} />
                    <div style={styles.headerContent}>
                        <div style={styles.headerLeft}>
                            <Link to="/dashboard" style={styles.backButton}>
                                <FaArrowLeft /> Volver
                            </Link>
                            <div>
                                <h1 style={styles.title}>🎉 Cláusula 79Bis</h1>
                                <p style={styles.subtitle}>Festejo de:</p>
                                <div style={styles.categoriasBadge}>
                                    <FaUsers /> Intendencia • Limpieza e Higiene • Camilleria • Transportes • Conservacion • Polivalentes • y sus escalafones
                                </div>
                            </div>
                        </div>
                        <div>
                            <span style={styles.statusBadge(statusInfo.bg)}>
                                {statusInfo.icon} {statusInfo.label}
                            </span>
                        </div>
                    </div>
                </div>

                <div style={styles.card}>
                    <div style={styles.cardBody}>
                        <div style={styles.statusCard}>
                            <FaCalendarAlt style={{ color: '#3EAEF4' }} />
                            <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                                {registroExistente.fecha_registro && 
                                    `Registrado el ${new Date(registroExistente.fecha_registro).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}`
                                }
                            </span>
                            {registroExistente.fecha_validacion && (
                                <>
                                    <span style={{ color: '#dee2e6' }}>|</span>
                                    <FaCheckCircle style={{ color: '#28a745' }} />
                                    <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                                        Validado el {new Date(registroExistente.fecha_validacion).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                </>
                            )}
                        </div>

                        {registroExistente.observaciones && isObservaciones && (
                            <div style={styles.observacionesBox}>
                                <strong>📝 Observaciones del validador:</strong>
                                <p style={{ margin: '0.5rem 0 0 0' }}>{registroExistente.observaciones}</p>
                            </div>
                        )}

                        <div style={styles.grid2cols}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}><FaUser style={styles.labelIcon} /> Nombre</label>
                                <input style={{ ...styles.input, ...styles.inputReadOnly }} value={usuario?.nombre || ''} readOnly />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}><FaIdCard style={styles.labelIcon} /> Matrícula</label>
                                <input style={{ ...styles.input, ...styles.inputReadOnly }} value={matricula} readOnly />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}><FaBuilding style={styles.labelIcon} /> Adscripción</label>
                                <input style={{ ...styles.input, ...styles.inputReadOnly }} value={usuario?.adscripcion || ''} readOnly />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Categoría</label>
                                <input style={{ ...styles.input, ...styles.inputReadOnly }} value={usuario?.categoria || ''} readOnly />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}><FaPhone style={styles.labelIcon} /> Teléfono</label>
                                <input style={{ ...styles.input, ...styles.inputReadOnly }} value={registroExistente.telefono || ''} readOnly />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}><FaEnvelope style={styles.labelIcon} /> Correo</label>
                                <input style={{ ...styles.input, ...styles.inputReadOnly }} value={registroExistente.correo || ''} readOnly />
                            </div>
                        </div>

                        {registroExistente.tiene_acompanante == 1 && (
                            <div style={styles.inputGroup}>
                                <label style={styles.label}><FaUserPlus style={styles.labelIcon} /> Acompañante</label>
                                <input style={{ ...styles.input, ...styles.inputReadOnly }} value={registroExistente.nombre_acompanante || ''} readOnly />
                            </div>
                        )}

                        {/* Botón Reintentar para observaciones */}
                        {isObservaciones && (
                            <div style={{ marginTop: '1.5rem' }}>
                                <button 
                                    style={styles.btnReintentar}
                                    onClick={activarEdicion}
                                >
                                    <FaSync /> Reintentar - Corregir documentos
                                </button>
                            </div>
                        )}

                        {isAprobado && (
                            <div style={{ marginTop: '1.5rem' }}>
                                <button 
                                    style={styles.btnDownload}
                                    onClick={() => {
                                        alert('Próximamente: Generar QR para el evento');
                                    }}
                                >
                                    <FaDownload /> Generar QR de entrada
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Si no hay registro, mostrar formulario
    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.headerGlow} />
                <div style={styles.headerContent}>
                    <div style={styles.headerLeft}>
                        <Link to="/dashboard" style={styles.backButton}>
                            <FaArrowLeft /> Volver
                        </Link>
                        <div>
                            <h1 style={styles.title}>🎉 Cláusula 79Bis</h1>
                            <p style={styles.subtitle}>Festejo de:</p>
                            <div style={styles.categoriasBadge}>
                                <FaUsers /> Intendencia • Limpieza e Higiene • Camilleria • Transportes • Conservacion • Polivalentes • y sus escalafones
                            </div>
                        </div>
                    </div>
                    <div>
                        <span style={styles.statusBadge('linear-gradient(135deg, #3EAEF4, #2d8fd4)')}>
                            <FaRocket /> Nuevo Registro
                        </span>
                    </div>
                </div>
            </div>

            <div style={styles.card}>
                <div style={styles.cardBody}>
                    <form onSubmit={handleSubmit}>
                        <div style={styles.grid2cols}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}><FaUser style={styles.labelIcon} /> Nombre</label>
                                <input style={{ ...styles.input, ...styles.inputReadOnly }} value={usuario?.nombre || ''} readOnly />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}><FaIdCard style={styles.labelIcon} /> Matrícula</label>
                                <input style={{ ...styles.input, ...styles.inputReadOnly }} value={matricula} readOnly />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}><FaBuilding style={styles.labelIcon} /> Adscripción</label>
                                <input style={{ ...styles.input, ...styles.inputReadOnly }} value={usuario?.adscripcion || ''} readOnly />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Categoría</label>
                                <input style={{ ...styles.input, ...styles.inputReadOnly }} value={usuario?.categoria || ''} readOnly />
                            </div>
                        </div>

                        <div style={styles.grid2cols}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    <FaPhone style={styles.labelIcon} /> Teléfono *
                                </label>
                                <input
                                    type="text"
                                    style={styles.input}
                                    placeholder="10 dígitos numéricos"
                                    value={formData.telefono}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        setFormData({ ...formData, telefono: value.slice(0, 10) });
                                    }}
                                    disabled={loading}
                                    required
                                    maxLength={10}
                                />
                                <small style={styles.smallText}>📱 10 dígitos numéricos</small>
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    <FaEnvelope style={styles.labelIcon} /> Correo *
                                </label>
                                <input
                                    type="email"
                                    style={styles.input}
                                    placeholder="tu@email.com"
                                    value={formData.correo}
                                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        <div 
                            style={styles.checkboxWrapper}
                            onClick={() => setFormData({ ...formData, tiene_acompanante: !formData.tiene_acompanante })}
                        >
                            <input
                                type="checkbox"
                                style={styles.checkboxHidden}
                                id="tiene_acompanante"
                                checked={formData.tiene_acompanante}
                                onChange={() => {}}
                            />
                            <div style={styles.checkboxCustom(formData.tiene_acompanante)}>
                                {formData.tiene_acompanante && <FaCheckCircle style={{ color: 'white', fontSize: '0.9rem' }} />}
                            </div>
                            <div>
                                <div style={styles.checkboxLabel}>
                                    <FaUserPlus style={{ color: '#3EAEF4', marginRight: '0.3rem' }} />
                                    ¿Llevarás acompañante?
                                </div>
                                <div style={styles.checkboxSubtext}>Si asistes con alguien más, regístralo aquí</div>
                            </div>
                        </div>

                        {formData.tiene_acompanante && (
                            <div style={styles.inputGroup}>
                                <label style={styles.label}><FaUserPlus style={styles.labelIcon} /> Nombre del acompañante *</label>
                                <input
                                    type="text"
                                    style={styles.input}
                                    placeholder="Nombre completo del acompañante"
                                    value={formData.nombre_acompanante}
                                    onChange={(e) => setFormData({ ...formData, nombre_acompanante: e.target.value })}
                                    disabled={loading}
                                    required
                                />
                            </div>
                        )}

                        <div style={styles.grid2cols}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}><FaFilePdf style={{ color: '#dc3545', marginRight: '0.3rem' }} /> Tarjetón de pago (PDF) *</label>
                                <input
                                    type="file"
                                    style={styles.fileInput}
                                    accept=".pdf"
                                    onChange={handleTarjetonChange}
                                    disabled={loading}
                                    required={!registroExistente?.tarjeton_ruta}
                                />
                                {tarjetonName && <div style={styles.fileStatus}><FaCheckCircle /> {tarjetonName}</div>}
                                <small style={styles.smallText}>📄 Máximo 5MB. Solo PDF.</small>
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}><FaFilePdf style={{ color: '#dc3545', marginRight: '0.3rem' }} /> INE (PDF) *</label>
                                <input
                                    type="file"
                                    style={styles.fileInput}
                                    accept=".pdf"
                                    onChange={handleIneChange}
                                    disabled={loading}
                                    required={!registroExistente?.ine_ruta}
                                />
                                {ineName && <div style={styles.fileStatus}><FaCheckCircle /> {ineName}</div>}
                                <small style={styles.smallText}>🪪 Máximo 5MB. Solo PDF.</small>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            style={styles.btnPrimary}
                            disabled={loading}
                        >
                            {loading ? 'Guardando...' : <><FaSave /> Registrar</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Clausula79Bis;