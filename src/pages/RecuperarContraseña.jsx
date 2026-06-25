import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUserAlt, FaEnvelope, FaPaperPlane, FaCheckCircle, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';
import { apiUrl } from '../config';

const RecuperarContraseña = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    
    const [formData, setFormData] = useState({
        matricula: '',
        correo: ''
    });

    const validarMatricula = (matricula) => {
        return /^\d{8,9}$/.test(matricula);
    };

    const validarCorreo = (correo) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(correo);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setLoading(true);

        const matricula = formData.matricula.trim();
        const correo = formData.correo.trim().toLowerCase();

        if (!validarMatricula(matricula)) {
            setErrorMsg('La matrícula debe tener entre 8 y 9 dígitos numéricos.');
            setLoading(false);
            return;
        }

        if (!validarCorreo(correo)) {
            setErrorMsg('Ingresa un correo electrónico válido.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(apiUrl('/recuperar_contraseña.php'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matricula, correo })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Error al procesar la solicitud.');
            }

            setSuccessMsg(data.message || 'Se ha enviado un correo con tu contraseña temporal.');
            setFormData({ matricula: '', correo: '' });
            
            // Redirigir al login después de 3 segundos
            setTimeout(() => {
                navigate('/login');
            }, 4000);
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

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
            borderBottom: '4px solid #3EAEF4',
        },
        title: {
            fontSize: '1.6rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #fff 30%, #3EAEF4 100%)',
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
        button: {
            width: '100%',
            padding: '0.75rem',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#0A0F1E',
            backgroundColor: '#3EAEF4',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
        },
        successAlert: {
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
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
            color: '#3EAEF4',
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
                    <h2 style={styles.title}>Recuperar Contraseña</h2>
                    <p style={styles.subtitle}>SNTSS Sección XXXIII</p>
                </div>
                
                <div style={styles.body}>
                    {successMsg && (
                        <div style={styles.successAlert}>
                            <FaCheckCircle />
                            <span>{successMsg}</span>
                        </div>
                    )}
                    
                    {errorMsg && (
                        <div style={styles.errorAlert}>
                            <FaExclamationTriangle />
                            <span>{errorMsg}</span>
                        </div>
                    )}
                    
                    <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1.5rem' }}>
                        Ingresa tu matrícula y el correo electrónico con el que te registraste. 
                        Te enviaremos una contraseña temporal de acceso.
                    </p>
                    
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
                                <FaEnvelope style={{ marginRight: '8px' }} /> Correo Electrónico
                            </label>
                            <div style={styles.inputWrapper}>
                                <FaEnvelope style={styles.inputIcon} />
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
                        
                        <button type="submit" style={styles.button} disabled={loading}>
                            {loading ? (
                                'Enviando solicitud...'
                            ) : (
                                <>
                                    <FaPaperPlane /> Enviar contraseña temporal
                                </>
                            )}
                        </button>
                    </form>
                    
                    <div style={styles.footer}>
                        <Link to="/login" style={styles.footerLink}>
                            <FaArrowLeft /> Volver al inicio de sesión
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecuperarContraseña;