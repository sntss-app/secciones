import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUserAlt, FaLock, FaSignInAlt, FaEye, FaEyeSlash, FaExclamationTriangle, FaUserPlus, FaEnvelope } from 'react-icons/fa';
import { apiUrl } from '../config';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const [formData, setFormData] = useState({
        matricula: '',
        password: ''
    });

    const validarMatricula = (matricula) => {
        return /^\d{8,9}$/.test(matricula);
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const matricula = formData.matricula.trim();
    const password = formData.password;

    if (!validarMatricula(matricula)) {
        setErrorMsg('La matrícula debe tener entre 8 y 9 dígitos numéricos.');
        setLoading(false);
        return;
    }

    if (!password) {
        setErrorMsg('La contraseña es obligatoria.');
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
            throw new Error(data.message || 'Error al iniciar sesión.');
        }

        console.log('Usuario logueado:', data.usuario);
        console.log('Requiere 2FA:', data.usuario.requires_2fa);

        // 🔥 VERIFICAR SI TIENE 2FA ACTIVADO 🔥
        if (data.usuario.requires_2fa === true) {
                sessionStorage.setItem('temp_matricula', data.usuario.matricula);
                sessionStorage.setItem('temp_nombre', data.usuario.nombre);     // ← Agrega esta línea
                sessionStorage.setItem('temp_correo', data.usuario.correo || ''); // ← Opcional
                navigate('/verificar-2fa');
            }else {
            // Login normal, guardar datos permanentes
            localStorage.setItem('matricula', data.usuario.matricula);
            localStorage.setItem('nombre', data.usuario.nombre);
            localStorage.setItem('correo', data.usuario.correo || '');
            localStorage.setItem('idRol', data.usuario.idRol || '');
            localStorage.setItem('roleName', data.usuario.roleName || '');
            
            if (data.usuario.foto_path) {
                localStorage.setItem('foto', data.usuario.foto_path);
            }
            
            console.log('Redirigiendo a /dashboard');
            navigate('/dashboard');
        }
    } catch (err) {
        console.error('Error en login:', err);
        setErrorMsg(err.message);
    } finally {
        setLoading(false);
    }
};

    // ... el resto del JSX (los estilos) se quedan igual
    const styles = {
        container: {
            minHeight: 'calc(100vh - 200px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            backgroundColor: '#f0f2f5',
        },
        card: {
            maxWidth: '450px',
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden',
        },
        header: {
            backgroundColor: '#0A0F1E',
            padding: '2rem',
            textAlign: 'center',
            borderBottom: '4px solid #FFD700',
        },
        title: {
            fontSize: '1.8rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #fff 30%, #FFD700 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.5rem',
        },
        subtitle: {
            color: '#aaa',
            fontSize: '0.85rem',
        },
        body: {
            padding: '2rem',
        },
        inputGroup: {
            marginBottom: '1.5rem',
        },
        label: {
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '600',
            color: '#333',
            fontSize: '0.9rem',
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
        },
        input: {
            width: '100%',
            padding: '0.75rem 0.75rem 0.75rem 2.5rem',
            fontSize: '1rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            transition: 'all 0.2s ease',
            outline: 'none',
            boxSizing: 'border-box',
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
        },
        button: {
            width: '100%',
            padding: '0.75rem',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#0A0F1E',
            backgroundColor: '#FFD700',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
        },
        errorAlert: {
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
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
            borderTop: '1px solid #eee',
        },
        footerLink: {
            color: '#FFD700',
            textDecoration: 'none',
            fontWeight: '500',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
        },
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Bienvenido</h2>
                    <p style={styles.subtitle}>SNTSS Sección XXXIII</p>
                </div>
                
                <div style={styles.body}>
                    {errorMsg && (
                        <div style={styles.errorAlert}>
                            <FaExclamationTriangle />
                            <span>{errorMsg}</span>
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>
                                <FaUserAlt style={{ marginRight: '8px' }} /> Matrícula
                            </label>
                            <div style={styles.inputWrapper}>
                                <FaUserAlt style={styles.inputIcon} />
                                <input
                                    type="text"
                                    style={styles.input}
                                    placeholder="Ej. 97123456"
                                    value={formData.matricula}
                                    onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                                    disabled={loading}
                                    required
                                />
                            </div>
                            <small style={{ color: '#666', fontSize: '0.7rem' }}>8 o 9 dígitos numéricos</small>
                        </div>
                        
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>
                                <FaLock style={{ marginRight: '8px' }} /> Contraseña
                            </label>
                            <div style={styles.inputWrapper}>
                                <FaLock style={styles.inputIcon} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    style={styles.input}
                                    placeholder="Ingresa tu contraseña"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    disabled={loading}
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
                        
                        <button type="submit" style={styles.button} disabled={loading}>
                            {loading ? (
                                'Iniciando sesión...'
                            ) : (
                                <>
                                    <FaSignInAlt /> Entrar
                                </>
                            )}
                        </button>
                    </form>
                    
                    <div style={styles.footer}>
                        <Link to="/registro" style={styles.footerLink}>
                            <FaUserPlus /> ¿No tienes cuenta? Regístrate aquí
                        </Link>
                        <br />
                        <Link to="/RecuperarContraseña" style={{ ...styles.footerLink, marginTop: '0.5rem', display: 'inline-flex' }}>
                            <FaEnvelope /> ¿Olvidaste tu contraseña?
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;