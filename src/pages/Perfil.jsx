import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FaUser, FaIdCard, FaBuilding, FaPhone, FaEnvelope, FaCamera, 
    FaSave, FaKey, FaArrowLeft, FaEdit, FaRocket, FaStar,
    FaShieldAlt, FaCheckCircle, FaExclamationTriangle, FaTimes
} from 'react-icons/fa';
import { apiUrl } from '../config';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// ✅ IMPORTAR CSS EXTERNO
import '../css/Perfil.css';

const Perfil = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    
    const [showPassModal, setShowPassModal] = useState(false);
    const [passLoading, setPassLoading] = useState(false);
    const [passError, setPassError] = useState('');
    const [passSuccess, setPassSuccess] = useState('');
    const [passData, setPassData] = useState({
        nueva_password: '',
        confirmar_password: ''
    });

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('blob:') || path.startsWith('data:')) {
            return path;
        }
        if (path.startsWith('http://') || path.startsWith('https://')) {
            return path;
        }
        if (path.startsWith('/api')) {
            return apiUrl(path.replace('/api', ''));
        }
        return apiUrl(path);
    };

    const [perfil, setPerfil] = useState({
        matricula: '',
        nombre: '',
        adscripcion: '',
        categoria: '',
        curp: '',
        telefono: '',
        correo: '',
        edad: '',
        foto_path: '',
        tarjeton_path: ''
    });

    const [editData, setEditData] = useState({
        telefono: '',
        correo: ''
    });

    const [fotoFile, setFotoFile] = useState(null);
    const [fotoPreview, setFotoPreview] = useState(null);

    useEffect(() => {
        const matricula = localStorage.getItem('matricula');
        if (!matricula) {
            navigate('/login');
            return;
        }
        cargarPerfil(matricula);
    }, []);

    const cargarPerfil = async (matricula) => {
        setLoading(true);
        try {
            const response = await fetch(apiUrl(`/obtener_perfil.php?matricula=${matricula}`));
            const data = await response.json();
            
            if (data.success) {
                setPerfil(data.usuario);
                setEditData({
                    telefono: data.usuario.telefono || '',
                    correo: data.usuario.correo || ''
                });
                if (data.usuario.foto_path) {
                    const separador = data.usuario.foto_path.includes('?') ? '&' : '?';
                    setFotoPreview(`${data.usuario.foto_path}${separador}v=${Date.now()}`);
                }
            } else {
                Swal.fire({
                    title: '❌ Error',
                    text: data.message || 'Error al cargar perfil',
                    icon: 'error',
                    confirmButtonColor: '#dc3545',
                });
            }
        } catch (error) {
            Swal.fire({
                title: '❌ Error de conexión',
                text: 'No se pudo conectar con el servidor',
                icon: 'error',
                confirmButtonColor: '#dc3545',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const fotoTipos = ['image/jpeg', 'image/png', 'image/webp'];
            if (!fotoTipos.includes(file.type)) {
                Swal.fire({
                    title: '❌ Formato no válido',
                    text: 'La foto debe ser JPG, PNG o WEBP.',
                    icon: 'error',
                    confirmButtonColor: '#dc3545',
                });
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                Swal.fire({
                    title: '❌ Archivo muy grande',
                    text: 'La foto no debe superar los 5MB.',
                    icon: 'error',
                    confirmButtonColor: '#dc3545',
                });
                return;
            }
            setFotoFile(file);
            setFotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setLoading(true);

        try {
            let response;
            
            if (fotoFile) {
                const formData = new FormData();
                formData.append('matricula', perfil.matricula);
                formData.append('telefono', editData.telefono);
                formData.append('correo', editData.correo);
                formData.append('foto', fotoFile);

                response = await fetch(apiUrl('/actualizar_perfil.php'), {
                    method: 'POST',
                    body: formData
                });
            } else {
                const payload = {
                    matricula: perfil.matricula,
                    telefono: editData.telefono,
                    correo: editData.correo
                };

                response = await fetch(apiUrl('/actualizar_perfil.php'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Error al actualizar perfil');
            }

            await Swal.fire({
                title: '✅ ¡Perfil actualizado!',
                text: 'Tus datos han sido guardados correctamente.',
                icon: 'success',
                confirmButtonColor: '#28a745',
                timer: 3000,
                timerProgressBar: true,
            });

            localStorage.setItem('correo', editData.correo);
            await cargarPerfil(perfil.matricula);
            setFotoFile(null);
        } catch (err) {
            await Swal.fire({
                title: '❌ Error',
                text: err.message,
                icon: 'error',
                confirmButtonColor: '#dc3545',
            });
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCambiarPass = async (e) => {
        e.preventDefault();
        setPassError('');
        setPassSuccess('');
        setPassLoading(true);

        const { nueva_password, confirmar_password } = passData;

        if (!nueva_password || !confirmar_password) {
            Swal.fire({
                title: '⚠️ Campos incompletos',
                text: 'Todos los campos son obligatorios.',
                icon: 'warning',
                confirmButtonColor: '#ffc107',
            });
            setPassLoading(false);
            return;
        }

        if (nueva_password.length < 8) {
            Swal.fire({
                title: '⚠️ Contraseña corta',
                text: 'La contraseña debe tener al menos 8 caracteres.',
                icon: 'warning',
                confirmButtonColor: '#ffc107',
            });
            setPassLoading(false);
            return;
        }

        if (nueva_password !== confirmar_password) {
            Swal.fire({
                title: '⚠️ No coinciden',
                text: 'Las contraseñas no coinciden.',
                icon: 'warning',
                confirmButtonColor: '#ffc107',
            });
            setPassLoading(false);
            return;
        }

        try {
            const response = await fetch(apiUrl('/cambiar_password.php'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    matricula: perfil.matricula,
                    password_nueva: nueva_password
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Error al cambiar contraseña');
            }

            await Swal.fire({
                title: '✅ ¡Contraseña actualizada!',
                text: 'Tu contraseña ha sido cambiada exitosamente.',
                icon: 'success',
                confirmButtonColor: '#28a745',
                timer: 3000,
                timerProgressBar: true,
            });

            setPassSuccess('Contraseña actualizada correctamente');
            setTimeout(() => {
                setShowPassModal(false);
                setPassData({ nueva_password: '', confirmar_password: '' });
                setPassSuccess('');
            }, 1500);
        } catch (err) {
            await Swal.fire({
                title: '❌ Error',
                text: err.message,
                icon: 'error',
                confirmButtonColor: '#dc3545',
            });
            setPassError(err.message);
        } finally {
            setPassLoading(false);
        }
    };

    if (loading && !perfil.matricula) {
        return (
            <div className="perfil-container">
                <div className="perfil-loading">
                    <div className="perfil-spinner" role="status" />
                    <span>Cargando perfil...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="perfil-wrapper">
            {/* Header Banner Sección 5 */}
            <div className="perfil-header ui-shadow">
                <div className="perfil-header-dots dot-matrix"></div>
                <div className="perfil-header-content">
                    <div className="perfil-header-left">
                        <button className="perfil-back-button" onClick={() => navigate('/')}>
                            <FaArrowLeft size={12} /> Volver al Inicio
                        </button>
                        <div className="perfil-header-titles">
                            <span className="perfil-header-tag">Portal del Agremiado</span>
                            <h1 className="perfil-title">
                                Mi Perfil
                            </h1>
                            <p className="perfil-subtitle">
                                Consulta y actualiza tu información personal, laboral y credenciales de acceso
                            </p>
                        </div>
                    </div>
                    <div className="perfil-header-right">
                        <span className="perfil-header-badge">
                            <FaShieldAlt style={{ marginRight: '6px' }} /> Datos Protegidos
                        </span>
                    </div>
                </div>

                {/* Matriz decorativa de puntitos en esquina */}
                <div className="perfil-header-dots-matrix">
                    <span className="dot-blue"></span>
                    <span className="dot-blue"></span>
                    <span className="dot-blue"></span>
                    <span className="dot-blue"></span>
                    <span className="dot-emerald"></span>
                    <span className="dot-emerald"></span>
                    <span className="dot-emerald"></span>
                    <span className="dot-emerald"></span>
                </div>
            </div>

            {/* Card Principal */}
            <div className="perfil-card">
                <div className="perfil-card-body">
                    {/* Foto de perfil */}
                    <div className="perfil-foto-container">
                        <div className="perfil-foto-wrapper">
                            {fotoPreview ? (
                                <img 
                                    src={getImageUrl(fotoPreview)} 
                                    alt="Foto de perfil" 
                                    className="perfil-foto"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            ) : (
                                <div className="perfil-foto-placeholder">
                                    <FaUser style={{ fontSize: '60px', color: '#adb5bd' }} />
                                </div>
                            )}
                            <label className="perfil-foto-camera">
                                <FaCamera size={18} color="white" />
                                <input
                                    type="file"
                                    className="perfil-foto-input"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleFotoChange}
                                    disabled={loading}
                                />
                            </label>
                        </div>
                        <p className="perfil-foto-text">
                            <FaEdit style={{ marginRight: '5px' }} /> Haz clic en la cámara para cambiar tu foto y recuerda dar al boton de guardar cambios al finalizar.
                        </p>
                    </div>

                    {/* Formulario */}
                    <form onSubmit={(e) => e.preventDefault()}>
                        <div className="perfil-grid-2cols">
                            {/* Datos fijos */}
                            <div className="perfil-col-campo">
                                <div className="perfil-campo">
                                    <label className="perfil-label"><FaIdCard /> Matrícula</label>
                                    <div className="perfil-value">{perfil.matricula || ''}</div>
                                </div>
                            </div>
                            <div className="perfil-col-campo">
                                <div className="perfil-campo">
                                    <label className="perfil-label"><FaUser /> Nombre</label>
                                    <div className="perfil-value">{perfil.nombre || ''}</div>
                                </div>
                            </div>
                            <div className="perfil-col-campo">
                                <div className="perfil-campo">
                                    <label className="perfil-label"><FaBuilding /> Adscripción</label>
                                    <div className="perfil-value">{perfil.adscripcion || 'N/A'}</div>
                                </div>
                            </div>
                            <div className="perfil-col-campo">
                                <div className="perfil-campo">
                                    <label className="perfil-label">Categoría</label>
                                    <div className="perfil-value">{perfil.categoria || 'N/A'}</div>
                                </div>
                            </div>
                            <div className="perfil-col-campo">
                                <div className="perfil-campo">
                                    <label className="perfil-label">CURP</label>
                                    <div className="perfil-value">{perfil.curp || ''}</div>
                                </div>
                            </div>
                            <div className="perfil-col-campo">
                                <div className="perfil-campo">
                                    <label className="perfil-label">Edad</label>
                                    <div className="perfil-value">{perfil.edad ? `${perfil.edad} años` : 'N/A'}</div>
                                </div>
                            </div>

                            {/* Datos editables */}
                            <div className="perfil-col-full">
                                <div style={{ marginTop: '0.5rem' }}>
                                    <p className="perfil-editable-label">
                                        <FaEdit style={{ color: '#3EAEF4' }} /> Campos editables
                                    </p>
                                </div>
                            </div>
                            <div className="perfil-col-campo">
                                <div className="perfil-campo">
                                    <label className="perfil-label"><FaPhone /> Teléfono</label>
                                    <input
                                        type="tel"
                                        className="perfil-input perfil-input-editable"
                                        placeholder="10 dígitos numéricos"
                                        value={editData.telefono}
                                        onChange={(e) => setEditData({ ...editData, telefono: e.target.value })}
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="perfil-col-campo">
                                <div className="perfil-campo">
                                    <label className="perfil-label"><FaEnvelope /> Correo</label>
                                    <input
                                        type="email"
                                        className="perfil-input perfil-input-editable"
                                        placeholder="tu@email.com"
                                        value={editData.correo}
                                        onChange={(e) => setEditData({ ...editData, correo: e.target.value })}
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="perfil-flex-row">
                            <button 
                                type="button"
                                className="perfil-btn-primary"
                                disabled={loading}
                                onClick={handleSubmit}
                            >
                                {loading ? 'Guardando...' : <><FaSave /> Guardar Cambios</>}
                            </button>
                            <button 
                                type="button" 
                                className="perfil-btn-danger"
                                onClick={() => setShowPassModal(true)}
                            >
                                <FaKey /> Cambiar Contraseña
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Modal Cambiar Contraseña */}
            {showPassModal && (
                <div className="perfil-modal-overlay" onClick={(e) => {
                    if (e.target === e.currentTarget) setShowPassModal(false);
                }}>
                    <div className="perfil-modal-content">
                        <div className="perfil-modal-header">
                            <h5 className="perfil-modal-title">
                                <FaKey /> Cambiar Contraseña
                            </h5>
                            <button className="perfil-modal-close" onClick={() => setShowPassModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="perfil-modal-body">
                            {passError && (
                                <div className="perfil-alert-error">
                                    <FaExclamationTriangle /> {passError}
                                    <button className="perfil-alert-close" onClick={() => setPassError('')}>✕</button>
                                </div>
                            )}
                            {passSuccess && (
                                <div className="perfil-alert-success">
                                    <FaCheckCircle /> {passSuccess}
                                    <button className="perfil-alert-close" onClick={() => setPassSuccess('')}>✕</button>
                                </div>
                            )}
                            <form onSubmit={handleCambiarPass}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label className="perfil-label">Nueva Contraseña</label>
                                    <input
                                        type="password"
                                        className="perfil-input"
                                        placeholder="Mínimo 8 caracteres"
                                        value={passData.nueva_password}
                                        onChange={(e) => setPassData({ ...passData, nueva_password: e.target.value })}
                                        disabled={passLoading || passSuccess}
                                        required
                                    />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label className="perfil-label">Confirmar Contraseña</label>
                                    <input
                                        type="password"
                                        className="perfil-input"
                                        placeholder="Repite tu nueva contraseña"
                                        value={passData.confirmar_password}
                                        onChange={(e) => setPassData({ ...passData, confirmar_password: e.target.value })}
                                        disabled={passLoading || passSuccess}
                                        required
                                    />
                                </div>
                                <div className="perfil-modal-actions">
                                    <button 
                                        type="submit" 
                                        className="perfil-btn-success"
                                        disabled={passLoading || passSuccess}
                                    >
                                        {passLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
                                    </button>
                                    <button 
                                        type="button" 
                                        className="perfil-btn-danger"
                                        onClick={() => setShowPassModal(false)}
                                        disabled={passLoading}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Perfil;