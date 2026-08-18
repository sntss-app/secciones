import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaArrowLeft, FaSearch, FaCheckCircle, FaExclamationTriangle, 
    FaClock, FaUser, FaIdCard, FaBuilding, FaPhone, FaEnvelope,
    FaUserPlus, FaCalendarAlt, FaShieldAlt, FaStar, FaRocket,
    FaQrcode, FaUsers, FaGift, FaTrophy, FaInfoCircle
} from 'react-icons/fa';
import { apiUrl } from '../config';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const Clausula79BisEntrada = () => {
    const [matriculaBusqueda, setMatriculaBusqueda] = useState('');
    const [loading, setLoading] = useState(false);
    const [registro, setRegistro] = useState(null);
    const [estadisticas, setEstadisticas] = useState({
        total_registros: 0,
        total_aprobados: 0,
        check_in_trabajadores: 0,
        check_in_acompanantes: 0,
        total_personas: 0,
        sin_registro: 0
    });

    // Cargar estadísticas al montar
    useEffect(() => {
        cargarEstadisticas();
    }, []);

    const cargarEstadisticas = async () => {
        try {
            const response = await fetch(apiUrl('/clausula79bis_estadisticas.php'));
            const data = await response.json();
            if (data.success) {
                setEstadisticas(data.estadisticas || {
                    total_registros: 0,
                    total_aprobados: 0,
                    check_in_trabajadores: 0,
                    check_in_acompanantes: 0,
                    total_personas: 0,
                    sin_registro: 0
                });
            }
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
        }
    };

    const buscarTrabajador = async () => {
        if (!matriculaBusqueda.trim()) {
            Swal.fire({
                title: '⚠️ Matrícula requerida',
                text: 'Ingresa la matrícula del trabajador.',
                icon: 'warning',
                confirmButtonColor: '#ffc107',
            });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(apiUrl(`/clausula79bis_obtener.php?matricula=${encodeURIComponent(matriculaBusqueda.trim())}`));
            const data = await response.json();

            if (data.success && data.registro) {
                setRegistro(data.registro);
                // Si ya tiene check-in, mostrar mensaje
                if (data.registro.entrada_trabajador) {
                    Swal.fire({
                        title: 'ℹ️ Ya registrado',
                        text: 'Este trabajador ya registró su entrada.',
                        icon: 'info',
                        confirmButtonColor: '#3EAEF4',
                        timer: 2000,
                    });
                }
            } else {
                // Sin registro - guardar como "sin registro"
                const result = await Swal.fire({
                    title: '⚠️ Sin registro',
                    text: 'Este trabajador no tiene registro en el sistema. ¿Deseas registrarlo como "sin registro"?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#dc3545',
                    cancelButtonColor: '#6c757d',
                    confirmButtonText: '✅ Sí, registrar sin registro',
                    cancelButtonText: '❌ Cancelar',
                });

                if (result.isConfirmed) {
                    await registrarSinRegistro(matriculaBusqueda.trim());
                }
                setRegistro(null);
            }
        } catch (error) {
            console.error('Error buscando trabajador:', error);
            Swal.fire({
                title: '❌ Error',
                text: 'Error al buscar el trabajador.',
                icon: 'error',
                confirmButtonColor: '#dc3545',
            });
        } finally {
            setLoading(false);
        }
    };

    const registrarSinRegistro = async (matricula) => {
        try {
            const response = await fetch(apiUrl('/clausula79bis_sin_registro.php'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matricula })
            });

            const data = await response.json();
            if (data.success) {
                await Swal.fire({
                    title: '✅ Registrado sin registro',
                    text: 'El trabajador ha sido registrado como "sin registro".',
                    icon: 'success',
                    confirmButtonColor: '#28a745',
                    timer: 2000,
                });
                cargarEstadisticas();
                setRegistro(null);
                setMatriculaBusqueda('');
            } else {
                throw new Error(data.message || 'Error al registrar');
            }
        } catch (error) {
            Swal.fire({
                title: '❌ Error',
                text: error.message,
                icon: 'error',
                confirmButtonColor: '#dc3545',
            });
        }
    };

    const registrarEntrada = async () => {
        if (!registro) return;

        // Confirmar
        const confirm = await Swal.fire({
            title: '✅ Registrar entrada',
            html: `¿Registrar entrada de <strong>${registro.nombre}</strong>?<br><small style="color:#6c757d;">Se registrará la hora actual.</small>`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#6c757d',
            confirmButtonText: '✅ Sí, registrar',
            cancelButtonText: '❌ Cancelar',
        });

        if (!confirm.isConfirmed) return;

        try {
            const response = await fetch(apiUrl('/clausula79bis_entrada.php'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: registro.id,
                    matricula: registro.matricula,
                    tipo: 'trabajador'
                })
            });

            const data = await response.json();
            if (data.success) {
                await Swal.fire({
                    title: '✅ ¡Entrada registrada!',
                    text: `Bienvenido ${registro.nombre}`,
                    icon: 'success',
                    confirmButtonColor: '#28a745',
                    timer: 2000,
                });
                setRegistro({ ...registro, entrada_trabajador: data.hora });
                cargarEstadisticas();
            } else {
                throw new Error(data.message || 'Error al registrar');
            }
        } catch (error) {
            Swal.fire({
                title: '❌ Error',
                text: error.message,
                icon: 'error',
                confirmButtonColor: '#dc3545',
            });
        }
    };

    const registrarEntradaAcompanante = async () => {
        if (!registro) return;

        if (registro.tiene_acompanante != 1) {
            Swal.fire({
                title: 'ℹ️ Sin acompañante',
                text: 'Este trabajador no registró acompañante.',
                icon: 'info',
                confirmButtonColor: '#3EAEF4',
            });
            return;
        }

        if (registro.entrada_acompanante) {
            Swal.fire({
                title: 'ℹ️ Ya registrado',
                text: 'El acompañante ya registró su entrada.',
                icon: 'info',
                confirmButtonColor: '#3EAEF4',
            });
            return;
        }

        // Confirmar
        const confirm = await Swal.fire({
            title: '✅ Registrar acompañante',
            html: `¿Registrar entrada de <strong>${registro.nombre_acompanante}</strong>?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#6c757d',
            confirmButtonText: '✅ Sí, registrar',
            cancelButtonText: '❌ Cancelar',
        });

        if (!confirm.isConfirmed) return;

        try {
            const response = await fetch(apiUrl('/clausula79bis_entrada.php'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: registro.id,
                    matricula: registro.matricula,
                    tipo: 'acompanante'
                })
            });

            const data = await response.json();
            if (data.success) {
                await Swal.fire({
                    title: '✅ ¡Acompañante registrado!',
                    text: `Bienvenido ${registro.nombre_acompanante}`,
                    icon: 'success',
                    confirmButtonColor: '#28a745',
                    timer: 2000,
                });
                setRegistro({ ...registro, entrada_acompanante: data.hora });
                cargarEstadisticas();
            } else {
                throw new Error(data.message || 'Error al registrar');
            }
        } catch (error) {
            Swal.fire({
                title: '❌ Error',
                text: error.message,
                icon: 'error',
                confirmButtonColor: '#dc3545',
            });
        }
    };

    // Ya tienes esta función en el componente
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

    // ========== ESTILOS ==========
    const styles = {
        container: {
            maxWidth: '1200px',
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
            borderBottom: '4px solid #3EAEF4',
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
            background: 'linear-gradient(135deg, #fff 30%, #3EAEF4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0,
        },
        subtitle: {
            color: '#aab',
            fontSize: '0.95rem',
            margin: 0,
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
        // Stats
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
        },
        statCard: {
            backgroundColor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '1rem 1.2rem',
            border: '1px solid rgba(255,255,255,0.5)',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            transition: 'all 0.3s ease',
        },
        statNumber: {
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#0A0F1E',
            lineHeight: 1.2,
        },
        statLabel: {
            fontSize: '0.7rem',
            color: '#6c757d',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
        },
        statIcon: {
            fontSize: '1.2rem',
            display: 'block',
            marginBottom: '0.2rem',
        },
        // Buscador
        searchCard: {
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.5)',
            marginBottom: '2rem',
            padding: '1.5rem',
        },
        searchRow: {
            display: 'flex',
            gap: '0.8rem',
            alignItems: 'center',
            flexWrap: 'wrap',
        },
        searchWrapper: {
            flex: 1,
            position: 'relative',
            minWidth: '200px',
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
            fontSize: '1rem',
            border: '1px solid #ddd',
            borderRadius: '25px',
            outline: 'none',
            transition: 'all 0.3s ease',
            backgroundColor: '#f0f2f5',
            height: '50px',
        },
        btnSearch: {
            backgroundColor: '#3EAEF4',
            color: '#0A0F1E',
            border: 'none',
            padding: '0.7rem 1.5rem',
            borderRadius: '25px',
            fontWeight: 'bold',
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            height: '50px',
        },
        // Resultado
        resultCard: {
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.5)',
            padding: '1.5rem',
        },
        resultHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid #e9ecef',
        },
        resultNombre: {
            fontSize: '1.3rem',
            fontWeight: 'bold',
            color: '#0A0F1E',
            margin: 0,
        },
        resultGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.3rem 1.5rem',
        },
        resultInfo: {
            display: 'flex',
            flexDirection: 'column',
        },
        resultLabel: {
            fontSize: '0.7rem',
            fontWeight: '600',
            color: '#6c757d',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
        },
        resultValue: {
            fontSize: '0.95rem',
            fontWeight: '500',
            color: '#0A0F1E',
        },
        btnEntrada: {
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            padding: '0.8rem 1.5rem',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            flex: 1,
        },
        btnEntradaDisabled: {
            backgroundColor: '#6c757d',
            color: 'white',
            cursor: 'not-allowed',
            opacity: 0.6,
        },
        btnAcompanante: {
            backgroundColor: '#8E44AD',
            color: 'white',
            border: 'none',
            padding: '0.8rem 1.5rem',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            flex: 1,
        },
        flexRow: {
            display: 'flex',
            gap: '0.8rem',
            marginTop: '1rem',
            flexWrap: 'wrap',
        },
        badgeStatus: (bg) => ({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.3rem 1rem',
            borderRadius: '20px',
            background: bg,
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.8rem',
        }),
        checkBadge: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.2rem 0.6rem',
            borderRadius: '12px',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            backgroundColor: '#28a745',
            color: 'white',
        },
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerGlow} />
                <div style={styles.headerContent}>
                    <div style={styles.headerLeft}>
                        <Link to="/dashboard" style={styles.backButton}>
                            <FaArrowLeft /> Volver
                        </Link>
                        <div>
                            <h1 style={styles.title}>
                                <FaQrcode style={{ color: '#3EAEF4' }} /> Entrada 79Bis
                            </h1>
                            <p style={styles.subtitle}>
                                Registro de asistencia para el festejo
                            </p>
                        </div>
                    </div>
                    <div>
                        <span style={styles.headerBadge}>
                            <FaStar style={{ marginRight: '5px' }} /> Control de entrada
                        </span>
                    </div>
                </div>
            </div>

            {/* Estadísticas en vivo */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <span style={styles.statIcon}>📋</span>
                    <div style={styles.statNumber}>{estadisticas.total_registros}</div>
                    <div style={styles.statLabel}>Registros totales</div>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statIcon}>✅</span>
                    <div style={styles.statNumber}>{estadisticas.total_aprobados}</div>
                    <div style={styles.statLabel}>Aprobados</div>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statIcon}>👤</span>
                    <div style={styles.statNumber}>{estadisticas.check_in_trabajadores}</div>
                    <div style={styles.statLabel}>Trabajadores</div>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statIcon}>👥</span>
                    <div style={styles.statNumber}>{estadisticas.check_in_acompanantes}</div>
                    <div style={styles.statLabel}>Acompañantes</div>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statIcon}>🧑‍🤝‍🧑</span>
                    <div style={styles.statNumber}>{estadisticas.total_personas}</div>
                    <div style={styles.statLabel}>Total asistentes</div>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statIcon}>⚠️</span>
                    <div style={styles.statNumber}>{estadisticas.sin_registro}</div>
                    <div style={styles.statLabel}>Sin registro</div>
                </div>
            </div>

            {/* Buscador */}
            <div style={styles.searchCard}>
                <div style={styles.searchRow}>
                    <div style={styles.searchWrapper}>
                        <FaSearch style={styles.searchIcon} />
                        <input
                            type="text"
                            style={styles.searchInput}
                            placeholder="Buscar por matrícula"
                            value={matriculaBusqueda}
                            onChange={(e) => setMatriculaBusqueda(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    buscarTrabajador();
                                }
                            }}
                            disabled={loading}
                        />
                    </div>
                    <button
                        style={styles.btnSearch}
                        onClick={buscarTrabajador}
                        disabled={loading}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(62,174,244,0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        {loading ? 'Buscando...' : <><FaSearch /> Buscar</>}
                    </button>
                </div>
            </div>

            {/* Resultado */}
            {registro && (
                <div style={styles.resultCard}>
                    <div style={styles.resultHeader}>
                        <h3 style={styles.resultNombre}>
                            {registro.nombre || 'Sin nombre'}
                            <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#6c757d', marginLeft: '0.5rem' }}>
                                #{registro.matricula}
                            </span>
                        </h3>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            {registro.entrada_trabajador && (
                                <span style={styles.checkBadge}>
                                    <FaCheckCircle /> Entrada: {new Date(registro.entrada_trabajador).toLocaleTimeString()}
                                </span>
                            )}
                            {registro.sin_registro == 1 && (
                                <span style={{ ...styles.checkBadge, backgroundColor: '#dc3545' }}>
                                    <FaExclamationTriangle /> Sin registro
                                </span>
                            )}
                            {!registro.entrada_trabajador && registro.sin_registro != 1 && (
                                <span style={{ ...styles.checkBadge, backgroundColor: '#ffc107', color: '#0A0F1E' }}>
                                    <FaClock /> Pendiente
                                </span>
                            )}
                        </div>
                    </div>

                    <div style={styles.resultGrid}>
                        <div style={styles.resultInfo}>
                            <span style={styles.resultLabel}>Matrícula</span>
                            <span style={styles.resultValue}>{registro.matricula}</span>
                        </div>
                        <div style={styles.resultInfo}>
                            <span style={styles.resultLabel}>Estatus</span>
                            <span style={styles.resultValue}>
                                {getStatusInfo(registro.estatus).icon} {getStatusInfo(registro.estatus).label}
                            </span>
                        </div>
                        <div style={styles.resultInfo}>
                            <span style={styles.resultLabel}>Adscripción</span>
                            <span style={styles.resultValue}>{registro.adscripcion || 'N/A'}</span>
                        </div>
                        <div style={styles.resultInfo}>
                            <span style={styles.resultLabel}>Categoría</span>
                            <span style={styles.resultValue}>{registro.categoria || 'N/A'}</span>
                        </div>
                        <div style={styles.resultInfo}>
                            <span style={styles.resultLabel}>Teléfono</span>
                            <span style={styles.resultValue}>{registro.telefono || 'N/A'}</span>
                        </div>
                        <div style={styles.resultInfo}>
                            <span style={styles.resultLabel}>Correo</span>
                            <span style={styles.resultValue}>{registro.correo || 'N/A'}</span>
                        </div>
                        {registro.tiene_acompanante == 1 && (
                            <div style={styles.resultInfo}>
                                <span style={styles.resultLabel}>Acompañante</span>
                                <span style={styles.resultValue}>
                                    {registro.nombre_acompanante || 'No especificado'}
                                    {registro.entrada_acompanante && (
                                        <span style={{ fontSize: '0.7rem', color: '#28a745', marginLeft: '0.5rem' }}>
                                            ✅ {new Date(registro.entrada_acompanante).toLocaleTimeString()}
                                        </span>
                                    )}
                                </span>
                            </div>
                        )}
                    </div>

                    {registro.observaciones && (
                        <div style={{
                            backgroundColor: '#fff3cd',
                            padding: '0.5rem 0.8rem',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            borderLeft: '4px solid #ffc107',
                            marginTop: '0.5rem'
                        }}>
                            <strong>📝 Observaciones:</strong> {registro.observaciones}
                        </div>
                    )}

                    <div style={styles.flexRow}>
                        {/* Botón entrada trabajador */}
                        {!registro.entrada_trabajador && registro.sin_registro != 1 ? (
                            <button
                                style={styles.btnEntrada}
                                onClick={registrarEntrada}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(40,167,69,0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <FaUser /> Registrar Entrada
                            </button>
                        ) : (
                            <button
                                style={{ ...styles.btnEntrada, ...styles.btnEntradaDisabled }}
                                disabled
                            >
                                <FaCheckCircle /> Entrada Registrada
                            </button>
                        )}

                        {/* Botón entrada acompañante */}
                        {registro.tiene_acompanante == 1 && !registro.entrada_acompanante && (
                            <button
                                style={styles.btnAcompanante}
                                onClick={registrarEntradaAcompanante}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(142,68,173,0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <FaUserPlus /> Registrar Acompañante
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clausula79BisEntrada;