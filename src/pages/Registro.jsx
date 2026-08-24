import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    FaUserAlt, FaIdCard, FaPhone, FaEnvelope, FaLock, FaFilePdf, 
    FaCamera, FaCheckCircle, FaExclamationTriangle, FaArrowLeft, 
    FaArrowRight, FaEye, FaEyeSlash, FaUser, FaBuilding, FaCalendarAlt,
    FaUserPlus, FaUpload
} from 'react-icons/fa';
import { apiUrl } from '../config';
import AvisoPrivacidad from '../components/AvisoPrivacidad';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

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

    const validarMatricula = (matricula) => /^\d{8,9}$/.test(matricula);

    const validarCURP = (curp) => {
        const limpia = curp.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (limpia.length !== 18) return false;
        const regex = /^[A-Z]{4}\d{6}[A-Z]{6}[A-Z0-9]{2}$/;
        return regex.test(limpia);
    };

    // Paso 1: Buscar Usuario
    const handleBuscarUsuario = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        const matricula = formData.matricula.trim();
        let curp = formData.curp.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

        if (!validarMatricula(matricula)) {
            await Swal.fire({
                title: '⚠️ Matrícula inválida',
                text: 'La matrícula debe tener entre 8 y 9 dígitos numéricos.',
                icon: 'warning',
                confirmButtonColor: '#486DAA',
                confirmButtonText: 'Entendido',
            });
            setLoading(false);
            return;
        }

        if (!validarCURP(curp)) {
            await Swal.fire({
                title: '⚠️ CURP inválida',
                text: 'La CURP debe tener exactamente 18 caracteres con el formato oficial.',
                icon: 'warning',
                confirmButtonColor: '#486DAA',
                confirmButtonText: 'Entendido',
            });
            setLoading(false);
            return;
        }

        try {
            const payload = { matricula, curp };
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
                    color: data.usuario.seccion_color || '#486DAA'
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
                    confirmButtonColor: '#486DAA',
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

    // Paso 2: Guardar Datos del Registro
    const handleCompletarRegistro = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        const { antiguedad, telefono, correo, password, confirmar_password } = registroData;

        if (!antiguedad || !/^\d+$/.test(antiguedad)) {
            await Swal.fire({
                title: '⚠️ Antigüedad inválida',
                text: 'La antigüedad debe ser un número entero (ej: 5, 10, 15).',
                icon: 'warning',
                confirmButtonColor: '#486DAA',
                confirmButtonText: 'Entendido',
            });
            setLoading(false);
            return;
        }

        if (!telefono || !/^\d{10}$/.test(telefono)) {
            await Swal.fire({
                title: '⚠️ Teléfono inválido',
                text: 'El teléfono debe tener exactamente 10 dígitos numéricos.',
                icon: 'warning',
                confirmButtonColor: '#486DAA',
                confirmButtonText: 'Entendido',
            });
            setLoading(false);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!correo || !emailRegex.test(correo)) {
            await Swal.fire({
                title: '⚠️ Correo inválido',
                text: 'Ingresa un correo electrónico válido.',
                icon: 'warning',
                confirmButtonColor: '#486DAA',
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
                confirmButtonColor: '#486DAA',
                confirmButtonText: 'Entendido',
            });
            setLoading(false);
            return;
        }

        if (password !== confirmar_password) {
            await Swal.fire({
                title: '⚠️ Contraseñas no coinciden',
                text: 'Las contraseñas ingresadas no coinciden.',
                icon: 'warning',
                confirmButtonColor: '#486DAA',
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
                confirmButtonColor: '#486DAA',
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
                throw new Error('El servidor respondió con un formato no válido');
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

    // Paso 3: Subir Documentos
    const handleSubirDocumentos = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        if (!tarjetonFile || !fotoFile) {
            await Swal.fire({
                title: '⚠️ Archivos requeridos',
                text: 'Por favor selecciona tu tarjetón de pago (PDF) y tu foto de perfil.',
                icon: 'warning',
                confirmButtonColor: '#486DAA',
                confirmButtonText: 'Entendido',
            });
            setLoading(false);
            return;
        }

        try {
            const formDataDocs = new FormData();
            formDataDocs.append('matricula', usuarioValidado.matricula);
            formDataDocs.append('tarjeton', tarjetonFile);
            formDataDocs.append('foto', fotoFile);

            const response = await fetch(apiUrl('/subir_documentos.php'), {
                method: 'POST',
                body: formDataDocs
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Error al subir los documentos.');
            }

            await Swal.fire({
                title: '🎉 ¡Registro Completado!',
                text: 'Tus datos y documentos han sido registrados exitosamente. Ya puedes iniciar sesión.',
                icon: 'success',
                confirmButtonColor: '#10B981',
                confirmButtonText: 'Iniciar Sesión',
            });

            navigate('/login');
        } catch (err) {
            await Swal.fire({
                title: '❌ Error al subir documentos',
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

    return (
        <div className="relative min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-10">
            {/* Patrón de puntos flotante */}
            <div className="absolute top-10 left-10 w-28 h-28 dot-matrix opacity-40 pointer-events-none"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 dot-matrix opacity-40 pointer-events-none"></div>

            {/* Contenedor Principal */}
            <div className="relative z-10 w-full max-w-2xl bg-white rounded-[2.5rem] p-8 sm:p-10 ui-shadow border border-white">
                
                {/* Cabecera */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#486DAA] rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg shadow-[#486DAA]/30">
                        <FaUserPlus />
                    </div>
                    <span className="inline-block bg-[#486DAA]/10 text-[#486DAA] text-[10px] font-extrabold px-3 py-1 rounded-full mb-2 border border-[#486DAA]/20">
                        Afiliación y Registro
                    </span>
                    <h2 className="text-2xl font-black text-[#486DAA] tracking-tight m-0">
                        Registro de Agremiado
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 font-medium m-0">
                        Sindicato Nacional de Trabajadores del Seguro Social
                    </p>
                </div>

                {/* Indicador de Pasos (Pills) */}
                <div className="flex items-center justify-between mb-8 px-4">
                    {[
                        { num: 1, label: 'Validar' },
                        { num: 2, label: 'Datos' },
                        { num: 3, label: 'Documentos' }
                    ].map((s) => (
                        <div key={s.num} className="flex flex-col items-center flex-1 relative">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                                step === s.num 
                                    ? 'bg-[#486DAA] text-white shadow-md shadow-[#486DAA]/30 scale-110' 
                                    : step > s.num 
                                    ? 'bg-emerald-500 text-white' 
                                    : 'bg-slate-100 text-slate-400'
                            }`}>
                                {step > s.num ? <FaCheckCircle /> : s.num}
                            </div>
                            <span className={`text-[10px] font-bold mt-1.5 uppercase ${
                                step === s.num ? 'text-[#486DAA]' : step > s.num ? 'text-emerald-600' : 'text-slate-400'
                            }`}>
                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* PASO 1: BÚSQUEDA Y VALIDACIÓN DE MATRÍCULA Y CURP */}
                {step === 1 && (
                    <form onSubmit={handleBuscarUsuario} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-[#486DAA] mb-1.5 pl-2">
                                Matrícula
                            </label>
                            <div className="relative flex items-center">
                                <span className="absolute left-4 text-slate-400 text-sm">
                                    <FaUserAlt />
                                </span>
                                <input 
                                    type="text"
                                    value={formData.matricula}
                                    onChange={(e) => setFormData({ ...formData, matricula: e.target.value.replace(/\D/g, '').slice(0, 9) })}
                                    placeholder="Ej. 97158643"
                                    maxLength={9}
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-full py-3 pl-11 pr-4 text-xs font-medium text-slate-700 outline-none focus:border-[#486DAA] focus:bg-white focus:ring-4 focus:ring-[#486DAA]/15 transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#486DAA] mb-1.5 pl-2">
                                Clave Única de Registro de Población (CURP)
                            </label>
                            <div className="relative flex items-center">
                                <span className="absolute left-4 text-slate-400 text-sm">
                                    <FaIdCard />
                                </span>
                                <input 
                                    type="text"
                                    value={formData.curp}
                                    onChange={(e) => setFormData({ ...formData, curp: e.target.value.toUpperCase() })}
                                    placeholder="18 caracteres alfanuméricos"
                                    maxLength={18}
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-full py-3 pl-11 pr-4 text-xs font-medium text-slate-700 outline-none focus:border-[#486DAA] focus:bg-white focus:ring-4 focus:ring-[#486DAA]/15 transition uppercase"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-[#486DAA] to-[#355386] hover:from-[#3b598d] hover:to-[#2e4771] text-white font-bold py-3.5 px-6 rounded-full shadow-lg shadow-[#486DAA]/30 hover:scale-[1.02] active:scale-[0.98] transition duration-200 text-xs sm:text-sm flex items-center justify-center space-x-2 border-0 cursor-pointer mt-6"
                        >
                            <span>{loading ? 'Buscando en padrón...' : 'Validar Datos y Continuar'}</span>
                            <FaArrowRight />
                        </button>
                    </form>
                )}

                {/* PASO 2: COMPLETAR DATOS */}
                {step === 2 && usuarioValidado && (
                    <form onSubmit={handleCompletarRegistro} className="space-y-4">
                        
                        {/* Tarjeta con Datos Validados */}
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs">
                            <div className="font-bold text-[#486DAA] mb-2 pb-2 border-b border-slate-200 flex items-center space-x-2">
                                <FaCheckCircle className="text-emerald-500" />
                                <span>Datos Encontrados en Padrón</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-slate-600">
                                <div><span className="font-bold">Nombre:</span> {usuarioValidado.nombre}</div>
                                <div><span className="font-bold">Matrícula:</span> {usuarioValidado.matricula}</div>
                                <div><span className="font-bold">Adscripción:</span> {usuarioValidado.adscripcion || 'N/A'}</div>
                                <div><span className="font-bold">Categoría:</span> {usuarioValidado.categoria || 'N/A'}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-[#486DAA] mb-1.5 pl-2">Antigüedad (Años)</label>
                                <input 
                                    type="number"
                                    value={registroData.antiguedad}
                                    onChange={(e) => setRegistroData({ ...registroData, antiguedad: e.target.value })}
                                    placeholder="Ej. 8"
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-full py-2.5 px-4 text-xs text-slate-700 outline-none focus:border-[#486DAA]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#486DAA] mb-1.5 pl-2">Teléfono (10 dígitos)</label>
                                <input 
                                    type="tel"
                                    value={registroData.telefono}
                                    onChange={(e) => setRegistroData({ ...registroData, telefono: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                    placeholder="Ej. 5512345678"
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-full py-2.5 px-4 text-xs text-slate-700 outline-none focus:border-[#486DAA]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#486DAA] mb-1.5 pl-2">Correo Electrónico</label>
                            <input 
                                type="email"
                                value={registroData.correo}
                                onChange={(e) => setRegistroData({ ...registroData, correo: e.target.value })}
                                placeholder="tu_correo@dominio.com"
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-full py-2.5 px-4 text-xs text-slate-700 outline-none focus:border-[#486DAA]"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-[#486DAA] mb-1.5 pl-2">Contraseña (Mín. 8 caracteres)</label>
                                <input 
                                    type="password"
                                    value={registroData.password}
                                    onChange={(e) => setRegistroData({ ...registroData, password: e.target.value })}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-full py-2.5 px-4 text-xs text-slate-700 outline-none focus:border-[#486DAA]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#486DAA] mb-1.5 pl-2">Confirmar Contraseña</label>
                                <input 
                                    type="password"
                                    value={registroData.confirmar_password}
                                    onChange={(e) => setRegistroData({ ...registroData, confirmar_password: e.target.value })}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-full py-2.5 px-4 text-xs text-slate-700 outline-none focus:border-[#486DAA]"
                                />
                            </div>
                        </div>

                        {/* Checkboxes de Términos */}
                        <div className="space-y-2 pt-2 text-xs">
                            <label className="flex items-start space-x-2 cursor-pointer">
                                <input 
                                    type="checkbox"
                                    checked={aceptaInformacion}
                                    onChange={(e) => setAceptaInformacion(e.target.checked)}
                                    className="mt-0.5"
                                />
                                <span>Confirmo bajo protesta de decir verdad que los datos proporcionados son correctos.</span>
                            </label>

                            <label className="flex items-start space-x-2 cursor-pointer">
                                <input 
                                    type="checkbox"
                                    checked={aceptaPrivacidad}
                                    onChange={(e) => setAceptaPrivacidad(e.target.checked)}
                                    className="mt-0.5"
                                />
                                <span>
                                    He leído y acepto el{' '}
                                    <button 
                                        type="button" 
                                        onClick={() => setShowAvisoPrivacidad(true)} 
                                        className="text-[#486DAA] font-bold underline bg-transparent border-0 p-0 cursor-pointer"
                                    >
                                        Aviso de Privacidad
                                    </button>.
                                </span>
                            </label>
                        </div>

                        <div className="flex space-x-3 pt-4">
                            <button 
                                type="button"
                                onClick={() => setStep(1)}
                                className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 px-4 rounded-full text-xs hover:bg-slate-200 transition border-0 cursor-pointer"
                            >
                                <FaArrowLeft className="mr-1 inline" /> Regresar
                            </button>

                            <button 
                                type="submit"
                                disabled={loading}
                                className="flex-2 bg-gradient-to-r from-[#486DAA] to-[#355386] text-white font-bold py-3 px-6 rounded-full text-xs shadow-md shadow-[#486DAA]/30 hover:scale-[1.02] transition border-0 cursor-pointer"
                            >
                                <span>{loading ? 'Guardando...' : 'Siguiente'}</span>
                                <FaArrowRight className="ml-1 inline" />
                            </button>
                        </div>
                    </form>
                )}

                {/* PASO 3: SUBIDA DE DOCUMENTOS */}
                {step === 3 && (
                    <form onSubmit={handleSubirDocumentos} className="space-y-6">
                        <div className="text-center p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 font-medium">
                            Tus datos personales se han guardado. Ahora sube tus comprobantes para finalizar el alta.
                        </div>

                        {/* Tarjetón PDF */}
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                            <label className="block text-xs font-bold text-[#486DAA] mb-2 flex items-center space-x-2">
                                <FaFilePdf className="text-red-500 text-base" />
                                <span>Último Tarjetón de Pago (PDF, máx. 5MB)</span>
                            </label>
                            <input 
                                type="file"
                                accept=".pdf"
                                onChange={(e) => setTarjetonFile(e.target.files[0])}
                                required
                                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#486DAA] file:text-white hover:file:bg-[#355386] file:cursor-pointer"
                            />
                        </div>

                        {/* Foto de Busto */}
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                            <label className="block text-xs font-bold text-[#486DAA] mb-2 flex items-center space-x-2">
                                <FaCamera className="text-[#486DAA] text-base" />
                                <span>Fotografía de Busto (JPG/PNG/WEBP, máx. 5MB)</span>
                            </label>
                            <input 
                                type="file"
                                accept="image/*"
                                onChange={handleFotoChange}
                                required
                                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-500 file:text-white hover:file:bg-emerald-600 file:cursor-pointer mb-3"
                            />
                            {fotoPreview && (
                                <div className="text-center mt-2">
                                    <img 
                                        src={fotoPreview} 
                                        alt="Vista previa" 
                                        className="w-24 h-24 rounded-full object-cover border-2 border-emerald-500 mx-auto shadow-md"
                                    />
                                    <p className="text-[10px] text-slate-500 mt-1">Vista previa</p>
                                </div>
                            )}
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3.5 px-6 rounded-full shadow-lg shadow-emerald-500/30 hover:scale-[1.02] transition duration-200 text-xs sm:text-sm flex items-center justify-center space-x-2 border-0 cursor-pointer"
                        >
                            <FaUpload />
                            <span>{loading ? 'Subiendo archivos...' : 'Finalizar Registro Completo'}</span>
                        </button>
                    </form>
                )}

                {/* Footer Login */}
                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <p className="text-xs text-slate-500 m-0">
                        ¿Ya tienes una cuenta registrada?{' '}
                        <Link to="/login" className="font-bold text-[#486DAA] hover:underline text-decoration-none">
                            Inicia sesión aquí
                        </Link>
                    </p>
                </div>

            </div>

            <AvisoPrivacidad 
                show={showAvisoPrivacidad} 
                onHide={() => setShowAvisoPrivacidad(false)} 
            />
        </div>
    );
};

export default Registro;