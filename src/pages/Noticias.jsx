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

// ✅ IMPORTAR CSS EXTERNO
import '../css/Noticias.css';

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
            <div className="noticias-modal-overlay" onClick={(e) => {
                if (e.target === e.currentTarget) cerrarModal();
            }}>
                <div className="noticias-modal-content">
                    <button className="noticias-modal-close" onClick={cerrarModal}>
                        <FaTimes />
                    </button>

                    {n.imagen && (
                        <img 
                            src={getImageUrl(n.imagen)} 
                            alt={n.titulo} 
                            className="noticias-modal-image"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    )}

                    <h1 className="noticias-modal-title">{n.titulo}</h1>

                    <div className="noticias-modal-meta">
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
                        {n.fijada && <span className="noticias-card-badge">📌 Fijada</span>}
                    </div>

                    <div className="noticias-modal-body">
                        {n.contenido ? (
                            <div dangerouslySetInnerHTML={{ __html: n.contenido.replace(/\n/g, '<br/>') }} />
                        ) : (
                            <p>{n.resumen}</p>
                        )}
                    </div>

                    {n.pdfPath && (
                        <div style={{ marginTop: '1.5rem' }}>
                            <a href={n.pdfPath} target="_blank" rel="noopener noreferrer" className="noticias-download-btn">
                                <FaFilePdf /> Descargar PDF adjunto
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
                            <div className="noticias-video-wrapper">
                                <iframe
                                    src={embedUrl}
                                    frameBorder="0"
                                    allowFullScreen
                                    title="Video YouTube"
                                />
                            </div>
                        );
                    })()}

                    {n.galeria && n.galeria.length > 0 && (
                        <div style={{ marginTop: '1.5rem' }}>
                            <h5><FaImages /> Galería ({n.galeria.length} archivos)</h5>
                            <div className="noticias-gallery-container">
                                <div style={{ display: 'flex', transition: 'transform 0.5s ease' }}>
                                    {n.galeria.map((item, idx) => (
                                        <div 
                                            key={idx} 
                                            className="noticias-gallery-slide"
                                            style={{ display: idx === galleryIndex ? 'block' : 'none' }}
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
                                            className="noticias-gallery-nav noticias-gallery-nav-left"
                                            onClick={() => setGalleryIndex(prev => prev === 0 ? n.galeria.length - 1 : prev - 1)}
                                        >
                                            <FaChevronLeft />
                                        </button>
                                        <button
                                            className="noticias-gallery-nav noticias-gallery-nav-right"
                                            onClick={() => setGalleryIndex(prev => prev === n.galeria.length - 1 ? 0 : prev + 1)}
                                        >
                                            <FaChevronRight />
                                        </button>
                                        <div className="noticias-gallery-dots">
                                            {n.galeria.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    className={`noticias-gallery-dot ${idx === galleryIndex ? 'noticias-gallery-dot-active' : 'noticias-gallery-dot-inactive'}`}
                                                    onClick={() => setGalleryIndex(idx)}
                                                />
                                            ))}
                                        </div>
                                        <div className="noticias-gallery-counter">
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
            <div className="noticias-container">
                <div className="noticias-loading">
                    <div className="noticias-spinner" role="status" />
                    <span>Cargando noticias...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="noticias-wrapper">
            {/* Header Banner Sección 5 */}
            <div className="noticias-header ui-shadow">
                <div className="noticias-header-dots dot-matrix"></div>
                <div className="noticias-header-content">
                    <div className="noticias-header-left">
                        <Link to="/" className="noticias-back-button">
                            <FaArrowLeft size={12} /> Volver al Inicio
                        </Link>
                        <div className="noticias-header-titles">
                            <span className="noticias-header-tag">Comunicación Oficial</span>
                            <h1 className="noticias-header-title">
                                Noticias y Avisos
                            </h1>
                            <p className="noticias-header-subtitle">
                                Mantente informado con las últimas noticias y comunicados de tu sección sindical
                            </p>
                        </div>
                    </div>
                    <div className="noticias-header-right">
                        <span className="noticias-header-badge">
                            <FaStar style={{ marginRight: '6px' }} /> {noticiasFiltradas.length} noticias disponibles
                        </span>
                    </div>
                </div>

                {/* Matriz decorativa de puntitos en esquina */}
                <div className="noticias-header-dots-matrix">
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

            {/* Search y filtros */}
            <div className="noticias-search-bar">
                <div className="noticias-search-wrapper">
                    <FaSearch className="noticias-search-icon" />
                    <input
                        type="text"
                        className="noticias-search-input"
                        placeholder="Buscar noticias..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <Link to="/dashboard" className="noticias-back-button">
                    <FaArrowLeft /> Volver
                </Link>
                
                <select 
                    className="noticias-filter-select"
                    value={filtroFijadas} 
                    onChange={(e) => setFiltroFijadas(e.target.value)}
                >
                    <option value="todas">📋 Todas las noticias</option>
                    <option value="fijadas">📌 Solo fijadas</option>
                    <option value="no-fijadas">📄 Sin fijar</option>
                </select>
                
                <span className="noticias-count">
                    <FaEye style={{ marginRight: '5px', color: '#3EAEF4' }} /> {noticiasFiltradas.length} noticias
                </span>
            </div>

            {/* Grid de noticias */}
            {noticiasPagina.length === 0 ? (
                <div className="noticias-empty-state">
                    <FaNewspaper className="noticias-empty-icon" />
                    <h3 className="noticias-empty-title">No hay noticias disponibles</h3>
                    <p style={{ color: '#6c757d' }}>Pronto publicaremos nuevas noticias para ti.</p>
                </div>
            ) : (
                <div className="noticias-grid">
                    {noticiasPagina.map((noticia) => (
                        <div key={noticia.id} className="noticias-card">
                            <div className="noticias-card-header">
                                <div className="noticias-avatar">
                                    <FaUserCircle />
                                </div>
                                <div>
                                    <div className="noticias-autor-nombre">
                                        {noticia.autor ? noticia.autor.replace(/\//g, ' ') : 'SNTSS'}
                                    </div>
                                    <div className="noticias-autor-fecha">
                                        <FaCalendarAlt /> {noticia.fecha}
                                    </div>
                                </div>
                            </div>

                            <h3 className="noticias-card-title">{noticia.titulo}</h3>
                            <p className="noticias-card-resumen">{noticia.resumen}</p>

                            {noticia.imagen ? (
                                <img 
                                    src={getImageUrl(noticia.imagen)} 
                                    alt={noticia.titulo} 
                                    className="noticias-card-image"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            ) : (
                                <div className="noticias-card-image-placeholder">
                                    <FaNewspaper />
                                </div>
                            )}

                            <button className="noticias-btn-leer-mas" onClick={() => abrirModal(noticia)}>
                                Leer más →
                            </button>

                            <div className="noticias-card-footer">
                                <button 
                                    className={`noticias-btn-like ${userLikes[noticia.id] ? 'noticias-btn-like-liked' : 'noticias-btn-like-normal'}`}
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
                                    <span className="noticias-likes-count">
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
                <div className="noticias-pagination">
                    <button
                        className="noticias-page-btn"
                        onClick={() => setPaginaActual(Math.max(1, paginaSegura - 1))}
                        disabled={paginaSegura === 1}
                    >
                        <FaChevronLeft /> Anterior
                    </button>
                    {Array.from({ length: Math.min(totalPaginas, 10) }, (_, i) => i + 1).map(num => (
                        <button
                            key={num}
                            className={`noticias-page-btn ${paginaSegura === num ? 'noticias-page-btn-active' : ''}`}
                            onClick={() => setPaginaActual(num)}
                        >
                            {num}
                        </button>
                    ))}
                    {totalPaginas > 10 && paginaSegura < totalPaginas - 5 && (
                        <span className="noticias-page-ellipsis">…</span>
                    )}
                    <button
                        className="noticias-page-btn"
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