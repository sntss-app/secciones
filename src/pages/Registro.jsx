import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    FaUserAlt, FaIdCard, FaPhone, FaEnvelope, FaLock, FaFilePdf, 
    FaCamera, FaCheckCircle, FaExclamationTriangle, FaArrowLeft, 
    FaArrowRight, FaEye, FaEyeSlash, FaUser, FaBuilding, FaCalendarAlt 
} from 'react-icons/fa';
import { apiUrl } from '../config';
import AvisoPrivacidad from '../components/AvisoPrivacidad';

// Estilos en línea para el componente
const styles = {
    container: {
        maxWidth: '800px',
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
        padding: '1.8rem 2rem',
        textAlign: 'center',
        borderBottom: '4px solid #3EAEF4',
    },
    cardHeaderTitle: {
        fontSize: '1.8rem',
        fontWeight: 'bold',
        background: 'linear-gradient(135deg, #fff 30%, #3EAEF4 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        margin: 0,
    },
    cardHeaderSubtitle: {
        color: '#aaa',
        fontSize: '0.9rem',
        margin: '0.3rem 0 0 0',
    },
    cardBody: {
        padding: '2rem',
    },
    stepIndicator: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        position: 'relative',
    },
    stepItem: (active) => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flex: 1,
        position: 'relative',
    }),
    stepCircle: (active, completed) => ({
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1rem',
        fontWeight: 'bold',
        backgroundColor: active ? '#3EAEF4' : completed ? '#28a745' : '#e9ecef',
        color: active || completed ? '#0A0F1E' : '#6c757d',
        border: active ? '3px solid #3EAEF4' : completed ? '3px solid #28a745' : '3px solid #dee2e6',
        transition: 'all 0.3s ease',
        boxShadow: active ? '0 0 0 4px rgba(255,215,0,0.2)' : 'none',
    }),
    stepLabel: (active) => ({
        fontSize: '0.7rem',
        fontWeight: active ? 'bold' : 'normal',
        color: active ? '#3EAEF4' : '#6c757d',
        marginTop: '0.3rem',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    }),
    stepLine: (active) => ({
        position: 'absolute',
        top: '20px',
        left: '50%',
        width: '100%',
        height: '2px',
        backgroundColor: active ? '#3EAEF4' : '#dee2e6',
        zIndex: -1,
    }),
    userCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        border: '1px solid #e9ecef',
        position: 'relative',
        overflow: 'hidden',
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
    inputGroup: {
        marginBottom: '1.2rem',
    },
    label: {
        display: 'block',
        fontWeight: '600',
        fontSize: '0.9rem',
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
    inputGroupWrapper: {
        position: 'relative',
    },
    inputIcon: {
        position: 'absolute',
        left: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#aaa',
        fontSize: '1rem',
    },
    inputWithIcon: {
        paddingLeft: '2.5rem',
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
        width: '100%',
    },
    btnPrimaryHover: {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(255,215,0,0.3)',
    },
    btnSecondary: {
        backgroundColor: '#e9ecef',
        color: '#333',
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
    btnSuccess: {
        backgroundColor: '#28a745',
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
    fileInputHover: {
        borderColor: '#3EAEF4',
        boxShadow: '0 0 0 3px rgba(255,215,0,0.1)',
    },
    checkbox: {
        marginRight: '0.5rem',
        accentColor: '#3EAEF4',
        width: '18px',
        height: '18px',
        cursor: 'pointer',
    },
    checkboxLabel: {
        fontSize: '0.9rem',
        color: '#333',
        cursor: 'pointer',
    },
    fotoPreview: {
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        objectFit: 'cover',
        border: '3px solid #3EAEF4',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        marginTop: '0.5rem',
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
    link: {
        color: '#3EAEF4',
        textDecoration: 'none',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    linkHover: {
        textDecoration: 'underline',
    },
    smallText: {
        fontSize: '0.75rem',
        color: '#6c757d',
        marginTop: '0.2rem',
        display: 'block',
    },
    flexRow: {
        display: 'flex',
        gap: '0.5rem',
        marginTop: '1rem',
    },
    flexGrow: {
        flex: 1,
    },
};

const Registro = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [aceptaInformacion, setAceptaInformacion] = useState(false);
    const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);
    const [showAvisoPrivacidad, setShowAvisoPrivacidad] = useState(false);
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        matricula: '',
        curp: ''
    });
    const [usuarioValidado, setUsuarioValidado] = useState(null);

    const [registroData, setRegistroData] = useState({
        antiguedad: '',
        telefono: '',
        correo: '',
        password: '',
        confirmar_password: ''
    });

    const [tarjetonFile, setTarjetonFile] = useState(null);
    const [fotoFile, setFotoFile] = useState(null);
    const [fotoPreview, setFotoPreview] = useState(null);

    const validarMatricula = (matricula) => {
        return /^\d{8,9}$/.test(matricula);
    };

    const validarCURP = (curp) => {
        const limpia = curp.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (limpia.length !== 18) return false;
        const regex = /^[A-Z]{4}\d{6}[A-Z]{6}[A-Z0-9]{2}$/;
        return regex.test(limpia);
    };

    const validarPassword = (password) => password.length >= 8;

    const handleBuscarUsuario = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        const matricula = formData.matricula.trim();
        let curp = formData.curp.trim().toUpperCase();
        curp = curp.replace(/[^A-Z0-9]/g, '');

        if (!validarMatricula(matricula)) {
            setErrorMsg('La matrícula debe tener entre 8 y 9 dígitos numéricos.');
            setLoading(false);
            return;
        }

        if (!validarCURP(curp)) {
            setErrorMsg('La CURP debe tener exactamente 18 caracteres con el formato correcto.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(apiUrl('/buscar_usuario.php'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matricula, curp })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Error al validar tus datos.');
            }

            if (data.usuario && data.usuario.contrasena !== undefined && data.usuario.contrasena !== null && data.usuario.contrasena !== '') {
                setErrorMsg('Este usuario ya se encuentra registrado. Por favor, inicia sesión.');
                setTimeout(() => navigate('/login'), 3000);
                setLoading(false);
                return;
            }

            setUsuarioValidado(data.usuario);
            setStep(2);
        } catch (err) {
            setErrorMsg(err.message || 'Ocurrió un error. Comunícate con soporte@sntss-secciones.org');
        } finally {
            setLoading(false);
        }
    };

    const handleCompletarRegistro = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        const { antiguedad, telefono, correo, password, confirmar_password } = registroData;

        if (!antiguedad || !telefono || !correo || !password || !confirmar_password) {
            setErrorMsg('Todos los campos son obligatorios.');
            setLoading(false);
            return;
        }

        if (!/^\d+$/.test(antiguedad)) {
            setErrorMsg('La antigüedad debe ser un número válido.');
            setLoading(false);
            return;
        }

        if (!/^\d{10}$/.test(telefono)) {
            setErrorMsg('El teléfono debe tener exactamente 10 dígitos numéricos.');
            setLoading(false);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correo)) {
            setErrorMsg('Ingresa un correo electrónico válido.');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
            setLoading(false);
            return;
        }

        if (password !== confirmar_password) {
            setErrorMsg('Las contraseñas no coinciden.');
            setLoading(false);
            return;
        }

        if (!aceptaInformacion || !aceptaPrivacidad) {
            setErrorMsg('Debes aceptar la veracidad de la información y el aviso de privacidad.');
            setLoading(false);
            return;
        }

        try {
            const payload = {
                matricula: usuarioValidado.matricula,
                curp: usuarioValidado.curp,
                antiguedad: antiguedad,
                telefono: telefono,
                correo: correo,
                password: password
            };

            const response = await fetch(apiUrl('/completar_registro.php'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const textResponse = await response.text();
            let data;
            try {
                data = JSON.parse(textResponse);
            } catch (e) {
                throw new Error('El servidor respondió con un formato inválido');
            }

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Error al guardar tus datos.');
            }

            setStep(3);
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFotoFile(file);
            setFotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubirDocumentos = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        if (!tarjetonFile) {
            setErrorMsg('Por favor, selecciona tu último tarjetón de pago (PDF).');
            setLoading(false);
            return;
        }

        if (!fotoFile) {
            setErrorMsg('Por favor, selecciona una foto de busto para tu perfil.');
            setLoading(false);
            return;
        }

        if (tarjetonFile.type !== 'application/pdf') {
            setErrorMsg('El tarjetón debe ser un archivo PDF.');
            setLoading(false);
            return;
        }

        if (tarjetonFile.size > 5 * 1024 * 1024) {
            setErrorMsg('El tarjetón no debe superar los 5MB.');
            setLoading(false);
            return;
        }

        const fotoTipos = ['image/jpeg', 'image/png', 'image/webp'];
        if (!fotoTipos.includes(fotoFile.type)) {
            setErrorMsg('La foto debe ser JPG, PNG o WEBP.');
            setLoading(false);
            return;
        }

        if (fotoFile.size > 5 * 1024 * 1024) {
            setErrorMsg('La foto no debe superar los 5MB.');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('matricula', usuarioValidado.matricula);
        formData.append('tarjeton', tarjetonFile);
        formData.append('foto', fotoFile);
        formData.append('process', 'registro');

        try {
            const response = await fetch(apiUrl('/subir_documentos.php'), {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Error al subir los documentos.');
            }

            setSuccessMsg('¡Registro completado exitosamente! Redirigiendo al inicio de sesión...');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Renderizado de pasos
    const renderStep1 = () => (
        <form onSubmit={handleBuscarUsuario}>
            <div style={styles.inputGroup}>
                <label style={styles.label}>
                    <FaUserAlt className="me-2" style={{ color: '#3EAEF4' }} /> Matrícula
                </label>
                <input
                    type="text"
                    style={styles.input}
                    placeholder="Ej. 97123456"
                    value={formData.matricula}
                    onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                    disabled={loading}
                    required
                />
                <small style={styles.smallText}>8 o 9 dígitos numéricos</small>
            </div>

            <div style={styles.inputGroup}>
                <label style={styles.label}>
                    <FaIdCard className="me-2" style={{ color: '#3EAEF4' }} /> CURP
                </label>
                <input
                    type="text"
                    style={{ ...styles.input, textTransform: 'uppercase' }}
                    placeholder="Ej. LOPA800101MDFRRN09"
                    value={formData.curp}
                    onChange={(e) => setFormData({ ...formData, curp: e.target.value.slice(0, 18).toUpperCase() })}
                    disabled={loading}
                    required
                    maxLength="18"
                />
                <small style={styles.smallText}>18 caracteres (letras y números)</small>
            </div>

            <button 
                type="submit" 
                style={styles.btnPrimary}
                disabled={loading}
                onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 4px 12px rgba(255,215,0,0.3)'; }}
                onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}
            >
                {loading ? 'Validando...' : 'Siguiente'}
                <FaArrowRight />
            </button>
        </form>
    );

    const renderStep2 = () => (
        <>
            {/* Card de datos verificados con estilo fachero */}
            <div style={styles.userCard}>
                <div style={styles.userCardHeader}>
                    <FaCheckCircle style={{ color: '#28a745' }} />
                    <h5 style={styles.userCardTitle}>Datos verificados</h5>
                </div>
                <div style={styles.userDataGrid}>
                    <div style={styles.userDataItem}>
                        <span style={styles.userDataLabel}><FaIdCard className="me-1" /> Matrícula</span>
                        <span style={styles.userDataValue}>{usuarioValidado?.matricula}</span>
                    </div>
                    <div style={styles.userDataItem}>
                        <span style={styles.userDataLabel}><FaUser className="me-1" /> Nombre</span>
                        <span style={styles.userDataValue}>{usuarioValidado?.nombre}</span>
                    </div>
                    <div style={styles.userDataItem}>
                        <span style={styles.userDataLabel}><FaBuilding className="me-1" /> Adscripción</span>
                        <span style={styles.userDataValue}>{usuarioValidado?.adscripcion || 'N/A'}</span>
                    </div>
                    <div style={styles.userDataItem}>
                        <span style={styles.userDataLabel}><FaUserAlt className="me-1" /> Categoría</span>
                        <span style={styles.userDataValue}>{usuarioValidado?.categoria || 'N/A'}</span>
                    </div>
                    <div style={styles.userDataItem}>
                        <span style={styles.userDataLabel}><FaIdCard className="me-1" /> CURP</span>
                        <span style={styles.userDataValue}>{usuarioValidado?.curp}</span>
                    </div>
                    <div style={styles.userDataItem}>
                        <span style={styles.userDataLabel}><FaCalendarAlt className="me-1" /> Edad</span>
                        <span style={styles.userDataValue}>{usuarioValidado?.edad || 'N/A'} años</span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleCompletarRegistro}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Antigüedad (años)</label>
                    <input
                        type="number"
                        style={styles.input}
                        placeholder="Ej. 5, 10, 15, 20"
                        value={registroData.antiguedad}
                        onChange={(e) => setRegistroData({ ...registroData, antiguedad: e.target.value })}
                        disabled={loading}
                        required
                    />
                    <small style={styles.smallText}>Esta información viene en tu tarjetón de pago</small>
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>
                        <FaPhone className="me-2" style={{ color: '#3EAEF4' }} /> Teléfono
                    </label>
                    <input
                        type="tel"
                        style={styles.input}
                        placeholder="10 dígitos numéricos"
                        value={registroData.telefono}
                        onChange={(e) => setRegistroData({ ...registroData, telefono: e.target.value })}
                        disabled={loading}
                        required
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>
                        <FaEnvelope className="me-2" style={{ color: '#3EAEF4' }} /> Correo Electrónico
                    </label>
                    <input
                        type="email"
                        style={styles.input}
                        placeholder="tu@email.com"
                        value={registroData.correo}
                        onChange={(e) => setRegistroData({ ...registroData, correo: e.target.value })}
                        disabled={loading}
                        required
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>
                        <FaLock className="me-2" style={{ color: '#3EAEF4' }} /> Contraseña
                    </label>
                    <div style={styles.inputGroupWrapper}>
                        <input
                            type={showPassword ? "text" : "password"}
                            style={{ ...styles.input, ...styles.inputWithIcon }}
                            placeholder="Mínimo 8 caracteres"
                            value={registroData.password}
                            onChange={(e) => setRegistroData({ ...registroData, password: e.target.value })}
                            disabled={loading}
                            required
                        />
                        <button
                            type="button"
                            style={{ ...styles.btnOutline, position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)', padding: '0.3rem 0.6rem', border: 'none' }}
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    <small style={styles.smallText}>Mínimo 8 caracteres</small>
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>
                        <FaLock className="me-2" style={{ color: '#3EAEF4' }} /> Confirmar Contraseña
                    </label>
                    <div style={styles.inputGroupWrapper}>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            style={{ ...styles.input, ...styles.inputWithIcon }}
                            placeholder="Repite tu contraseña"
                            value={registroData.confirmar_password}
                            onChange={(e) => setRegistroData({ ...registroData, confirmar_password: e.target.value })}
                            disabled={loading}
                            required
                        />
                        <button
                            type="button"
                            style={{ ...styles.btnOutline, position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)', padding: '0.3rem 0.6rem', border: 'none' }}
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                </div>

                <div style={styles.inputGroup}>
                    <input
                        type="checkbox"
                        style={styles.checkbox}
                        id="aceptaInformacion"
                        checked={aceptaInformacion}
                        onChange={(e) => setAceptaInformacion(e.target.checked)}
                        required
                    />
                    <label style={styles.checkboxLabel} htmlFor="aceptaInformacion">
                        <strong>Declaro que la información proporcionada es verdadera y completa.</strong>
                    </label>
                </div>

                <div style={{ ...styles.inputGroup, marginBottom: '1.5rem' }}>
                    <input
                        type="checkbox"
                        style={styles.checkbox}
                        id="aceptaPrivacidad"
                        checked={aceptaPrivacidad}
                        onChange={(e) => setAceptaPrivacidad(e.target.checked)}
                        required
                    />
                    <label style={styles.checkboxLabel} htmlFor="aceptaPrivacidad">
                        He leído y acepto el <a href="#" style={styles.link} onClick={(e) => { e.preventDefault(); setShowAvisoPrivacidad(true); }}>Aviso de Privacidad</a>
                    </label>
                </div>

                <div style={styles.flexRow}>
                    <button 
                        type="button" 
                        style={styles.btnOutline} 
                        onClick={() => setStep(1)} 
                        disabled={loading}
                    >
                        <FaArrowLeft /> Atrás
                    </button>
                    <button 
                        type="submit" 
                        style={{ ...styles.btnPrimary, ...styles.flexGrow }}
                        disabled={loading}
                        onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 4px 12px rgba(255,215,0,0.3)'; }}
                        onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}
                    >
                        {loading ? 'Guardando...' : 'Siguiente'}
                        <FaArrowRight />
                    </button>
                </div>
            </form>
        </>
    );

    const renderStep3 = () => (
        <form onSubmit={handleSubirDocumentos}>
            <div style={styles.inputGroup}>
                <label style={styles.label}>
                    <FaFilePdf className="me-2" style={{ color: '#dc3545' }} /> Último Tarjetón de Pago (PDF)
                </label>
                <input
                    type="file"
                    style={styles.fileInput}
                    accept=".pdf"
                    onChange={(e) => setTarjetonFile(e.target.files[0])}
                    disabled={loading}
                    required
                />
                <small style={styles.smallText}>Máximo 5MB. Solo PDF.</small>
            </div>

            <div style={styles.inputGroup}>
                <label style={styles.label}>
                    <FaCamera className="me-2" style={{ color: '#3EAEF4' }} /> Foto de Busto para Perfil
                </label>
                <input
                    type="file"
                    style={styles.fileInput}
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFotoChange}
                    disabled={loading}
                    required
                />
                <small style={styles.smallText}>Máximo 5MB. JPG, PNG o WEBP.</small>
                {fotoPreview && (
                    <div className="text-center mt-2">
                        <img src={fotoPreview} alt="Vista previa" style={styles.fotoPreview} />
                    </div>
                )}
            </div>

            <div style={styles.flexRow}>
                <button 
                    type="button" 
                    style={styles.btnOutline} 
                    onClick={() => setStep(2)} 
                    disabled={loading}
                >
                    <FaArrowLeft /> Atrás
                </button>
                <button 
                    type="submit" 
                    style={{ ...styles.btnSuccess, ...styles.flexGrow }}
                    disabled={loading}
                    onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 4px 12px rgba(40,167,69,0.3)'; }}
                    onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}
                >
                    {loading ? 'Subiendo documentos...' : 'Completar Registro'}
                    <FaCheckCircle />
                </button>
            </div>
        </form>
    );

    const stepLabels = ['Validación', 'Datos', 'Documentos'];

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.cardHeader}>
                    <h2 style={styles.cardHeaderTitle}>Crear Cuenta</h2>
                    <p style={styles.cardHeaderSubtitle}>SNTSS Sección XXXIII</p>
                </div>
                <div style={styles.cardBody}>
                    {/* Indicador de pasos */}
                    <div style={styles.stepIndicator}>
                        {[1, 2, 3].map((num) => {
                            const active = step === num;
                            const completed = step > num;
                            return (
                                <div key={num} style={{ ...styles.stepItem(active), position: 'relative' }}>
                                    {num < 3 && (
                                        <div style={{ ...styles.stepLine(active || completed), left: '50%', width: '100%' }} />
                                    )}
                                    <div style={styles.stepCircle(active, completed)}>
                                        {completed ? <FaCheckCircle /> : num}
                                    </div>
                                    <span style={styles.stepLabel(active)}>{stepLabels[num - 1]}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Mensajes de error y éxito */}
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

                    {/* Renderizado de pasos */}
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}

                    {/* Enlace a login */}
                    {step === 1 && (
                        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                            <p style={{ margin: 0, fontSize: '0.9rem' }}>
                                ¿Ya tienes cuenta? <Link to="/login" style={styles.link}>Inicia sesión aquí</Link>
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <AvisoPrivacidad show={showAvisoPrivacidad} onHide={() => setShowAvisoPrivacidad(false)} />
        </div>
    );
};

export default Registro;