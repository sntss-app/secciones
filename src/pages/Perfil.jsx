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
                    setFotoPreview(data.usuario.foto_path);
                }
            } else {
                setErrorMsg(data.message || 'Error al cargar perfil');
            }
        } catch (error) {
            setErrorMsg('Error de conexión con el servidor');
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
            setPassError('Todos los campos son obligatorios.');
            setPassLoading(false);
            return;
        }

        if (nueva_password.length < 8) {
            setPassError('La contraseña debe tener al menos 8 caracteres.');
            setPassLoading(false);
            return;
        }

        if (nueva_password !== confirmar_password) {
            setPassError('Las contraseñas no coinciden.');
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

    // ========== ESTILOS MODERNOS ==========
    const styles = {
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '2rem 1.5rem',
            background: '#f0f4f8',
            minHeight: 'calc(100vh - 200px)',
        },
        header: {
            background: 'linear-gradient(135deg, #0A0F1E 0%, #1a1f2e 50%, #0A0F1E 100%)',
            borderRadius: '20px',
            padding: '2.5rem 2rem',
            marginBottom: '2rem',
            borderBottom: '4px solid #3EAEF4',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            position: 'relative',
            overflow: 'hidden',
        },
        headerGlow: {
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(62,174,244,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
        },
        headerContent: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            position: 'relative',
            zIndex: 2,
        },
        headerLeft: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
        },
        backButton: {
            color: 'white',
            backgroundColor: 'rgba(255,255,255,0.1)',
            padding: '0.7rem 1.2rem',
            borderRadius: '12px',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer',
        },
        title: {
            fontSize: '2rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #fff 30%, #3EAEF4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
        },
        subtitle: {
            color: '#aab',
            fontSize: '0.95rem',
            margin: 0,
        },
        headerBadge: {
            display: 'inline-block',
            backgroundColor: '#3EAEF4',
            color: '#0A0F1E',
            padding: '0.3rem 1rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
        },
        card: {
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.5)',
        },
        cardBody: {
            padding: '2rem',
        },
        // Foto de perfil
        fotoContainer: {
            textAlign: 'center',
            marginBottom: '1.5rem',
        },
        fotoWrapper: {
            position: 'relative',
            display: 'inline-block',
        },
        foto: {
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '4px solid #3EAEF4',
            boxShadow: '0 4px 20px rgba(62,174,244,0.3)',
            transition: 'all 0.3s ease',
        },
        fotoPlaceholder: {
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            backgroundColor: '#e9ecef',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '4px solid #3EAEF4',
            boxShadow: '0 4px 20px rgba(62,174,244,0.3)',
        },
        fotoCamera: {
            position: 'absolute',
            bottom: '5px',
            right: '5px',
            backgroundColor: '#3EAEF4',
            borderRadius: '50%',
            padding: '10px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            border: '2px solid white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        },
        fotoInput: {
            display: 'none',
        },
        // Grid de datos
        grid2cols: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
        },
        campo: {
            marginBottom: '0.5rem',
        },
        label: {
            display: 'block',
            fontSize: '0.75rem',
            fontWeight: '600',
            color: '#6c757d',
            marginBottom: '0.2rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
        },
        value: {
            display: 'block',
            fontSize: '1rem',
            fontWeight: '500',
            color: '#0A0F1E',
            padding: '0.5rem 0.75rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef',
        },
        input: {
            width: '100%',
            padding: '0.6rem 1rem',
            fontSize: '0.95rem',
            border: '1px solid #ddd',
            borderRadius: '10px',
            outline: 'none',
            transition: 'all 0.3s ease',
            backgroundColor: 'white',
        },
        inputEditable: {
            borderLeft: '3px solid #3EAEF4',
        },
        btnPrimary: {
            backgroundColor: '#3EAEF4',
            color: '#0A0F1E',
            border: 'none',
            padding: '0.7rem 1.5rem',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '0.95rem',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
        },
        btnSuccess: {
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            padding: '0.7rem 1.5rem',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '0.95rem',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
        },
        btnDanger: {
            backgroundColor: 'transparent',
            color: '#dc3545',
            border: '2px solid #dc3545',
            padding: '0.7rem 1.5rem',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '0.95rem',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
        },
        btnDangerHover: {
            backgroundColor: '#dc3545',
            color: 'white',
        },
        flexRow: {
            display: 'flex',
            gap: '1rem',
            marginTop: '1.5rem',
            flexWrap: 'wrap',
        },
        // Modal
        modalOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
        },
        modalContent: {
            backgroundColor: 'white',
            borderRadius: '20px',
            maxWidth: '500px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        },
        modalHeader: {
            background: 'linear-gradient(135deg, #0A0F1E, #1a1f2e)',
            color: 'white',
            padding: '1.5rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '3px solid #3EAEF4',
        },
        modalBody: {
            padding: '2rem',
        },
        modalClose: {
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '1.5rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
        },
        alertError: {
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
        },
        alertSuccess: {
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
        },
        closeBtn: {
            background: 'none',
            border: 'none',
            marginLeft: 'auto',
            color: 'inherit',
            fontSize: '1.2rem',
            cursor: 'pointer',
        },
        loadingSpinner: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '4rem',
            gap: '1rem',
            color: '#6c757d',
        },
    };

    if (loading && !perfil.matricula) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingSpinner}>
                    <div className="spinner-border text-warning" role="status" style={{ width: '2.5rem', height: '2.5rem' }} />
                    <span>Cargando perfil...</span>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerGlow} />
                <div style={styles.headerContent}>
                    <div style={styles.headerLeft}>
                        <button style={styles.backButton} onClick={() => navigate('/dashboard')}>
                            <FaArrowLeft /> Volver
                        </button>
                        <div>
                            <h1 style={styles.title}>
                                <FaRocket style={{ color: '#3EAEF4' }} /> Mi Perfil
                            </h1>
                            <p style={styles.subtitle}>
                                Gestiona tu información personal
                            </p>
                        </div>
                    </div>
                    <div>
                        <span style={styles.headerBadge}>
                            <FaShieldAlt style={{ marginRight: '5px' }} /> Datos personales
                        </span>
                    </div>
                </div>
            </div>

            {/* Card Principal */}
            <div style={styles.card}>
                <div style={styles.cardBody}>
                    {/* Foto de perfil */}
                    <div style={styles.fotoContainer}>
                        <div style={styles.fotoWrapper}>
                            {fotoPreview ? (
                                <img 
                                    src={getImageUrl(fotoPreview)} 
                                    alt="Foto de perfil" 
                                    style={styles.foto}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            ) : (
                                <div style={styles.fotoPlaceholder}>
                                    <FaUser style={{ fontSize: '60px', color: '#adb5bd' }} />
                                </div>
                            )}
                            <label style={styles.fotoCamera}>
                                <FaCamera size={18} color="white" />
                                <input
                                    type="file"
                                    style={styles.fotoInput}
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleFotoChange}
                                    disabled={loading}
                                />
                            </label>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '0.5rem' }}>
                            <FaEdit style={{ marginRight: '5px' }} /> Haz clic en la cámara para cambiar tu foto
                        </p>
                    </div>

                    {/* Formulario */}
                    <form onSubmit={handleSubmit}>
                        <div style={styles.grid2cols}>
                            {/* Datos fijos */}
                            <div style={styles.campo}>
                                <label style={styles.label}><FaIdCard /> Matrícula</label>
                                <div style={styles.value}>{perfil.matricula || ''}</div>
                            </div>
                            <div style={styles.campo}>
                                <label style={styles.label}><FaUser /> Nombre</label>
                                <div style={styles.value}>{perfil.nombre || ''}</div>
                            </div>
                            <div style={styles.campo}>
                                <label style={styles.label}><FaBuilding /> Adscripción</label>
                                <div style={styles.value}>{perfil.adscripcion || 'N/A'}</div>
                            </div>
                            <div style={styles.campo}>
                                <label style={styles.label}>Categoría</label>
                                <div style={styles.value}>{perfil.categoria || 'N/A'}</div>
                            </div>
                            <div style={styles.campo}>
                                <label style={styles.label}>CURP</label>
                                <div style={styles.value}>{perfil.curp || ''}</div>
                            </div>
                            <div style={styles.campo}>
                                <label style={styles.label}>Edad</label>
                                <div style={styles.value}>{perfil.edad ? `${perfil.edad} años` : 'N/A'}</div>
                            </div>

                            {/* Datos editables */}
                            <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                                <p style={{ fontSize: '0.8rem', color: '#6c757d', borderBottom: '2px dashed #3EAEF4', paddingBottom: '0.5rem' }}>
                                    <FaEdit style={{ color: '#3EAEF4' }} /> Campos editables
                                </p>
                            </div>
                            <div style={styles.campo}>
                                <label style={styles.label}><FaPhone /> Teléfono</label>
                                <input
                                    type="tel"
                                    style={{ ...styles.input, ...styles.inputEditable }}
                                    placeholder="10 dígitos numéricos"
                                    value={editData.telefono}
                                    onChange={(e) => setEditData({ ...editData, telefono: e.target.value })}
                                    disabled={loading}
                                    required
                                />
                            </div>
                            <div style={styles.campo}>
                                <label style={styles.label}><FaEnvelope /> Correo</label>
                                <input
                                    type="email"
                                    style={{ ...styles.input, ...styles.inputEditable }}
                                    placeholder="tu@email.com"
                                    value={editData.correo}
                                    onChange={(e) => setEditData({ ...editData, correo: e.target.value })}
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        <div style={styles.flexRow}>
                            <button 
                                type="submit" 
                                style={styles.btnPrimary}
                                disabled={loading}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(62,174,244,0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                {loading ? 'Guardando...' : <><FaSave /> Guardar Cambios</>}
                            </button>
                            <button 
                                type="button" 
                                style={styles.btnDanger}
                                onClick={() => setShowPassModal(true)}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#dc3545';
                                    e.currentTarget.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#dc3545';
                                }}
                            >
                                <FaKey /> Cambiar Contraseña
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Modal Cambiar Contraseña */}
            {showPassModal && (
                <div style={styles.modalOverlay} onClick={(e) => {
                    if (e.target === e.currentTarget) setShowPassModal(false);
                }}>
                    <div style={styles.modalContent}>
                        <div style={styles.modalHeader}>
                            <h5 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaKey /> Cambiar Contraseña
                            </h5>
                            <button style={styles.modalClose} onClick={() => setShowPassModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div style={styles.modalBody}>
                            {passError && (
                                <div style={styles.alertError}>
                                    <FaExclamationTriangle /> {passError}
                                    <button style={styles.closeBtn} onClick={() => setPassError('')}>✕</button>
                                </div>
                            )}
                            {passSuccess && (
                                <div style={styles.alertSuccess}>
                                    <FaCheckCircle /> {passSuccess}
                                    <button style={styles.closeBtn} onClick={() => setPassSuccess('')}>✕</button>
                                </div>
                            )}
                            <form onSubmit={handleCambiarPass}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={styles.label}>Nueva Contraseña</label>
                                    <input
                                        type="password"
                                        style={styles.input}
                                        placeholder="Mínimo 8 caracteres"
                                        value={passData.nueva_password}
                                        onChange={(e) => setPassData({ ...passData, nueva_password: e.target.value })}
                                        disabled={passLoading || passSuccess}
                                        required
                                    />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={styles.label}>Confirmar Contraseña</label>
                                    <input
                                        type="password"
                                        style={styles.input}
                                        placeholder="Repite tu nueva contraseña"
                                        value={passData.confirmar_password}
                                        onChange={(e) => setPassData({ ...passData, confirmar_password: e.target.value })}
                                        disabled={passLoading || passSuccess}
                                        required
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button 
                                        type="submit" 
                                        style={styles.btnSuccess}
                                        disabled={passLoading || passSuccess}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(40,167,69,0.3)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        {passLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
                                    </button>
                                    <button 
                                        type="button" 
                                        style={{ ...styles.btnDanger, padding: '0.7rem 1.5rem' }}
                                        onClick={() => setShowPassModal(false)}
                                        disabled={passLoading}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#6c757d';
                                            e.currentTarget.style.color = 'white';
                                            e.currentTarget.style.borderColor = '#6c757d';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = '#dc3545';
                                            e.currentTarget.style.borderColor = '#dc3545';
                                        }}
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