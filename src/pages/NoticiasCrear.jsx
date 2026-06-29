import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    FaNewspaper, FaFilePdf, FaImage, FaVideo, FaImages, FaPlus, 
    FaTrash, FaSave, FaArrowLeft, FaCheckCircle, FaExclamationTriangle,
    FaEye, FaEyeSlash, FaThumbtack, FaEdit, FaUpload, FaSync,
    FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';
import { apiUrl } from '../config';

// Estilos
const styles = {
    container: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem 1rem',
    },
    grid2cols: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        border: 'none',
        height: 'fit-content',
    },
    cardHeader: {
        background: 'linear-gradient(135deg, #0A0F1E 0%, #1a1f2e 100%)',
        padding: '1.2rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem',
        borderBottom: '4px solid #3EAEF4',
    },
    cardHeaderTitle: {
        fontSize: '1.2rem',
        fontWeight: 'bold',
        background: 'linear-gradient(135deg, #fff 30%, #3EAEF4 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    cardBody: {
        padding: '1.5rem',
        maxHeight: 'calc(100vh - 200px)',
        overflowY: 'auto',
    },
    inputGroup: {
        marginBottom: '1rem',
    },
    label: {
        display: 'block',
        fontWeight: '600',
        fontSize: '0.85rem',
        color: '#333',
        marginBottom: '0.3rem',
    },
    input: {
        width: '100%',
        padding: '0.6rem 1rem',
        fontSize: '0.95rem',
        border: '1px solid #ddd',
        borderRadius: '12px',
        transition: 'all 0.3s ease',
        outline: 'none',
        backgroundColor: 'white',
    },
    textarea: {
        width: '100%',
        padding: '0.6rem 1rem',
        fontSize: '0.95rem',
        border: '1px solid #ddd',
        borderRadius: '12px',
        transition: 'all 0.3s ease',
        outline: 'none',
        backgroundColor: 'white',
        minHeight: '100px',
        resize: 'vertical',
    },
    dropzone: {
        border: '2px dashed #ddd',
        borderRadius: '12px',
        padding: '1.5rem',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        backgroundColor: '#f8f9fa',
    },
    dropzoneActive: {
        borderColor: '#3EAEF4',
        backgroundColor: 'rgba(255,215,0,0.05)',
    },
    dropzoneIcon: {
        fontSize: '2rem',
        color: '#3EAEF4',
        marginBottom: '0.3rem',
    },
    // Carrusel de la galería
    carouselContainer: {
        position: 'relative',
        marginTop: '1rem',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: '#e9ecef',
        minHeight: '150px',
    },
    carouselSlide: {
        display: 'flex',
        transition: 'transform 0.5s ease',
    },
    carouselItem: {
        minWidth: '100%',
        position: 'relative',
        aspectRatio: '16/9',
        backgroundColor: '#e9ecef',
    },
    carouselImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    carouselVideo: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    carouselRemove: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        backgroundColor: 'rgba(220,53,69,0.8)',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '30px',
        height: '30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        zIndex: 5,
    },
    carouselNav: {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        backgroundColor: 'rgba(0,0,0,0.5)',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        zIndex: 5,
    },
    carouselNavLeft: {
        left: '10px',
    },
    carouselNavRight: {
        right: '10px',
    },
    carouselDots: {
        display: 'flex',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.5rem',
        position: 'absolute',
        bottom: '10px',
        left: 0,
        right: 0,
        zIndex: 5,
    },
    carouselDot: (active) => ({
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        backgroundColor: active ? '#3EAEF4' : 'rgba(255,255,255,0.5)',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    }),
    carouselCounter: {
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        backgroundColor: 'rgba(0,0,0,0.6)',
        color: 'white',
        padding: '0.2rem 0.6rem',
        borderRadius: '12px',
        fontSize: '0.7rem',
        zIndex: 5,
    },
    toggleGroup: {
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1rem',
        flexWrap: 'wrap',
    },
    toggleBtn: (active) => ({
        padding: '0.3rem 0.8rem',
        borderRadius: '20px',
        border: active ? '2px solid #3EAEF4' : '1px solid #ddd',
        backgroundColor: active ? 'rgba(255,215,0,0.1)' : 'transparent',
        color: active ? '#0A0F1E' : '#6c757d',
        fontWeight: active ? 'bold' : 'normal',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        fontSize: '0.8rem',
    }),
    btnPrimary: {
        backgroundColor: '#3EAEF4',
        color: '#0A0F1E',
        border: 'none',
        padding: '0.6rem 1.2rem',
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
        padding: '0.4rem 0.8rem',
        borderRadius: '8px',
        fontWeight: 'bold',
        fontSize: '0.8rem',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
    },
    btnDanger: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '0.4rem 0.8rem',
        borderRadius: '8px',
        fontWeight: 'bold',
        fontSize: '0.8rem',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
    },
    btnWarning: {
        backgroundColor: '#3EAEF4',
        color: '#0A0F1E',
        border: 'none',
        padding: '0.4rem 0.8rem',
        borderRadius: '8px',
        fontWeight: 'bold',
        fontSize: '0.8rem',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
    },
    btnOutline: {
        backgroundColor: 'transparent',
        color: '#6c757d',
        border: '1px solid #ddd',
        padding: '0.6rem 1.2rem',
        borderRadius: '12px',
        fontWeight: 'bold',
        fontSize: '0.95rem',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        textDecoration: 'none',
    },
    flexRow: {
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
        marginTop: '1rem',
    },
    flexGrow: {
        flex: 1,
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
    noticiaItem: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1rem',
        border: '1px solid #e9ecef',
        transition: 'all 0.3s ease',
    },
    noticiaTitulo: {
        fontSize: '1rem',
        fontWeight: 'bold',
        margin: 0,
        color: '#0A0F1E',
    },
    noticiaMeta: {
        fontSize: '0.75rem',
        color: '#6c757d',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        marginTop: '0.3rem',
    },
    noticiaActions: {
        display: 'flex',
        gap: '0.3rem',
        flexWrap: 'wrap',
        marginTop: '0.5rem',
    },
    badge: (color) => ({
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.2rem 0.6rem',
        borderRadius: '12px',
        fontSize: '0.7rem',
        fontWeight: 'bold',
        backgroundColor: color,
        color: 'white',
    }),
    loadingSpinner: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
        gap: '1rem',
        color: '#6c757d',
    },
};

