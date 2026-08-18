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
        // 🔥 SweetAlert2 - Confirmación
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
            customClass: {
                container: 'swal-container',
                popup: 'swal-popup',
                title: 'swal-title',
                htmlContainer: 'swal-html',
                confirmButton: 'swal-confirm-btn',
                cancelButton: 'swal-cancel-btn'
            },
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

        // Mostrar loading
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
                // 🔥 SweetAlert2 - Éxito
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
                // 🔥 SweetAlert2 - Error
                await Swal.fire({
                    title: '❌ Error',
                    text: data.message || 'Error al restaurar la noticia.',
                    icon: 'error',
                    confirmButtonColor: '#dc3545',
                    confirmButtonText: 'Entendido',
                });
            }
        } catch (error) {
            // 🔥 SweetAlert2 - Error de conexión
            await Swal.fire({
                title: '❌ Error de conexión',
                text: 'No se pudo conectar con el servidor. Intenta de nuevo.',
                icon: 'error',
                confirmButtonColor: '#dc3545',
                confirmButtonText: 'Entendido',
            });
        }
    };

    // Mostrar notificación de éxito/error con SweetAlert2
    const mostrarNotificacion = (mensaje, tipo) => {
        const config = {
            title: tipo === 'success' ? '✅ ¡Éxito!' : '❌ Error',
            text: mensaje,
            icon: tipo,
            confirmButtonColor: tipo === 'success' ? '#28a745' : '#dc3545',
            confirmButtonText: 'Entendido',
            timer: 3000,
            timerProgressBar: true,
        };
        Swal.fire(config);
    };

    // ========== ESTILOS MODERNOS ==========
    const styles = {
        container: {
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '2rem 1.5rem',
            background: '#f0f4f8',
            minHeight: 'calc(100vh - 200px)',
        },
        header: {
            background: 'linear-gradient(135deg, #0A0F1E 0%, #1a1f2e 50%, #0A0F1E 100%)',
            borderRadius: '20px',
            padding: '2.5rem 2rem',
            marginBottom: '2rem',
            borderBottom: '4px solid #dc3545',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            position: 'relative',
            overflow: 'hidden',
        },
        headerGlow: {
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(220,53,69,0.1) 0%, transparent 70%)',
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
        },
        headerLeft: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
        },
        backButton: {
            color: 'white',
            backgroundColor: 'rgba(255,255,255,0.1)',
            padding: '0.7rem 1.2rem',
            borderRadius: '12px',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: '500',
        },
        title: {
            fontSize: '2rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #fff 30%, #dc3545 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
        },
        subtitle: {
            color: '#aab',
            fontSize: '0.95rem',
            margin: 0,
        },
        headerBadge: {
            display: 'inline-block',
            backgroundColor: '#dc3545',
            color: 'white',
            padding: '0.3rem 1rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
        },
        statsBar: {
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            flexWrap: 'wrap',
        },
        statCard: {
            flex: 1,
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '1rem 1.5rem',
            border: '1px solid rgba(255,255,255,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        },
        statIcon: {
            fontSize: '1.5rem',
            color: '#dc3545',
        },
        statInfo: {
            display: 'flex',
            flexDirection: 'column',
        },
        statNumber: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#0A0F1E',
            lineHeight: 1.2,
        },
        statLabel: {
            fontSize: '0.8rem',
            color: '#6c757d',
        },
        gridCards: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.5rem',
        },
        card: {
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.5)',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            padding: '1.2rem 1.2rem 0.8rem 1.2rem',
        },
        cardHeader: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.5rem',
        },
        avatar: {
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #dc3545, #c82333)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            color: 'white',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(220,53,69,0.2)',
        },
        cardTitle: {
            fontSize: '1.05rem',
            fontWeight: 'bold',
            color: '#0A0F1E',
            marginBottom: '0.3rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.4,
        },
        cardMeta: {
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            fontSize: '0.75rem',
            color: '#6c757d',
            marginBottom: '0.5rem',
        },
        cardMetaItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
        },
        cardBadge: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.15rem 0.6rem',
            borderRadius: '12px',
            fontSize: '0.6rem',
            fontWeight: 'bold',
            backgroundColor: '#dc3545',
            color: 'white',
        },
        cardFooter: {
            display: 'flex',
            gap: '0.5rem',
            paddingTop: '0.8rem',
            borderTop: '1px solid #e4e6eb',
            marginTop: '0.5rem',
            flexWrap: 'wrap',
        },
        btnRestore: {
            flex: 1,
            background: 'linear-gradient(135deg, #28a745, #20c997)',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '10px',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            minHeight: '40px',
        },
        btnView: {
            flex: 1,
            background: 'rgba(62,174,244,0.1)',
            color: '#3EAEF4',
            border: '1px solid #3EAEF4',
            padding: '0.5rem 1rem',
            borderRadius: '10px',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            textDecoration: 'none',
            minHeight: '40px',
        },
        emptyState: {
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.5)',
        },
        emptyIcon: {
            fontSize: '4rem',
            color: '#dc3545',
            marginBottom: '1rem',
            opacity: 0.3,
        },
        loadingSpinner: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '4rem',
            gap: '1rem',
            color: '#6c757d',
        },
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingSpinner}>
                    <div className="spinner-border text-warning" role="status" style={{ width: '2.5rem', height: '2.5rem' }} />
                    <span>Cargando papelera...</span>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerGlow} />
                <div style={styles.headerContent}>
                    <div style={styles.headerLeft}>
                        <Link to="/noticias/crear" style={styles.backButton}>
                            <FaArrowLeft /> Volver
                        </Link>
                        <div>
                            <h1 style={styles.title}>
                                <FaTrash style={{ color: '#dc3545' }} /> Papelera de Noticias
                            </h1>
                            <p style={styles.subtitle}>
                                Noticias eliminadas que pueden ser restauradas
                            </p>
                        </div>
                    </div>
                    <div>
                        <span style={styles.headerBadge}>
                            <FaStar style={{ marginRight: '5px' }} /> {noticias.length} en papelera
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div style={styles.statsBar}>
                <div style={styles.statCard}>
                    <div style={styles.statIcon}><FaTrash /></div>
                    <div style={styles.statInfo}>
                        <span style={styles.statNumber}>{noticias.length}</span>
                        <span style={styles.statLabel}>Noticias en papelera</span>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <div style={{ ...styles.statIcon, color: '#28a745' }}><FaUndo /></div>
                    <div style={styles.statInfo}>
                        <span style={styles.statNumber}>Restaurar</span>
                        <span style={styles.statLabel}>Todas las noticias</span>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <div style={{ ...styles.statIcon, color: '#3EAEF4' }}><FaFileAlt /></div>
                    <div style={styles.statInfo}>
                        <span style={styles.statNumber}>Archivadas</span>
                        <span style={styles.statLabel}>Permanentes</span>
                    </div>
                </div>
            </div>

            {/* Grid de cards */}
            {noticias.length === 0 ? (
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}><FaTrash /></div>
                    <h3 style={{ color: '#0A0F1E' }}>La papelera está vacía</h3>
                    <p style={{ color: '#6c757d' }}>Las noticias que elimines aparecerán aquí para que puedas restaurarlas.</p>
                </div>
            ) : (
                <div style={styles.gridCards}>
                    {noticias.map((noticia) => (
                        <div 
                            key={noticia.id}
                            style={styles.card}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-6px)';
                                e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.1)';
                                e.currentTarget.style.borderColor = '#dc3545';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
                            }}
                        >
                            <div style={styles.cardHeader}>
                                <div style={styles.avatar}>
                                    <FaNewspaper />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={styles.cardTitle}>{noticia.titulo}</div>
                                </div>
                                <span style={styles.cardBadge}>
                                    <FaTrash /> Eliminada
                                </span>
                            </div>

                            <div style={styles.cardMeta}>
                                <span style={styles.cardMetaItem}>
                                    <FaUser /> {noticia.autor || 'SNTSS'}
                                </span>
                                <span style={styles.cardMetaItem}>
                                    <FaCalendarAlt /> {noticia.fecha}
                                </span>
                            </div>

                            <div style={styles.cardFooter}>
                                <button 
                                    style={styles.btnRestore}
                                    onClick={() => restaurarNoticia(noticia.id, noticia.titulo)}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(40,167,69,0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <FaTrashRestore /> Restaurar
                                </button>
                                {/* <Link 
                                    to={`/noticias/${noticia.id}`}
                                    style={styles.btnView}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#3EAEF4';
                                        e.currentTarget.style.color = '#0A0F1E';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(62,174,244,0.1)';
                                        e.currentTarget.style.color = '#3EAEF4';
                                    }}
                                >
                                    <FaEye /> Ver
                                </Link> */}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NoticiasPapelera;