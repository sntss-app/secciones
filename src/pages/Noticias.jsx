import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaNewspaper, FaSearch, FaEye, FaCalendarAlt, FaUser, FaFilePdf, 
    FaVideo, FaImages, FaYoutube, FaTimes, FaChevronLeft, FaChevronRight, 
    FaThumbtack, FaHeart, FaUserCircle, FaArrowLeft, FaRocket, FaStar,
    FaShare, FaComment, FaBookmark
} from "react-icons/fa";
import { apiUrl } from '../config';
import DetallesUsuarios from '../components/DetallesUsuarios';

// ========== ESTILOS MODERNOS ==========
const styles = {
    container: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem 1.5rem',
        background: '#f0f2f5',
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
        textAlign: 'center',
        color: 'white',
        borderBottom: '4px solid #3EAEF4',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        position: 'relative',
        overflow: 'hidden',
        '@media (max-width: 768px)': {
            padding: '2rem 1.2rem',
        },
        '@media (max-width: 480px)': {
            padding: '1.5rem 0.8rem',
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
    headerTitle: {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        background: 'linear-gradient(135deg, #fff 30%, #3EAEF4 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '0.5rem',
        position: 'relative',
        zIndex: 2,
        '@media (max-width: 768px)': {
            fontSize: '2rem',
        },
        '@media (max-width: 480px)': {
            fontSize: '1.5rem',
        },
    },
    headerSubtitle: {
        color: '#aab',
        fontSize: '1.1rem',
        position: 'relative',
        zIndex: 2,
        '@media (max-width: 768px)': {
            fontSize: '0.95rem',
        },
        '@media (max-width: 480px)': {
            fontSize: '0.85rem',
        },
    },
    headerBadge: {
        display: 'inline-block',
        backgroundColor: '#3EAEF4',
        color: '#0A0F1E',
        padding: '0.3rem 1.2rem',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        marginTop: '0.5rem',
        position: 'relative',
        zIndex: 2,
    },
    // Search Bar
    searchBar: {
        display: 'flex',
        gap: '0.8rem',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '1rem 1.5rem',
        border: '1px solid rgba(255,255,255,0.5)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        '@media (max-width: 768px)': {
            flexDirection: 'column',
            alignItems: 'stretch',
            padding: '1rem',
        },
    },
    searchInputWrapper: {
        flex: 2,
        position: 'relative',
        minWidth: '200px',
        '@media (max-width: 768px)': {
            width: '100%',
        },
    },
    searchIcon: {
        position: 'absolute',
        left: '14px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#999',
        fontSize: '0.9rem',
    },
    searchInput: {
        width: '100%',
        padding: '0.7rem 1rem 0.7rem 2.5rem',
        fontSize: '0.95rem',
        border: '1px solid #ddd',
        borderRadius: '25px',
        outline: 'none',
        transition: 'all 0.3s ease',
        backgroundColor: '#f0f2f5',
        height: '46px',
    },
    searchInputFocus: {
        borderColor: '#3EAEF4',
        boxShadow: '0 0 0 3px rgba(62,174,244,0.15)',
        backgroundColor: 'white',
    },
    filterSelect: {
        padding: '0.7rem 1rem',
        fontSize: '0.95rem',
        border: '1px solid #ddd',
        borderRadius: '25px',
        outline: 'none',
        backgroundColor: '#f0f2f5',
        cursor: 'pointer',
        minWidth: '150px',
        transition: 'all 0.3s ease',
        height: '46px',
        '@media (max-width: 768px)': {
            width: '100%',
        },
    },
    backButton: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        background: 'linear-gradient(135deg, #3EAEF4, #2d8fd4)',
        color: '#0A0F1E',
        border: 'none',
        padding: '0.7rem 1.5rem',
        borderRadius: '25px',
        fontWeight: 'bold',
        fontSize: '0.9rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        textDecoration: 'none',
        height: '46px',
        boxShadow: '0 2px 8px rgba(62,174,244,0.3)',
        whiteSpace: 'nowrap',
        '@media (max-width: 768px)': {
            width: '100%',
            justifyContent: 'center',
        },
    },
    noticiasCount: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '0.9rem',
        color: '#6c757d',
        whiteSpace: 'nowrap',
        '@media (max-width: 768px)': {
            width: '100%',
            justifyContent: 'center',
        },
    },
    // Grid de cards
    gridCards: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '1.5rem',
        '@media (max-width: 480px)': {
            gridTemplateColumns: '1fr',
        },
    },
    // Card estilo red social premium
    card: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        padding: '1.2rem 1.2rem 0.8rem 1.2rem',
        border: '1px solid rgba(255,255,255,0.5)',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        cursor: 'pointer',
        '@media (max-width: 480px)': {
            padding: '1rem',
        },
    },
    cardHover: {
        transform: 'translateY(-6px)',
        boxShadow: '0 16px 40px rgba(0,0,0,0.1)',
        borderColor: '#3EAEF4',
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '0.75rem',
    },
    avatar: {
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #3EAEF4, #2d8fd4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
        color: 'white',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(62,174,244,0.2)',
    },
    autorNombre: {
        fontWeight: 'bold',
        fontSize: '0.95rem',
        color: '#0A0F1E',
    },
    autorFecha: {
        fontSize: '0.7rem',
        color: '#65676b',
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem',
    },
    cardTitle: {
        fontSize: '1.1rem',
        fontWeight: 'bold',
        marginBottom: '0.3rem',
        color: '#0A0F1E',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        lineHeight: 1.4,
    },
    cardResumen: {
        color: '#65676b',
        fontSize: '0.9rem',
        lineHeight: '1.6',
        marginBottom: '0.5rem',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
    },
    cardImage: {
        width: '100%',
        maxHeight: '280px',
        objectFit: 'cover',
        borderRadius: '12px',
        marginBottom: '0.5rem',
        backgroundColor: '#e9ecef',
    },
    cardImagePlaceholder: {
        width: '100%',
        height: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0f2f5, #e4e6eb)',
        color: '#adb5bd',
        fontSize: '3rem',
        borderRadius: '12px',
        marginBottom: '0.5rem',
    },
    btnLeerMas: {
        backgroundColor: 'transparent',
        color: '#3EAEF4',
        border: 'none',
        padding: '0.3rem 0',
        fontWeight: '600',
        cursor: 'pointer',
        fontSize: '0.85rem',
        transition: 'all 0.2s ease',
        display: 'block',
        textAlign: 'left',
    },
    // Footer de la card
    cardFooter: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '0.8rem',
        borderTop: '1px solid #e4e6eb',
        marginTop: '0.5rem',
        flexWrap: 'wrap',
        gap: '0.5rem',
    },
    btnLike: (liked) => ({
        backgroundColor: 'transparent',
        border: 'none',
        color: liked ? '#1877f2' : '#4b4f56',
        fontWeight: '600',
        fontSize: '0.85rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.3rem 0.8rem',
        borderRadius: '8px',
        transition: 'all 0.2s ease',
        ...(liked && {
            background: 'rgba(24,119,242,0.08)',
        }),
    }),
    likesCount: {
        fontSize: '0.85rem',
        color: '#65676b',
        fontWeight: '500',
        padding: '0.3rem 0.8rem',
        borderRadius: '8px',
        transition: 'all 0.2s ease',
    },
    cardBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.2rem 0.6rem',
        borderRadius: '12px',
        fontSize: '0.65rem',
        fontWeight: 'bold',
        background: 'linear-gradient(135deg, #3EAEF4, #2d8fd4)',
        color: '#0A0F1E',
    },
    // Modal
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
        },
        '@media (max-width: 480px)': {
            padding: '1rem',
        },
    },
    modalClose: {
        position: 'sticky',
        top: 0,
        float: 'right',
        backgroundColor: 'rgba(0,0,0,0.08)',
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
        ':hover': {
            backgroundColor: 'rgba(0,0,0,0.15)',
            transform: 'rotate(90deg)',
        },
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
        fontSize: '2rem',
        fontWeight: 'bold',
        marginBottom: '0.5rem',
        color: '#0A0F1E',
        '@media (max-width: 768px)': {
            fontSize: '1.5rem',
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
            gap: '0.8rem',
            fontSize: '0.8rem',
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
    emptyState: {
        textAlign: 'center',
        padding: '4rem 2rem',
        color: '#6c757d',
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.5)',
    },
    loadingSpinner: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '4rem',
        gap: '1rem',
        color: '#6c757d',
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        gap: '0.5rem',
        marginTop: '2rem',
        flexWrap: 'wrap',
    },
    pageBtn: (active) => ({
        padding: '0.5rem 1rem',
        borderRadius: '25px',
        border: active ? '2px solid #3EAEF4' : '1px solid #ddd',
        backgroundColor: active ? '#3EAEF4' : 'transparent',
        color: active ? '#0A0F1E' : '#6c757d',
        fontWeight: active ? 'bold' : 'normal',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        minWidth: '40px',
        ...(active && {
            boxShadow: '0 2px 8px rgba(62,174,244,0.3)',
        }),
    }),
};

