import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    FaUser, FaIdCard, FaBuilding, FaPhone, FaEnvelope, FaFilePdf, 
    FaCheckCircle, FaExclamationTriangle, FaArrowLeft, FaSave,
    FaUserPlus, FaCalendarAlt, FaClock,
    FaInfoCircle, FaDownload, FaShieldAlt, FaStar,
    FaRocket, FaUsers, FaGift, FaSync
} from 'react-icons/fa';
import { apiUrl } from '../config';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// ✅ IMPORTAR CSS EXTERNO
import '../css/Clausula79Bis.css';

const Clausula79Bis = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [registroExistente, setRegistroExistente] = useState(null);
    const [matricula, setMatricula] = useState('');
    const [usuario, setUsuario] = useState(null);
    const [cargandoRegistro, setCargandoRegistro] = useState(true);
    const [modoEdicion, setModoEdicion] = useState(false);

    const [formData, setFormData] = useState({
        telefono: '',
        correo: '',
        tiene_acompanante: false,
        nombre_acompanante: '',
    });

    const [tarjetonFile, setTarjetonFile] = useState(null);
    const [tarjetonName, setTarjetonName] = useState('');
    const [ineFile, setIneFile] = useState(null);
    const [ineName, setIneName] = useState('');

    const categoriasFestejo = [
        'Intendencia',
        'Limpieza e Higiene',
        'Camilleria',
        'Transportes',
        'Conservacion',
        'Polivalentes',
        'y sus escalafones'
    ];

    useEffect(() => {
        const matriculaStorage = localStorage.getItem('matricula');
        if (!matriculaStorage) {
            navigate('/login');
            return;
        }
        setMatricula(matriculaStorage);
        cargarUsuario(matriculaStorage);
        verificarRegistro(matriculaStorage);
    }, []);

    const cargarUsuario = async (matricula) => {
        try {
            const response = await fetch(apiUrl(`/obtener_perfil.php?matricula=${encodeURIComponent(matricula)}`));
            const data = await response.json();
            if (data.success) {
                setUsuario(data.usuario);
                setFormData(prev => ({
                    ...prev,
                    telefono: data.usuario.telefono || '',
                    correo: data.usuario.correo || ''
                }));
            }
        } catch (error) {
            console.error('Error cargando usuario:', error);
        }
    };

    const verificarRegistro = async (matricula) => {
        setCargandoRegistro(true);
        try {
            const response = await fetch(apiUrl(`/clausula79bis_obtener.php?matricula=${encodeURIComponent(matricula)}`));
            const data = await response.json();
            console.log('📦 Respuesta obtener:', data);
            
            if (data.success && data.registro) {
                console.log('✅ ID del registro:', data.registro.id);
                console.log('✅ Registro completo:', data.registro);
                setRegistroExistente(data.registro);
            }
        } catch (error) {
            console.error('Error verificando registro:', error);
            setRegistroExistente(null);
        } finally {
            setCargandoRegistro(false);
        }
    };

    const getStatusInfo = (estatus) => {
        const map = {
            1: { color: '#6c757d', icon: <FaClock />, label: 'Preregistro', bg: 'linear-gradient(135deg, #6c757d, #495057)' },
            2: { color: '#28a745', icon: <FaCheckCircle />, label: '✅ Aprobado', bg: 'linear-gradient(135deg, #28a745, #20c997)' },
            3: { color: '#ffc107', icon: <FaExclamationTriangle />, label: 'Observaciones', bg: 'linear-gradient(135deg, #ffc107, #fd7e14)' },
            4: { color: '#fd7e14', icon: <FaInfoCircle />, label: 'Incompleto', bg: 'linear-gradient(135deg, #fd7e14, #dc3545)' },
            5: { color: '#dc3545', icon: <FaExclamationTriangle />, label: 'Denegado', bg: 'linear-gradient(135deg, #dc3545, #c82333)' }
        };
        return map[estatus] || map[1];
    };

    const handleTarjetonChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                Swal.fire({
                    title: '⚠️ Formato incorrecto',
                    text: 'El tarjetón debe ser un archivo PDF.',
                    icon: 'warning',
                    confirmButtonColor: '#ffc107',
                });
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                Swal.fire({
                    title: '⚠️ Archivo muy grande',
                    text: 'El tarjetón no debe superar los 5MB.',
                    icon: 'warning',
                    confirmButtonColor: '#ffc107',
                });
                return;
            }
            setTarjetonFile(file);
            setTarjetonName(file.name);
        }
    };

    const handleIneChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                Swal.fire({
                    title: '⚠️ Formato incorrecto',
                    text: 'El INE debe ser un archivo PDF.',
                    icon: 'warning',
                    confirmButtonColor: '#ffc107',
                });
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                Swal.fire({
                    title: '⚠️ Archivo muy grande',
                    text: 'El INE no debe superar los 5MB.',
                    icon: 'warning',
                    confirmButtonColor: '#ffc107',
                });
                return;
            }
            setIneFile(file);
            setIneName(file.name);
        }
    };

    const activarEdicion = () => {
        setModoEdicion(true);
        setTarjetonFile(null);
        setTarjetonName('');
        setIneFile(null);
        setIneName('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelarEdicion = () => {
        setModoEdicion(false);
        if (registroExistente) {
            setFormData({
                telefono: registroExistente.telefono || '',
                correo: registroExistente.correo || '',
                tiene_acompanante: registroExistente.tiene_acompanante == 1,
                nombre_acompanante: registroExistente.nombre_acompanante || ''
            });
            if (registroExistente.tarjeton_ruta) setTarjetonName('Tarjetón cargado');
            if (registroExistente.ine_ruta) setIneName('INE cargado');
            setTarjetonFile(null);
            setIneFile(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setLoading(true);

        if (!formData.telefono || !/^\d{10}$/.test(formData.telefono)) {
            await Swal.fire({
                title: '⚠️ Teléfono inválido',
                text: 'El teléfono debe tener exactamente 10 dígitos numéricos.',
                icon: 'warning',
                confirmButtonColor: '#ffc107',
            });
            setLoading(false);
            return;
        }

        if (!formData.correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
            await Swal.fire({
                title: '⚠️ Correo inválido',
                text: 'Ingresa un correo electrónico válido.',
                icon: 'warning',
                confirmButtonColor: '#ffc107',
            });
            setLoading(false);
            return;
        }

        if (formData.tiene_acompanante && !formData.nombre_acompanante.trim()) {
            await Swal.fire({
                title: '⚠️ Acompañante',
                text: 'Ingresa el nombre del acompañante.',
                icon: 'warning',
                confirmButtonColor: '#ffc107',
            });
            setLoading(false);
            return;
        }

        if (!tarjetonFile && !registroExistente?.tarjeton_ruta) {
            await Swal.fire({
                title: '⚠️ Documento requerido',
                text: 'Debes subir tu último tarjetón de pago (PDF).',
                icon: 'warning',
                confirmButtonColor: '#ffc107',
            });
            setLoading(false);
            return;
        }

        if (!ineFile && !registroExistente?.ine_ruta) {
            await Swal.fire({
                title: '⚠️ Documento requerido',
                text: 'Debes subir tu INE (PDF).',
                icon: 'warning',
                confirmButtonColor: '#ffc107',
            });
            setLoading(false);
            return;
        }

        try {
            const payload = {
                matricula: matricula,
                telefono: formData.telefono,
                correo: formData.correo,
                tiene_acompanante: formData.tiene_acompanante ? 1 : 0,
                nombre_acompanante: formData.nombre_acompanante
            };

            console.log('📦 Payload inicial:', payload);
            console.log('📦 modoEdicion:', modoEdicion);
            console.log('📦 registroExistente:', registroExistente);

            let endpoint = '/clausula79bis_guardar.php';
            let successMessage = '¡Registro aprobado!';

            if (registroExistente) {
                console.log('🔍 REGISTRO EXISTENTE - USANDO ACTUALIZAR');
                console.log('🔍 ID del registro:', registroExistente.id);
                
                const id = registroExistente.id || registroExistente.ID;
                if (!id) {
                    throw new Error('No se encontró el ID del registro');
                }
                
                payload.id = id;
                endpoint = '/clausula79bis_actualizar.php';
                successMessage = '¡Registro actualizado!';
                
                console.log('📦 Payload final con ID:', payload);
            }

            console.log('📤 Enviando a:', endpoint);
            console.log('📤 Payload:', JSON.stringify(payload, null, 2));

            const response = await fetch(apiUrl(endpoint), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            console.log('📥 Respuesta:', data);

            if (!data.success) {
                throw new Error(data.message || 'Error al guardar el registro');
            }

            if (tarjetonFile) {
                const formDataTarjeton = new FormData();
                formDataTarjeton.append('matricula', matricula);
                formDataTarjeton.append('tipo', '1');
                formDataTarjeton.append('tarjeton', tarjetonFile);

                await fetch(apiUrl('/clausula79bis_subir_documentos.php'), {
                    method: 'POST',
                    body: formDataTarjeton
                });
            }

            if (ineFile) {
                const formDataIne = new FormData();
                formDataIne.append('matricula', matricula);
                formDataIne.append('tipo', '2');
                formDataIne.append('ine', ineFile);

                await fetch(apiUrl('/clausula79bis_subir_documentos.php'), {
                    method: 'POST',
                    body: formDataIne
                });
            }

            await verificarRegistro(matricula);
            setModoEdicion(false);

            await Swal.fire({
                title: '✅ ¡Éxito!',
                text: successMessage,
                icon: 'success',
                confirmButtonColor: '#28a745',
                timer: 3000,
                timerProgressBar: true,
            });

        } catch (error) {
            console.error('❌ Error:', error);
            await Swal.fire({
                title: '❌ Error',
                text: error.message,
                icon: 'error',
                confirmButtonColor: '#dc3545',
            });
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (cargandoRegistro) {
        return (
            <div className="clausula-container">
                <div className="clausula-loading">
                    <div className="clausula-spinner" role="status" />
                    <p className="clausula-loading-text">Verificando tu registro...</p>
                </div>
            </div>
        );
    }

    if (registroExistente && (modoEdicion || registroExistente.estatus === 3)) {
        const statusInfo = getStatusInfo(registroExistente.estatus);
        
        return (
            <div className="clausula-wrapper">
                {/* Header Banner Sección 5 */}
                <div className="clausula-header ui-shadow">
                    <div className="clausula-header-dots dot-matrix"></div>
                    <div className="clausula-header-content">
                        <div className="clausula-header-left">
                            <Link to="/" className="clausula-back-button">
                                <FaArrowLeft size={12} /> Volver al Inicio
                            </Link>
                            <div className="clausula-header-titles">
                                <span className="clausula-header-tag">Evento Conmemorativo</span>
                                <h1 className="clausula-title">
                                    Cláusula 79Bis
                                </h1>
                                <p className="clausula-subtitle">
                                    Festejo de Intendencia, Limpieza e Higiene, Camillería, Transportes, Conservación, Polivalentes y sus escalafones
                                </p>
                            </div>
                        </div>
                        <div className="clausula-header-right">
                            <span className="clausula-status-badge" style={{ background: statusInfo.bg }}>
                                {statusInfo.icon} {statusInfo.label}
                            </span>
                        </div>
                    </div>

                    {/* Matriz decorativa de puntitos en esquina */}
                    <div className="clausula-header-dots-matrix">
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

                <div className="clausula-card">
                    <div className="clausula-card-body">
                        {registroExistente.observaciones && (
                            <div className="clausula-observaciones-box">
                                <strong>📝 Observaciones del validador:</strong>
                                <p className="clausula-observaciones-text">{registroExistente.observaciones}</p>
                                <p className="clausula-observaciones-hint">
                                    ⚠️ Corrige los documentos y vuelve a enviar tu registro.
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="clausula-grid-2cols">
                                <div className="clausula-input-group">
                                    <label className="clausula-label"><FaUser className="clausula-label-icon" /> Nombre</label>
                                    <input className="clausula-input clausula-input-readonly" value={usuario?.nombre || ''} readOnly />
                                </div>
                                <div className="clausula-input-group">
                                    <label className="clausula-label"><FaIdCard className="clausula-label-icon" /> Matrícula</label>
                                    <input className="clausula-input clausula-input-readonly" value={matricula} readOnly />
                                </div>
                                <div className="clausula-input-group">
                                    <label className="clausula-label"><FaBuilding className="clausula-label-icon" /> Adscripción</label>
                                    <input className="clausula-input clausula-input-readonly" value={usuario?.adscripcion || ''} readOnly />
                                </div>
                                <div className="clausula-input-group">
                                    <label className="clausula-label">Categoría</label>
                                    <input className="clausula-input clausula-input-readonly" value={usuario?.categoria || ''} readOnly />
                                </div>
                            </div>

                            <div className="clausula-grid-2cols">
                                <div className="clausula-input-group">
                                    <label className="clausula-label">
                                        <FaPhone className="clausula-label-icon" /> Teléfono *
                                    </label>
                                    <input
                                        type="text"
                                        className="clausula-input"
                                        placeholder="10 dígitos numéricos"
                                        value={formData.telefono}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '');
                                            setFormData({ ...formData, telefono: value.slice(0, 10) });
                                        }}
                                        disabled={loading}
                                        required
                                        maxLength={10}
                                    />
                                    <small className="clausula-small-text">📱 10 dígitos numéricos</small>
                                </div>
                                <div className="clausula-input-group">
                                    <label className="clausula-label">
                                        <FaEnvelope className="clausula-label-icon" /> Correo *
                                    </label>
                                    <input
                                        type="email"
                                        className="clausula-input"
                                        placeholder="tu@email.com"
                                        value={formData.correo}
                                        onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </div>

                            <div 
                                className="clausula-checkbox-wrapper"
                                onClick={() => setFormData({ ...formData, tiene_acompanante: !formData.tiene_acompanante })}
                            >
                                <input
                                    type="checkbox"
                                    className="clausula-checkbox-hidden"
                                    id="tiene_acompanante"
                                    checked={formData.tiene_acompanante}
                                    onChange={() => {}}
                                />
                                <div className={`clausula-checkbox-custom ${formData.tiene_acompanante ? 'clausula-checkbox-custom-checked' : 'clausula-checkbox-custom-unchecked'}`}>
                                    {formData.tiene_acompanante && <FaCheckCircle style={{ color: 'white', fontSize: '0.9rem' }} />}
                                </div>
                                <div>
                                    <div className="clausula-checkbox-label">
                                        <FaUserPlus style={{ color: '#3EAEF4', marginRight: '0.3rem' }} />
                                        ¿Llevarás acompañante?
                                    </div>
                                    <div className="clausula-checkbox-subtext">Si asistes con alguien más, regístralo aquí</div>
                                </div>
                            </div>

                            {formData.tiene_acompanante && (
                                <div className="clausula-input-group">
                                    <label className="clausula-label"><FaUserPlus className="clausula-label-icon" /> Nombre del acompañante *</label>
                                    <input
                                        type="text"
                                        className="clausula-input"
                                        placeholder="Nombre completo del acompañante"
                                        value={formData.nombre_acompanante}
                                        onChange={(e) => setFormData({ ...formData, nombre_acompanante: e.target.value })}
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            )}

                            <div className="clausula-grid-2cols">
                                <div className="clausula-input-group">
                                    <label className="clausula-label"><FaFilePdf style={{ color: '#dc3545', marginRight: '0.3rem' }} /> Tarjetón de pago (PDF) *</label>
                                    <input
                                        type="file"
                                        className="clausula-file-input"
                                        accept=".pdf"
                                        onChange={handleTarjetonChange}
                                        disabled={loading}
                                        required={!registroExistente?.tarjeton_ruta}
                                    />
                                    {tarjetonName && <div className="clausula-file-status"><FaCheckCircle /> {tarjetonName}</div>}
                                    <small className="clausula-small-text">📄 Máximo 5MB. Solo PDF.</small>
                                </div>
                                <div className="clausula-input-group">
                                    <label className="clausula-label"><FaFilePdf style={{ color: '#dc3545', marginRight: '0.3rem' }} /> INE (PDF) *</label>
                                    <input
                                        type="file"
                                        className="clausula-file-input"
                                        accept=".pdf"
                                        onChange={handleIneChange}
                                        disabled={loading}
                                        required={!registroExistente?.ine_ruta}
                                    />
                                    {ineName && <div className="clausula-file-status"><FaCheckCircle /> {ineName}</div>}
                                    <small className="clausula-small-text">🪪 Máximo 5MB. Solo PDF.</small>
                                </div>
                            </div>

                            <div className="clausula-flex-row">
                                <button 
                                    type="submit" 
                                    className="clausula-btn-primary clausula-flex-grow"
                                    disabled={loading}
                                >
                                    {loading ? 'Guardando...' : <><FaSave /> Actualizar Registro</>}
                                </button>
                                <button 
                                    type="button" 
                                    className="clausula-btn-cancelar"
                                    onClick={cancelarEdicion}
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    if (registroExistente) {
        const statusInfo = getStatusInfo(registroExistente.estatus);
        const isAprobado = registroExistente.estatus === 2;
        const isObservaciones = registroExistente.estatus === 3;

        return (
            <div className="clausula-wrapper">
                {/* Header Banner Sección 5 */}
                <div className="clausula-header ui-shadow">
                    <div className="clausula-header-dots dot-matrix"></div>
                    <div className="clausula-header-content">
                        <div className="clausula-header-left">
                            <Link to="/" className="clausula-back-button">
                                <FaArrowLeft size={12} /> Volver al Inicio
                            </Link>
                            <div className="clausula-header-titles">
                                <span className="clausula-header-tag">Evento Conmemorativo</span>
                                <h1 className="clausula-title">
                                    Cláusula 79Bis
                                </h1>
                                <p className="clausula-subtitle">
                                    Festejo de Intendencia, Limpieza e Higiene, Camillería, Transportes, Conservación, Polivalentes y sus escalafones
                                </p>
                            </div>
                        </div>
                        <div className="clausula-header-right">
                            <span className="clausula-status-badge" style={{ background: statusInfo.bg }}>
                                {statusInfo.icon} {statusInfo.label}
                            </span>
                        </div>
                    </div>

                    {/* Matriz decorativa de puntitos en esquina */}
                    <div className="clausula-header-dots-matrix">
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

                {registroExistente.observaciones && (
                    <div className="clausula-observaciones-box" style={{ marginBottom: '1.5rem' }}>
                        <FaExclamationTriangle style={{ color: '#856404', marginTop: '0.15rem', flexShrink: 0 }} />
                        <div>
                            <strong>📝 Observaciones del validador:</strong>
                            <p className="clausula-observaciones-text">{registroExistente.observaciones}</p>
                            {isObservaciones && (
                                <p className="clausula-observaciones-hint">
                                    ⚠️ Corrige los documentos y vuelve a enviar tu registro.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                <div className="clausula-card">
                    <div className="clausula-card-body">
                        <div className="clausula-status-card">
                            <FaCalendarAlt style={{ color: '#3EAEF4' }} />
                            <span className="clausula-text-muted" style={{ fontSize: '0.9rem' }}>
                                {registroExistente.fecha_registro && 
                                    `Registrado el ${new Date(registroExistente.fecha_registro).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}`
                                }
                            </span>
                            {registroExistente.fecha_validacion && (
                                <>
                                    <span style={{ color: '#dee2e6' }}>|</span>
                                    <FaCheckCircle style={{ color: '#28a745' }} />
                                    <span className="clausula-text-muted" style={{ fontSize: '0.9rem' }}>
                                        Validado el {new Date(registroExistente.fecha_validacion).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                </>
                            )}
                        </div>

                        <div className="clausula-grid-2cols">
                            <div className="clausula-input-group">
                                <label className="clausula-label"><FaUser className="clausula-label-icon" /> Nombre</label>
                                <input className="clausula-input clausula-input-readonly" value={usuario?.nombre || ''} readOnly />
                            </div>
                            <div className="clausula-input-group">
                                <label className="clausula-label"><FaIdCard className="clausula-label-icon" /> Matrícula</label>
                                <input className="clausula-input clausula-input-readonly" value={matricula} readOnly />
                            </div>
                            <div className="clausula-input-group">
                                <label className="clausula-label"><FaBuilding className="clausula-label-icon" /> Adscripción</label>
                                <input className="clausula-input clausula-input-readonly" value={usuario?.adscripcion || ''} readOnly />
                            </div>
                            <div className="clausula-input-group">
                                <label className="clausula-label">Categoría</label>
                                <input className="clausula-input clausula-input-readonly" value={usuario?.categoria || ''} readOnly />
                            </div>
                            <div className="clausula-input-group">
                                <label className="clausula-label"><FaPhone className="clausula-label-icon" /> Teléfono</label>
                                <input className="clausula-input clausula-input-readonly" value={registroExistente.telefono || ''} readOnly />
                            </div>
                            <div className="clausula-input-group">
                                <label className="clausula-label"><FaEnvelope className="clausula-label-icon" /> Correo</label>
                                <input className="clausula-input clausula-input-readonly" value={registroExistente.correo || ''} readOnly />
                            </div>
                        </div>

                        {registroExistente.tiene_acompanante == 1 && (
                            <div className="clausula-input-group">
                                <label className="clausula-label"><FaUserPlus className="clausula-label-icon" /> Acompañante</label>
                                <input className="clausula-input clausula-input-readonly" value={registroExistente.nombre_acompanante || ''} readOnly />
                            </div>
                        )}

                        {isObservaciones && (
                            <div style={{ marginTop: '1.5rem' }}>
                                <button 
                                    className="clausula-btn-reintentar"
                                    onClick={activarEdicion}
                                >
                                    <FaSync /> Reintentar - Corregir documentos
                                </button>
                            </div>
                        )}

                        {isAprobado && (
                            <div style={{ marginTop: '1.5rem' }}>
                                <button 
                                    className="clausula-btn-download"
                                    onClick={() => {
                                        alert('Próximamente: Generar QR para el evento');
                                    }}
                                >
                                    <FaDownload /> Generar QR de entrada
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="clausula-wrapper">
            {/* Header Banner Sección 5 */}
            <div className="clausula-header ui-shadow">
                <div className="clausula-header-dots dot-matrix"></div>
                <div className="clausula-header-content">
                    <div className="clausula-header-left">
                        <Link to="/" className="clausula-back-button">
                            <FaArrowLeft size={12} /> Volver al Inicio
                        </Link>
                        <div className="clausula-header-titles">
                            <span className="clausula-header-tag">Evento Conmemorativo</span>
                            <h1 className="clausula-title">
                                Cláusula 79Bis
                            </h1>
                            <p className="clausula-subtitle">
                                Festejo de Intendencia, Limpieza e Higiene, Camillería, Transportes, Conservación, Polivalentes y sus escalafones
                            </p>
                        </div>
                    </div>
                    <div className="clausula-header-right">
                        <span className="clausula-status-badge" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
                            <FaRocket /> Nuevo Registro
                        </span>
                    </div>
                </div>

                {/* Matriz decorativa de puntitos en esquina */}
                <div className="clausula-header-dots-matrix">
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

            <div className="clausula-card">
                <div className="clausula-card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="clausula-grid-2cols">
                            <div className="clausula-input-group">
                                <label className="clausula-label"><FaUser className="clausula-label-icon" /> Nombre</label>
                                <input className="clausula-input clausula-input-readonly" value={usuario?.nombre || ''} readOnly />
                            </div>
                            <div className="clausula-input-group">
                                <label className="clausula-label"><FaIdCard className="clausula-label-icon" /> Matrícula</label>
                                <input className="clausula-input clausula-input-readonly" value={matricula} readOnly />
                            </div>
                            <div className="clausula-input-group">
                                <label className="clausula-label"><FaBuilding className="clausula-label-icon" /> Adscripción</label>
                                <input className="clausula-input clausula-input-readonly" value={usuario?.adscripcion || ''} readOnly />
                            </div>
                            <div className="clausula-input-group">
                                <label className="clausula-label">Categoría</label>
                                <input className="clausula-input clausula-input-readonly" value={usuario?.categoria || ''} readOnly />
                            </div>
                        </div>

                        <div className="clausula-grid-2cols">
                            <div className="clausula-input-group">
                                <label className="clausula-label">
                                    <FaPhone className="clausula-label-icon" /> Teléfono *
                                </label>
                                <input
                                    type="text"
                                    className="clausula-input"
                                    placeholder="10 dígitos numéricos"
                                    value={formData.telefono}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        setFormData({ ...formData, telefono: value.slice(0, 10) });
                                    }}
                                    disabled={loading}
                                    required
                                    maxLength={10}
                                />
                                <small className="clausula-small-text">📱 10 dígitos numéricos</small>
                            </div>
                            <div className="clausula-input-group">
                                <label className="clausula-label">
                                    <FaEnvelope className="clausula-label-icon" /> Correo *
                                </label>
                                <input
                                    type="email"
                                    className="clausula-input"
                                    placeholder="tu@email.com"
                                    value={formData.correo}
                                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        <div 
                            className="clausula-checkbox-wrapper"
                            onClick={() => setFormData({ ...formData, tiene_acompanante: !formData.tiene_acompanante })}
                        >
                            <input
                                type="checkbox"
                                className="clausula-checkbox-hidden"
                                id="tiene_acompanante"
                                checked={formData.tiene_acompanante}
                                onChange={() => {}}
                            />
                            <div className={`clausula-checkbox-custom ${formData.tiene_acompanante ? 'clausula-checkbox-custom-checked' : 'clausula-checkbox-custom-unchecked'}`}>
                                {formData.tiene_acompanante && <FaCheckCircle style={{ color: 'white', fontSize: '0.9rem' }} />}
                            </div>
                            <div>
                                <div className="clausula-checkbox-label">
                                    <FaUserPlus style={{ color: '#3EAEF4', marginRight: '0.3rem' }} />
                                    ¿Llevarás acompañante?
                                </div>
                                <div className="clausula-checkbox-subtext">Si asistes con alguien más, regístralo aquí</div>
                            </div>
                        </div>

                        {formData.tiene_acompanante && (
                            <div className="clausula-input-group">
                                <label className="clausula-label"><FaUserPlus className="clausula-label-icon" /> Nombre del acompañante *</label>
                                <input
                                    type="text"
                                    className="clausula-input"
                                    placeholder="Nombre completo del acompañante"
                                    value={formData.nombre_acompanante}
                                    onChange={(e) => setFormData({ ...formData, nombre_acompanante: e.target.value })}
                                    disabled={loading}
                                    required
                                />
                            </div>
                        )}

                        <div className="clausula-grid-2cols">
                            <div className="clausula-input-group">
                                <label className="clausula-label"><FaFilePdf style={{ color: '#dc3545', marginRight: '0.3rem' }} /> Tarjetón de pago (PDF) *</label>
                                <input
                                    type="file"
                                    className="clausula-file-input"
                                    accept=".pdf"
                                    onChange={handleTarjetonChange}
                                    disabled={loading}
                                    required={!registroExistente?.tarjeton_ruta}
                                />
                                {tarjetonName && <div className="clausula-file-status"><FaCheckCircle /> {tarjetonName}</div>}
                                <small className="clausula-small-text">📄 Máximo 5MB. Solo PDF.</small>
                            </div>
                            <div className="clausula-input-group">
                                <label className="clausula-label"><FaFilePdf style={{ color: '#dc3545', marginRight: '0.3rem' }} /> INE (PDF) *</label>
                                <input
                                    type="file"
                                    className="clausula-file-input"
                                    accept=".pdf"
                                    onChange={handleIneChange}
                                    disabled={loading}
                                    required={!registroExistente?.ine_ruta}
                                />
                                {ineName && <div className="clausula-file-status"><FaCheckCircle /> {ineName}</div>}
                                <small className="clausula-small-text">🪪 Máximo 5MB. Solo PDF.</small>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="clausula-btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Guardando...' : <><FaSave /> Registrar</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Clausula79Bis;