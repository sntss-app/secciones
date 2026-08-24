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

const Noticias = () => {
    const [noticias, setNoticias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [noticiaSeleccionada, setNoticiaSeleccionada] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [noticiasPorPagina] = useState(6);
    const [filtroSeccion, setFiltroSeccion] = useState("todas");
    const [orden, setOrden] = useState("recientes");
    const [likedNoticias, setLikedNoticias] = useState({});
    const [likesCount, setLikesCount] = useState({});
    const [modalUsuarios, setModalUsuarios] = useState({
        visible: false,
        noticiaId: null,
        tipo: null
    });

    const matricula = localStorage.getItem('matricula');
    const isLoggedIn = Boolean(matricula);

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http://') || path.startsWith('https://')) return path;
        if (path.startsWith('/api')) return apiUrl(path.replace('/api', ''));
        return apiUrl(path);
    };

    const cargarNoticias = async () => {
        setLoading(true);
        try {
            const matriculaParam = matricula ? `&matricula=${encodeURIComponent(matricula)}` : '';
            const response = await fetch(apiUrl(`/listar_noticias.php?includeHidden=0${matriculaParam}`));
            const data = await response.json();
            
            if (data.success && data.noticias) {
                setNoticias(data.noticias);
                const initialLikes = {};
                const initialCount = {};
                data.noticias.forEach(n => {
                    initialLikes[n.id] = n.liked_by_user || false;
                    initialCount[n.id] = n.likes || 0;
                });
                setLikedNoticias(initialLikes);
                setLikesCount(initialCount);
            }
        } catch (error) {
            console.error('Error cargando noticias:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarNoticias();
    }, []);

    const handleLike = async (e, noticiaId) => {
        e.stopPropagation();
        if (!isLoggedIn) {
            alert('Debes iniciar sesión para reaccionar a las noticias');
            return;
        }

        const currentlyLiked = likedNoticias[noticiaId] || false;
        const currentCount = likesCount[noticiaId] || 0;

        setLikedNoticias(prev => ({ ...prev, [noticiaId]: !currentlyLiked }));
        setLikesCount(prev => ({
            ...prev,
            [noticiaId]: currentlyLiked ? currentCount - 1 : currentCount + 1
        }));

        try {
            const response = await fetch(apiUrl('/dar_like.php'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ noticia_id: noticiaId, matricula: matricula })
            });
            const data = await response.json();
            if (!data.success) {
                setLikedNoticias(prev => ({ ...prev, [noticiaId]: currentlyLiked }));
                setLikesCount(prev => ({ ...prev, [noticiaId]: currentCount }));
            }
        } catch (error) {
            setLikedNoticias(prev => ({ ...prev, [noticiaId]: currentlyLiked }));
            setLikesCount(prev => ({ ...prev, [noticiaId]: currentCount }));
        }
    };

    const abrirNoticia = async (noticia) => {
        setNoticiaSeleccionada(noticia);
        setModalVisible(true);
        try {
            const matriculaParam = matricula ? `&matricula=${encodeURIComponent(matricula)}` : '';
            await fetch(apiUrl(`/registrar_vista_noticia.php?id=${noticia.id}${matriculaParam}`));
            setNoticias(prev => prev.map(n => n.id === noticia.id ? { ...n, vistas: (n.vistas || 0) + 1 } : n));
        } catch (error) {
            console.error('Error registrando vista:', error);
        }
    };

    const cerrarModal = () => {
        setModalVisible(false);
        setNoticiaSeleccionada(null);
    };

    const noticiasFiltradas = noticias.filter(noticia => {
        const matchesSearch = 
            (noticia.titulo && noticia.titulo.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (noticia.resumen && noticia.resumen.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
    });

    const sortedNoticias = [...noticiasFiltradas].sort((a, b) => {
        if (a.fijada !== b.fijada) return b.fijada - a.fijada;
        if (orden === 'recientes') return new Date(b.fecha) - new Date(a.fecha);
        if (orden === 'vistas') return (b.vistas || 0) - (a.vistas || 0);
        if (orden === 'likes') return (b.likes || 0) - (a.likes || 0);
        return 0;
    });

    const indexOfLastNoticia = currentPage * noticiasPorPagina;
    const indexOfFirstNoticia = indexOfLastNoticia - noticiasPorPagina;
    const currentNoticias = sortedNoticias.slice(indexOfFirstNoticia, indexOfLastNoticia);
    const totalPages = Math.ceil(sortedNoticias.length / noticiasPorPagina);

    return (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
            
            {/* Header Noticias */}
            <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 ui-shadow border border-white mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <Link to="/dashboard" className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-[#486DAA] hover:text-white flex items-center justify-center transition text-decoration-none">
                        <FaArrowLeft />
                    </Link>
                    <div>
                        <span className="inline-block bg-[#486DAA]/10 text-[#486DAA] text-[10px] font-extrabold px-3 py-0.5 rounded-full mb-1 border border-[#486DAA]/20">
                            Comunicación Sindical
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black text-[#486DAA] tracking-tight m-0">
                            Noticias y Avisos Oficiales
                        </h2>
                    </div>
                </div>

                {/* Buscador en cápsula */}
                <div className="w-full md:w-72 relative flex items-center">
                    <span className="absolute left-4 text-slate-400 text-sm"><FaSearch /></span>
                    <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar noticias..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-full py-2.5 pl-10 pr-4 text-xs font-medium text-slate-700 outline-none focus:border-[#486DAA] focus:bg-white transition"
                    />
                </div>
            </div>

            {/* Grid de Noticias */}
            {loading ? (
                <div className="text-center py-16 text-slate-400 font-medium text-xs">
                    Cargando comunicados y noticias...
                </div>
            ) : currentNoticias.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentNoticias.map((noticia) => (
                        <div 
                            key={noticia.id}
                            onClick={() => abrirNoticia(noticia)}
                            className="bg-white rounded-[2rem] p-6 flex flex-col justify-between relative ui-shadow ui-shadow-hover border border-slate-50 cursor-pointer group"
                        >
                            <div>
                                {noticia.imagen ? (
                                    <div className="w-full h-44 rounded-2xl overflow-hidden mb-4 bg-slate-100">
                                        <img 
                                            src={getImageUrl(noticia.imagen)} 
                                            alt={noticia.titulo} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full h-28 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 text-3xl mb-4">
                                        <FaNewspaper />
                                    </div>
                                )}

                                <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-bold mb-2">
                                    <span><FaCalendarAlt className="inline mr-1" />{noticia.fecha}</span>
                                    <span>•</span>
                                    <span><FaEye className="inline mr-1" />{noticia.vistas || 0} vistas</span>
                                    {noticia.fijada && (
                                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[9px]">
                                            📌 Fijada
                                        </span>
                                    )}
                                </div>

                                <h3 className="font-extrabold text-[#486DAA] text-sm mb-2 leading-snug line-clamp-2">
                                    {noticia.titulo}
                                </h3>

                                <p className="text-xs text-slate-500 font-medium line-clamp-3 m-0">
                                    {noticia.resumen}
                                </p>
                            </div>

                            {/* Footer de la tarjeta */}
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                <button 
                                    onClick={(e) => handleLike(e, noticia.id)}
                                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition border-0 cursor-pointer ${
                                        likedNoticias[noticia.id] 
                                            ? 'bg-red-50 text-red-500' 
                                            : 'bg-slate-50 text-slate-500 hover:text-red-500'
                                    }`}
                                >
                                    <FaHeart className="text-xs" />
                                    <span>{likesCount[noticia.id] || 0}</span>
                                </button>

                                <span className="text-xs text-[#486DAA] font-bold group-hover:underline">
                                    Leer completo →
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-[2.5rem] ui-shadow p-8 text-slate-400 font-medium text-xs">
                    No se encontraron noticias.
                </div>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
                <div className="flex justify-center space-x-2 mt-10">
                    <button 
                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white rounded-full text-xs font-bold text-slate-600 ui-shadow disabled:opacity-40 border-0 cursor-pointer"
                    >
                        Anterior
                    </button>
                    <span className="px-4 py-2 bg-[#486DAA] text-white rounded-full text-xs font-bold">
                        Página {currentPage} de {totalPages}
                    </span>
                    <button 
                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-white rounded-full text-xs font-bold text-slate-600 ui-shadow disabled:opacity-40 border-0 cursor-pointer"
                    >
                        Siguiente
                    </button>
                </div>
            )}

            {/* Modal Detalle de Noticia */}
            {modalVisible && noticiaSeleccionada && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative ui-shadow">
                        <button 
                            onClick={cerrarModal}
                            className="absolute top-6 right-6 w-9 h-9 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full flex items-center justify-center border-0 cursor-pointer transition"
                        >
                            <FaTimes />
                        </button>

                        <span className="inline-block bg-[#486DAA]/10 text-[#486DAA] text-[10px] font-extrabold px-3 py-1 rounded-full mb-3">
                            Comunicado Oficial
                        </span>

                        <h2 className="text-xl sm:text-2xl font-black text-[#486DAA] leading-snug mb-3">
                            {noticiaSeleccionada.titulo}
                        </h2>

                        <div className="flex items-center space-x-3 text-xs text-slate-400 font-bold mb-4 pb-3 border-b border-slate-100">
                            <span><FaCalendarAlt className="inline mr-1" />{noticiaSeleccionada.fecha}</span>
                            <span>•</span>
                            <span><FaEye className="inline mr-1" />{noticiaSeleccionada.vistas || 0} vistas</span>
                        </div>

                        {noticiaSeleccionada.imagen && (
                            <img 
                                src={getImageUrl(noticiaSeleccionada.imagen)} 
                                alt={noticiaSeleccionada.titulo}
                                className="w-full max-h-80 object-cover rounded-2xl mb-4 shadow-sm"
                            />
                        )}

                        <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                            {noticiaSeleccionada.contenido || noticiaSeleccionada.resumen}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Noticias;