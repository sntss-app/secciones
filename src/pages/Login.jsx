import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    FaUserAlt, FaLock, FaSignInAlt, FaEye, FaEyeSlash, 
    FaExclamationTriangle, FaUserPlus, FaEnvelope, FaKey, FaShieldAlt
} from 'react-icons/fa';
import { apiUrl } from '../config';
import { storeUserSession } from '../utils/roles';
import { getSectionAssets } from '../utils/sectionAssets';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [intentos, setIntentos] = useState(0);
    const [bloqueado, setBloqueado] = useState(false);
    
    const [formData, setFormData] = useState({
        matricula: '',
        password: ''
    });

    const validarMatricula = (matricula) => {
        return /^\d{8,9}$/.test(matricula);
    };

    const handleMatriculaChange = (e) => {
        const rawValue = e.target.value;
        const numericValue = rawValue.replace(/\D/g, '');
        const finalValue = numericValue.slice(0, 9);
        setFormData({ ...formData, matricula: finalValue });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        const matricula = formData.matricula.trim();
        const password = formData.password;

        if (!validarMatricula(matricula)) {
            Swal.fire({
                title: '⚠️ Matrícula inválida',
                text: 'La matrícula debe tener entre 8 y 9 dígitos numéricos.',
                icon: 'warning',
                confirmButtonColor: '#486DAA',
                confirmButtonText: 'Entendido',
            });
            setLoading(false);
            return;
        }

        if (!password) {
            Swal.fire({
                title: '⚠️ Campo vacío',
                text: 'La contraseña es obligatoria.',
                icon: 'warning',
                confirmButtonColor: '#486DAA',
                confirmButtonText: 'Entendido',
            });
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(apiUrl('/mail-login.php'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matricula, password })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                if (data.bloqueado) {
                    setBloqueado(true);
                    await Swal.fire({
                        title: '🔒 Cuenta bloqueada',
                        html: `${data.message}<br><small style="color:#6c757d;">Espera los minutos indicados para intentar de nuevo.</small>`,
                        icon: 'error',
                        confirmButtonColor: '#dc3545',
                        confirmButtonText: 'Entendido',
                    });
                    setErrorMsg(data.message);
                } else if (data.intentos !== undefined) {
                    setIntentos(data.intentos);
                    const intentosRestantes = 5 - data.intentos;
                    await Swal.fire({
                        title: '❌ Credenciales incorrectas',
                        html: `Matrícula o contraseña incorrectas.<br><strong>Intentos restantes: ${intentosRestantes}</strong>`,
                        icon: 'error',
                        confirmButtonColor: '#dc3545',
                        confirmButtonText: 'Intentar de nuevo',
                    });
                    setErrorMsg(data.message);
                } else {
                    await Swal.fire({
                        title: '❌ Error',
                        text: data.message || 'Error al iniciar sesión.',
                        icon: 'error',
                        confirmButtonColor: '#dc3545',
                        confirmButtonText: 'Entendido',
                    });
                    setErrorMsg(data.message || 'Error al iniciar sesión.');
                }
                setLoading(false);
                return;
            }

            await Swal.fire({
                title: '✅ ¡Bienvenido!',
                text: `Hola ${data.usuario.nombre || 'Usuario'}, has iniciado sesión correctamente.`,
                icon: 'success',
                confirmButtonColor: '#10B981',
                confirmButtonText: 'Continuar',
                timer: 2000,
                timerProgressBar: true,
            });

            const usuario = data.usuario;

            // Guardar en localStorage
            localStorage.setItem('matricula', usuario.matricula);
            localStorage.setItem('nombre', usuario.nombre || usuario.matricula);
            localStorage.setItem('correo', usuario.correo || '');
            localStorage.setItem('status', usuario.status || '2');
            localStorage.setItem('isLoggedIn', 'true');

            if (usuario.idTipo) {
                localStorage.setItem('idTipo', usuario.idTipo.toString());
                const tipoMap = { 1: 'activo', 2: 'jubilado', 3: 'confianza' };
                localStorage.setItem('tipoUsuario', tipoMap[usuario.idTipo] || 'activo');
            } else {
                localStorage.setItem('idTipo', '1');
                localStorage.setItem('tipoUsuario', 'activo');
            }

            if (usuario.idSeccion) {
                const assets = getSectionAssets(usuario.idSeccion);
                const seccionData = {
                    id: usuario.idSeccion,
                    romano: usuario.seccion_romano || 'N/A',
                    nombre: usuario.seccion_nombre || 'Sin sección',
                    slogan: usuario.seccion_slogan || null,
                    direccion: usuario.seccion_direccion || null,
                    color: usuario.seccion_color || '#486DAA',
                    logo: usuario.seccion_logo || assets.logo,
                    banner: usuario.seccion_banner || assets.banner,
                    redes: usuario.redes_sociales || {}
                };
                localStorage.setItem('seccionUsuario', JSON.stringify(seccionData));
            }

            if (usuario.foto_path) localStorage.setItem('foto', usuario.foto_path);
            if (usuario.userId) localStorage.setItem('userId', usuario.userId);
            if (usuario.curp) localStorage.setItem('curp', usuario.curp);

            if (usuario.roleIds && usuario.roleIds.length > 0) {
                localStorage.setItem('roleIds', JSON.stringify(usuario.roleIds));
            }
            if (usuario.roleNames && usuario.roleNames.length > 0) {
                localStorage.setItem('roleNames', JSON.stringify(usuario.roleNames));
            }

            if (usuario.requires_2fa === true) {
                storeUserSession(sessionStorage, usuario);
                navigate('/verificar-2fa');
            } else {
                storeUserSession(localStorage, usuario);
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('Error en login:', err);
            await Swal.fire({
                title: '❌ Error de conexión',
                text: 'No se pudo conectar con el servidor. Intenta de nuevo.',
                icon: 'error',
                confirmButtonColor: '#dc3545',
                confirmButtonText: 'Entendido',
            });
            setErrorMsg('Error de conexión con el servidor. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-10">
            {/* Patrón de puntos flotante */}
            <div className="absolute top-10 left-10 w-28 h-28 dot-matrix opacity-40 pointer-events-none"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 dot-matrix opacity-40 pointer-events-none"></div>

            {/* Card Principal de Login */}
            <div className="relative z-10 w-full max-w-md bg-white rounded-[2.5rem] p-8 sm:p-10 ui-shadow border border-white">
                
                {/* Cabecera */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#486DAA] rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg shadow-[#486DAA]/30">
                        <FaSignInAlt />
                    </div>
                    <span className="inline-block bg-[#486DAA]/10 text-[#486DAA] text-[10px] font-extrabold px-3 py-1 rounded-full mb-2 border border-[#486DAA]/20">
                        Portal de Acceso
                    </span>
                    <h2 className="text-2xl font-black text-[#486DAA] tracking-tight m-0">
                        Iniciar Sesión
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 font-medium m-0">
                        Ingresa tu matrícula y contraseña sindical
                    </p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Campo Matrícula */}
                    <div>
                        <label className="block text-xs font-bold text-[#486DAA] mb-1.5 pl-2">
                            Matrícula Institucional
                        </label>
                        <div className="relative flex items-center">
                            <span className="absolute left-4 text-slate-400 text-sm">
                                <FaUserAlt />
                            </span>
                            <input 
                                type="text"
                                value={formData.matricula}
                                onChange={handleMatriculaChange}
                                placeholder="Ej. 97158643"
                                maxLength={9}
                                required
                                disabled={bloqueado || loading}
                                className="w-full bg-slate-50 border border-slate-200 rounded-full py-3 pl-11 pr-4 text-xs font-medium text-slate-700 outline-none focus:border-[#486DAA] focus:bg-white focus:ring-4 focus:ring-[#486DAA]/15 transition"
                            />
                        </div>
                    </div>

                    {/* Campo Contraseña */}
                    <div>
                        <label className="block text-xs font-bold text-[#486DAA] mb-1.5 pl-2">
                            Contraseña
                        </label>
                        <div className="relative flex items-center">
                            <span className="absolute left-4 text-slate-400 text-sm">
                                <FaLock />
                            </span>
                            <input 
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                                required
                                disabled={bloqueado || loading}
                                className="w-full bg-slate-50 border border-slate-200 rounded-full py-3 pl-11 pr-11 text-xs font-medium text-slate-700 outline-none focus:border-[#486DAA] focus:bg-white focus:ring-4 focus:ring-[#486DAA]/15 transition"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 text-slate-400 hover:text-[#486DAA] border-0 bg-transparent cursor-pointer text-sm p-0"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    {/* Recuperar Contraseña */}
                    <div className="flex justify-end pt-1">
                        <Link 
                            to="/RecuperarContraseña" 
                            className="text-[11px] font-bold text-[#486DAA] hover:underline text-decoration-none"
                        >
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>

                    {/* Mensaje de error si existe */}
                    {errorMsg && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-600 text-center font-medium">
                            {errorMsg}
                        </div>
                    )}

                    {/* Botón de Submit */}
                    <button 
                        type="submit"
                        disabled={loading || bloqueado}
                        className="w-full bg-gradient-to-r from-[#486DAA] to-[#355386] hover:from-[#3b598d] hover:to-[#2e4771] text-white font-bold py-3.5 px-6 rounded-full shadow-lg shadow-[#486DAA]/30 hover:scale-[1.02] active:scale-[0.98] transition duration-200 text-xs sm:text-sm flex items-center justify-center space-x-2 border-0 cursor-pointer mt-4"
                    >
                        <FaSignInAlt />
                        <span>{loading ? 'Verificando...' : 'Acceder al Portal'}</span>
                    </button>
                </form>

                {/* Footer de Registro */}
                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <p className="text-xs text-slate-500 m-0">
                        ¿Aún no tienes cuenta?{' '}
                        <Link to="/registro" className="font-bold text-[#486DAA] hover:underline text-decoration-none">
                            Regístrate aquí
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Login;