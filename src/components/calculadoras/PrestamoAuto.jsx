import React, { useState } from 'react';
import { FaCalculator, FaCar, FaMoneyBillWave, FaInfoCircle, FaChartLine, FaCheckCircle } from 'react-icons/fa';

const PrestamoAuto = () => {
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
        const mensualIntegrado = mensualBase * 1.20;
        setResultado(mensualIntegrado * 24);
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
            borderBottom: '3px solid #F2994A',
        },
        headerIcon: {
            fontSize: '2rem',
            color: '#F2994A',
        },
        headerTitle: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #0A0F1E, #F2994A)',
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
            backgroundColor: 'rgba(242,153,74,0.08)',
            borderLeft: '4px solid #F2994A',
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
            color: '#F2994A',
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
            backgroundColor: '#F2994A',
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
            backgroundColor: 'rgba(242,153,74,0.08)',
            borderLeft: '4px solid #F2994A',
            marginBottom: '0.5rem',
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
        badge: {
            display: 'inline-block',
            backgroundColor: 'rgba(242,153,74,0.15)',
            color: '#F2994A',
            padding: '0.2rem 0.6rem',
            borderRadius: '12px',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            marginTop: '0.3rem',
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
                <FaCar style={styles.headerIcon} />
                <div>
                    <h3 style={styles.headerTitle}>Préstamo de Auto</h3>
                    <div style={styles.headerSubtitle}>
                        <FaInfoCircle size={12} /> Financiamiento para la compra de tu vehículo
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div style={styles.infoBox}>
                <FaInfoCircle style={{ color: '#F2994A', marginRight: '0.5rem' }} />
                El préstamo para auto se calcula con base en el Salario Mensual Integrado 
                (Sueldo Base + 20% de prestaciones). Se puede financiar hasta 24 veces el salario.
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
                            e.target.style.borderColor = '#F2994A';
                            e.target.style.boxShadow = '0 0 0 3px rgba(242,153,74,0.15)';
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
                            e.target.style.borderColor = '#F2994A';
                            e.target.style.boxShadow = '0 0 0 3px rgba(242,153,74,0.15)';
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
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(242,153,74,0.3)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                }}
            >
                <FaCalculator /> Calcular Préstamo para Auto
            </button>

            {/* Resultados */}
            {resultado && (
                <div style={styles.resultadoContainer}>
                    <div style={styles.resultadoTitle}>
                        <FaCar style={{ color: '#F2994A', marginRight: '0.5rem' }} />
                        Monto del Préstamo para Auto
                    </div>

                    <div style={styles.resultadoItem}>
                        <div>
                            <span style={styles.resultadoLabel}>Por 24 veces el sueldo mensual integrado</span>
                            <span style={styles.resultadoLabelSmall}>Incluye 20% de prestaciones</span>
                            <span style={styles.badge}>
                                <FaCheckCircle style={{ marginRight: '0.2rem' }} /> Financiamiento
                            </span>
                        </div>
                        <span style={styles.resultadoMonto}>{formatter.format(resultado)}</span>
                    </div>

                    <div style={styles.resultadoDetalle}>
                        <div style={styles.detalleItem}>
                            <span>Concepto 002 (quincenal)</span>
                            <span>{formatter.format(parseFloat(c02) || 0)}</span>
                        </div>
                        <div style={styles.detalleItem}>
                            <span>Concepto 011 (quincenal)</span>
                            <span>{formatter.format(parseFloat(c11) || 0)}</span>
                        </div>
                        <div style={styles.detalleItem}>
                            <span>Prestaciones (20%)</span>
                            <span>Incluidas</span>
                        </div>
                        <div style={{ ...styles.detalleItem, ...styles.detalleItemLast }}>
                            <span>Plazo de pago</span>
                            <span>24 meses</span>
                        </div>
                    </div>

                    <small style={styles.smallText}>
                        <FaChartLine style={{ marginRight: '0.3rem' }} />
                        El monto final depende de la evaluación crediticia y disponibilidad de recursos.
                        Plazo de pago: hasta 24 meses.
                    </small>
                </div>
            )}
        </div>
    );
};

export default PrestamoAuto;