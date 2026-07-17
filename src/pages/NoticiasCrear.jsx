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

// ========== ESTILOS MODERNOS CON RESPONSIVE ==========
const styles = {
    container: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem 1.5rem',
        background: '#f0f4f8',
        minHeight: 'calc(100vh - 200px)',
        '@media (max-width: 768px)': {
            padding: '1rem 0.8rem',
        },
    },
    // Header con glow
    header: {
        background: 'linear-gradient(135deg, #0A0F1E 0%, #1a1f2e 50%, #0A0F1E 100%)',
        borderRadius: '20px',
        padding: '2.5rem 2rem',
        marginBottom: '2rem',
        borderBottom: '4px solid #3EAEF4',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        position: 'relative',
        overflow: 'hidden',
        '@media (max-width: 768px)': {
            padding: '1.5rem 1.2rem',
        },
        '@media (max-width: 480px)': {
            padding: '1.2rem 0.8rem',
        },
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
        '@media (max-width: 768px)': {
            flexDirection: 'column',
            textAlign: 'center',
            gap: '0.8rem',
        },
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        '@media (max-width: 768px)': {
            flexDirection: 'column',
            justifyContent: 'center',
        },
    },
    headerTitle: {
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
        '@media (max-width: 768px)': {
            fontSize: '1.5rem',
            justifyContent: 'center',
        },
        '@media (max-width: 480px)': {
            fontSize: '1.2rem',
        },
    },
    headerSubtitle: {
        color: '#aab',
        fontSize: '0.95rem',
        margin: 0,
        '@media (max-width: 768px)': {
            fontSize: '0.85rem',
        },
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
    headerButtons: {
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
        '@media (max-width: 768px)': {
            justifyContent: 'center',
            width: '100%',
        },
    },
    // ===== GRID RESPONSIVE CON FLEXBOX =====
    grid2cols: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '2rem',
        '@media (max-width: 992px)': {
            gap: '1.5rem',
        },
    },
    colFormulario: {
        flex: '1 1 calc(50% - 1rem)',
        minWidth: '300px',
        order: 1,
        '@media (max-width: 992px)': {
            flex: '1 1 100%',
            order: 1,
        },
    },
    colLista: {
        flex: '1 1 calc(50% - 1rem)',
        minWidth: '300px',
        order: 2,
        '@media (max-width: 992px)': {
            flex: '1 1 100%',
            order: 2,
        },
    },
    // Card
    card: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.5)',
        height: 'fit-content',
        transition: 'all 0.3s ease',
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
        '@media (max-width: 480px)': {
            padding: '1rem',
            flexDirection: 'column',
            alignItems: 'stretch',
        },
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
        '@media (max-width: 480px)': {
            fontSize: '1rem',
            justifyContent: 'center',
        },
    },
    cardBody: {
        padding: '1.5rem',
        maxHeight: 'calc(100vh - 200px)',
        overflowY: 'auto',
        '@media (max-width: 768px)': {
            maxHeight: 'none',
            padding: '1rem',
        },
        '@media (max-width: 480px)': {
            padding: '0.8rem',
        },
    },
    // Formulario
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
        color: '#0A0F1E',
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
        '@media (max-width: 480px)': {
            padding: '1rem',
        },
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
    toggleGroup: {
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        '@media (max-width: 480px)': {
            flexDirection: 'column',
        },
    },
    toggleBtn: (active) => ({
        padding: '0.4rem 1rem',
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
        '@media (max-width: 480px)': {
            justifyContent: 'center',
            width: '100%',
        },
    }),
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
        width: '100%',
        '@media (max-width: 480px)': {
            fontSize: '0.85rem',
            padding: '0.6rem 1rem',
        },
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
        '@media (max-width: 480px)': {
            justifyContent: 'center',
            width: '100%',
        },
    },
    btnOutline: {
        backgroundColor: 'transparent',
        color: '#6c757d',
        border: '1px solid #ddd',
        padding: '0.6rem 1.2rem',
        borderRadius: '12px',
        fontWeight: 'bold',
        fontSize: '0.9rem',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        textDecoration: 'none',
        '@media (max-width: 480px)': {
            fontSize: '0.8rem',
            padding: '0.5rem 1rem',
            width: '100%',
        },
    },
    noticiaItem: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1rem',
        border: '1px solid #e9ecef',
        transition: 'all 0.3s ease',
        '@media (max-width: 480px)': {
            padding: '0.8rem',
        },
    },
    noticiaTitulo: {
        fontSize: '1rem',
        fontWeight: 'bold',
        margin: 0,
        color: '#0A0F1E',
        '@media (max-width: 480px)': {
            fontSize: '0.9rem',
        },
    },
    noticiaMeta: {
        fontSize: '0.75rem',
        color: '#6c757d',
        display: 'flex',
        gap: '0.5rem 1rem',
        flexWrap: 'wrap',
        marginTop: '0.3rem',
        '@media (max-width: 480px)': {
            fontSize: '0.7rem',
            gap: '0.3rem 0.8rem',
        },
    },
    noticiaActions: {
        display: 'flex',
        gap: '0.3rem',
        flexWrap: 'wrap',
        marginTop: '0.5rem',
        '@media (max-width: 480px)': {
            gap: '0.2rem',
        },
    },
    noticiaActionBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.2rem',
        padding: '0.3rem 0.6rem',
        borderRadius: '6px',
        fontSize: '0.7rem',
        fontWeight: '600',
        border: '1.5px solid',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backgroundColor: 'transparent',
        minWidth: '70px',
        height: '28px',
        '@media (max-width: 480px)': {
            fontSize: '0.65rem',
            padding: '0.2rem 0.4rem',
            minWidth: '60px',
            height: '24px',
        },
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
        '@media (max-width: 480px)': {
            fontSize: '0.6rem',
            padding: '0.15rem 0.4rem',
        },
    }),
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
        '@media (max-width: 480px)': {
            fontSize: '0.8rem',
            padding: '0.6rem 0.8rem',
        },
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
        '@media (max-width: 480px)': {
            fontSize: '0.8rem',
            padding: '0.6rem 0.8rem',
        },
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        overflowY: 'auto',
        '@media (max-width: 768px)': {
            padding: '1rem',
        },
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: '20px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '2rem',
        position: 'relative',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        '@media (max-width: 768px)': {
            padding: '1.5rem',
            maxHeight: '95vh',
        },
        '@media (max-width: 480px)': {
            padding: '1rem',
            borderRadius: '12px',
        },
    },
    modalClose: {
        position: 'sticky',
        top: 0,
        float: 'right',
        backgroundColor: 'rgba(0,0,0,0.1)',
        border: 'none',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        zIndex: 10,
    },
    modalImage: {
        width: '100%',
        maxHeight: '400px',
        objectFit: 'cover',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    },
    modalTitle: {
        fontSize: '1.8rem',
        fontWeight: 'bold',
        marginBottom: '0.5rem',
        color: '#0A0F1E',
        '@media (max-width: 768px)': {
            fontSize: '1.4rem',
        },
        '@media (max-width: 480px)': {
            fontSize: '1.2rem',
        },
    },
    modalMeta: {
        display: 'flex',
        gap: '1.5rem',
        flexWrap: 'wrap',
        fontSize: '0.9rem',
        color: '#6c757d',
        marginBottom: '1.5rem',
        borderBottom: '1px solid #e9ecef',
        paddingBottom: '1rem',
        '@media (max-width: 480px)': {
            fontSize: '0.8rem',
            gap: '0.8rem',
        },
    },
    modalBody: {
        fontSize: '1rem',
        lineHeight: '1.8',
        color: '#333',
        '@media (max-width: 480px)': {
            fontSize: '0.9rem',
        },
    },
    loadingSpinner: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
        gap: '1rem',
        color: '#6c757d',
        '@media (max-width: 480px)': {
            padding: '1rem',
            flexDirection: 'column',
        },
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
    carouselContainer: {
        position: 'relative',
        marginTop: '1rem',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: '#e9ecef',
        minHeight: '150px',
    },
    cardBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.2rem 0.6rem',
        borderRadius: '12px',
        fontSize: '0.7rem',
        fontWeight: 'bold',
        backgroundColor: '#1877f2',
        color: 'white',
    },
};

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
        <div style={styles.carouselContainer}>
            <div style={{ display: 'flex', transition: 'transform 0.5s ease' }}>
                {items.map((item, index) => (
                    <div
                        key={index}
                        style={{
                            minWidth: '100%',
                            display: index === currentIndex ? 'block' : 'none',
                            aspectRatio: '16/9',
                            backgroundColor: '#e9ecef',
                            position: 'relative',
                        }}
                    >
                        {isVideo(item) ? (
                            <video style={{ width: '100%', height: '100%', objectFit: 'cover' }} controls>
                                <source src={item.preview} />
                            </video>
                        ) : (
                            <img
                                src={item.preview}
                                alt={`Galería ${index}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        )}
                        <button
                            style={{
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
                            }}
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
                        style={{
                            position: 'absolute',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            left: '10px',
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
                        }}
                        onClick={goToPrevious}
                    >
                        <FaChevronLeft />
                    </button>
                    <button
                        style={{
                            position: 'absolute',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            right: '10px',
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
                        }}
                        onClick={goToNext}
                    >
                        <FaChevronRight />
                    </button>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem',
                        position: 'absolute',
                        bottom: '10px',
                        left: 0,
                        right: 0,
                        zIndex: 5,
                    }}>
                        {items.map((_, index) => (
                            <button
                                key={index}
                                style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    backgroundColor: index === currentIndex ? '#3EAEF4' : 'rgba(255,255,255,0.5)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                }}
                                onClick={() => setCurrentIndex(index)}
                            />
                        ))}
                    </div>
                    <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        fontSize: '0.7rem',
                        zIndex: 5,
                    }}>
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
            <div style={styles.modalOverlay} onClick={(e) => {
                if (e.target === e.currentTarget) cerrarPreviewNoticia();
            }}>
                <div style={styles.modalContent}>
                    <button style={styles.modalClose} onClick={cerrarPreviewNoticia}>
                        <FaTimes />
                    </button>

                    {n.imagen && (
                        <img 
                            src={getImageUrl(n.imagen)} 
                            alt={n.titulo} 
                            style={styles.modalImage}
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    )}

                    <h1 style={styles.modalTitle}>{n.titulo}</h1>

                    <div style={styles.modalMeta}>
                        <span><FaUser /> {n.autor || 'SNTSS'}</span>
                        <span><FaCalendarAlt /> {n.fecha}</span>
                        <span><FaEye /> {n.vistas || 0} vistas</span>
                        <span><FaHeart style={{ color: '#1877f2' }} /> {n.likes || 0} me gusta</span>
                        {n.fijada && <span style={styles.cardBadge}>📌 Fijada</span>}
                    </div>

                    <div style={styles.modalBody}>
                        {n.contenido ? (
                            <div dangerouslySetInnerHTML={{ __html: n.contenido.replace(/\n/g, '<br/>') }} />
                        ) : (
                            <p>{n.resumen}</p>
                        )}
                    </div>

                    {n.pdfPath && (
                        <div style={{ marginTop: '1.5rem' }}>
                            <a href={getImageUrl(n.pdfPath)} target="_blank" rel="noopener noreferrer" className="btn btn-warning">
                                <FaFilePdf className="me-2" /> Descargar PDF adjunto
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
                            <h5><FaImages className="me-2" />Galería ({n.galeria.length} archivos)</h5>
                            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#e9ecef' }}>
                                <div style={{ display: 'flex', transition: 'transform 0.5s ease' }}>
                                    {n.galeria.map((item, idx) => (
                                        <div 
                                            key={idx} 
                                            style={{ 
                                                minWidth: '100%',
                                                display: idx === previewGalleryIndex ? 'block' : 'none',
                                                aspectRatio: '16/9',
                                                backgroundColor: '#e9ecef',
                                            }}
                                        >
                                            {item.type === 'video' ? (
                                                <video style={{ width: '100%', height: '100%', objectFit: 'cover' }} controls>
                                                    <source src={getImageUrl(item.path)} />
                                                </video>
                                            ) : (
                                                <img 
                                                    src={getImageUrl(item.path)} 
                                                    alt={`Galería ${idx}`} 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {n.galeria.length > 1 && (
                                    <>
                                        <button
                                            style={{
                                                position: 'absolute',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                left: '10px',
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
                                                zIndex: 5,
                                            }}
                                            onClick={() => setPreviewGalleryIndex(prev => prev === 0 ? n.galeria.length - 1 : prev - 1)}
                                        >
                                            <FaChevronLeft />
                                        </button>
                                        <button
                                            style={{
                                                position: 'absolute',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                right: '10px',
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
                                                zIndex: 5,
                                            }}
                                            onClick={() => setPreviewGalleryIndex(prev => prev === n.galeria.length - 1 ? 0 : prev + 1)}
                                        >
                                            <FaChevronRight />
                                        </button>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            padding: '0.5rem',
                                            position: 'absolute',
                                            bottom: '10px',
                                            left: 0,
                                            right: 0,
                                            zIndex: 5,
                                        }}>
                                            {n.galeria.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    style={{
                                                        width: '10px',
                                                        height: '10px',
                                                        borderRadius: '50%',
                                                        backgroundColor: idx === previewGalleryIndex ? '#1877f2' : 'rgba(255,255,255,0.5)',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s ease',
                                                    }}
                                                    onClick={() => setPreviewGalleryIndex(idx)}
                                                />
                                            ))}
                                        </div>
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '10px',
                                            right: '10px',
                                            backgroundColor: 'rgba(0,0,0,0.6)',
                                            color: 'white',
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '12px',
                                            fontSize: '0.7rem',
                                            zIndex: 5,
                                        }}>
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

    // Botones de acción con estilos
    const btnEdit = { borderColor: '#0d6efd', color: '#0d6efd' };
    const btnPreview = { borderColor: '#0dcaf0', color: '#0dcaf0' };
    const btnToggle = { borderColor: '#ffc107', color: '#ffc107' };
    const btnPin = { borderColor: '#6f42c1', color: '#6f42c1' };
    const btnDelete = { borderColor: '#dc3545', color: '#dc3545' };

    return (
        <div style={styles.container}>
            {/* Header con glow */}
            <div style={styles.header}>
                <div style={styles.headerGlow} />
                <div style={styles.headerContent}>
                    <div style={styles.headerLeft}>
                        <div>
                            <h2 style={styles.headerTitle}>
                                <FaRocket style={{ color: '#3EAEF4' }} /> 
                                {editando ? ' Editar Noticia' : ' Crear Noticia'}
                            </h2>
                            <p style={styles.headerSubtitle}>
                                {editando ? 'Actualiza la información de la noticia' : 'Publica nuevas noticias para los agremiados'}
                            </p>
                            <span style={styles.headerBadge}>
                                <FaStar style={{ marginRight: '5px' }} /> 
                                {editando ? 'Modo Edición' : 'Nueva Publicación'}
                            </span>
                        </div>
                    </div>
                    <div style={styles.headerButtons}>
                        <Link to="/dashboard" style={styles.btnOutline}>
                            <FaArrowLeft /> Volver
                        </Link>
                        <Link to="/noticias/papelera" style={{ ...styles.btnOutline, color: '#dc3545', borderColor: '#dc3545' }}>
                            <FaTrash /> Papelera
                        </Link>
                    </div>
                </div>
            </div>

            {/* Alertas */}
            {errorMsg && (
                <div style={styles.alertError}>
                    <FaExclamationTriangle /> {errorMsg}
                    <button type="button" style={{ background: 'none', border: 'none', marginLeft: 'auto', color: 'inherit', fontSize: '1.2rem' }} onClick={() => setErrorMsg('')}>✕</button>
                </div>
            )}
            {successMsg && (
                <div style={styles.alertSuccess}>
                    <FaCheckCircle /> {successMsg}
                    <button type="button" style={{ background: 'none', border: 'none', marginLeft: 'auto', color: 'inherit', fontSize: '1.2rem' }} onClick={() => setSuccessMsg('')}>✕</button>
                </div>
            )}

            {/* ===== GRID RESPONSIVE CON FLEXBOX ===== */}
            <div style={styles.grid2cols}>
                {/* Columna: Formulario */}
                <div style={styles.colFormulario}>
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
                </div>

                {/* Columna: Lista de Noticias */}
                <div style={styles.colLista}>
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
                                    <div className="spinner-border text-warning" role="status" style={{ width: '1.5rem', height: '1.5rem' }} />
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
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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
                                            <button 
                                                style={{ ...styles.noticiaActionBtn, ...btnEdit }}
                                                onMouseEnter={(e) => { e.target.style.backgroundColor = '#0d6efd'; e.target.style.color = 'white'; }}
                                                onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#0d6efd'; }}
                                                onClick={() => editarNoticia(noticia)}
                                            >
                                                <FaEdit /> Editar
                                            </button>
                                            <button 
                                                style={{ ...styles.noticiaActionBtn, ...btnPreview }}
                                                onMouseEnter={(e) => { e.target.style.backgroundColor = '#0dcaf0'; e.target.style.color = 'white'; }}
                                                onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#0dcaf0'; }}
                                                onClick={() => abrirPreviewNoticia(noticia)}
                                            >
                                                <FaEye /> Vista Previa
                                            </button>
                                            <button 
                                                style={{ ...styles.noticiaActionBtn, ...btnToggle }}
                                                onMouseEnter={(e) => { e.target.style.backgroundColor = '#ffc107'; e.target.style.color = '#0A0F1E'; }}
                                                onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#ffc107'; }}
                                                onClick={() => cambiarVisibilidad(noticia.id, !noticia.visible)}
                                            >
                                                {noticia.visible ? <FaEyeSlash /> : <FaEye />}
                                                {noticia.visible ? ' Ocultar' : ' Publicar'}
                                            </button>
                                            <button 
                                                style={{ ...styles.noticiaActionBtn, ...btnPin }}
                                                onMouseEnter={(e) => { e.target.style.backgroundColor = '#6f42c1'; e.target.style.color = 'white'; }}
                                                onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#6f42c1'; }}
                                                onClick={() => cambiarFijada(noticia.id, !noticia.fijada)}
                                            >
                                                <FaThumbtack />
                                                {noticia.fijada ? ' Desfijar' : ' Fijar'}
                                            </button>
                                            <button 
                                                style={{ ...styles.noticiaActionBtn, ...btnDelete }}
                                                onMouseEnter={(e) => { e.target.style.backgroundColor = '#dc3545'; e.target.style.color = 'white'; }}
                                                onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#dc3545'; }}
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