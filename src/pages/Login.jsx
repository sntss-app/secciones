import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    FaUserAlt, FaLock, FaSignInAlt, FaEye, FaEyeSlash, 
    FaExclamationTriangle, FaUserPlus, FaEnvelope, FaRocket, FaStar
} from 'react-icons/fa';
import { apiUrl } from '../config';
import { storeUserSession } from '../utils/roles';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { color } from 'chart.js/helpers';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [intentos, setIntentos] = useState(0);
    const [bloqueado, setBloqueado] = useState(false);
    const matriculaRef = useRef(null); // ← REF para la matrícula
    
    const [formData, setFormData] = useState({
        matricula: '',
        password: ''
    });

    const validarMatricula = (matricula) => {
        return /^\d{8,9}$/.test(matricula);
    };

    // 🔥 FUNCIÓN PARA FILTRAR SOLO NÚMEROS
    const handleMatriculaChange = (e) => {
        const rawValue = e.target.value;
        // Solo permitir números
        const numericValue = rawValue.replace(/\D/g, '');
        // Limitar a 9 dígitos
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

            if (data.usuario.requires_2fa === true) {
                storeUserSession(sessionStorage, data.usuario);
                navigate('/verificar-2fa');
            } else {
                storeUserSession(localStorage, data.usuario);
                
                if (data.usuario.foto_path) {
                    localStorage.setItem('foto', data.usuario.foto_path);
                }
                
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

    // ========== ESTILOS ==========
    const styles = {
        container: {
            minHeight: 'calc(100vh - 200px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: '#f0f4f8',
        },
        card: {
            maxWidth: '450px',
            width: '100%',
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.5)',
        },
        header: {
            background: 'linear-gradient(135deg, #0A0F1E 0%, #1a1f2e 50%, #0A0F1E 100%)',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            borderBottom: '4px solid #3EAEF4',
            position: 'relative',
            overflow: 'hidden',
        },
        headerGlow: {
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(62,174,244,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
        },
        title: {
            fontSize: '2rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #fff 30%, #3EAEF4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.3rem',
            position: 'relative',
            zIndex: 2,
        },
        subtitle: {
            color: '#aab',
            fontSize: '0.9rem',
            position: 'relative',
            zIndex: 2,
        },
        badge: {
            display: 'inline-block',
            backgroundColor: '#3EAEF4',
            color: '#0A0F1E',
            padding: '0.2rem 0.8rem',
            borderRadius: '12px',
            fontSize: '0.65rem',
            fontWeight: 'bold',
            marginTop: '0.5rem',
            position: 'relative',
            zIndex: 2,
        },
        body: {
            padding: '2rem',
        },
        inputGroup: {
            marginBottom: '1.5rem',
        },
        label: {
            display: 'block',
            marginBottom: '0.4rem',
            fontWeight: '600',
            color: '#0A0F1E',
            fontSize: '0.85rem',
        },
        inputWrapper: {
            position: 'relative',
        },
        inputIcon: {
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#999',
            fontSize: '0.9rem',
        },
        input: {
            width: '100%',
            padding: '0.7rem 0.75rem 0.7rem 2.5rem',
            fontSize: '0.95rem',
            border: '1px solid #ddd',
            borderRadius: '12px',
            transition: 'all 0.3s ease',
            outline: 'none',
            backgroundColor: 'white',
            boxSizing: 'border-box',
            color: '#000',
        },
        passwordToggle: {
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            cursor: 'pointer',
            color: '#999',
            background: 'none',
            border: 'none',
            fontSize: '0.9rem',
            padding: '0.25rem',
        },
        helperText: {
            display: 'block',
            color: '#6c757d',
            fontSize: '0.7rem',
            marginTop: '0.3rem',
        },
        button: {
            width: '100%',
            padding: '0.75rem',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#0A0F1E',
            backgroundColor: '#3EAEF4',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
        },
        buttonDisabled: {
            opacity: 0.6,
            cursor: 'not-allowed',
        },
        errorAlert: {
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
        },
        footer: {
            textAlign: 'center',
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid #e9ecef',
        },
        footerLink: {
            color: '#3EAEF4',
            textDecoration: 'none',
            fontWeight: '500',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            transition: 'color 0.3s ease',
        },
        footerSeparator: {
            display: 'block',
            height: '0.5rem',
        },
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <div style={styles.headerGlow} />
                    <h2 style={styles.title}>
                        <FaRocket style={{ color: '#3EAEF4', marginRight: '8px' }} /> Bienvenido
                    </h2>
                    <p style={styles.subtitle}>SNTSS Sección XXXIII</p>
                    <span style={styles.badge}>
                        <FaStar style={{ marginRight: '4px' }} /> Unidad y Fortaleza Sindical
                    </span>
                </div>
                
                <div style={styles.body}>
                    {errorMsg && (
                        <div style={styles.errorAlert}>
                            <FaExclamationTriangle />
                            <span>{errorMsg}</span>
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                        {/* Matrícula */}
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>
                                <FaUserAlt style={{ marginRight: '8px', color: '#3EAEF4' }} /> Matrícula
                            </label>
                            <div style={styles.inputWrapper}>
                                <FaUserAlt style={styles.inputIcon} />
                                <input
                                    type="text"
                                    style={styles.input}
                                    placeholder="Ej. 97123456"
                                    value={formData.matricula}
                                    onChange={handleMatriculaChange} // ← Función separada
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#3EAEF4';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(62,174,244,0.15)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#ddd';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    disabled={loading || bloqueado}
                                    required
                                />
                            </div>
                            <span style={styles.helperText}>
                                <FaEnvelope style={{ marginRight: '4px', fontSize: '0.6rem' }} />
                                8 o 9 dígitos numéricos
                            </span>
                        </div>
                        
                        {/* Contraseña */}
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>
                                <FaLock style={{ marginRight: '8px', color: '#3EAEF4' }} /> Contraseña
                            </label>
                            <div style={styles.inputWrapper}>
                                <FaLock style={styles.inputIcon} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    style={styles.input}
                                    placeholder="Ingresa tu contraseña"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#3EAEF4';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(62,174,244,0.15)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#ddd';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    disabled={loading || bloqueado}
                                    required
                                />
                                <button
                                    type="button"
                                    style={styles.passwordToggle}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>
                        
                        <button 
                            type="submit" 
                            style={{
                                ...styles.button,
                                ...((loading || bloqueado) ? styles.buttonDisabled : {})
                            }}
                            disabled={loading || bloqueado}
                            onMouseEnter={(e) => {
                                if (!loading && !bloqueado) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(62,174,244,0.3)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" style={{ width: '1rem', height: '1rem' }} />
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
                    
                    <div style={styles.footer}>
                        <Link 
                            to="/registro" 
                            style={styles.footerLink}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#2d8fd4'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#3EAEF4'}
                        >
                            <FaUserPlus /> ¿No tienes cuenta? Regístrate aquí
                        </Link>
                        <span style={styles.footerSeparator} />
                        <Link 
                            to="/RecuperarContraseña" 
                            style={styles.footerLink}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#2d8fd4'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#3EAEF4'}
                        >
                            <FaEnvelope /> ¿Olvidaste tu contraseña?
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;