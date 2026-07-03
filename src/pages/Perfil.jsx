import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaIdCard, FaBuilding, FaPhone, FaEnvelope, FaCamera, FaSave, FaKey, FaArrowLeft, FaEdit } from 'react-icons/fa';
import { apiUrl } from '../config';

const Perfil = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    
    // Estado para el modal de cambio de contraseña
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
        // Si ya es una URL completa, devolverla
        if (path.startsWith('http://') || path.startsWith('https://')) {
            return path;
        }
        // Si empieza con /api, usar apiUrl
        if (path.startsWith('/api')) {
            return apiUrl(path.replace('/api', ''));
        }
        // Si no, asumir que es una ruta relativa
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

    // Cargar perfil
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
            const response = await fetch(apiUrl(`/obtener_perfil.php?matricula=${matricula}`), {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
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
                setErrorMsg('La foto debe ser JPG, PNG o WEBP.');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setErrorMsg('La foto no debe superar los 5MB.');
                return;
            }
            setFotoFile(file);
            setFotoPreview(URL.createObjectURL(file));
        }
    };

    // Actualizar perfil (teléfono, correo y foto)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setLoading(true);

        try {
            let response;
            
            if (fotoFile) {
                // Si hay foto nueva, usar FormData
                const formData = new FormData();
                formData.append('matricula', perfil.matricula);
                formData.append('telefono', editData.telefono);
                formData.append('correo', editData.correo);
                formData.append('foto', fotoFile);

                response = await fetch(apiUrl('/actualizar_perfil.php'), {
                    method: 'POST',
                    body: formData
                    // ⚠️ No usar Content-Type, el navegador lo pone automáticamente
                });
            } else {
                // Sin foto, usar JSON
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

            setSuccessMsg(data.message || 'Perfil actualizado correctamente');
            localStorage.setItem('correo', editData.correo);
            
            // Recargar perfil para mostrar la nueva foto
            await cargarPerfil(perfil.matricula);
            setFotoFile(null); // Limpiar el estado de la foto
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Cambiar contraseña (desde el modal)
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

            setPassSuccess('Contraseña actualizada correctamente');
            setTimeout(() => {
                setShowPassModal(false);
                setPassData({ nueva_password: '', confirmar_password: '' });
            }, 2000);
        } catch (err) {
            setPassError(err.message);
        } finally {
            setPassLoading(false);
        }
    };

    if (loading && !perfil.matricula) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-warning" role="status"></div>
                <p className="mt-3">Cargando perfil...</p>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card shadow-sm">
                        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                            <h4 className="mb-0"><FaUser className="me-2" />Mi Perfil</h4>
                            <button className="btn btn-outline-light btn-sm" onClick={() => navigate('/dashboard')}>
                                <FaArrowLeft className="me-1" /> Volver
                            </button>
                        </div>
                        <div className="card-body">
                            {errorMsg && (
                                <div className="alert alert-danger alert-dismissible fade show">
                                    {errorMsg}
                                    <button type="button" className="btn-close" onClick={() => setErrorMsg('')}></button>
                                </div>
                            )}
                            {successMsg && (
                                <div className="alert alert-success alert-dismissible fade show">
                                    {successMsg}
                                    <button type="button" className="btn-close" onClick={() => setSuccessMsg('')}></button>
                                </div>
                            )}

                            <div className="row">
                                {/* Foto de perfil */}
                                <div className="col-md-4 text-center mb-4">
                                    <div className="position-relative">
                                        {fotoPreview ? (
                                            <img 
                                                src={getImageUrl(fotoPreview)} 
                                                alt="Foto de perfil" 
                                                className="rounded-circle border border-3 border-info"
                                                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                                onError={(e) => {
                                                    // Si la imagen falla, mostrar el placeholder
                                                    e.target.style.display = 'none';
                                                    e.target.parentElement.innerHTML = `
                                                        <div class="rounded-circle bg-light border border-3 border-info d-flex align-items-center justify-content-center mx-auto"
                                                            style="width: 150px; height: 150px;">
                                                            <FaUser style="font-size: 60px; color: #ccc;" />
                                                        </div>
                                                    `;
                                                }}
                                            />
                                        ) : (
                                            <div 
                                                className="rounded-circle bg-light border border-3 border-info d-flex align-items-center justify-content-center mx-auto"
                                                style={{ width: '150px', height: '150px' }}
                                            >
                                                <FaUser style={{ fontSize: '60px', color: '#ccc' }} />
                                            </div>
                                        )}
                                        <label 
                                            className="position-absolute bottom-0 end-0 bg-info rounded-circle p-2 cursor-pointer"
                                            style={{ transform: 'translate(10px, 10px)', cursor: 'pointer' }}
                                        >
                                            <FaCamera size={20} />
                                            <input
                                                type="file"
                                                className="d-none"
                                                accept="image/jpeg,image/png,image/webp"
                                                onChange={handleFotoChange}
                                                disabled={loading}
                                            />
                                        </label>
                                    </div>
                                    <p className="text-muted small mt-2">Haz clic en la cámara para cambiar tu foto</p>
                                </div>

                                {/* Datos del perfil */}
                                <div className="col-md-8">
                                    <form onSubmit={handleSubmit}>
                                        <div className="row g-3">
                                            {/* Datos fijos (solo lectura) */}
                                            <div className="col-md-6">
                                                <label className="form-label fw-bold">Matrícula</label>
                                                <input
                                                    type="text"
                                                    className="form-control bg-light"
                                                    value={perfil.matricula || ''}
                                                    readOnly
                                                    disabled
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-bold">Nombre</label>
                                                <input
                                                    type="text"
                                                    className="form-control bg-light"
                                                    value={perfil.nombre || ''}
                                                    readOnly
                                                    disabled
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-bold">Adscripción</label>
                                                <input
                                                    type="text"
                                                    className="form-control bg-light"
                                                    value={perfil.adscripcion || 'N/A'}
                                                    readOnly
                                                    disabled
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-bold">Categoría</label>
                                                <input
                                                    type="text"
                                                    className="form-control bg-light"
                                                    value={perfil.categoria || 'N/A'}
                                                    readOnly
                                                    disabled
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-bold">CURP</label>
                                                <input
                                                    type="text"
                                                    className="form-control bg-light"
                                                    value={perfil.curp || ''}
                                                    readOnly
                                                    disabled
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-bold">Edad</label>
                                                <input
                                                    type="text"
                                                    className="form-control bg-light"
                                                    value={perfil.edad ? `${perfil.edad} años` : 'N/A'}
                                                    readOnly
                                                    disabled
                                                />
                                            </div>

                                            {/* Datos editables */}
                                            <div className="col-12">
                                                <p className="text-muted small mb-2" style={{ borderBottom: '1px dashed #ccc', paddingBottom: '5px' }}>
                                                    <FaEdit className="me-1" /> Campos editables
                                                </p>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-bold">
                                                    <FaPhone className="me-1" /> Teléfono
                                                </label>
                                                <input
                                                    type="tel"
                                                    className="form-control"
                                                    placeholder="10 dígitos numéricos"
                                                    value={editData.telefono}
                                                    onChange={(e) => setEditData({ ...editData, telefono: e.target.value })}
                                                    disabled={loading}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-bold">
                                                    <FaEnvelope className="me-1" /> Correo
                                                </label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    placeholder="tu@email.com"
                                                    value={editData.correo}
                                                    onChange={(e) => setEditData({ ...editData, correo: e.target.value })}
                                                    disabled={loading}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="d-flex gap-2 mt-4">
                                            <button type="submit" className="btn btn-warning fw-bold" disabled={loading}>
                                                {loading ? 'Guardando...' : <><FaSave className="me-2" /> Guardar Cambios</>}
                                            </button>
                                            <button 
                                                type="button" 
                                                className="btn btn-outline-danger" 
                                                onClick={() => setShowPassModal(true)}
                                            >
                                                <FaKey className="me-2" /> Cambiar Contraseña
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Cambiar Contraseña */}
            {showPassModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-dark text-white">
                                <h5 className="modal-title"><FaKey className="me-2" />Cambiar Contraseña</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowPassModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                {passError && (
                                    <div className="alert alert-danger">{passError}</div>
                                )}
                                {passSuccess && (
                                    <div className="alert alert-success">{passSuccess}</div>
                                )}
                                <form onSubmit={handleCambiarPass}>
                                    <div className="mb-3">
                                        <label className="form-label">Nueva Contraseña</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            placeholder="Mínimo 8 caracteres"
                                            value={passData.nueva_password}
                                            onChange={(e) => setPassData({ ...passData, nueva_password: e.target.value })}
                                            disabled={passLoading || passSuccess}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Confirmar Contraseña</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            placeholder="Repite tu nueva contraseña"
                                            value={passData.confirmar_password}
                                            onChange={(e) => setPassData({ ...passData, confirmar_password: e.target.value })}
                                            disabled={passLoading || passSuccess}
                                            required
                                        />
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button 
                                            type="submit" 
                                            className="btn btn-success" 
                                            disabled={passLoading || passSuccess}
                                        >
                                            {passLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
                                        </button>
                                        <button 
                                            type="button" 
                                            className="btn btn-secondary" 
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
                </div>
            )}
        </div>
    );
};

export default Perfil;