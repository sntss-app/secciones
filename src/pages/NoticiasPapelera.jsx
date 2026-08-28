import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaTrashRestore, FaTrash, FaNewspaper, FaTimes, FaEye, 
    FaRocket, FaStar, FaUser, FaCalendarAlt, FaArrowLeft,
    FaUndo, FaInfoCircle, FaFileAlt
} from 'react-icons/fa';
import { apiUrl } from '../config';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// ✅ IMPORTAR CSS EXTERNO
import '../css/NoticiasPapelera.css';

const NoticiasPapelera = () => {
    const [noticias, setNoticias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const cargarNoticiasEliminadas = async () => {
        setLoading(true);
        try {
            const response = await fetch(apiUrl('/listar_noticias_eliminadas.php'));
            const data = await response.json();
            if (data.success) {
                setNoticias(data.noticias || []);
            } else {
                setErrorMsg(data.message || 'Error al cargar noticias.');
            }
        } catch (error) {
            setErrorMsg('Error de conexión con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarNoticiasEliminadas();
    }, []);

    const restaurarNoticia = async (id, titulo) => {
        const result = await Swal.fire({
            title: '¿Restaurar noticia?',
            html: `¿Estás seguro de que deseas restaurar la noticia <strong>"${titulo}"</strong>?<br><small style="color:#6c757d;">Volverá a estar visible en el panel de administración.</small>`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#6c757d',
            confirmButtonText: '✅ Sí, restaurar',
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
            title: 'Restaurando...',
            html: 'Por favor espera un momento',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const response = await fetch(apiUrl('/restaurar_noticia.php'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            const data = await response.json();

            if (data.success) {
                await Swal.fire({
                    title: '✅ ¡Restaurada!',
                    text: 'La noticia ha sido restaurada correctamente.',
                    icon: 'success',
                    confirmButtonColor: '#28a745',
                    confirmButtonText: 'Perfecto',
                    timer: 3000,
                    timerProgressBar: true,
                });
                cargarNoticiasEliminadas();
            } else {
                await Swal.fire({
                    title: '❌ Error',
                    text: data.message || 'Error al restaurar la noticia.',
                    icon: 'error',
                    confirmButtonColor: '#dc3545',
                    confirmButtonText: 'Entendido',
                });
            }
        } catch (error) {
            await Swal.fire({
                title: '❌ Error de conexión',
                text: 'No se pudo conectar con el servidor. Intenta de nuevo.',
                icon: 'error',
                confirmButtonColor: '#dc3545',
                confirmButtonText: 'Entendido',
            });
        }
    };

    if (loading) {
        return (
            <div className="noticiaspapelera-container">
                <div className="noticiaspapelera-loading">
                    <div className="noticiaspapelera-spinner" role="status" />
                    <span>Cargando papelera...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="noticiaspapelera-wrapper">
            {/* Header Banner Sección 5 */}
            <div className="noticiaspapelera-header ui-shadow">
                <div className="noticiaspapelera-header-dots dot-matrix"></div>
                <div className="noticiaspapelera-header-content">
                    <div className="noticiaspapelera-header-left">
                        <Link to="/noticias/crear" className="noticiaspapelera-back-button">
                            <FaArrowLeft size={12} /> Volver a Crear Noticias
                        </Link>
                        <div className="noticiaspapelera-header-titles">
                            <span className="noticiaspapelera-header-tag">Papelera de Reciclaje</span>
                            <h1 className="noticiaspapelera-title">
                                Papelera de Noticias
                            </h1>
                            <p className="noticiaspapelera-subtitle">
                                Noticias eliminadas que pueden ser restauradas o eliminadas definitivamente
                            </p>
                        </div>
                    </div>
                    <div className="noticiaspapelera-header-right">
                        <span className="noticiaspapelera-header-badge">
                            <FaTrash style={{ marginRight: '6px' }} /> {noticias.length} en papelera
                        </span>
                    </div>
                </div>

                {/* Matriz decorativa de puntitos en esquina */}
                <div className="noticiaspapelera-header-dots-matrix">
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

            {/* Stats */}
            <div className="noticiaspapelera-stats-bar">
                <div className="noticiaspapelera-stat-card">
                    <div className="noticiaspapelera-stat-icon"><FaTrash /></div>
                    <div className="noticiaspapelera-stat-info">
                        <span className="noticiaspapelera-stat-number">{noticias.length}</span>
                        <span className="noticiaspapelera-stat-label">Noticias en papelera</span>
                    </div>
                </div>
                <div className="noticiaspapelera-stat-card">
                    <div className="noticiaspapelera-stat-icon noticiaspapelera-stat-icon-success"><FaUndo /></div>
                    <div className="noticiaspapelera-stat-info">
                        <span className="noticiaspapelera-stat-number">Restaurar</span>
                        <span className="noticiaspapelera-stat-label">Todas las noticias</span>
                    </div>
                </div>
                <div className="noticiaspapelera-stat-card">
                    <div className="noticiaspapelera-stat-icon noticiaspapelera-stat-icon-info"><FaFileAlt /></div>
                    <div className="noticiaspapelera-stat-info">
                        <span className="noticiaspapelera-stat-number">Archivadas</span>
                        <span className="noticiaspapelera-stat-label">Permanentes</span>
                    </div>
                </div>
            </div>

            {/* Grid de cards */}
            {noticias.length === 0 ? (
                <div className="noticiaspapelera-empty-state">
                    <div className="noticiaspapelera-empty-icon"><FaTrash /></div>
                    <h3 className="noticiaspapelera-empty-title">La papelera está vacía</h3>
                    <p className="noticiaspapelera-empty-text">Las noticias que elimines aparecerán aquí para que puedas restaurarlas.</p>
                </div>
            ) : (
                <div className="noticiaspapelera-grid">
                    {noticias.map((noticia) => (
                        <div 
                            key={noticia.id}
                            className="noticiaspapelera-card"
                        >
                            <div className="noticiaspapelera-card-header">
                                <div className="noticiaspapelera-avatar">
                                    <FaNewspaper />
                                </div>
                                <div className="noticiaspapelera-card-title">{noticia.titulo}</div>
                                <span className="noticiaspapelera-card-badge">
                                    <FaTrash /> Eliminada
                                </span>
                            </div>

                            <div className="noticiaspapelera-card-meta">
                                <span className="noticiaspapelera-card-meta-item">
                                    <FaUser /> {noticia.autor || 'SNTSS'}
                                </span>
                                <span className="noticiaspapelera-card-meta-item">
                                    <FaCalendarAlt /> {noticia.fecha}
                                </span>
                            </div>

                            <div className="noticiaspapelera-card-footer">
                                <button 
                                    className="noticiaspapelera-btn-restore"
                                    onClick={() => restaurarNoticia(noticia.id, noticia.titulo)}
                                >
                                    <FaTrashRestore /> Restaurar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NoticiasPapelera;