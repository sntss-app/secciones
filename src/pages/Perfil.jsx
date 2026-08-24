import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    FaUser, FaIdCard, FaBuilding, FaPhone, FaEnvelope, FaCamera, 
    FaSave, FaKey, FaArrowLeft, FaEdit, FaShieldAlt, FaCheckCircle, 
    FaFilePdf, FaTimes
} from 'react-icons/fa';
import { apiUrl } from '../config';
import { Modal } from 'react-bootstrap';
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

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('blob:') || path.startsWith('data:')) return path;
        if (path.startsWith('http://') || path.startsWith('https://')) return path;
        if (path.startsWith('/api')) return apiUrl(path.replace('/api', ''));
        return apiUrl(path);
    };

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
                confirmButtonColor: '#10B981',
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
                confirmButtonColor: '#486DAA',
            });
            setPassLoading(false);
            return;
        }

        if (nueva_password.length < 8) {
            Swal.fire({
                title: '⚠️ Contraseña corta',
                text: 'La contraseña debe tener al menos 8 caracteres.',
                icon: 'warning',
                confirmButtonColor: '#486DAA',
            });
            setPassLoading(false);
            return;
        }

        if (nueva_password !== confirmar_password) {
            Swal.fire({
                title: '⚠️ No coinciden',
                text: 'Las contraseñas no coinciden.',
                icon: 'warning',
                confirmButtonColor: '#486DAA',
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
                confirmButtonColor: '#10B981',
                timer: 3000,
                timerProgressBar: true,
            });

            setShowPassModal(false);
            setPassData({ nueva_password: '', confirmar_password: '' });
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

    return (
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
            
            {/* Header Perfil */}
            <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 ui-shadow border border-white mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <Link to="/dashboard" className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-[#486DAA] hover:text-white flex items-center justify-center transition text-decoration-none">
                        <FaArrowLeft />
                    </Link>
                    <div>
                        <span className="inline-block bg-[#486DAA]/10 text-[#486DAA] text-[10px] font-extrabold px-3 py-0.5 rounded-full mb-1 border border-[#486DAA]/20">
                            Expediente Sindical
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black text-[#486DAA] tracking-tight m-0">
                            Perfil de Agremiado
                        </h2>
                    </div>
                </div>

                <button 
                    onClick={() => setShowPassModal(true)}
                    className="inline-flex items-center space-x-2 bg-slate-100 hover:bg-[#486DAA] hover:text-white text-slate-700 font-bold px-5 py-2.5 rounded-full text-xs transition duration-200 border border-slate-200 cursor-pointer"
                >
                    <FaKey />
                    <span>Cambiar Contraseña</span>
                </button>
            </div>

            {/* Grid Principal: Foto/Resumen + Formulario */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Columna Izquierda: Tarjeta de Identidad */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-6 text-center ui-shadow border border-white relative overflow-hidden">
                        <div className="absolute top-4 right-4 w-16 h-16 dot-matrix opacity-30 pointer-events-none"></div>
                        
                        {/* Foto de Perfil */}
                        <div className="relative w-32 h-32 mx-auto mb-4">
                            <img 
                                src={fotoPreview ? getImageUrl(fotoPreview) : '/images/avatar-default.png'} 
                                alt={perfil.nombre || 'Usuario'} 
                                className="w-full h-full rounded-full object-cover border-4 border-emerald-500 shadow-md"
                                onError={(e) => { e.target.src = '/images/avatar-default.png'; }}
                            />
                            <label className="absolute bottom-0 right-0 w-10 h-10 bg-[#486DAA] text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-[#355386] transition">
                                <FaCamera className="text-sm" />
                                <input type="file" accept="image/*" onChange={handleFotoChange} className="hidden" />
                            </label>
                        </div>

                        <h3 className="text-base font-black text-[#486DAA] m-0">{perfil.nombre || 'Nombre no disponible'}</h3>
                        <p className="text-xs text-slate-500 font-bold mt-1 mb-3">Matrícula: {perfil.matricula}</p>

                        <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold border border-emerald-200">
                            <FaShieldAlt />
                            <span>Agremiado Activo</span>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 text-left text-xs space-y-2 text-slate-600">
                            <div><span className="font-bold text-[#486DAA]">CURP:</span> {perfil.curp || 'N/A'}</div>
                            <div><span className="font-bold text-[#486DAA]">Adscripción:</span> {perfil.adscripcion || 'N/A'}</div>
                            <div><span className="font-bold text-[#486DAA]">Categoría:</span> {perfil.categoria || 'N/A'}</div>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Edición de Contacto */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-[2.5rem] p-7 sm:p-8 ui-shadow border border-white">
                        <div className="flex items-center space-x-2.5 mb-6 pb-3 border-b border-slate-100">
                            <div className="w-8 h-8 rounded-xl bg-[#486DAA] text-white flex items-center justify-center text-xs">
                                <FaEdit />
                            </div>
                            <h3 className="text-base font-black text-[#486DAA] m-0">Información de Contacto</h3>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-[#486DAA] mb-1.5 pl-2">
                                    Teléfono Móvil
                                </label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-4 text-slate-400 text-sm"><FaPhone /></span>
                                    <input 
                                        type="tel"
                                        value={editData.telefono}
                                        onChange={(e) => setEditData({ ...editData, telefono: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                        placeholder="10 dígitos"
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-full py-3 pl-11 pr-4 text-xs font-medium text-slate-700 outline-none focus:border-[#486DAA] focus:bg-white focus:ring-4 focus:ring-[#486DAA]/15 transition"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#486DAA] mb-1.5 pl-2">
                                    Correo Electrónico
                                </label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-4 text-slate-400 text-sm"><FaEnvelope /></span>
                                    <input 
                                        type="email"
                                        value={editData.correo}
                                        onChange={(e) => setEditData({ ...editData, correo: e.target.value })}
                                        placeholder="usuario@dominio.com"
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-full py-3 pl-11 pr-4 text-xs font-medium text-slate-700 outline-none focus:border-[#486DAA] focus:bg-white focus:ring-4 focus:ring-[#486DAA]/15 transition"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto bg-gradient-to-r from-[#486DAA] to-[#355386] hover:from-[#3b598d] hover:to-[#2e4771] text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-[#486DAA]/30 hover:scale-[1.02] transition duration-200 text-xs flex items-center justify-center space-x-2 border-0 cursor-pointer"
                            >
                                <FaSave />
                                <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
                            </button>
                        </form>
                    </div>
                </div>

            </div>

            {/* Modal Cambiar Contraseña */}
            <Modal show={showPassModal} onHide={() => setShowPassModal(false)} centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="font-bold text-[#486DAA] text-base flex items-center space-x-2">
                        <FaKey />
                        <span>Actualizar Contraseña</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-2">
                    <form onSubmit={handleCambiarPass} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-[#486DAA] mb-1 pl-2">Nueva Contraseña</label>
                            <input 
                                type="password"
                                value={passData.nueva_password}
                                onChange={(e) => setPassData({ ...passData, nueva_password: e.target.value })}
                                placeholder="Mínimo 8 caracteres"
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-full py-2.5 px-4 text-xs outline-none focus:border-[#486DAA]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#486DAA] mb-1 pl-2">Confirmar Contraseña</label>
                            <input 
                                type="password"
                                value={passData.confirmar_password}
                                onChange={(e) => setPassData({ ...passData, confirmar_password: e.target.value })}
                                placeholder="Repite la contraseña"
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-full py-2.5 px-4 text-xs outline-none focus:border-[#486DAA]"
                            />
                        </div>

                        <div className="flex justify-end space-x-2 pt-3">
                            <button 
                                type="button" 
                                onClick={() => setShowPassModal(false)}
                                className="bg-slate-100 text-slate-600 font-bold px-5 py-2.5 rounded-full text-xs border-0 cursor-pointer hover:bg-slate-200"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                disabled={passLoading}
                                className="bg-[#486DAA] text-white font-bold px-6 py-2.5 rounded-full text-xs border-0 cursor-pointer hover:bg-[#355386] shadow-sm"
                            >
                                {passLoading ? 'Actualizando...' : 'Guardar'}
                            </button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>

        </div>
    );
};

export default Perfil;
