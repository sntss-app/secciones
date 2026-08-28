import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    FaNewspaper, FaFilePdf, FaImage, FaVideo, FaImages, FaPlus, 
    FaTrash, FaSave, FaArrowLeft, FaCheckCircle, FaExclamationTriangle,
    FaEye, FaEyeSlash, FaThumbtack, FaEdit, FaUpload, FaSync,
    FaChevronLeft, FaChevronRight, FaUser, FaCalendarAlt, FaTimes, FaHeart,
    FaRocket, FaStar
} from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';
import { apiUrl } from '../config';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// ✅ IMPORTAR CSS EXTERNO
import '../css/NoticiasCrear.css';

// ========== COMPONENTE CARRUSEL ==========
const GaleriaCarrusel = ({ items, onRemove }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!items || items.length === 0) return null;

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
    };

    const isVideo = (file) => {
        const videoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
        return videoTypes.includes(file.file?.type) || file.type === 'video';
    };

    return (
        <div className="noticiascrear-carousel-container">
            <div style={{ display: 'flex', transition: 'transform 0.5s ease' }}>
                {items.map((item, index) => (
                    <div
                        key={index}
                        className="noticiascrear-carousel-slide"
                        style={{ display: index === currentIndex ? 'block' : 'none' }}
                    >
                        {isVideo(item) ? (
                            <video controls>
                                <source src={item.preview} />
                            </video>
                        ) : (
                            <img src={item.preview} alt={`Galería ${index}`} />
                        )}
                        <button
                            className="noticiascrear-carousel-remove"
                            onClick={() => onRemove(index)}
                        >
                            <FaTrash size={12} />
                        </button>
                    </div>
                ))}
            </div>

            {items.length > 1 && (
                <>
                    <button
                        className="noticiascrear-carousel-nav noticiascrear-carousel-nav-left"
                        onClick={goToPrevious}
                    >
                        <FaChevronLeft />
                    </button>
                    <button
                        className="noticiascrear-carousel-nav noticiascrear-carousel-nav-right"
                        onClick={goToNext}
                    >
                        <FaChevronRight />
                    </button>
                    <div className="noticiascrear-carousel-dots">
                        {items.map((_, index) => (
                            <button
                                key={index}
                                className={`noticiascrear-carousel-dot ${index === currentIndex ? 'noticiascrear-carousel-dot-active' : 'noticiascrear-carousel-dot-inactive'}`}
                                onClick={() => setCurrentIndex(index)}
                            />
                        ))}
                    </div>
                    <div className="noticiascrear-carousel-counter">
                        {currentIndex + 1} / {items.length}
                    </div>
                </>
            )}
        </div>
    );
};

