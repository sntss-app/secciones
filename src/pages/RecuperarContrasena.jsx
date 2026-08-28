import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    FaUserAlt, FaEnvelope, FaPaperPlane, FaCheckCircle, 
    FaExclamationTriangle, FaArrowLeft 
} from 'react-icons/fa';
import { apiUrl } from '../config';

// ✅ IMPORTAR CSS EXTERNO
import '../css/RecuperarContrasena.css';

const RecuperarContrasena = () => {
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
            const response = await fetch(apiUrl('/recuperar_contrasena.php'), {
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
            
            setTimeout(() => {
                navigate('/login');
            }, 4000);
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="recuperar-wrapper">
            <div className="recuperar-card ui-shadow">
                <div className="recuperar-header">
                    <div className="recuperar-header-dots dot-matrix"></div>
                    <span className="recuperar-badge">Seguridad de Acceso</span>
                    <h2 className="recuperar-title">Recuperar Contraseña</h2>
                    <p className="recuperar-subtitle">Ingresa tus datos para restablecer tus credenciales</p>
                </div>
                
                <div className="recuperar-body">
                    {successMsg && (
                        <div className="recuperar-alert-success">
                            <FaCheckCircle />
                            <span>{successMsg}</span>
                            <button 
                                className="recuperar-alert-close"
                                onClick={() => setSuccessMsg('')}
                            >
                                ✕
                            </button>
                        </div>
                    )}
                    
                    {errorMsg && (
                        <div className="recuperar-alert-error">
                            <FaExclamationTriangle />
                            <span>{errorMsg}</span>
                            <button 
                                className="recuperar-alert-close"
                                onClick={() => setErrorMsg('')}
                            >
                                ✕
                            </button>
                        </div>
                    )}
                    
                    <p className="recuperar-info-text">
                        Ingresa tu matrícula y el correo electrónico con el que te registraste. 
                        Te enviaremos una contraseña temporal de acceso.
                    </p>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="recuperar-input-group">
                            <label className="recuperar-label">
                                <FaUserAlt style={{ marginRight: '8px', color: '#3EAEF4' }} /> Matrícula
                            </label>
                            <div className="recuperar-input-wrapper">
                                <FaUserAlt className="recuperar-input-icon" />
                                <input
                                    type="text"
                                    className="recuperar-input"
                                    placeholder="Ej. 97123456"
                                    value={formData.matricula}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        setFormData({ ...formData, matricula: value.slice(0, 9) });
                                    }}
                                    disabled={loading}
                                    required
                                />
                            </div>
                            <small className="recuperar-small-text">8 o 9 dígitos numéricos</small>
                        </div>
                        
                        <div className="recuperar-input-group">
                            <label className="recuperar-label">
                                <FaEnvelope style={{ marginRight: '8px', color: '#3EAEF4' }} /> Correo Electrónico
                            </label>
                            <div className="recuperar-input-wrapper">
                                <FaEnvelope className="recuperar-input-icon" />
                                <input
                                    type="email"
                                    className="recuperar-input"
                                    placeholder="tu@email.com"
                                    value={formData.correo}
                                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>
                        
                        <button 
                            type="submit" 
                            className="recuperar-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="recuperar-spinner" />
                                    Enviando solicitud...
                                </>
                            ) : (
                                <>
                                    <FaPaperPlane /> Enviar contraseña temporal
                                </>
                            )}
                        </button>
                    </form>
                    
                    <div className="recuperar-footer">
                        <Link to="/login" className="recuperar-footer-link">
                            <FaArrowLeft /> Volver al inicio de sesión
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecuperarContrasena;