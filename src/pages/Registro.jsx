import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUserAlt, FaIdCard, FaPhone, FaEnvelope, FaLock, FaFilePdf, FaCamera, FaCheckCircle, FaExclamationTriangle, FaArrowLeft, FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa';
import { apiUrl } from '../config';

const Registro = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    
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
    // Limpia la CURP (solo letras y números)
    const limpia = curp.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Verifica longitud
    if (limpia.length !== 18) {
        console.log('Longitud CURP:', limpia.length);
        return false;
    }
    
    // Verifica formato: 4 letras, 6 números, 6 letras, 2 números
    const regex = /^[A-Z]{4}\d{6}[A-Z]{6}[A-Z0-9]{2}$/;
    const esValido = regex.test(limpia);
    
    if (!esValido) {
        console.log('CURP no cumple formato:', limpia);
    }
    
    return esValido;
};

    const validarPassword = (password) => {
        return password.length >= 8;
    };

    // Paso 1: Buscar usuario
    const handleBuscarUsuario = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        const matricula = formData.matricula.trim();
        let curp = formData.curp.trim().toUpperCase();
        curp = curp.replace(/[^A-Z0-9]/g, '');

        // 🔥 AHORA SÍ, después de declarar curp, haces los console.log
    console.log('CURP original:', formData.curp);
    console.log('CURP después de limpiar:', curp);
    console.log('Longitud CURP:', curp.length);
    console.log('¿Pasa validación?', validarCURP(curp));


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
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
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

    // Paso 2: Completar registro
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
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Renderizado de pasos
    const renderStep1 = () => (
        <form onSubmit={handleBuscarUsuario}>
            <div className="mb-4">
                <label className="form-label fw-semibold">
                    <FaUserAlt className="me-2" /> Matrícula
                </label>
                <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Ej. 97123456"
                    value={formData.matricula}
                    onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                    disabled={loading}
                    required
                />
                <small className="text-muted">8 o 9 dígitos numéricos</small>
            </div>

            <div className="mb-4">
                <label className="form-label fw-semibold">
                    <FaIdCard className="me-2" /> CURP
                </label>
                <input
                    type="text"
                    className="form-control form-control-lg text-uppercase"
                    placeholder="Ej. LOPA800101MDFRRN09"
                    value={formData.curp}
                    onChange={(e) => setFormData({ ...formData, curp: e.target.value.slice(0, 18) })}
                    disabled={loading}
                    required
                    maxLength="18"
                />
                <small className="text-muted">18 caracteres (letras y números)</small>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-100" disabled={loading}>
                {loading ? 'Validando...' : 'Siguiente'}
                <FaArrowRight className="ms-2" />
            </button>
        </form>
    );

    const renderStep2 = () => (
        <>
            <div className="card bg-light mb-4">
                <div className="card-body">
                    <h6 className="card-title fw-bold mb-3">Datos verificados</h6>
                    <div className="row g-3">
                        <div className="col-6">
                            <small className="text-muted">Matrícula</small>
                            <p className="fw-semibold mb-0">{usuarioValidado?.matricula}</p>
                        </div>
                        <div className="col-6">
                            <small className="text-muted">Nombre</small>
                            <p className="fw-semibold mb-0">{usuarioValidado?.nombre}</p>
                        </div>
                        <div className="col-6">
                            <small className="text-muted">Adscripción</small>
                            <p className="fw-semibold mb-0">{usuarioValidado?.adscripcion || 'N/A'}</p>
                        </div>
                        <div className="col-6">
                            <small className="text-muted">Categoría</small>
                            <p className="fw-semibold mb-0">{usuarioValidado?.categoria || 'N/A'}</p>
                        </div>
                        <div className="col-6">
                            <small className="text-muted">CURP</small>
                            <p className="fw-semibold mb-0">{usuarioValidado?.curp}</p>
                        </div>
                        <div className="col-6">
                            <small className="text-muted">Edad</small>
                            <p className="fw-semibold mb-0">{usuarioValidado?.edad || 'N/A'} años</p>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleCompletarRegistro}>
                <div className="mb-3">
                    <label className="form-label fw-semibold">Antigüedad (años)</label>
                    <input
                        type="number"
                        className="form-control"
                        placeholder="Ej. 5, 10, 15, 20"
                        value={registroData.antiguedad}
                        onChange={(e) => setRegistroData({ ...registroData, antiguedad: e.target.value })}
                        disabled={loading}
                        required
                    />
                    <small className="text-muted">Esta información viene en tu tarjetón de pago</small>
                </div>

                <div className="mb-3">
                    <label className="form-label fw-semibold">
                        <FaPhone className="me-1" /> Teléfono
                    </label>
                    <input
                        type="tel"
                        className="form-control"
                        placeholder="10 dígitos numéricos"
                        value={registroData.telefono}
                        onChange={(e) => setRegistroData({ ...registroData, telefono: e.target.value })}
                        disabled={loading}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label fw-semibold">
                        <FaEnvelope className="me-1" /> Correo Electrónico
                    </label>
                    <input
                        type="email"
                        className="form-control"
                        placeholder="tu@email.com"
                        value={registroData.correo}
                        onChange={(e) => setRegistroData({ ...registroData, correo: e.target.value })}
                        disabled={loading}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label fw-semibold">
                        <FaLock className="me-1" /> Contraseña
                    </label>
                    <div className="input-group">
                        <input
                            type={showPassword ? "text" : "password"}
                            className="form-control"
                            placeholder="Mínimo 8 caracteres"
                            value={registroData.password}
                            onChange={(e) => setRegistroData({ ...registroData, password: e.target.value })}
                            disabled={loading}
                            required
                        />
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    <small className="text-muted">Mínimo 8 caracteres</small>
                </div>

                <div className="mb-4">
                    <label className="form-label fw-semibold">
                        <FaLock className="me-1" /> Confirmar Contraseña
                    </label>
                    <div className="input-group">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            className="form-control"
                            placeholder="Repite tu contraseña"
                            value={registroData.confirmar_password}
                            onChange={(e) => setRegistroData({ ...registroData, confirmar_password: e.target.value })}
                            disabled={loading}
                            required
                        />
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                </div>

                <div className="d-flex gap-2">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setStep(1)} disabled={loading}>
                        <FaArrowLeft className="me-1" /> Atrás
                    </button>
                    <button type="submit" className="btn btn-primary flex-grow-1" disabled={loading}>
                        {loading ? 'Guardando...' : 'Siguiente'}
                        <FaArrowRight className="ms-2" />
                    </button>
                </div>
            </form>
        </>
    );

    const renderStep3 = () => (
        <form onSubmit={handleSubirDocumentos}>
            <div className="mb-4">
                <label className="form-label fw-semibold">
                    <FaFilePdf className="me-2 text-danger" /> Último Tarjetón de Pago (PDF)
                </label>
                <input
                    type="file"
                    className="form-control"
                    accept=".pdf"
                    onChange={(e) => setTarjetonFile(e.target.files[0])}
                    disabled={loading}
                    required
                />
                <small className="text-muted">Máximo 5MB. Solo PDF.</small>
            </div>

            <div className="mb-4">
                <label className="form-label fw-semibold">
                    <FaCamera className="me-2" /> Foto de Busto para Perfil
                </label>
                <input
                    type="file"
                    className="form-control"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFotoChange}
                    disabled={loading}
                    required
                />
                <small className="text-muted">Máximo 5MB. JPG, PNG o WEBP.</small>
                {fotoPreview && (
                    <div className="mt-3 text-center">
                        <img src={fotoPreview} alt="Vista previa" className="rounded-circle border" style={{ width: '120px', height: '120px', objectFit: 'cover' }} />
                    </div>
                )}
            </div>

            <div className="d-flex gap-2">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setStep(2)} disabled={loading}>
                    <FaArrowLeft className="me-1" /> Atrás
                </button>
                <button type="submit" className="btn btn-success flex-grow-1" disabled={loading}>
                    {loading ? 'Subiendo documentos...' : 'Completar Registro'}
                    <FaCheckCircle className="ms-2" />
                </button>
            </div>
        </form>
    );

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-lg-6 col-md-8">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-dark text-white text-center py-3">
                            <h4 className="mb-0">Crear Cuenta</h4>
                            <small>SNTSS Sección XXXIII</small>
                        </div>
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between mb-4">
                                <div className={`text-center flex-grow-1 ${step >= 1 ? 'text-primary' : 'text-muted'}`}>
                                    <div className={`rounded-circle mx-auto d-flex align-items-center justify-content-center ${step >= 1 ? 'bg-primary text-white' : 'bg-secondary text-white'}`} style={{ width: '30px', height: '30px' }}>1</div>
                                    <small>Validación</small>
                                </div>
                                <div className={`text-center flex-grow-1 ${step >= 2 ? 'text-primary' : 'text-muted'}`}>
                                    <div className={`rounded-circle mx-auto d-flex align-items-center justify-content-center ${step >= 2 ? 'bg-primary text-white' : 'bg-secondary text-white'}`} style={{ width: '30px', height: '30px' }}>2</div>
                                    <small>Datos</small>
                                </div>
                                <div className={`text-center flex-grow-1 ${step >= 3 ? 'text-primary' : 'text-muted'}`}>
                                    <div className={`rounded-circle mx-auto d-flex align-items-center justify-content-center ${step >= 3 ? 'bg-primary text-white' : 'bg-secondary text-white'}`} style={{ width: '30px', height: '30px' }}>3</div>
                                    <small>Documentos</small>
                                </div>
                            </div>

                            {errorMsg && (
                                <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
                                    <FaExclamationTriangle className="me-2" /> {errorMsg}
                                    <button type="button" className="btn-close" data-bs-dismiss="alert" onClick={() => setErrorMsg('')}></button>
                                </div>
                            )}
                            {successMsg && (
                                <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
                                    <FaCheckCircle className="me-2" /> {successMsg}
                                </div>
                            )}

                            {step === 1 && renderStep1()}
                            {step === 2 && renderStep2()}
                            {step === 3 && renderStep3()}

                            {step === 1 && (
                                <div className="mt-4 text-center">
                                    <p className="mb-0">
                                        ¿Ya tienes cuenta? <Link to="/login" className="text-decoration-none fw-semibold">Inicia sesión aquí</Link>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Registro;