import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    FaUserAlt, FaLock, FaSignInAlt, FaEye, FaEyeSlash, 
    FaExclamationTriangle, FaUserPlus, FaEnvelope, FaRocket, FaStar
} from 'react-icons/fa';
import { apiUrl } from '../config';
import { storeUserSession } from '../utils/roles';
import { getSectionAssets } from '../utils/sectionAssets';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
// ✅ IMPORTAR CSS EXTERNO
import '../css/Login.css';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [intentos, setIntentos] = useState(0);
    const [bloqueado, setBloqueado] = useState(false);
    const matriculaRef = useRef(null);
    
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
                confirmButtonColor: '#ffc107',
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
                confirmButtonColor: '#ffc107',
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
                confirmButtonColor: '#28a745',
                confirmButtonText: 'Continuar',
                timer: 2000,
                timerProgressBar: true,
            });

            // ✅ GUARDAR TODOS LOS DATOS DEL USUARIO
            const usuario = data.usuario;

            // 🔥 DEBUG: Ver qué viene del backend
            console.log('🔍 usuario completo:', usuario);
            console.log('🔍 idSeccion:', usuario.idSeccion);
            console.log('🔍 idTipo:', usuario.idTipo);
            console.log('🔍 seccion_banner:', usuario.seccion_banner);
            console.log('🔍 seccion_logo:', usuario.seccion_logo);

            // ============================================
            // ✅ 1. GUARDAR DATOS BÁSICOS
            // ============================================
            localStorage.setItem('matricula', usuario.matricula);
            localStorage.setItem('nombre', usuario.nombre || usuario.matricula);
            localStorage.setItem('correo', usuario.correo || '');
            localStorage.setItem('status', usuario.status || '2');
            localStorage.setItem('isLoggedIn', 'true');

            // ============================================
            // ✅ 2. GUARDAR idTipo y tipoUsuario
            // ============================================
            if (usuario.idTipo) {
                localStorage.setItem('idTipo', usuario.idTipo.toString());
                const tipoMap = {
                    1: 'activo',
                    2: 'jubilado',
                    3: 'confianza'
                };
                const tipoUsuario = tipoMap[usuario.idTipo] || 'activo';
                localStorage.setItem('tipoUsuario', tipoUsuario);
                console.log('✅ Tipo de usuario guardado:', tipoUsuario, '(ID:', usuario.idTipo, ')');
            } else {
                localStorage.setItem('idTipo', '1');
                localStorage.setItem('tipoUsuario', 'activo');
                console.warn('⚠️ idTipo no encontrado, se asignó "activo" por defecto');
            }

            // ============================================
            // ✅ 3. GUARDAR LA SECCIÓN
            // ============================================
            if (usuario.idSeccion) {
                const assets = getSectionAssets(usuario.idSeccion);
                const seccionData = {
                    id: usuario.idSeccion,
                    romano: usuario.seccion_romano || 'N/A',
                    nombre: usuario.seccion_nombre || 'Sin sección',
                    slogan: usuario.seccion_slogan || null,
                    direccion: usuario.seccion_direccion || null,
                    color: usuario.seccion_color || '#3EAEF4',
                    logo: usuario.seccion_logo || assets.logo,
                    banner: usuario.seccion_banner || assets.banner,
                    redes: usuario.redes_sociales || {}
                };
                localStorage.setItem('seccionUsuario', JSON.stringify(seccionData));
                console.log('✅ Sección guardada:', seccionData);
            } else {
                console.warn('⚠️ usuario.idSeccion es null o undefined, NO se guardó la sección');
            }

            // ============================================
            // ✅ 4. GUARDAR FOTO Y OTROS DATOS
            // ============================================
            if (usuario.foto_path) {
                localStorage.setItem('foto', usuario.foto_path);
            }

            if (usuario.userId) {
                localStorage.setItem('userId', usuario.userId);
            }

            if (usuario.curp) {
                localStorage.setItem('curp', usuario.curp);
            }

            // ============================================
            // ✅ 5. GUARDAR ROLES
            // ============================================
            if (usuario.roleIds && usuario.roleIds.length > 0) {
                localStorage.setItem('roleIds', JSON.stringify(usuario.roleIds));
            }
            if (usuario.roleNames && usuario.roleNames.length > 0) {
                localStorage.setItem('roleNames', JSON.stringify(usuario.roleNames));
            }

            // ============================================
            // ✅ 6. REDIRIGIR SEGÚN 2FA
            // ============================================
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
        <div className="login-wrapper">
            <div className="login-card ui-shadow">
                <div className="login-header">
                    <div className="login-header-dots dot-matrix"></div>
                    <span className="login-badge">Portal Oficial</span>
                    <h2 className="login-title">
                        Iniciar Sesión
                    </h2>
                    <p className="login-subtitle">Ingresa tu matrícula y contraseña para acceder</p>
                </div>
                
                <div className="login-body">
                    {errorMsg && (
                        <div className="login-error">
                            <FaExclamationTriangle />
                            <span>{errorMsg}</span>
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="login-input-group">
                            <label className="login-label">
                                <FaUserAlt style={{ marginRight: '8px', color: '#3EAEF4' }} /> Matrícula
                            </label>
                            <div className="login-input-wrapper">
                                <FaUserAlt className="login-input-icon" />
                                <input
                                    type="text"
                                    className="login-input"
                                    placeholder="Ej. 97123456"
                                    value={formData.matricula}
                                    onChange={handleMatriculaChange}
                                    disabled={loading || bloqueado}
                                    required
                                />
                            </div>
                            <span className="login-helper-text">
                                <FaEnvelope style={{ marginRight: '4px', fontSize: '0.6rem' }} />
                                8 o 9 dígitos numéricos
                            </span>
                        </div>
                        
                        <div className="login-input-group">
                            <label className="login-label">
                                <FaLock style={{ marginRight: '8px', color: '#3EAEF4' }} /> Contraseña
                            </label>
                            <div className="login-input-wrapper">
                                <FaLock className="login-input-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="login-input"
                                    placeholder="Ingresa tu contraseña"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    disabled={loading || bloqueado}
                                    required
                                />
                                <button
                                    type="button"
                                    className="login-password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>
                        
                        <button 
                            type="submit" 
                            className="login-btn"
                            disabled={loading || bloqueado}
                        >
                            {loading ? (
                                <>
                                    <span className="login-spinner" role="status" />
                                    Iniciando sesión...
                                </>
                            ) : bloqueado ? (
                                'Cuenta bloqueada, intenta más tarde'
                            ) : (
                                <>
                                    <FaSignInAlt /> Entrar
                                </>
                            )}
                        </button>
                    </form>
                    
                    <div className="login-footer">
                        <Link to="/registro" className="login-footer-link">
                            <FaUserPlus /> ¿No tienes cuenta? Regístrate aquí
                        </Link>
                        <span className="login-footer-separator" />
                        <Link to="/RecuperarContrasena" className="login-footer-link">
                            <FaEnvelope /> ¿Olvidaste tu contraseña?
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;