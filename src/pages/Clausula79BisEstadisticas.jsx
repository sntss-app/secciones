import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaArrowLeft, FaUsers, FaCheckCircle, FaClock, FaExclamationTriangle,
    FaUserPlus, FaCalendarAlt, FaChartPie, FaChartBar, FaDownload,
    FaShieldAlt, FaStar, FaRocket, FaGift, FaTrophy, FaInfoCircle,
    FaUser, FaUserFriends, FaRegSmile, FaRegFrown
} from 'react-icons/fa';
import { apiUrl } from '../config';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// ✅ IMPORTAR CSS EXTERNO
import '../css/Clausula79BisEstadisticas.css';

// Registrar componentes de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Clausula79BisEstadisticas = () => {
    const [loading, setLoading] = useState(true);
    const [estadisticas, setEstadisticas] = useState({
        total_registros: 0,
        total_aprobados: 0,
        check_in_trabajadores: 0,
        check_in_acompanantes: 0,
        total_personas: 0,
        sin_registro: 0,
        por_estatus: {
            preregistro: 0,
            aprobado: 0,
            observaciones: 0,
            incompleto: 0,
            denegado: 0
        }
    });

    const cargarEstadisticas = async () => {
        setLoading(true);
        try {
            const response = await fetch(apiUrl('/clausula79bis_estadisticas.php'));
            const data = await response.json();
            if (data.success) {
                setEstadisticas(data.estadisticas);
            }
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
            Swal.fire({
                title: '❌ Error',
                text: 'Error al cargar las estadísticas',
                icon: 'error',
                confirmButtonColor: '#dc3545',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarEstadisticas();
        const interval = setInterval(cargarEstadisticas, 30000);
        return () => clearInterval(interval);
    }, []);

    const statusData = {
        labels: ['Preregistro', 'Aprobado', 'Observaciones', 'Incompleto', 'Denegado'],
        datasets: [{
            data: [
                estadisticas.por_estatus?.preregistro || 0,
                estadisticas.por_estatus?.aprobado || 0,
                estadisticas.por_estatus?.observaciones || 0,
                estadisticas.por_estatus?.incompleto || 0,
                estadisticas.por_estatus?.denegado || 0
            ],
            backgroundColor: [
                '#6c757d',
                '#28a745',
                '#ffc107',
                '#fd7e14',
                '#dc3545'
            ],
            borderColor: [
                '#5a6268',
                '#1e7e34',
                '#e0a800',
                '#cc7a00',
                '#bd2130'
            ],
            borderWidth: 2,
        }]
    };

    const asistenciaData = {
        labels: ['Trabajadores', 'Acompañantes', 'Total'],
        datasets: [{
            label: 'Asistentes',
            data: [
                estadisticas.check_in_trabajadores || 0,
                estadisticas.check_in_acompanantes || 0,
                estadisticas.total_personas || 0
            ],
            backgroundColor: [
                'rgba(62,174,244,0.8)',
                'rgba(142,68,173,0.8)',
                'rgba(40,167,69,0.8)'
            ],
            borderColor: [
                '#3EAEF4',
                '#8E44AD',
                '#28a745'
            ],
            borderWidth: 2,
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    font: {
                        size: 12
                    },
                    padding: 20
                }
            }
        }
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        }
    };

    if (loading) {
        return (
            <div className="clausulaestadisticas-container">
                <div className="clausulaestadisticas-loading">
                    <div className="clausulaestadisticas-spinner" role="status" />
                    <span>Cargando estadísticas...</span>
                </div>
            </div>
        );
    }

    const totalRegistros = estadisticas.total_registros || 0;
    const totalAprobados = estadisticas.total_aprobados || 0;
    const porcentajeAprobados = totalRegistros > 0 ? Math.round((totalAprobados / totalRegistros) * 100) : 0;
    const totalAsistentes = estadisticas.total_personas || 0;

    return (
        <div className="clausulaestadisticas-wrapper">
            {/* Header Banner Sección 5 */}
            <div className="clausulaestadisticas-header ui-shadow">
                <div className="clausulaestadisticas-header-dots dot-matrix"></div>
                <div className="clausulaestadisticas-header-content">
                    <div className="clausulaestadisticas-header-left">
                        <Link to="/" className="clausulaestadisticas-back-button">
                            <FaArrowLeft size={12} /> Volver al Inicio
                        </Link>
                        <div className="clausulaestadisticas-header-titles">
                            <span className="clausulaestadisticas-header-tag">Métricas en Tiempo Real</span>
                            <h1 className="clausulaestadisticas-title">
                                Estadísticas Cláusula 79Bis
                            </h1>
                            <p className="clausulaestadisticas-subtitle">
                                Resumen, aforos, registros y métricas de asistencia del festejo institucional
                            </p>
                        </div>
                    </div>
                    <div className="clausulaestadisticas-flex-center">
                        <span className="clausulaestadisticas-header-badge">
                            <FaStar style={{ marginRight: '6px' }} /> Actualizado en vivo
                        </span>
                        <button 
                            className="clausulaestadisticas-refresh-button"
                            onClick={cargarEstadisticas}
                        >
                            <FaClock /> Actualizar
                        </button>
                    </div>
                </div>

                {/* Matriz decorativa de puntitos en esquina */}
                <div className="clausulaestadisticas-header-dots-matrix">
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

            {/* Stats Grid */}
            <div className="clausulaestadisticas-stats-grid">
                <div className="clausulaestadisticas-stat-card">
                    <span className="clausulaestadisticas-stat-icon">📋</span>
                    <div className="clausulaestadisticas-stat-number">{totalRegistros}</div>
                    <div className="clausulaestadisticas-stat-label">Registros totales</div>
                </div>
                <div className="clausulaestadisticas-stat-card">
                    <span className="clausulaestadisticas-stat-icon">✅</span>
                    <div className="clausulaestadisticas-stat-number">{totalAprobados}</div>
                    <div className="clausulaestadisticas-stat-label">Aprobados ({porcentajeAprobados}%)</div>
                </div>
                <div className="clausulaestadisticas-stat-card">
                    <span className="clausulaestadisticas-stat-icon">👤</span>
                    <div className="clausulaestadisticas-stat-number">{estadisticas.check_in_trabajadores || 0}</div>
                    <div className="clausulaestadisticas-stat-label">Trabajadores</div>
                </div>
                <div className="clausulaestadisticas-stat-card">
                    <span className="clausulaestadisticas-stat-icon">👥</span>
                    <div className="clausulaestadisticas-stat-number">{estadisticas.check_in_acompanantes || 0}</div>
                    <div className="clausulaestadisticas-stat-label">Acompañantes</div>
                </div>
                <div className="clausulaestadisticas-stat-card">
                    <span className="clausulaestadisticas-stat-icon">🧑‍🤝‍🧑</span>
                    <div className="clausulaestadisticas-stat-number">{totalAsistentes}</div>
                    <div className="clausulaestadisticas-stat-label">Total asistentes</div>
                </div>
                <div className="clausulaestadisticas-stat-card">
                    <span className="clausulaestadisticas-stat-icon">⚠️</span>
                    <div className="clausulaestadisticas-stat-number">{estadisticas.sin_registro || 0}</div>
                    <div className="clausulaestadisticas-stat-label">Sin registro</div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="clausulaestadisticas-charts-grid">
                <div className="clausulaestadisticas-chart-card">
                    <div className="clausulaestadisticas-chart-title">
                        <FaChartPie style={{ color: '#3EAEF4' }} /> Distribución por Estatus
                    </div>
                    <div className="clausulaestadisticas-chart-container">
                        <Pie data={statusData} options={chartOptions} />
                    </div>
                </div>

                <div className="clausulaestadisticas-chart-card">
                    <div className="clausulaestadisticas-chart-title">
                        <FaChartBar style={{ color: '#28a745' }} /> Asistencia al Evento
                    </div>
                    <div className="clausulaestadisticas-chart-container">
                        <Bar data={asistenciaData} options={barOptions} />
                    </div>
                </div>
            </div>

            {/* Resumen ejecutivo */}
            <div className="clausulaestadisticas-table-card">
                <div className="clausulaestadisticas-table-title">
                    <FaInfoCircle style={{ color: '#3EAEF4' }} /> Resumen Ejecutivo
                </div>
                <div className="clausulaestadisticas-resumen-grid">
                    <div className="clausulaestadisticas-resumen-item">
                        <div className="clausulaestadisticas-resumen-label">Mesas necesarias</div>
                        <div className="clausulaestadisticas-resumen-number">
                            {Math.ceil(totalAsistentes / 10)}
                        </div>
                        <div className="clausulaestadisticas-resumen-sub">10 personas por mesa</div>
                    </div>
                    <div className="clausulaestadisticas-resumen-item">
                        <div className="clausulaestadisticas-resumen-label">Comida necesaria</div>
                        <div className="clausulaestadisticas-resumen-number">
                            {totalAsistentes}
                        </div>
                        <div className="clausulaestadisticas-resumen-sub">porciones</div>
                    </div>
                    <div className="clausulaestadisticas-resumen-item">
                        <div className="clausulaestadisticas-resumen-label">Regalos necesarios</div>
                        <div className="clausulaestadisticas-resumen-number">
                            {estadisticas.check_in_trabajadores || 0}
                        </div>
                        <div className="clausulaestadisticas-resumen-sub">para trabajadores</div>
                    </div>
                </div>
            </div>

            {/* Últimos registros */}
            <div className="clausulaestadisticas-table-card">
                <div className="clausulaestadisticas-table-title">
                    <FaUsers style={{ color: '#3EAEF4' }} /> Últimos Registros
                </div>
                <p className="clausulaestadisticas-text-muted" style={{ fontSize: '0.85rem' }}>
                    Los últimos registros aparecerán aquí con su estatus y hora de entrada.
                </p>
            </div>
        </div>
    );
};

export default Clausula79BisEstadisticas;