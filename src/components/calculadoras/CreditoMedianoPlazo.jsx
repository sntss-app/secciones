import React, { useState } from 'react';
import { FaCalculator, FaHouseUser, FaMoneyBillWave, FaInfoCircle, FaHome, FaChartLine } from 'react-icons/fa';

const CreditoMedianoPlazo = () => {
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

        const sumaQuincenal = c02Num + c11Num;
        const mensualBase = sumaQuincenal * 2;
        const prestaciones = mensualBase * 0.20;
        const totalMensual = mensualBase + prestaciones;

        setResultado(totalMensual * 35);
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
            borderBottom: '3px solid #5B86E5',
        },
        headerIcon: {
            fontSize: '2rem',
            color: '#5B86E5',
        },
        headerTitle: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #0A0F1E, #5B86E5)',
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
            backgroundColor: 'rgba(91,134,229,0.08)',
            borderLeft: '4px solid #5B86E5',
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
            color: '#5B86E5',
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
            backgroundColor: '#5B86E5',
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
            backgroundColor: 'rgba(91,134,229,0.08)',
            borderLeft: '4px solid #5B86E5',
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
            color: '#003c82',
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
                <FaHouseUser style={styles.headerIcon} />
                <div>
                    <h3 style={styles.headerTitle}>Crédito a Mediano Plazo</h3>
                    <div style={styles.headerSubtitle}>
                        <FaInfoCircle size={12} /> Trámite gestionado por la Secretaría de Fomento a la Habitación
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div style={styles.infoBox}>
                <FaInfoCircle style={{ color: '#5B86E5', marginRight: '0.5rem' }} />
                El crédito a mediano plazo se calcula con base en el Salario Mensual Integrado 
                (Sueldo Base + 20% de prestaciones). Permite financiar hasta 35 veces el salario.
            </div>

            {/* Formulario */}
            <div style={styles.grid}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>
                        <FaMoneyBillWave style={styles.labelIcon} /> Concepto 002 (quincenal)
                    </label>
                    <input 
                        type="number" 
                        step="0.01"
                        style={styles.input} 
                        value={c02} 
                        onChange={(e) => setC02(e.target.value)} 
                        placeholder="Ej: 2437.73"
                        onFocus={(e) => {
                            e.target.style.borderColor = '#5B86E5';
                            e.target.style.boxShadow = '0 0 0 3px rgba(91,134,229,0.15)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = '#ddd';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>
                        <FaMoneyBillWave style={styles.labelIcon} /> Concepto 011 (quincenal)
                    </label>
                    <input 
                        type="number" 
                        step="0.01"
                        style={styles.input} 
                        value={c11} 
                        onChange={(e) => setC11(e.target.value)} 
                        placeholder="Ej: 2002.60"
                        onFocus={(e) => {
                            e.target.style.borderColor = '#5B86E5';
                            e.target.style.boxShadow = '0 0 0 3px rgba(91,134,229,0.15)';
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
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(91,134,229,0.3)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                }}
            >
                <FaCalculator /> Calcular Crédito a Mediano Plazo
            </button>

            {/* Resultados */}
            {resultado && (
                <div style={styles.resultadoContainer}>
                    <div style={styles.resultadoTitle}>
                        <FaHome style={{ color: '#5B86E5', marginRight: '0.5rem' }} />
                        Monto del Crédito a Mediano Plazo
                    </div>

                    <div style={styles.resultadoItem}>
                        <div>
                            <span style={styles.resultadoLabel}>Por 35 veces el Salario Mensual Integrado</span>
                            <span style={styles.resultadoLabelSmall}>Financiamiento para remodelación o mejora de vivienda</span>
                        </div>
                        <span style={styles.resultadoMonto}>{formatter.format(resultado)}</span>
                    </div>

                    <small style={styles.smallText}>
                        <FaChartLine style={{ marginRight: '0.3rem' }} />
                        El monto final depende de la evaluación crediticia y disponibilidad de recursos.
                    </small>
                </div>
            )}
        </div>
    );
};

export default CreditoMedianoPlazo;