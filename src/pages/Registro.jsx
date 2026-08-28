import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    FaUserAlt, FaIdCard, FaPhone, FaEnvelope, FaLock, FaFilePdf, 
    FaCamera, FaCheckCircle, FaExclamationTriangle, FaArrowLeft, 
    FaArrowRight, FaEye, FaEyeSlash, FaUser, FaBuilding, FaCalendarAlt 
} from 'react-icons/fa';
import { apiUrl } from '../config';
import AvisoPrivacidad from '../components/AvisoPrivacidad';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// ✅ IMPORTAR CSS EXTERNO
import '../css/Registro.css';

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
    const [seccionUsuario, setSeccionUsuario] = useState(null);

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

    // ============================================
    // ✅ handleBuscarUsuario
    // ============================================
    const handleBuscarUsuario = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        const matricula = formData.matricula.trim();
        let curp = formData.curp.trim().toUpperCase();
        curp = curp.replace(/[^A-Z0-9]/g, '');

        if (!validarMatricula(matricula)) {
            await Swal.fire({
                title: '⚠️ Matrícula inválida',
                text: 'La matrícula debe tener entre 8 y 9 dígitos numéricos.',
                icon: 'warning',
                confirmButtonColor: '#ffc107',
                confirmButtonText: 'Entendido',
            });
            setLoading(false);
            return;
        }

        if (!validarCURP(curp)) {
            await Swal.fire({
                title: '⚠️ CURP inválida',
                text: 'La CURP debe tener exactamente 18 caracteres con el formato correcto.',
                icon: 'warning',
                confirmButtonColor: '#ffc107',
                confirmButtonText: 'Entendido',
            });
            setLoading(false);
            return;
        }

        try {
            const payload = {
                matricula: matricula,
                curp: curp
            };

            const response = await fetch(apiUrl('/buscar_usuario.php'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Error al validar tus datos.');
            }

            if (data.usuario && data.usuario.idSeccion) {
                const seccionData = {
                    id: data.usuario.idSeccion,
                    romano: data.usuario.seccion_romano || 'N/A',
                    nombre: data.usuario.seccion_nombre || 'Sin nombre',
                    color: data.usuario.seccion_color || '#3EAEF4'
                };
                setSeccionUsuario(seccionData);
                
                setUsuarioValidado({
                    ...data.usuario,
                    idSeccion: data.usuario.idSeccion
                });
            } else {
                setUsuarioValidado(data.usuario);
            }

            if (data.usuario && data.usuario.contrasena !== undefined && data.usuario.contrasena !== null && data.usuario.contrasena !== '') {
                await Swal.fire({
                    title: '⚠️ Usuario ya registrado',
                    text: 'Este usuario ya se encuentra registrado. Por favor, inicia sesión.',
                    icon: 'warning',
                    confirmButtonColor: '#ffc107',
                    confirmButtonText: 'Ir a iniciar sesión',
                });
                navigate('/login');
                setLoading(false);
                return;
            }

            setStep(2);
        } catch (err) {
            await Swal.fire({
                title: '❌ Error',
                text: err.message || 'Ocurrió un error. Comunícate con soporte@sntss-secciones.org',
                icon: 'error',
                confirmButtonColor: '#dc3545',
                confirmButtonText: 'Entendido',
            });
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // ✅ handleCompletarRegistro
    // ============================================
    const handleCompletarRegistro = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        const { antiguedad, telefono, correo, password, confirmar_password } = registroData;

        if (!antiguedad || !/^\d+$/.test(antiguedad)) {
            await Swal.fire({
                title: '⚠️ Antigüedad inválida',
                text: 'La antigüedad debe ser un número válido (ej: 5, 10, 15).',
                icon: 'warning',
                confirmButtonColor: '#ffc107',
                confirmButtonText: 'Entendido',
            });
            setLoading(false);
            return;
        }

        if (!telefono) {
            await Swal.fire({
                title: '⚠️ Teléfono requerido',
                text: 'El teléfono es obligatorio.',
                icon: 'warning',
                confirmButtonColor: '#ffc107',
                confirmButtonText: 'Entendido',
            });
            setLoading(false);
            return;
        }

        if (!/^\d{10}$/.test(telefono)) {
            await Swal.fire({
                title: '⚠️ Teléfono inválido',
                text: 'El teléfono debe tener exactamente 10 dígitos numéricos (ej: 5512345678).',
                icon: 'warning',
                confirmButtonColor: '#ffc107',
                confirmButtonText: 'Entendido',
            });
            setLoading(false);
            return;
        }

        if (!correo) {
            await Swal.fire({
                title: '⚠️ Correo requerido',
                text: 'El correo electrónico es obligatorio.',
                icon: 'warning',
                confirmButtonColor: '#ffc107',
                confirmButtonText: 'Entendido',
            });
            setLoading(false);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correo)) {
            await Swal.fire({
                title: '⚠️ Correo inválido',
                text: 'Ingresa un correo electrónico válido (ej: usuario@dominio.com).',
                icon: 'warning',
                confirmButtonColor: '#ffc107',
                confirmButtonText: 'Entendido',
            });
            setLoading(false);
            return;
        }

        if (!password || password.length < 8) {
            await Swal.fire({
                title: '⚠️ Contraseña insegura',
                text: 'La contraseña debe tener al menos 8 caracteres.',
                icon: 'warning',
                confirmButtonColor: '#ffc107',
                confirmButtonText: 'Entendido',
            });
            setLoading(false);
            return;
        }

        if (password !== confirmar_password) {
            await Swal.fire({
                title: '⚠️ Contraseñas no coinciden',
                text: 'Las contraseñas no coinciden. Por favor verifica.',
                icon: 'warning',
                confirmButtonColor: '#ffc107',
                confirmButtonText: 'Entendido',
            });
            setLoading(false);
            return;
        }

        if (!aceptaInformacion || !aceptaPrivacidad) {
            await Swal.fire({
                title: '⚠️ Aceptación requerida',
                text: 'Debes aceptar la veracidad de la información y el aviso de privacidad.',
                icon: 'warning',
                confirmButtonColor: '#ffc107',
                confirmButtonText: 'Entendido',
            });
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
            await Swal.fire({
                title: '❌ Error',
                text: err.message,
                icon: 'error',
                confirmButtonColor: '#dc3545',
                confirmButtonText: 'Entendido',
            });
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // ✅ handleSubirDocumentos
    // ============================================
    const handleSubirDocumentos = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        if (!tarjetonFile) {
            await Swal.fire({
                title: '⚠️ Documento requerido',
                text: 'Por favor, selecciona tu último tarjetón de pago (PDF).',
                icon: 'warning',
                confirmButtonColor: '#ffc107',
                confirmButtonText: 'Entendido',
            });
            setLoading(false);
            return;
        }

        if (!fotoFile) {
            await Swal.fire({
                title: '⚠️ Foto requerida',
                text: 'Por favor, selecciona una foto de busto para tu perfil.',
                icon: 'warning',
                confirmButtonColor: '#ffc107',
                confirmButtonText: 'Entendido',
            });
            setLoading(false);
            return;
        }

        if (tarjetonFile.type !== 'application/pdf') {
            await Swal.fire({
                title: '⚠️ Formato incorrecto',
                text: 'El tarjetón debe ser un archivo PDF.',
                icon: 'warning',
                confirmButtonColor: '#ffc107',
                confirmButtonText: 'Entendido',
            });
            setLoading(false);
            return;
        }

        if (tarjetonFile.size > 5 * 1024 * 1024) {
            await Swal.fire({
                title: '⚠️ Archivo muy grande',
                text: 'El tarjetón no debe superar los 5MB.',
                icon: 'warning',
                confirmButtonColor: '#ffc107',
                confirmButtonText: 'Entendido',
            });
            setLoading(false);
            return;
        }

        const fotoTipos = ['image/jpeg', 'image/png', 'image/webp'];
        if (!fotoTipos.includes(fotoFile.type)) {
            await Swal.fire({
                title: '⚠️ Formato incorrecto',
                text: 'La foto debe ser JPG, PNG o WEBP.',
                icon: 'warning',
                confirmButtonColor: '#ffc107',
                confirmButtonText: 'Entendido',
            });
            setLoading(false);
            return;
        }

        if (fotoFile.size > 5 * 1024 * 1024) {
            await Swal.fire({
                title: '⚠️ Archivo muy grande',
                text: 'La foto no debe superar los 5MB.',
                icon: 'warning',
                confirmButtonColor: '#ffc107',
                confirmButtonText: 'Entendido',
            });
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('matricula', usuarioValidado.matricula);
        formData.append('idSeccion', seccionUsuario.id);
        formData.append('idTipo', usuarioValidado.idTipo || 1);
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

            await Swal.fire({
                title: '✅ ¡Registro completado!',
                text: 'Tu cuenta ha sido creada exitosamente. Ahora puedes iniciar sesión.',
                icon: 'success',
                confirmButtonColor: '#28a745',
                confirmButtonText: 'Ir a iniciar sesión',
                timer: 3000,
                timerProgressBar: true,
            });
            navigate('/login');
        } catch (err) {
            await Swal.fire({
                title: '❌ Error',
                text: err.message,
                icon: 'error',
                confirmButtonColor: '#dc3545',
                confirmButtonText: 'Entendido',
            });
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

    // ===== RENDER DE PASOS =====
    
    const renderStep1 = () => (
        <form onSubmit={handleBuscarUsuario}>
            <div className="registro-input-group">
                <label className="registro-label">
                    <FaUserAlt className="me-2" style={{ color: '#3EAEF4' }} /> Matrícula
                </label>
                <input
                    type="text"
                    className="registro-input"
                    placeholder="Ej. 97123456"
                    value={formData.matricula}
                    onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setFormData({ ...formData, matricula: value.slice(0, 9) });
                    }}
                    disabled={loading}
                    required
                />
                <small className="registro-small-text">8 o 9 dígitos numéricos</small>
            </div>

            <div className="registro-input-group">
                <label className="registro-label">
                    <FaIdCard className="me-2" style={{ color: '#3EAEF4' }} /> CURP
                </label>
                <input
                    type="text"
                    className="registro-input"
                    style={{ textTransform: 'uppercase' }}
                    placeholder="Ej. LOPA800101MDFRRN09"
                    value={formData.curp}
                    onChange={(e) => setFormData({ ...formData, curp: e.target.value.slice(0, 18).toUpperCase() })}
                    disabled={loading}
                    required
                    maxLength="18"
                />
                <small className="registro-small-text">18 caracteres (letras y números)</small>
            </div>

            <button 
                type="submit" 
                className="registro-btn-primary"
                disabled={loading}
            >
                {loading ? 'Validando...' : 'Siguiente'}
                <FaArrowRight />
            </button>
        </form>
    );

    const renderStep2 = () => (
        <>
            <div className="registro-user-card">
                <div className="registro-user-card-header">
                    <FaCheckCircle style={{ color: '#28a745' }} />
                    <h5 className="registro-user-card-title">Datos verificados</h5>
                </div>
                <div className="registro-user-data-grid">
                    <div className="registro-user-data-item">
                        <span className="registro-user-data-label"><FaIdCard className="me-1" /> Matrícula</span>
                        <span className="registro-user-data-value">{usuarioValidado?.matricula}</span>
                    </div>
                    <div className="registro-user-data-item">
                        <span className="registro-user-data-label"><FaUser className="me-1" /> Nombre</span>
                        <span className="registro-user-data-value">{usuarioValidado?.nombre}</span>
                    </div>
                    <div className="registro-user-data-item">
                        <span className="registro-user-data-label"><FaBuilding className="me-1" /> Adscripción</span>
                        <span className="registro-user-data-value">{usuarioValidado?.adscripcion || 'N/A'}</span>
                    </div>
                    <div className="registro-user-data-item">
                        <span className="registro-user-data-label"><FaUserAlt className="me-1" /> Categoría</span>
                        <span className="registro-user-data-value">{usuarioValidado?.categoria || 'N/A'}</span>
                    </div>
                    <div className="registro-user-data-item">
                        <span className="registro-user-data-label"><FaIdCard className="me-1" /> CURP</span>
                        <span className="registro-user-data-value">{usuarioValidado?.curp}</span>
                    </div>
                    <div className="registro-user-data-item">
                        <span className="registro-user-data-label"><FaCalendarAlt className="me-1" /> Edad</span>
                        <span className="registro-user-data-value">{usuarioValidado?.edad || 'N/A'} años</span>
                    </div>
                    {seccionUsuario && (
                        <div className="registro-user-data-item">
                            <span className="registro-user-data-label">
                                <FaBuilding className="me-1" /> Sección Asignada
                            </span>
                            <span className="registro-user-data-value" style={{
                                color: seccionUsuario.color || '#3EAEF4',
                                fontWeight: 'bold'
                            }}>
                                {seccionUsuario.romano} - {seccionUsuario.nombre}
                            </span>
                        </div>
                    )}
                </div>
                {seccionUsuario && (
                    <div style={{ 
                        marginTop: '0.8rem', 
                        padding: '0.8rem', 
                        backgroundColor: `${seccionUsuario.color || '#3EAEF4'}15`,
                        borderLeft: `4px solid ${seccionUsuario.color || '#3EAEF4'}`,
                        borderRadius: '8px'
                    }}>
                        <small style={{ color: '#333' }}>
                            <FaCheckCircle style={{ color: seccionUsuario.color || '#3EAEF4', marginRight: '0.5rem' }} />
                            Tu sección asignada en el padrón es: <strong style={{ color: seccionUsuario.color || '#3EAEF4' }}>
                                {seccionUsuario.romano} - {seccionUsuario.nombre}
                            </strong>
                        </small>
                    </div>
                )}
            </div>

            <form onSubmit={handleCompletarRegistro}>
                <div className="registro-input-group">
                    <label className="registro-label">Antigüedad (años)</label>
                    <input
                        type="text"
                        className="registro-input"
                        placeholder="Ej. 5, 10, 15, 20"
                        value={registroData.antiguedad}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setRegistroData({ ...registroData, antiguedad: value });
                        }}
                        disabled={loading}
                        required
                    />
                    <small className="registro-small-text">Esta información viene en tu tarjetón de pago</small>
                </div>

                <div className="registro-input-group">
                    <label className="registro-label">
                        <FaPhone className="me-2" style={{ color: '#3EAEF4' }} /> Teléfono
                    </label>
                    <input
                        type="text"
                        className="registro-input"
                        placeholder="10 dígitos numéricos"
                        value={registroData.telefono}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setRegistroData({ ...registroData, telefono: value.slice(0, 10) });
                        }}
                        disabled={loading}
                        required
                        maxLength={10}
                    />
                    <small className="registro-small-text">10 dígitos numéricos (ej: 5512345678)</small>
                </div>

                <div className="registro-input-group">
                    <label className="registro-label">
                        <FaEnvelope className="me-2" style={{ color: '#3EAEF4' }} /> Correo Electrónico
                    </label>
                    <input
                        type="email"
                        className="registro-input"
                        placeholder="tu@email.com"
                        value={registroData.correo}
                        onChange={(e) => setRegistroData({ ...registroData, correo: e.target.value })}
                        disabled={loading}
                        required
                    />
                </div>

                <div className="registro-input-group">
                    <label className="registro-label">
                        <FaLock className="me-2" style={{ color: '#3EAEF4' }} /> Contraseña
                    </label>
                    <div className="registro-input-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            className="registro-input registro-input-with-icon"
                            placeholder="Mínimo 8 caracteres"
                            value={registroData.password}
                            onChange={(e) => setRegistroData({ ...registroData, password: e.target.value })}
                            disabled={loading}
                            required
                        />
                        <button
                            type="button"
                            className="registro-btn-outline"
                            style={{ position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)', padding: '0.3rem 0.6rem', border: 'none' }}
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    <small className="registro-small-text">Mínimo 8 caracteres</small>
                </div>

                <div className="registro-input-group">
                    <label className="registro-label">
                        <FaLock className="me-2" style={{ color: '#3EAEF4' }} /> Confirmar Contraseña
                    </label>
                    <div className="registro-input-wrapper">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            className="registro-input registro-input-with-icon"
                            placeholder="Repite tu contraseña"
                            value={registroData.confirmar_password}
                            onChange={(e) => setRegistroData({ ...registroData, confirmar_password: e.target.value })}
                            disabled={loading}
                            required
                        />
                        <button
                            type="button"
                            className="registro-btn-outline"
                            style={{ position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)', padding: '0.3rem 0.6rem', border: 'none' }}
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                </div>

                <div className="registro-input-group">
                    <input
                        type="checkbox"
                        className="registro-checkbox"
                        id="aceptaInformacion"
                        checked={aceptaInformacion}
                        onChange={(e) => setAceptaInformacion(e.target.checked)}
                        required
                    />
                    <label className="registro-checkbox-label" htmlFor="aceptaInformacion">
                        <strong>Declaro que la información proporcionada es verdadera y completa.</strong>
                    </label>
                </div>

                <div className="registro-input-group" style={{ marginBottom: '1.5rem' }}>
                    <input
                        type="checkbox"
                        className="registro-checkbox"
                        id="aceptaPrivacidad"
                        checked={aceptaPrivacidad}
                        onChange={(e) => setAceptaPrivacidad(e.target.checked)}
                        required
                    />
                    <label className="registro-checkbox-label" htmlFor="aceptaPrivacidad">
                        He leído y acepto el <a href="#" className="registro-link" onClick={(e) => { e.preventDefault(); setShowAvisoPrivacidad(true); }}>Aviso de Privacidad</a>
                    </label>
                </div>

                <div className="registro-flex-row">
                    <button 
                        type="button" 
                        className="registro-btn-outline" 
                        onClick={() => setStep(1)} 
                        disabled={loading}
                    >
                        <FaArrowLeft /> Atrás
                    </button>
                    <button 
                        type="submit" 
                        className="registro-btn-primary registro-flex-grow"
                        disabled={loading}
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
            <div className="registro-input-group">
                <label className="registro-label">
                    <FaFilePdf className="me-2" style={{ color: '#dc3545' }} /> Último Tarjetón de Pago (PDF)
                </label>
                <input
                    type="file"
                    className="registro-file-input"
                    accept=".pdf"
                    onChange={(e) => setTarjetonFile(e.target.files[0])}
                    disabled={loading}
                    required
                />
                <small className="registro-small-text">Máximo 5MB. Solo PDF.</small>
            </div>

            <div className="registro-input-group">
                <label className="registro-label">
                    <FaCamera className="me-2" style={{ color: '#3EAEF4' }} /> Foto de Busto para Perfil
                </label>
                <input
                    type="file"
                    className="registro-file-input"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFotoChange}
                    disabled={loading}
                    required
                />
                <small className="registro-small-text">Máximo 5MB. JPG, PNG o WEBP.</small>
                {fotoPreview && (
                    <div className="registro-text-center" style={{ marginTop: '0.5rem' }}>
                        <img src={fotoPreview} alt="Vista previa" className="registro-foto-preview" />
                    </div>
                )}
            </div>

            <div className="registro-flex-row">
                <button 
                    type="button" 
                    className="registro-btn-outline" 
                    onClick={() => setStep(2)} 
                    disabled={loading}
                >
                    <FaArrowLeft /> Atrás
                </button>
                <button 
                    type="submit" 
                    className="registro-btn-success registro-flex-grow"
                    disabled={loading}
                >
                    {loading ? 'Subiendo documentos...' : 'Completar Registro'}
                    <FaCheckCircle />
                </button>
            </div>
        </form>
    );

    const stepLabels = ['Validación', 'Datos', 'Documentos'];

    return (
        <div className="registro-wrapper">
            <div className="registro-card ui-shadow">
                <div className="registro-card-header">
                    <div className="registro-header-dots dot-matrix"></div>
                    <span className="registro-header-badge">Afiliación Sindical</span>
                    <h2 className="registro-card-header-title">Crear Cuenta</h2>
                    <p className="registro-card-header-subtitle">Completa los 3 sencillos pasos para activar tu cuenta</p>
                </div>
                <div className="registro-card-body">
                    <div className="registro-step-indicator">
                        {[1, 2, 3].map((num) => {
                            const active = step === num;
                            const completed = step > num;
                            return (
                                <div key={num} className="registro-step-item">
                                    {num < 3 && (
                                        <div className={`registro-step-line ${active || completed ? 'registro-step-line-active' : 'registro-step-line-inactive'}`} />
                                    )}
                                    <div className={`registro-step-circle 
                                        ${active ? 'registro-step-circle-active' : ''} 
                                        ${completed ? 'registro-step-circle-completed' : ''} 
                                        ${!active && !completed ? 'registro-step-circle-inactive' : ''}`}
                                    >
                                        {completed ? <FaCheckCircle /> : num}
                                    </div>
                                    <span className={`registro-step-label ${active ? 'registro-step-label-active' : 'registro-step-label-inactive'}`}>
                                        {stepLabels[num - 1]}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {errorMsg && (
                        <div className="registro-alert-error">
                            <FaExclamationTriangle /> {errorMsg}
                            <button type="button" style={{ background: 'none', border: 'none', marginLeft: 'auto', color: 'inherit' }} onClick={() => setErrorMsg('')}>✕</button>
                        </div>
                    )}
                    {successMsg && (
                        <div className="registro-alert-success">
                            <FaCheckCircle /> {successMsg}
                        </div>
                    )}

                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}

                    {step === 1 && (
                        <div className="registro-text-center" style={{ marginTop: '1.5rem' }}>
                            <p style={{ margin: 0, fontSize: '0.9rem' }}>
                                ¿Ya tienes cuenta? <Link to="/login" className="registro-link">Inicia sesión aquí</Link>
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