const Noticias = () => {
    const [noticias, setNoticias] = useState([]);
    const [noticiasFiltradas, setNoticiasFiltradas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroFijadas, setFiltroFijadas] = useState('todas');
    const [noticiaSeleccionada, setNoticiaSeleccionada] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [galleryIndex, setGalleryIndex] = useState(0);
    const [paginaActual, setPaginaActual] = useState(1);
    const [userLikes, setUserLikes] = useState({});
    const itemsPorPagina = 6;

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

    const [likesEstado, setLikesEstado] = useState({});

    const cargarNoticias = async () => {
        setLoading(true);
        try {
            const response = await fetch(apiUrl('/listar_noticias.php?includeHidden=0'));
            const data = await response.json();
            if (data.success) {
                setNoticias(data.noticias || []);
                setNoticiasFiltradas(data.noticias || []);
                const likesInit = {};
                (data.noticias || []).forEach(n => {
                    likesInit[n.id] = n.likes || 0;
                });
                setLikesEstado(likesInit);
            }
        } catch (error) {
            console.error('Error cargando noticias:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const likesGuardados = localStorage.getItem('userLikes');
        if (likesGuardados) {
            try {
                const parsed = JSON.parse(likesGuardados);
                setUserLikes(parsed);
            } catch (e) {
                console.error('Error al cargar likes guardados:', e);
            }
        }
        cargarNoticias();
        cargarLikesUsuario();
    }, []);

    useEffect(() => {
        let filtradas = [...noticias];
        if (searchTerm.trim() !== '') {
            const term = searchTerm.trim().toLowerCase();
            filtradas = filtradas.filter(n => 
                n.titulo.toLowerCase().includes(term) ||
                n.resumen?.toLowerCase().includes(term) ||
                n.autor?.toLowerCase().includes(term)
            );
        }
        if (filtroFijadas === 'fijadas') {
            filtradas = filtradas.filter(n => n.fijada === true);
        } else if (filtroFijadas === 'no-fijadas') {
            filtradas = filtradas.filter(n => n.fijada !== true);
        }
        setNoticiasFiltradas(filtradas);
        setPaginaActual(1);
    }, [searchTerm, filtroFijadas, noticias]);

    const registrarVista = async (id, matricula) => {
        try {
            await fetch(apiUrl('/registrar_vista_noticia.php'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, matricula })
            });
        } catch (error) {
            console.error('Error registrando vista:', error);
        }
    };

    const darLike = async (noticiaId) => {
        const matricula = localStorage.getItem('matricula');
        if (!matricula) {
            alert('Inicia sesión para dar me gusta.');
            return;
        }
        try {
            const response = await fetch(apiUrl('/dar_like.php'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ noticia_id: noticiaId, matricula })
            });
            const data = await response.json();
            if (data.success) {
                setLikesEstado(prev => ({ ...prev, [noticiaId]: data.likes }));
                const nuevoEstado = data.action === 'liked';
                setUserLikes(prev => {
                    const nuevo = { ...prev, [noticiaId]: nuevoEstado };
                    localStorage.setItem('userLikes', JSON.stringify(nuevo));
                    return nuevo;
                });
                setNoticias(prev => prev.map(n => n.id === noticiaId ? { ...n, likes: data.likes } : n));
                setNoticiasFiltradas(prev => prev.map(n => n.id === noticiaId ? { ...n, likes: data.likes } : n));
            }
        } catch (error) {
            console.error('Error al dar like:', error);
        }
    };

    const cargarLikesUsuario = async () => {
        const matricula = localStorage.getItem('matricula');
        if (!matricula) return;
        try {
            const response = await fetch(apiUrl(`/obtener_usuarios_likes.php?matricula=${matricula}`));
            const data = await response.json();
            if (data.success) {
                const likesMap = {};
                data.likes.forEach(id => { likesMap[id] = true; });
                setUserLikes(likesMap);
            }
        } catch (error) {
            console.error('Error cargando likes del usuario:', error);
        }
    };

    const abrirModal = (noticia) => {
        setNoticiaSeleccionada(noticia);
        setShowModal(true);
        setGalleryIndex(0);
        const matricula = localStorage.getItem('matricula');
        registrarVista(noticia.id, matricula);
        setNoticias(prev => prev.map(n => n.id === noticia.id ? { ...n, vistas: (n.vistas || 0) + 1 } : n));
    };

    const cerrarModal = () => {
        setShowModal(false);
        setNoticiaSeleccionada(null);
    };

    const totalPaginas = Math.ceil(noticiasFiltradas.length / itemsPorPagina);
    const paginaSegura = Math.min(paginaActual, totalPaginas || 1);
    const indexInicio = (paginaSegura - 1) * itemsPorPagina;
    const indexFin = Math.min(indexInicio + itemsPorPagina, noticiasFiltradas.length);
    const noticiasPagina = noticiasFiltradas.slice(indexInicio, indexFin);

    const renderModal = () => {
        if (!noticiaSeleccionada) return null;
        const n = noticiaSeleccionada;

        return (
            <div style={styles.modalOverlay} onClick={(e) => {
                if (e.target === e.currentTarget) cerrarModal();
            }}>
                <div style={styles.modalContent}>
                    <button style={styles.modalClose} onClick={cerrarModal}>
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
                        <span><FaUser /> {n.autor ? n.autor.replace(/\//g, ' ') : 'SNTSS'}</span>
                        <span><FaCalendarAlt /> {n.fecha}</span>
                        <DetallesUsuarios 
                            noticiaId={n.id} 
                            tipo="vistas"
                            total={n.vistas || 0}
                        >
                            <span><FaEye /> {n.vistas || 0} vistas</span>
                        </DetallesUsuarios>
                        <DetallesUsuarios 
                            noticiaId={n.id} 
                            tipo="likes"
                            total={likesEstado[n.id] || 0}
                        >
                            <span><FaHeart style={{ color: '#1877f2' }} /> {likesEstado[n.id] || 0} me gusta</span>
                        </DetallesUsuarios>
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
                            <a href={n.pdfPath} target="_blank" rel="noopener noreferrer" className="btn btn-warning">
                                <FaFilePdf className="me-2" /> Descargar PDF adjunto
                            </a>
                        </div>
                    )}

                    {n.videoPath && (
                        <div style={{ marginTop: '1.5rem' }}>
                            <video controls style={{ width: '100%', maxHeight: '400px', borderRadius: '12px' }}>
                                <source src={n.videoPath} />
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
                                                display: idx === galleryIndex ? 'block' : 'none',
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
                                            onClick={() => setGalleryIndex(prev => prev === 0 ? n.galeria.length - 1 : prev - 1)}
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
                                            onClick={() => setGalleryIndex(prev => prev === n.galeria.length - 1 ? 0 : prev + 1)}
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
                                                        backgroundColor: idx === galleryIndex ? '#1877f2' : 'rgba(255,255,255,0.5)',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s ease',
                                                    }}
                                                    onClick={() => setGalleryIndex(idx)}
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
                                            {galleryIndex + 1} / {n.galeria.length}
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

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingSpinner}>
                    <div className="spinner-border text-warning" role="status"></div>
                    <span>Cargando noticias...</span>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header con glow */}
            <div style={styles.header}>
                <div style={styles.headerGlow} />
                <h1 style={styles.headerTitle}>
                    <FaRocket style={{ color: '#3EAEF4' }} /> Noticias y Avisos
                </h1>
                <p style={styles.headerSubtitle}>
                    Mantente informado con las últimas noticias de tu sección sindical
                </p>
                <span style={styles.headerBadge}>
                    <FaStar style={{ marginRight: '5px' }} /> {noticiasFiltradas.length} noticias disponibles
                </span>
            </div>

            {/* Search y filtros */}
            <div style={styles.searchBar}>
                <div style={styles.searchInputWrapper}>
                    <FaSearch style={styles.searchIcon} />
                    <input
                        type="text"
                        style={styles.searchInput}
                        placeholder="Buscar noticias..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={(e) => {
                            e.target.style.borderColor = '#3EAEF4';
                            e.target.style.boxShadow = '0 0 0 3px rgba(62,174,244,0.15)';
                            e.target.style.backgroundColor = 'white';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = '#ddd';
                            e.target.style.boxShadow = 'none';
                            e.target.style.backgroundColor = '#f0f2f5';
                        }}
                    />
                </div>
                
                <Link to="/dashboard" style={styles.backButton}>
                    <FaArrowLeft /> Volver
                </Link>
                
                <select 
                    style={styles.filterSelect} 
                    value={filtroFijadas} 
                    onChange={(e) => setFiltroFijadas(e.target.value)}
                >
                    <option value="todas">📋 Todas las noticias</option>
                    <option value="fijadas">📌 Solo fijadas</option>
                    <option value="no-fijadas">📄 Sin fijar</option>
                </select>
                
                <span style={styles.noticiasCount}>
                    <FaEye style={{ marginRight: '5px', color: '#3EAEF4' }} /> {noticiasFiltradas.length} noticias
                </span>
            </div>

            {/* Grid de noticias */}
            {noticiasPagina.length === 0 ? (
                <div style={styles.emptyState}>
                    <FaNewspaper style={{ fontSize: '4rem', color: '#3EAEF4', marginBottom: '1rem', opacity: 0.3 }} />
                    <h3 style={{ color: '#0A0F1E' }}>No hay noticias disponibles</h3>
                    <p style={{ color: '#6c757d' }}>Pronto publicaremos nuevas noticias para ti.</p>
                </div>
            ) : (
                <div style={styles.gridCards}>
                    {noticiasPagina.map((noticia) => (
                        <div 
                            key={noticia.id} 
                            style={styles.card}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-6px)';
                                e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.1)';
                                e.currentTarget.style.borderColor = '#3EAEF4';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
                            }}
                        >
                            {/* Header estilo red social */}
                            <div style={styles.cardHeader}>
                                <div style={styles.avatar}>
                                    <FaUserCircle />
                                </div>
                                <div>
                                    <div style={styles.autorNombre}>
                                        {noticia.autor ? noticia.autor.replace(/\//g, ' ') : 'SNTSS'}
                                    </div>
                                    <div style={styles.autorFecha}>
                                        <FaCalendarAlt /> {noticia.fecha}
                                    </div>
                                </div>
                            </div>

                            {/* Título */}
                            <h3 style={styles.cardTitle}>{noticia.titulo}</h3>

                            {/* Resumen */}
                            <p style={styles.cardResumen}>{noticia.resumen}</p>

                            {/* Imagen */}
                            {noticia.imagen ? (
                                <img 
                                    src={getImageUrl(noticia.imagen)} 
                                    alt={noticia.titulo} 
                                    style={styles.cardImage}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentElement.innerHTML = `
                                            <div style="${Object.entries(styles.cardImagePlaceholder).map(([k, v]) => `${k}:${typeof v === 'string' ? `'${v}'` : v}`).join(';')}">
                                                <FaNewspaper />
                                            </div>
                                        `;
                                    }}
                                />
                            ) : (
                                <div style={styles.cardImagePlaceholder}>
                                    <FaNewspaper />
                                </div>
                            )}

                            {/* Botón Leer más */}
                            <button style={styles.btnLeerMas} onClick={() => abrirModal(noticia)}>
                                Leer más →
                            </button>

                            {/* Footer con likes */}
                            <div style={styles.cardFooter}>
                                <button 
                                    style={styles.btnLike(userLikes[noticia.id] || false)} 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        darLike(noticia.id);
                                    }}
                                >
                                    <FaHeart 
                                        style={{ 
                                            color: userLikes[noticia.id] ? '#1877f2' : 'transparent',
                                            stroke: '#1877f2',
                                            strokeWidth: '3px',
                                            transition: 'all 0.2s ease',
                                            fontSize: '1.2rem'
                                        }} 
                                    />
                                    Me gusta
                                </button>
                                <DetallesUsuarios 
                                    noticiaId={noticia.id} 
                                    tipo="likes"
                                    total={likesEstado[noticia.id] || 0}
                                >
                                    <span style={styles.likesCount}>
                                        <FaHeart style={{ color: '#1877f2', marginRight: '3px', fontSize: '0.7rem' }} />
                                        {likesEstado[noticia.id] || 0} {likesEstado[noticia.id] === 1 ? 'Me gusta' : 'Me gusta'}
                                    </span>
                                </DetallesUsuarios>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Paginación */}
            {totalPaginas > 1 && (
                <div style={styles.pagination}>
                    <button
                        style={styles.pageBtn(false)}
                        onClick={() => setPaginaActual(Math.max(1, paginaSegura - 1))}
                        disabled={paginaSegura === 1}
                    >
                        <FaChevronLeft /> Anterior
                    </button>
                    {Array.from({ length: Math.min(totalPaginas, 10) }, (_, i) => i + 1).map(num => (
                        <button
                            key={num}
                            style={styles.pageBtn(paginaSegura === num)}
                            onClick={() => setPaginaActual(num)}
                        >
                            {num}
                        </button>
                    ))}
                    {totalPaginas > 10 && paginaSegura < totalPaginas - 5 && (
                        <span style={{ display: 'flex', alignItems: 'center', color: '#6c757d', padding: '0 0.5rem' }}>…</span>
                    )}
                    <button
                        style={styles.pageBtn(false)}
                        onClick={() => setPaginaActual(Math.min(totalPaginas, paginaSegura + 1))}
                        disabled={paginaSegura === totalPaginas}
                    >
                        Siguiente <FaChevronRight />
                    </button>
                </div>
            )}

            {/* Modal */}
            {showModal && renderModal()}
        </div>
    );
};

export default Noticias;