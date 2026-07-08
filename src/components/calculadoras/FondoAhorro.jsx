import React, { useState } from 'react';
import { FaCalculator, FaPiggyBank, FaMoneyBillWave, FaInfoCircle, FaCalendarAlt, FaChartLine } from 'react-icons/fa';

const FondoAhorro = () => {
    const [c02, setC02] = useState('');
    const [c11, setC11] = useState('');
    const [resultado, setResultado] = useState(null);

    const calcular = () => {
        const c02Num = parseFloat(c02);
        const c11Num = parseFloat(c11);
        
        if (isNaN(c02Num) || isNaN(c11Num)) {
            alert('Por favor ingresa ambos conceptos (002 y 011).');
            return;
        }

        setResultado((c02Num + c11Num) * 2 * 46 / 30);
    };

    const formatter = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2
    });

    const styles = {
        container: {
            padding: '1.5rem',
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.5)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            marginBottom: '1.5rem',
            paddingBottom: '0.5rem',
            borderBottom: '3px solid #27AE60',
        },
        headerIcon: {
            fontSize: '2rem',
            color: '#27AE60',
        },
        headerTitle: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #0A0F1E, #27AE60)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0,
        },
        headerSubtitle: {
            color: '#6c757d',
            fontSize: '0.85rem',
            marginTop: '0.2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
        },
        infoBox: {
            backgroundColor: 'rgba(39,174,96,0.08)',
            borderLeft: '4px solid #27AE60',
            padding: '0.8rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.85rem',
            color: '#495057',
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginBottom: '1rem',
        },
        inputGroup: {
            marginBottom: '1rem',
        },
        label: {
            display: 'block',
            fontWeight: '600',
            fontSize: '0.85rem',
            color: '#0A0F1E',
            marginBottom: '0.3rem',
        },
        labelIcon: {
            marginRight: '0.3rem',
            color: '#27AE60',
        },
        input: {
            width: '100%',
            padding: '0.6rem 1rem',
            fontSize: '0.95rem',
            border: '1px solid #ddd',
            borderRadius: '10px',
            outline: 'none',
            transition: 'all 0.3s ease',
            backgroundColor: 'white',
        },
        button: {
            backgroundColor: '#27AE60',
            color: 'white',
            border: 'none',
            padding: '0.7rem 1.5rem',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            width: '100%',
            marginTop: '0.5rem',
        },
        resultadoContainer: {
            marginTop: '1.5rem',
            padding: '1.25rem',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e9ecef',
        },
        resultadoTitle: {
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '1rem',
            color: '#0A0F1E',
            fontSize: '1rem',
        },
        resultadoItem: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.8rem 1rem',
            borderRadius: '8px',
            backgroundColor: 'rgba(39,174,96,0.08)',
            borderLeft: '4px solid #27AE60',
        },
        resultadoLabel: {
            color: '#495057',
            fontSize: '0.9rem',
        },
        resultadoLabelSmall: {
            display: 'block',
            fontSize: '0.75rem',
            color: '#6c757d',
            marginTop: '0.1rem',
        },
        resultadoMonto: {
            fontWeight: 'bold',
            fontSize: '1.3rem',
            color: '#27AE60',
        },
        resultadoDetalle: {
            marginTop: '0.8rem',
            padding: '0.8rem',
            backgroundColor: '#fff',
            borderRadius: '8px',
            border: '1px solid #e9ecef',
        },
        detalleItem: {
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0.3rem 0',
            fontSize: '0.85rem',
            color: '#495057',
            borderBottom: '1px solid #f8f9fa',
        },
        detalleItemLast: {
            borderBottom: 'none',
        },
        smallText: {
            display: 'block',
            textAlign: 'center',
            color: '#6c757d',
            fontSize: '0.75rem',
            marginTop: '0.8rem',
            fontStyle: 'italic',
        },
        '@media (max-width: 480px)': {
            grid: {
                gridTemplateColumns: '1fr',
            },
        },
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <FaPiggyBank style={styles.headerIcon} />
                <div>
                    <h3 style={styles.headerTitle}>Fondo de Ahorro (2° de Julio)</h3>
                    <div style={styles.headerSubtitle}>
                        <FaInfoCircle size={12} /> Ahorro anual para los trabajadores
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div style={styles.infoBox}>
                <FaInfoCircle style={{ color: '#27AE60', marginRight: '0.5rem' }} />
                El Fondo de Ahorro 2 de Julio se calcula con base en tu sueldo base.
                Se utiliza el promedio de los conceptos 002 y 011 para determinar el ahorro.
            </div>

            {/* Formulario */}
            <div style={styles.grid}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>
                        <FaMoneyBillWave style={styles.labelIcon} /> Concepto 002
                    </label>
                    <input 
                        type="number" 
                        style={styles.input} 
                        value={c02} 
                        onChange={(e) => setC02(e.target.value)} 
                        placeholder="Ej: 2437.73"
                        onFocus={(e) => {
                            e.target.style.borderColor = '#27AE60';
                            e.target.style.boxShadow = '0 0 0 3px rgba(39,174,96,0.15)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = '#ddd';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>
                        <FaMoneyBillWave style={styles.labelIcon} /> Concepto 011
                    </label>
                    <input 
                        type="number" 
                        style={styles.input} 
                        value={c11} 
                        onChange={(e) => setC11(e.target.value)} 
                        placeholder="Ej: 2002.60"
                        onFocus={(e) => {
                            e.target.style.borderColor = '#27AE60';
                            e.target.style.boxShadow = '0 0 0 3px rgba(39,174,96,0.15)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = '#ddd';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                </div>
            </div>

            {/* Botón Calcular */}
            <button 
                style={styles.button}
                onClick={calcular}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(39,174,96,0.3)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                }}
            >
                <FaCalculator /> Calcular Fondo de Ahorro
            </button>

            {/* Resultados */}
            {resultado && (
                <div style={styles.resultadoContainer}>
                    <div style={styles.resultadoTitle}>
                        <FaPiggyBank style={{ color: '#27AE60', marginRight: '0.5rem' }} />
                        Fondo de Ahorro Estimado
                    </div>

                    <div style={styles.resultadoItem}>
                        <div>
                            <span style={styles.resultadoLabel}>Total del fondo</span>
                            <span style={styles.resultadoLabelSmall}>46 días tabulares</span>
                        </div>
                        <span style={styles.resultadoMonto}>{formatter.format(resultado)}</span>
                    </div>

                    <div style={styles.resultadoDetalle}>
                        <div style={styles.detalleItem}>
                            <span>Base de cálculo</span>
                            <span>Conceptos 002 + 011</span>
                        </div>
                        <div style={styles.detalleItem}>
                            <span>Días considerados</span>
                            <span>46 días</span>
                        </div>
                        <div style={{ ...styles.detalleItem, ...styles.detalleItemLast }}>
                            <span>Periodo</span>
                            <span>Anual (2 de Julio)</span>
                        </div>
                    </div>

                    <small style={styles.smallText}>
                        <FaCalendarAlt style={{ marginRight: '0.3rem' }} />
                        El fondo se entrega el 2 de julio de cada año. 
                        El monto puede variar según incidencias del periodo.
                    </small>
                </div>
            )}
        </div>
    );
};

export default FondoAhorro;