// Componente Carrusel de Galería
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
        <div style={styles.carouselContainer}>
            <div style={styles.carouselSlide}>
                {items.map((item, index) => (
                    <div
                        key={index}
                        style={{
                            ...styles.carouselItem,
                            display: index === currentIndex ? 'block' : 'none',
                        }}
                    >
                        {isVideo(item) ? (
                            <video style={styles.carouselVideo} controls>
                                <source src={item.preview} />
                            </video>
                        ) : (
                            <img
                                src={item.preview}
                                alt={`Galería ${index}`}
                                style={styles.carouselImage}
                            />
                        )}
                        <button
                            style={styles.carouselRemove}
                            onClick={() => onRemove(index)}
                            title="Eliminar"
                        >
                            <FaTrash size={12} />
                        </button>
                    </div>
                ))}
            </div>

            {items.length > 1 && (
                <>
                    <button
                        style={{ ...styles.carouselNav, ...styles.carouselNavLeft }}
                        onClick={goToPrevious}
                    >
                        <FaChevronLeft />
                    </button>
                    <button
                        style={{ ...styles.carouselNav, ...styles.carouselNavRight }}
                        onClick={goToNext}
                    >
                        <FaChevronRight />
                    </button>
                    <div style={styles.carouselDots}>
                        {items.map((_, index) => (
                            <button
                                key={index}
                                style={styles.carouselDot(index === currentIndex)}
                                onClick={() => setCurrentIndex(index)}
                            />
                        ))}
                    </div>
                    <div style={styles.carouselCounter}>
                        {currentIndex + 1} / {items.length}
                    </div>
                </>
            )}
        </div>
    );
};

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

    const eliminarNoticia = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta noticia?')) return;
        try {
            const response = await fetch(apiUrl('/eliminar_noticia.php'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            const data = await response.json();
            if (data.success) {
                setSuccessMsg('Noticia eliminada correctamente.');
                cargarNoticias();
                if (noticiaId === id) cancelarEdicion();
            } else {
                setErrorMsg(data.message || 'Error al eliminar noticia.');
            }
        } catch (error) {
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
        <div style={styles.container}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 style={{ margin: 0 }}>
                    <FaNewspaper className="me-2 text-warning" />
                    {editando ? 'Editar Noticia' : 'Crear Noticia'}
                </h2>
                <Link to="/dashboard" className="btn btn-outline-secondary">
                    <FaArrowLeft className="me-1" /> Volver
                </Link>
                <Link to="/noticias/papelera" className="btn btn-outline-danger btn-sm">
                    <FaTrash className="me-1" /> Papelera
                </Link>
            </div>

            {errorMsg && (
                <div style={styles.alertError}>
                    <FaExclamationTriangle /> {errorMsg}
                    <button type="button" style={{ background: 'none', border: 'none', marginLeft: 'auto', color: 'inherit' }} onClick={() => setErrorMsg('')}>✕</button>
                </div>
            )}
            {successMsg && (
                <div style={styles.alertSuccess}>
                    <FaCheckCircle /> {successMsg}
                    <button type="button" style={{ background: 'none', border: 'none', marginLeft: 'auto', color: 'inherit' }} onClick={() => setSuccessMsg('')}>✕</button>
                </div>
            )}

            <div style={styles.grid2cols}>
                {/* Columna izquierda: Formulario */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h4 style={styles.cardHeaderTitle}>
                            {editando ? <FaEdit /> : <FaPlus />}
                            {editando ? ' Editar' : ' Crear'}
                        </h4>
                        {editando && (
                            <button type="button" style={styles.btnDanger} onClick={cancelarEdicion}>
                                Cancelar
                            </button>
                        )}
                    </div>
                    <div style={styles.cardBody}>
                        <form onSubmit={handleSubmit}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Título *</label>
                                <input
                                    type="text"
                                    style={styles.input}
                                    placeholder="Título de la noticia"
                                    value={formData.titulo}
                                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                    disabled={loading}
                                    required
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Resumen corto *</label>
                                <textarea
                                    style={styles.textarea}
                                    rows="2"
                                    placeholder="Breve resumen de la noticia (se muestra en la tarjeta)"
                                    value={formData.resumen}
                                    onChange={(e) => setFormData({ ...formData, resumen: e.target.value })}
                                    disabled={loading}
                                    required
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Cuerpo de la noticia *</label>
                                <textarea
                                    style={styles.textarea}
                                    rows="6"
                                    placeholder="Contenido completo de la noticia"
                                    value={formData.contenido}
                                    onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
                                    disabled={loading}
                                    required
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>URL de YouTube (opcional)</label>
                                <input
                                    type="text"
                                    style={styles.input}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    value={formData.youtubeUrl}
                                    onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                                    disabled={loading}
                                />
                            </div>

                            <div style={styles.toggleGroup}>
                                <button
                                    type="button"
                                    style={styles.toggleBtn(formData.visible)}
                                    onClick={() => setFormData({ ...formData, visible: !formData.visible })}
                                >
                                    {formData.visible ? <FaEye /> : <FaEyeSlash />}
                                    {formData.visible ? 'Visible' : 'Oculta'}
                                </button>
                                <button
                                    type="button"
                                    style={styles.toggleBtn(formData.fijada)}
                                    onClick={() => setFormData({ ...formData, fijada: !formData.fijada })}
                                >
                                    <FaThumbtack />
                                    {formData.fijada ? 'Fijada' : 'Fijar'}
                                </button>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}><FaImage className="me-1" /> Imagen destacada</label>
                                <input
                                    type="file"
                                    style={styles.input}
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleImagenChange}
                                    disabled={loading}
                                />
                                <small style={{ color: '#6c757d', fontSize: '0.7rem' }}>JPG, PNG o WEBP. Máx 5MB.</small>
                                {imagenPreview && (
                                    <div style={{ marginTop: '0.3rem' }}>
                                        <img src={imagenPreview} alt="Vista previa" style={{ maxHeight: '100px', borderRadius: '8px' }} />
                                        <p style={{ fontSize: '0.75rem', color: '#28a745' }}>✅ {imagenName}</p>
                                    </div>
                                )}
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}><FaFilePdf className="me-1" /> PDF adjunto</label>
                                <input
                                    type="file"
                                    style={styles.input}
                                    accept=".pdf"
                                    onChange={handlePdfChange}
                                    disabled={loading}
                                />
                                <small style={{ color: '#6c757d', fontSize: '0.7rem' }}>PDF. Máx 10MB.</small>
                                {pdfName && <p style={{ fontSize: '0.75rem', color: '#28a745' }}>✅ {pdfName}</p>}
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}><FaVideo className="me-1" /> Video local</label>
                                <input
                                    type="file"
                                    style={styles.input}
                                    accept="video/mp4,video/webm,video/ogg,video/quicktime"
                                    onChange={handleVideoChange}
                                    disabled={loading}
                                />
                                <small style={{ color: '#6c757d', fontSize: '0.7rem' }}>MP4, WEBM, OGG o MOV. Máx 100MB.</small>
                                {videoName && <p style={{ fontSize: '0.75rem', color: '#28a745' }}>✅ {videoName}</p>}
                            </div>

                            {/* Galería con carrusel */}
                            <div style={styles.inputGroup}>
                                <label style={styles.label}><FaImages className="me-1" /> Galería (hasta 10 archivos)</label>
                                <div 
                                    {...getRootProps()} 
                                    style={{ ...styles.dropzone, ...(isDragActive ? styles.dropzoneActive : {}) }}
                                >
                                    <input {...getInputProps()} />
                                    <div style={styles.dropzoneIcon}><FaUpload /></div>
                                    {isDragActive ? (
                                        <p>Suelta los archivos aquí...</p>
                                    ) : (
                                        <p style={{ fontSize: '0.85rem' }}>Arrastra imágenes o videos, o haz clic para seleccionarlos</p>
                                    )}
                                    <small style={{ color: '#6c757d', fontSize: '0.7rem' }}>Máx 10 archivos. Imágenes: JPG, PNG, WEBP. Videos: MP4, WEBM, OGG, MOV.</small>
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

                            <div style={styles.flexRow}>
                                <button
                                    type="submit"
                                    style={{ ...styles.btnPrimary, ...styles.flexGrow }}
                                    disabled={loading}
                                >
                                    {loading ? 'Guardando...' : <><FaSave className="me-1" /> Guardar</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Columna derecha: Listado de noticias */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h4 style={styles.cardHeaderTitle}>
                            <FaNewspaper /> Lista de Noticias
                        </h4>
                        <button type="button" style={styles.btnPrimary} onClick={cargarNoticias} disabled={loadingNoticias}>
                            <FaSync className="me-1" /> Actualizar
                        </button>
                    </div>
                    <div style={styles.cardBody}>
                        {loadingNoticias ? (
                            <div style={styles.loadingSpinner}>
                                <div className="spinner-border text-warning" role="status" style={{ width: '1.5rem', height: '1.5rem' }}></div>
                                <span>Cargando noticias...</span>
                            </div>
                        ) : noticias.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
                                <FaNewspaper style={{ fontSize: '3rem', color: '#ddd', marginBottom: '1rem' }} />
                                <p>No hay noticias creadas aún.</p>
                            </div>
                        ) : (
                            noticias.map((noticia) => (
                                <div key={noticia.id} style={styles.noticiaItem}>
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <p style={styles.noticiaTitulo}>{noticia.titulo}</p>
                                            <div style={styles.noticiaMeta}>
                                                <span>{noticia.autor || 'Sin autor'}</span>
                                                <span>{noticia.fecha}</span>
                                                <span>👁️ {noticia.vistas} vistas</span>
                                                <span style={styles.badge(getBadgeColor(noticia.visible, noticia.fijada))}>
                                                    {getBadgeLabel(noticia.visible, noticia.fijada)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={styles.noticiaActions}>
                                        <button style={styles.btnSuccess} onClick={() => editarNoticia(noticia)}>
                                            <FaEdit /> Editar
                                        </button>
                                        <button style={styles.btnWarning} onClick={() => cambiarVisibilidad(noticia.id, !noticia.visible)}>
                                            {noticia.visible ? <FaEyeSlash /> : <FaEye />}
                                            {noticia.visible ? ' Ocultar' : ' Publicar'}
                                        </button>
                                        <button style={styles.btnWarning} onClick={() => cambiarFijada(noticia.id, !noticia.fijada)}>
                                            <FaThumbtack />
                                            {noticia.fijada ? ' Desfijar' : ' Fijar'}
                                        </button>
                                        <button style={styles.btnDanger} onClick={() => eliminarNoticia(noticia.id)}>
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
    );
};

export default NoticiasCrear;