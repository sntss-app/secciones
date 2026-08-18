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
        // Actualizar cada 30 segundos
        const interval = setInterval(cargarEstadisticas, 30000);
        return () => clearInterval(interval);
    }, []);

    // Datos para gráfica de estatus (Pie)
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

    // Datos para gráfica de asistencia (Bar)
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

    // ========== ESTILOS ==========
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
        // Stats Grid
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
        },
        statCard: {
            backgroundColor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '1.2rem',
            border: '1px solid rgba(255,255,255,0.5)',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            transition: 'all 0.3s ease',
        },
        statNumber: {
            fontSize: '2.2rem',
            fontWeight: 'bold',
            color: '#0A0F1E',
            lineHeight: 1.2,
        },
        statLabel: {
            fontSize: '0.7rem',
            color: '#6c757d',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginTop: '0.2rem',
        },
        statIcon: {
            fontSize: '1.5rem',
            display: 'block',
            marginBottom: '0.3rem',
        },
        // Charts Grid
        chartsGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2rem',
            marginBottom: '2rem',
        },
        chartCard: {
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.5)',
            padding: '1.5rem',
        },
        chartTitle: {
            fontSize: '1rem',
            fontWeight: 'bold',
            color: '#0A0F1E',
            marginBottom: '1rem',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
        },
        chartContainer: {
            height: '280px',
            position: 'relative',
        },
        // Tabla de registros recientes
        tableCard: {
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.5)',
            padding: '1.5rem',
            marginBottom: '2rem',
        },
        tableTitle: {
            fontSize: '1rem',
            fontWeight: 'bold',
            color: '#0A0F1E',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.85rem',
        },
        th: {
            textAlign: 'left',
            padding: '0.6rem 0.8rem',
            backgroundColor: '#f8f9fa',
            fontWeight: 'bold',
            color: '#495057',
            borderBottom: '2px solid #e9ecef',
        },
        td: {
            padding: '0.6rem 0.8rem',
            borderBottom: '1px solid #e9ecef',
        },
        badge: (bg, color = 'white') => ({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.15rem 0.6rem',
            borderRadius: '12px',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            backgroundColor: bg,
            color: color,
        }),
        loadingSpinner: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '4rem',
            gap: '1rem',
            color: '#6c757d',
        },
        refreshButton: {
            backgroundColor: '#3EAEF4',
            color: '#0A0F1E',
            border: 'none',
            padding: '0.5rem 1.2rem',
            borderRadius: '25px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
        },
        // Responsive
        '@media (max-width: 768px)': {
            chartsGrid: {
                gridTemplateColumns: '1fr',
                gap: '1rem',
            },
            statsGrid: {
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            },
        },
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingSpinner}>
                    <div className="spinner-border text-warning" role="status" style={{ width: '2.5rem', height: '2.5rem' }} />
                    <span>Cargando estadísticas...</span>
                </div>
            </div>
        );
    }

    // Calcular totales para mostrar
    const totalRegistros = estadisticas.total_registros || 0;
    const totalAprobados = estadisticas.total_aprobados || 0;
    const porcentajeAprobados = totalRegistros > 0 ? Math.round((totalAprobados / totalRegistros) * 100) : 0;
    const totalAsistentes = estadisticas.total_personas || 0;

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
                                <FaChartPie style={{ color: '#3EAEF4' }} /> Estadísticas 79Bis
                            </h1>
                            <p style={styles.subtitle}>
                                Resumen del festejo de Intendencia y Limpieza
                            </p>
                        </div>
                    </div>
                    <div>
                        <span style={styles.headerBadge}>
                            <FaStar style={{ marginRight: '5px' }} /> Actualizado en vivo
                        </span>
                        <button 
                            style={{ ...styles.refreshButton, marginLeft: '0.5rem' }}
                            onClick={cargarEstadisticas}
                        >
                            <FaClock /> Actualizar
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <span style={styles.statIcon}>📋</span>
                    <div style={styles.statNumber}>{totalRegistros}</div>
                    <div style={styles.statLabel}>Registros totales</div>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statIcon}>✅</span>
                    <div style={styles.statNumber}>{totalAprobados}</div>
                    <div style={styles.statLabel}>Aprobados ({porcentajeAprobados}%)</div>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statIcon}>👤</span>
                    <div style={styles.statNumber}>{estadisticas.check_in_trabajadores || 0}</div>
                    <div style={styles.statLabel}>Trabajadores</div>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statIcon}>👥</span>
                    <div style={styles.statNumber}>{estadisticas.check_in_acompanantes || 0}</div>
                    <div style={styles.statLabel}>Acompañantes</div>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statIcon}>🧑‍🤝‍🧑</span>
                    <div style={styles.statNumber}>{totalAsistentes}</div>
                    <div style={styles.statLabel}>Total asistentes</div>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statIcon}>⚠️</span>
                    <div style={styles.statNumber}>{estadisticas.sin_registro || 0}</div>
                    <div style={styles.statLabel}>Sin registro</div>
                </div>
            </div>

            {/* Charts Grid */}
            <div style={styles.chartsGrid}>
                {/* Gráfica de estatus */}
                <div style={styles.chartCard}>
                    <div style={styles.chartTitle}>
                        <FaChartPie style={{ color: '#3EAEF4' }} /> Distribución por Estatus
                    </div>
                    <div style={styles.chartContainer}>
                        <Pie data={statusData} options={chartOptions} />
                    </div>
                </div>

                {/* Gráfica de asistencia */}
                <div style={styles.chartCard}>
                    <div style={styles.chartTitle}>
                        <FaChartBar style={{ color: '#28a745' }} /> Asistencia al Evento
                    </div>
                    <div style={styles.chartContainer}>
                        <Bar data={asistenciaData} options={barOptions} />
                    </div>
                </div>
            </div>

            {/* Resumen ejecutivo */}
            <div style={styles.tableCard}>
                <div style={styles.tableTitle}>
                    <FaInfoCircle style={{ color: '#3EAEF4' }} /> Resumen Ejecutivo
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', color: '#6c757d', textTransform: 'uppercase' }}>Mesas necesarias</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0A0F1E' }}>
                            {Math.ceil(totalAsistentes / 10)}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#6c757d' }}>10 personas por mesa</div>
                    </div>
                    <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', color: '#6c757d', textTransform: 'uppercase' }}>Comida necesaria</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0A0F1E' }}>
                            {totalAsistentes}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#6c757d' }}>porciones</div>
                    </div>
                    <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', color: '#6c757d', textTransform: 'uppercase' }}>Regalos necesarios</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0A0F1E' }}>
                            {estadisticas.check_in_trabajadores || 0}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#6c757d' }}>para trabajadores</div>
                    </div>
                </div>
            </div>

            {/* Últimos registros (opcional - se puede agregar después) */}
            <div style={styles.tableCard}>
                <div style={styles.tableTitle}>
                    <FaUsers style={{ color: '#3EAEF4' }} /> Últimos Registros
                </div>
                <p style={{ color: '#6c757d', fontSize: '0.85rem' }}>
                    Los últimos registros aparecerán aquí con su estatus y hora de entrada.
                </p>
                {/* Aquí se puede agregar una tabla con los últimos registros */}
            </div>
        </div>
    );
};

export default Clausula79BisEstadisticas;