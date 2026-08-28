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

// ✅ IMPORTAR CSS EXTERNO
import '../css/Clausula79BisEntrada.css';

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

        const confirm = await Swal.fire({
            title: '✅ Registrar entrada',
            html: `¿Registrar entrada de <strong>${registro.nombre}</strong>?<br><small class="clausulaentrada-text-muted">Se registrará la hora actual.</small>`,
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

    return (
        <div className="clausulaentrada-wrapper">
            {/* Header Banner Sección 5 */}
            <div className="clausulaentrada-header ui-shadow">
                <div className="clausulaentrada-header-dots dot-matrix"></div>
                <div className="clausulaentrada-header-content">
                    <div className="clausulaentrada-header-left">
                        <Link to="/" className="clausulaentrada-back-button">
                            <FaArrowLeft size={12} /> Volver al Inicio
                        </Link>
                        <div className="clausulaentrada-header-titles">
                            <span className="clausulaentrada-header-tag">Control de Asistencia</span>
                            <h1 className="clausulaentrada-title">
                                Entrada y Check-in Cláusula 79Bis
                            </h1>
                            <p className="clausulaentrada-subtitle">
                                Registro y validación de asistencia en tiempo real para el festejo institucional
                            </p>
                        </div>
                    </div>
                    <div className="clausulaentrada-header-right">
                        <span className="clausulaentrada-header-badge">
                            <FaQrcode style={{ marginRight: '6px' }} /> Control de Entrada
                        </span>
                    </div>
                </div>

                {/* Matriz decorativa de puntitos en esquina */}
                <div className="clausulaentrada-header-dots-matrix">
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

            {/* Estadísticas en vivo */}
            <div className="clausulaentrada-stats-grid">
                <div className="clausulaentrada-stat-card">
                    <span className="clausulaentrada-stat-icon">📋</span>
                    <div className="clausulaentrada-stat-number">{estadisticas.total_registros}</div>
                    <div className="clausulaentrada-stat-label">Registros totales</div>
                </div>
                <div className="clausulaentrada-stat-card">
                    <span className="clausulaentrada-stat-icon">✅</span>
                    <div className="clausulaentrada-stat-number">{estadisticas.total_aprobados}</div>
                    <div className="clausulaentrada-stat-label">Aprobados</div>
                </div>
                <div className="clausulaentrada-stat-card">
                    <span className="clausulaentrada-stat-icon">👤</span>
                    <div className="clausulaentrada-stat-number">{estadisticas.check_in_trabajadores}</div>
                    <div className="clausulaentrada-stat-label">Trabajadores</div>
                </div>
                <div className="clausulaentrada-stat-card">
                    <span className="clausulaentrada-stat-icon">👥</span>
                    <div className="clausulaentrada-stat-number">{estadisticas.check_in_acompanantes}</div>
                    <div className="clausulaentrada-stat-label">Acompañantes</div>
                </div>
                <div className="clausulaentrada-stat-card">
                    <span className="clausulaentrada-stat-icon">🧑‍🤝‍🧑</span>
                    <div className="clausulaentrada-stat-number">{estadisticas.total_personas}</div>
                    <div className="clausulaentrada-stat-label">Total asistentes</div>
                </div>
                <div className="clausulaentrada-stat-card">
                    <span className="clausulaentrada-stat-icon">⚠️</span>
                    <div className="clausulaentrada-stat-number">{estadisticas.sin_registro}</div>
                    <div className="clausulaentrada-stat-label">Sin registro</div>
                </div>
            </div>

            {/* Buscador */}
            <div className="clausulaentrada-search-card">
                <div className="clausulaentrada-search-row">
                    <div className="clausulaentrada-search-wrapper">
                        <FaSearch className="clausulaentrada-search-icon" />
                        <input
                            type="text"
                            className="clausulaentrada-search-input"
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
                        className="clausulaentrada-btn-search"
                        onClick={buscarTrabajador}
                        disabled={loading}
                    >
                        {loading ? 'Buscando...' : <><FaSearch /> Buscar</>}
                    </button>
                </div>
            </div>

            {/* Resultado */}
            {registro && (
                <div className="clausulaentrada-result-card">
                    <div className="clausulaentrada-result-header">
                        <h3 className="clausulaentrada-result-nombre">
                            {registro.nombre || 'Sin nombre'}
                            <span className="clausulaentrada-text-muted" style={{ fontSize: '0.8rem', fontWeight: 'normal', marginLeft: '0.5rem' }}>
                                #{registro.matricula}
                            </span>
                        </h3>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            {registro.entrada_trabajador && (
                                <span className="clausulaentrada-check-badge">
                                    <FaCheckCircle /> Entrada: {new Date(registro.entrada_trabajador).toLocaleTimeString()}
                                </span>
                            )}
                            {registro.sin_registro == 1 && (
                                <span className="clausulaentrada-check-badge clausulaentrada-check-badge-danger">
                                    <FaExclamationTriangle /> Sin registro
                                </span>
                            )}
                            {!registro.entrada_trabajador && registro.sin_registro != 1 && (
                                <span className="clausulaentrada-check-badge clausulaentrada-check-badge-warning">
                                    <FaClock /> Pendiente
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="clausulaentrada-result-grid">
                        <div className="clausulaentrada-result-info">
                            <span className="clausulaentrada-result-label">Matrícula</span>
                            <span className="clausulaentrada-result-value">{registro.matricula}</span>
                        </div>
                        <div className="clausulaentrada-result-info">
                            <span className="clausulaentrada-result-label">Estatus</span>
                            <span className="clausulaentrada-result-value">
                                {getStatusInfo(registro.estatus).icon} {getStatusInfo(registro.estatus).label}
                            </span>
                        </div>
                        <div className="clausulaentrada-result-info">
                            <span className="clausulaentrada-result-label">Adscripción</span>
                            <span className="clausulaentrada-result-value">{registro.adscripcion || 'N/A'}</span>
                        </div>
                        <div className="clausulaentrada-result-info">
                            <span className="clausulaentrada-result-label">Categoría</span>
                            <span className="clausulaentrada-result-value">{registro.categoria || 'N/A'}</span>
                        </div>
                        <div className="clausulaentrada-result-info">
                            <span className="clausulaentrada-result-label">Teléfono</span>
                            <span className="clausulaentrada-result-value">{registro.telefono || 'N/A'}</span>
                        </div>
                        <div className="clausulaentrada-result-info">
                            <span className="clausulaentrada-result-label">Correo</span>
                            <span className="clausulaentrada-result-value">{registro.correo || 'N/A'}</span>
                        </div>
                        {registro.tiene_acompanante == 1 && (
                            <div className="clausulaentrada-result-info">
                                <span className="clausulaentrada-result-label">Acompañante</span>
                                <span className="clausulaentrada-result-value">
                                    {registro.nombre_acompanante || 'No especificado'}
                                    {registro.entrada_acompanante && (
                                        <span className="clausulaentrada-text-success" style={{ fontSize: '0.7rem', marginLeft: '0.5rem' }}>
                                            ✅ {new Date(registro.entrada_acompanante).toLocaleTimeString()}
                                        </span>
                                    )}
                                </span>
                            </div>
                        )}
                    </div>

                    {registro.observaciones && (
                        <div className="clausulaentrada-observaciones-box">
                            <strong>📝 Observaciones:</strong> {registro.observaciones}
                        </div>
                    )}

                    <div className="clausulaentrada-flex-row">
                        {!registro.entrada_trabajador && registro.sin_registro != 1 ? (
                            <button
                                className="clausulaentrada-btn-entrada"
                                onClick={registrarEntrada}
                            >
                                <FaUser /> Registrar Entrada
                            </button>
                        ) : (
                            <button
                                className="clausulaentrada-btn-entrada"
                                disabled
                            >
                                <FaCheckCircle /> Entrada Registrada
                            </button>
                        )}

                        {registro.tiene_acompanante == 1 && !registro.entrada_acompanante && (
                            <button
                                className="clausulaentrada-btn-acompanante"
                                onClick={registrarEntradaAcompanante}
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