// ========== COMPONENTE PRINCIPAL ==========
const NoticiasCrear = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [loadingNoticias, setLoadingNoticias] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [editando, setEditando] = useState(false);
    const [noticiaId, setNoticiaId] = useState(null);
    const [noticias, setNoticias] = useState([]);

    const [matricula] = useState(() => localStorage.getItem('matricula') || '');

    const [formData, setFormData] = useState({
        titulo: '',
        resumen: '',
        contenido: '',
        youtubeUrl: '',
        visible: true,
        fijada: false,
    });

    const [imagenFile, setImagenFile] = useState(null);
    const [imagenPreview, setImagenPreview] = useState(null);
    const [imagenName, setImagenName] = useState('');
    const [pdfFile, setPdfFile] = useState(null);
    const [pdfName, setPdfName] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [videoName, setVideoName] = useState('');
    const [galeriaFiles, setGaleriaFiles] = useState([]);
    const [galeriaPreviews, setGaleriaPreviews] = useState([]);
    const [noticiaPreviewSeleccionada, setNoticiaPreviewSeleccionada] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewGalleryIndex, setPreviewGalleryIndex] = useState(0);

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

    const abrirPreviewNoticia = (noticia) => {
        setNoticiaPreviewSeleccionada(noticia);
        setShowPreviewModal(true);
        setPreviewGalleryIndex(0);
    };

    const cerrarPreviewNoticia = () => {
        setShowPreviewModal(false);
        setNoticiaPreviewSeleccionada(null);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
            'video/*': ['.mp4', '.webm', '.ogg', '.mov']
        },
        maxFiles: 10,
        onDrop: (acceptedFiles) => {
            const nuevos = acceptedFiles.map(file => ({
                file,
                preview: URL.createObjectURL(file),
                type: file.type.startsWith('video/') ? 'video' : 'image'
            }));
            const total = galeriaFiles.length + nuevos.length;
            if (total > 10) {
                setErrorMsg('Solo puedes subir hasta 10 archivos en la galería.');
                return;
            }
            setGaleriaFiles([...galeriaFiles, ...nuevos]);
            setGaleriaPreviews([...galeriaPreviews, ...nuevos.map(f => f.preview)]);
        },
        onDropRejected: () => {
            setErrorMsg('Solo se permiten imágenes (JPG, PNG, WEBP) y videos (MP4, WEBM, OGG, MOV).');
        }
    });

    const cargarNoticias = async () => {
        setLoadingNoticias(true);
        try {
            const response = await fetch(apiUrl('/listar_noticias.php?includeHidden=1'));
            const data = await response.json();
            if (data.success) {
                setNoticias(data.noticias || []);
            }
        } catch (error) {
            console.error('Error cargando noticias:', error);
        } finally {
            setLoadingNoticias(false);
        }
    };

    useEffect(() => {
        cargarNoticias();
    }, []);

    const handleImagenChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const tipos = ['image/jpeg', 'image/png', 'image/webp'];
        if (!tipos.includes(file.type)) {
            setErrorMsg('La imagen debe ser JPG, PNG o WEBP.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setErrorMsg('La imagen no debe superar los 5MB.');
            return;
        }
        setImagenFile(file);
        setImagenPreview(URL.createObjectURL(file));
        setImagenName(file.name);
    };

    const handlePdfChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.type !== 'application/pdf') {
            setErrorMsg('El archivo debe ser PDF.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setErrorMsg('El PDF no debe superar los 10MB.');
            return;
        }
        setPdfFile(file);
        setPdfName(file.name);
    };

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const tipos = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
        if (!tipos.includes(file.type)) {
            setErrorMsg('El video debe ser MP4, WEBM, OGG o MOV.');
            return;
        }
        if (file.size > 100 * 1024 * 1024) {
            setErrorMsg('El video no debe superar los 100MB.');
            return;
        }
        setVideoFile(file);
        setVideoName(file.name);
    };

    const removerGaleria = (index) => {
        const nuevos = galeriaFiles.filter((_, i) => i !== index);
        const nuevasPreviews = galeriaPreviews.filter((_, i) => i !== index);
        setGaleriaFiles(nuevos);
        setGaleriaPreviews(nuevasPreviews);
    };

    const editarNoticia = (noticia) => {
        setNoticiaId(noticia.id);
        setEditando(true);
        setFormData({
            titulo: noticia.titulo || '',
            resumen: noticia.resumen || '',
            contenido: noticia.contenido || '',
            youtubeUrl: noticia.youtubeUrl || '',
            visible: noticia.visible !== undefined ? noticia.visible : true,
            fijada: noticia.fijada || false,
        });
        if (noticia.imagenName) {
            setImagenName(noticia.imagenName);
            setImagenPreview(noticia.imagen);
        }
        if (noticia.pdfName) {
            setPdfName(noticia.pdfName);
        }
        if (noticia.videoName) {
            setVideoName(noticia.videoName);
        }
        setGaleriaFiles([]);
        setGaleriaPreviews([]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelarEdicion = () => {
        setEditando(false);
        setNoticiaId(null);
        setFormData({
            titulo: '',
            resumen: '',
            contenido: '',
            youtubeUrl: '',
            visible: true,
            fijada: false,
        });
        setImagenFile(null);
        setImagenPreview(null);
        setImagenName('');
        setPdfFile(null);
        setPdfName('');
        setVideoFile(null);
        setVideoName('');
        setGaleriaFiles([]);
        setGaleriaPreviews([]);
    };

    const renderNoticiaPreviewModal = () => {
        if (!noticiaPreviewSeleccionada) return null;
        const n = noticiaPreviewSeleccionada;

        return (
            <div className="noticiascrear-modal-overlay" onClick={(e) => {
                if (e.target === e.currentTarget) cerrarPreviewNoticia();
            }}>
                <div className="noticiascrear-modal-content">
                    <button className="noticiascrear-modal-close" onClick={cerrarPreviewNoticia}>
                        <FaTimes />
                    </button>

                    {n.imagen && (
                        <img 
                            src={getImageUrl(n.imagen)} 
                            alt={n.titulo} 
                            className="noticiascrear-modal-image"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    )}

                    <h1 className="noticiascrear-modal-title">{n.titulo}</h1>

                    <div className="noticiascrear-modal-meta">
                        <span><FaUser /> {n.autor || 'SNTSS'}</span>
                        <span><FaCalendarAlt /> {n.fecha}</span>
                        <span><FaEye /> {n.vistas || 0} vistas</span>
                        <span><FaHeart style={{ color: '#1877f2' }} /> {n.likes || 0} me gusta</span>
                        {n.fijada && <span className="noticiascrear-badge" style={{ backgroundColor: '#3EAEF4' }}>📌 Fijada</span>}
                    </div>

                    <div className="noticiascrear-modal-body">
                        {n.contenido ? (
                            <div dangerouslySetInnerHTML={{ __html: n.contenido.replace(/\n/g, '<br/>') }} />
                        ) : (
                            <p>{n.resumen}</p>
                        )}
                    </div>

                    {n.pdfPath && (
                        <div style={{ marginTop: '1.5rem' }}>
                            <a href={getImageUrl(n.pdfPath)} target="_blank" rel="noopener noreferrer" className="noticiascrear-btn-outline" style={{ backgroundColor: '#ffc107', color: '#0A0F1E', borderColor: '#ffc107' }}>
                                <FaFilePdf /> Descargar PDF adjunto
                            </a>
                        </div>
                    )}

                    {n.videoPath && (
                        <div style={{ marginTop: '1.5rem' }}>
                            <video controls style={{ width: '100%', maxHeight: '400px', borderRadius: '12px' }}>
                                <source src={getImageUrl(n.videoPath)} />
                                Tu navegador no soporta videos.
                            </video>
                        </div>
                    )}

                    {(() => {
                        const videoUrl = n.youtubeUrl || n.url_video || '';
                        if (!videoUrl) return null;

                        let embedUrl = videoUrl;
                        if (videoUrl.includes('watch?v=')) {
                            embedUrl = videoUrl.replace('watch?v=', 'embed/');
                        } else if (videoUrl.includes('youtu.be/')) {
                            const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
                            if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
                        } else if (videoUrl.includes('embed/')) {
                            embedUrl = videoUrl;
                        }

                        return (
                            <div style={{ marginTop: '1.5rem' }}>
                                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px' }}>
                                    <iframe
                                        src={embedUrl}
                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                        frameBorder="0"
                                        allowFullScreen
                                        title="Video YouTube"
                                    />
                                </div>
                            </div>
                        );
                    })()}

                    {n.galeria && n.galeria.length > 0 && (
                        <div style={{ marginTop: '1.5rem' }}>
                            <h5><FaImages /> Galería ({n.galeria.length} archivos)</h5>
                            <div className="noticiascrear-carousel-container">
                                <div style={{ display: 'flex', transition: 'transform 0.5s ease' }}>
                                    {n.galeria.map((item, idx) => (
                                        <div 
                                            key={idx} 
                                            className="noticiascrear-carousel-slide"
                                            style={{ display: idx === previewGalleryIndex ? 'block' : 'none' }}
                                        >
                                            {item.type === 'video' ? (
                                                <video controls>
                                                    <source src={getImageUrl(item.path)} />
                                                </video>
                                            ) : (
                                                <img 
                                                    src={getImageUrl(item.path)} 
                                                    alt={`Galería ${idx}`}
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {n.galeria.length > 1 && (
                                    <>
                                        <button
                                            className="noticiascrear-carousel-nav noticiascrear-carousel-nav-left"
                                            onClick={() => setPreviewGalleryIndex(prev => prev === 0 ? n.galeria.length - 1 : prev - 1)}
                                        >
                                            <FaChevronLeft />
                                        </button>
                                        <button
                                            className="noticiascrear-carousel-nav noticiascrear-carousel-nav-right"
                                            onClick={() => setPreviewGalleryIndex(prev => prev === n.galeria.length - 1 ? 0 : prev + 1)}
                                        >
                                            <FaChevronRight />
                                        </button>
                                        <div className="noticiascrear-carousel-dots">
                                            {n.galeria.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    className={`noticiascrear-carousel-dot ${idx === previewGalleryIndex ? 'noticiascrear-carousel-dot-active' : 'noticiascrear-carousel-dot-inactive'}`}
                                                    onClick={() => setPreviewGalleryIndex(idx)}
                                                />
                                            ))}
                                        </div>
                                        <div className="noticiascrear-carousel-counter">
                                            {previewGalleryIndex + 1} / {n.galeria.length}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const cambiarVisibilidad = async (id, visible) => {
        try {
            const response = await fetch(apiUrl('/actualizar_status_noticia.php'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, visible })
            });
            const data = await response.json();
            if (data.success) {
                setSuccessMsg(`Noticia ${visible ? 'publicada' : 'oculta'} correctamente.`);
                cargarNoticias();
            } else {
                setErrorMsg(data.message || 'Error al cambiar visibilidad.');
            }
        } catch (error) {
            setErrorMsg('Error de conexión.');
        }
    };

    const cambiarFijada = async (id, fijada) => {
        try {
            const response = await fetch(apiUrl('/actualizar_fijada_noticia.php'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, fijada })
            });
            const data = await response.json();
            if (data.success) {
                setSuccessMsg(`Noticia ${fijada ? 'fijada' : 'desfijada'} correctamente.`);
                cargarNoticias();
            } else {
                setErrorMsg(data.message || 'Error al cambiar fijada.');
            }
        } catch (error) {
            setErrorMsg('Error de conexión.');
        }
    };

    const eliminarNoticia = async (id, titulo) => {
        const result = await Swal.fire({
            title: '🗑️ ¿Eliminar noticia?',
            html: `¿Estás seguro de que deseas eliminar <strong>"${titulo}"</strong>?<br><small style="color:#6c757d;">Esta acción no se puede deshacer. La noticia se moverá a la papelera.</small>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: '✅ Sí, eliminar',
            cancelButtonText: '❌ Cancelar',
            reverseButtons: true,
            background: '#fff',
            backdrop: 'rgba(0,0,0,0.6)',
            showClass: {
                popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutUp'
            }
        });

        if (!result.isConfirmed) return;

        Swal.fire({
            title: 'Eliminando...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const response = await fetch(apiUrl('/eliminar_noticia.php'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            const data = await response.json();
            
            if (data.success) {
                await Swal.fire({
                    title: '✅ ¡Eliminada!',
                    text: 'La noticia ha sido eliminada correctamente.',
                    icon: 'success',
                    confirmButtonColor: '#28a745',
                    confirmButtonText: 'Perfecto',
                    timer: 3000,
                    timerProgressBar: true,
                });
                setSuccessMsg('Noticia eliminada correctamente.');
                cargarNoticias();
                if (noticiaId === id) cancelarEdicion();
            } else {
                await Swal.fire({
                    title: '❌ Error',
                    text: data.message || 'Error al eliminar noticia.',
                    icon: 'error',
                    confirmButtonColor: '#dc3545',
                    confirmButtonText: 'Entendido',
                });
                setErrorMsg(data.message || 'Error al eliminar noticia.');
            }
        } catch (error) {
            await Swal.fire({
                title: '❌ Error de conexión',
                text: 'No se pudo conectar con el servidor. Intenta de nuevo.',
                icon: 'error',
                confirmButtonColor: '#dc3545',
                confirmButtonText: 'Entendido',
            });
            setErrorMsg('Error de conexión.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setLoading(true);

        if (!formData.titulo.trim() || !formData.resumen.trim() || !formData.contenido.trim()) {
            setErrorMsg('Título, resumen y contenido son obligatorios.');
            setLoading(false);
            return;
        }

        try {
            const formPayload = new FormData();
            formPayload.append('matricula', matricula);
            formPayload.append('titulo', formData.titulo.trim());
            formPayload.append('resumen', formData.resumen.trim());
            formPayload.append('contenido', formData.contenido.trim());
            formPayload.append('youtubeUrl', formData.youtubeUrl.trim());
            formPayload.append('visible', formData.visible ? '1' : '0');
            
            if (noticiaId) {
                formPayload.append('id', noticiaId);
            }

            if (imagenFile) formPayload.append('imagen', imagenFile);
            if (pdfFile) formPayload.append('pdf', pdfFile);
            if (videoFile) formPayload.append('video', videoFile);

            if (galeriaFiles.length > 0) {
                galeriaFiles.forEach((item) => {
                    formPayload.append('galeria[]', item.file);
                });
            }

            const response = await fetch(apiUrl('/guardar_noticia.php'), {
                method: 'POST',
                body: formPayload,
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Error al guardar la noticia.');
            }

            setSuccessMsg('Noticia guardada correctamente.');
            cargarNoticias();
            cancelarEdicion();
            setLoading(false);
        } catch (err) {
            setErrorMsg(err.message);
            setLoading(false);
        }
    };

    const getBadgeColor = (visible, fijada) => {
        if (fijada) return '#3EAEF4';
        if (visible) return '#28a745';
        return '#dc3545';
    };

    const getBadgeLabel = (visible, fijada) => {
        if (fijada) return '📌 Fijada';
        if (visible) return '👁️ Visible';
        return '🚫 Oculta';
    };

    return (
        <div className="noticiascrear-wrapper">
            {/* Header Banner Sección 5 */}
            <div className="noticiascrear-header ui-shadow">
                <div className="noticiascrear-header-dots dot-matrix"></div>
                <div className="noticiascrear-header-content">
                    <div className="noticiascrear-header-left">
                        <div className="noticiascrear-header-nav-row">
                            <Link to="/" className="noticiascrear-back-btn">
                                <FaArrowLeft size={12} /> Volver al Inicio
                            </Link>
                            <Link to="/noticias/papelera" className="noticiascrear-trash-btn">
                                <FaTrash size={12} /> Papelera
                            </Link>
                        </div>
                        <div className="noticiascrear-header-titles">
                            <span className="noticiascrear-header-tag">{editando ? 'Modo Edición' : 'Panel de Publicación'}</span>
                            <h2 className="noticiascrear-header-title">
                                {editando ? 'Editar Noticia' : 'Crear Noticia'}
                            </h2>
                            <p className="noticiascrear-header-subtitle">
                                {editando ? 'Actualiza la información y recursos multimedia de la noticia' : 'Publica nuevas noticias, comunicados y recursos multimedia para los agremiados'}
                            </p>
                        </div>
                    </div>
                    <div className="noticiascrear-header-right">
                        <span className="noticiascrear-header-badge">
                            <FaStar style={{ marginRight: '6px' }} /> 
                            {editando ? 'Editando publicación' : 'Nueva publicación'}
                        </span>
                    </div>
                </div>

                {/* Matriz decorativa de puntitos en esquina */}
                <div className="noticiascrear-header-dots-matrix">
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

            {/* Alertas */}
            {errorMsg && (
                <div className="noticiascrear-alert noticiascrear-alert-error">
                    <FaExclamationTriangle /> {errorMsg}
                    <button className="noticiascrear-alert-close" onClick={() => setErrorMsg('')}>✕</button>
                </div>
            )}
            {successMsg && (
                <div className="noticiascrear-alert noticiascrear-alert-success">
                    <FaCheckCircle /> {successMsg}
                    <button className="noticiascrear-alert-close" onClick={() => setSuccessMsg('')}>✕</button>
                </div>
            )}

            {/* Grid */}
            <div className="noticiascrear-grid-2cols">
                {/* Columna: Formulario */}
                <div className="noticiascrear-col-formulario">
                    <div className="noticiascrear-card">
                        <div className="noticiascrear-card-header">
                            <h4 className="noticiascrear-card-header-title">
                                {editando ? <FaEdit /> : <FaPlus />}
                                {editando ? ' Editar' : ' Crear'}
                            </h4>
                            {editando && (
                                <button type="button" className="noticiascrear-btn-danger" onClick={cancelarEdicion}>
                                    Cancelar
                                </button>
                            )}
                        </div>
                        <div className="noticiascrear-card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="noticiascrear-input-group">
                                    <label className="noticiascrear-label">Título *</label>
                                    <input
                                        type="text"
                                        className="noticiascrear-input"
                                        placeholder="Título de la noticia"
                                        value={formData.titulo}
                                        onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                        disabled={loading}
                                        required
                                    />
                                </div>

                                <div className="noticiascrear-input-group">
                                    <label className="noticiascrear-label">Resumen corto *</label>
                                    <textarea
                                        className="noticiascrear-textarea"
                                        rows="2"
                                        placeholder="Breve resumen de la noticia (se muestra en la tarjeta)"
                                        value={formData.resumen}
                                        onChange={(e) => setFormData({ ...formData, resumen: e.target.value })}
                                        disabled={loading}
                                        required
                                    />
                                </div>

                                <div className="noticiascrear-input-group">
                                    <label className="noticiascrear-label">Cuerpo de la noticia *</label>
                                    <textarea
                                        className="noticiascrear-textarea"
                                        rows="6"
                                        placeholder="Contenido completo de la noticia"
                                        value={formData.contenido}
                                        onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
                                        disabled={loading}
                                        required
                                    />
                                </div>

                                <div className="noticiascrear-input-group">
                                    <label className="noticiascrear-label">URL de YouTube (opcional)</label>
                                    <input
                                        type="text"
                                        className="noticiascrear-input"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        value={formData.youtubeUrl}
                                        onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                                        disabled={loading}
                                    />
                                </div>

                                <div className="noticiascrear-toggle-group">
                                    <button
                                        type="button"
                                        className={`noticiascrear-toggle-btn ${formData.visible ? 'noticiascrear-toggle-btn-active' : ''}`}
                                        onClick={() => setFormData({ ...formData, visible: !formData.visible })}
                                    >
                                        {formData.visible ? <FaEye /> : <FaEyeSlash />}
                                        {formData.visible ? 'Visible' : 'Oculta'}
                                    </button>
                                    <button
                                        type="button"
                                        className={`noticiascrear-toggle-btn ${formData.fijada ? 'noticiascrear-toggle-btn-active' : ''}`}
                                        onClick={() => setFormData({ ...formData, fijada: !formData.fijada })}
                                    >
                                        <FaThumbtack />
                                        {formData.fijada ? 'Fijada' : 'Fijar'}
                                    </button>
                                </div>

                                <div className="noticiascrear-input-group">
                                    <label className="noticiascrear-label"><FaImage /> Imagen destacada</label>
                                    <input
                                        type="file"
                                        className="noticiascrear-input"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleImagenChange}
                                        disabled={loading}
                                    />
                                    <small className="noticiascrear-text-muted" style={{ fontSize: '0.7rem' }}>JPG, PNG o WEBP. Máx 5MB.</small>
                                    {imagenPreview && (
                                        <div className="noticiascrear-mt-1">
                                            <img src={imagenPreview} alt="Vista previa" style={{ maxHeight: '100px', borderRadius: '8px' }} />
                                            <p className="noticiascrear-text-success" style={{ fontSize: '0.75rem' }}>✅ {imagenName}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="noticiascrear-input-group">
                                    <label className="noticiascrear-label"><FaFilePdf /> PDF adjunto</label>
                                    <input
                                        type="file"
                                        className="noticiascrear-input"
                                        accept=".pdf"
                                        onChange={handlePdfChange}
                                        disabled={loading}
                                    />
                                    <small className="noticiascrear-text-muted" style={{ fontSize: '0.7rem' }}>PDF. Máx 10MB.</small>
                                    {pdfName && <p className="noticiascrear-text-success" style={{ fontSize: '0.75rem' }}>✅ {pdfName}</p>}
                                </div>

                                <div className="noticiascrear-input-group">
                                    <label className="noticiascrear-label"><FaVideo /> Video local</label>
                                    <input
                                        type="file"
                                        className="noticiascrear-input"
                                        accept="video/mp4,video/webm,video/ogg,video/quicktime"
                                        onChange={handleVideoChange}
                                        disabled={loading}
                                    />
                                    <small className="noticiascrear-text-muted" style={{ fontSize: '0.7rem' }}>MP4, WEBM, OGG o MOV. Máx 100MB.</small>
                                    {videoName && <p className="noticiascrear-text-success" style={{ fontSize: '0.75rem' }}>✅ {videoName}</p>}
                                </div>

                                <div className="noticiascrear-input-group">
                                    <label className="noticiascrear-label"><FaImages /> Galería (hasta 10 archivos)</label>
                                    <div 
                                        {...getRootProps()} 
                                        className={`noticiascrear-dropzone ${isDragActive ? 'noticiascrear-dropzone-active' : ''}`}
                                    >
                                        <input {...getInputProps()} />
                                        <div className="noticiascrear-dropzone-icon"><FaUpload /></div>
                                        {isDragActive ? (
                                            <p>Suelta los archivos aquí...</p>
                                        ) : (
                                            <p style={{ fontSize: '0.85rem' }}>Arrastra imágenes o videos, o haz clic para seleccionarlos</p>
                                        )}
                                        <small className="noticiascrear-text-muted" style={{ fontSize: '0.7rem' }}>Máx 10 archivos. Imágenes: JPG, PNG, WEBP. Videos: MP4, WEBM, OGG, MOV.</small>
                                    </div>
                                    {galeriaPreviews.length > 0 && (
                                        <GaleriaCarrusel 
                                            items={galeriaFiles.map((file, index) => ({
                                                ...file,
                                                preview: galeriaPreviews[index]
                                            }))}
                                            onRemove={removerGaleria}
                                        />
                                    )}
                                </div>

                                <div className="noticiascrear-flex-row">
                                    <button
                                        type="submit"
                                        className="noticiascrear-btn-primary noticiascrear-flex-grow"
                                        disabled={loading}
                                    >
                                        {loading ? 'Guardando...' : <><FaSave /> Guardar</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Columna: Lista de Noticias */}
                <div className="noticiascrear-col-lista">
                    <div className="noticiascrear-card">
                        <div className="noticiascrear-card-header">
                            <h4 className="noticiascrear-card-header-title">
                                <FaNewspaper /> Lista de Noticias
                            </h4>
                            <button type="button" className="noticiascrear-btn-primary" onClick={cargarNoticias} disabled={loadingNoticias} style={{ width: 'auto', padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
                                <FaSync /> Actualizar
                            </button>
                        </div>
                        <div className="noticiascrear-card-body">
                            {loadingNoticias ? (
                                <div className="noticiascrear-loading">
                                    <div className="noticiascrear-spinner" role="status" />
                                    <span>Cargando noticias...</span>
                                </div>
                            ) : noticias.length === 0 ? (
                                <div className="noticiascrear-text-center noticiascrear-p-2" style={{ color: '#6c757d' }}>
                                    <FaNewspaper style={{ fontSize: '3rem', color: '#ddd', marginBottom: '1rem' }} />
                                    <p>No hay noticias creadas aún.</p>
                                </div>
                            ) : (
                                noticias.map((noticia) => (
                                    <div key={noticia.id} className="noticiascrear-noticia-item">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <p className="noticiascrear-noticia-titulo">{noticia.titulo}</p>
                                                <div className="noticiascrear-noticia-meta">
                                                    <span>{noticia.autor || 'Sin autor'}</span>
                                                    <span>{noticia.fecha}</span>
                                                    <span>👁️ {noticia.vistas} vistas</span>
                                                    <span className="noticiascrear-badge" style={{ backgroundColor: getBadgeColor(noticia.visible, noticia.fijada) }}>
                                                        {getBadgeLabel(noticia.visible, noticia.fijada)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="noticiascrear-noticia-actions">
                                            <button 
                                                className="noticiascrear-noticia-action-btn noticiascrear-noticia-action-btn-edit"
                                                onClick={() => editarNoticia(noticia)}
                                            >
                                                <FaEdit /> Editar
                                            </button>
                                            <button 
                                                className="noticiascrear-noticia-action-btn noticiascrear-noticia-action-btn-preview"
                                                onClick={() => abrirPreviewNoticia(noticia)}
                                            >
                                                <FaEye /> Vista Previa
                                            </button>
                                            <button 
                                                className="noticiascrear-noticia-action-btn noticiascrear-noticia-action-btn-toggle"
                                                onClick={() => cambiarVisibilidad(noticia.id, !noticia.visible)}
                                            >
                                                {noticia.visible ? <FaEyeSlash /> : <FaEye />}
                                                {noticia.visible ? ' Ocultar' : ' Publicar'}
                                            </button>
                                            <button 
                                                className="noticiascrear-noticia-action-btn noticiascrear-noticia-action-btn-pin"
                                                onClick={() => cambiarFijada(noticia.id, !noticia.fijada)}
                                            >
                                                <FaThumbtack />
                                                {noticia.fijada ? ' Desfijar' : ' Fijar'}
                                            </button>
                                            <button 
                                                className="noticiascrear-noticia-action-btn noticiascrear-noticia-action-btn-delete"
                                                onClick={() => eliminarNoticia(noticia.id, noticia.titulo)}
                                            >
                                                <FaTrash /> Eliminar
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de preview */}
            {showPreviewModal && renderNoticiaPreviewModal()}
        </div>
    );
};

export default NoticiasCrear;