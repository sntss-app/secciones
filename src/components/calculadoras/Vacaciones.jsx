import React, { useState } from 'react';
import { FaCalculator, FaUmbrellaBeach, FaMoneyBillWave, FaInfoCircle, FaCalendarAlt, FaSun, FaCheckCircle } from 'react-icons/fa';

const Vacaciones = () => {
    const [c02, setC02] = useState('');
    const [c11, setC11] = useState('');
    const [diasVacaciones, setDiasVacaciones] = useState(6);
    const [resultado, setResultado] = useState(null);

    const calcular = () => {
        const c02Num = parseFloat(c02);
        const c11Num = parseFloat(c11);
        
        if (isNaN(c02Num) || isNaN(c11Num)) {
            alert('Ingresa los conceptos 002 y 011.');
            return;
        }

        const baseQuincenal = (c02Num + (c11Num * 2)) * 0.8215;
        const baseMensual = baseQuincenal * 2;
        const valorDiario = baseMensual / 30;
        const primaVacacional = valorDiario * diasVacaciones * 0.25;
        const total = (valorDiario * diasVacaciones) + primaVacacional;

        setResultado({
            total: total,
            prima: primaVacacional,
            dias: diasVacaciones,
            valorDiario: valorDiario
        });
    };

    const formatter = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2
    });

    const opcionesDias = [
        { value: 6, label: '6 días (1 año)' },
        { value: 8, label: '8 días (2 años)' },
        { value: 10, label: '10 días (3 años)' },
        { value: 12, label: '12 días (4 años)' },
        { value: 14, label: '14 días (5-9 años)' },
        { value: 16, label: '16 días (10-14 años)' },
        { value: 18, label: '18 días (15-19 años)' },
        { value: 20, label: '20 días (20-24 años)' },
        { value: 22, label: '22 días (25-29 años)' },
        { value: 24, label: '24 días (30+ años)' },
    ];

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
            borderBottom: '3px solid #1ABC9C',
        },
        headerIcon: {
            fontSize: '2rem',
            color: '#1ABC9C',
        },
        headerTitle: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #0A0F1E, #1ABC9C)',
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
            backgroundColor: 'rgba(26,188,156,0.08)',
            borderLeft: '4px solid #1ABC9C',
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
            color: '#1ABC9C',
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
        select: {
            width: '100%',
            padding: '0.6rem 1rem',
            fontSize: '0.95rem',
            border: '1px solid #ddd',
            borderRadius: '10px',
            outline: 'none',
            transition: 'all 0.3s ease',
            backgroundColor: 'white',
            cursor: 'pointer',
        },
        inputFull: {
            gridColumn: '1 / -1',
        },
        button: {
            backgroundColor: '#1ABC9C',
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
            marginBottom: '0.5rem',
        },
        resultadoItemTotal: {
            backgroundColor: 'rgba(26,188,156,0.08)',
            borderLeft: '4px solid #1ABC9C',
        },
        resultadoItemPrima: {
            backgroundColor: 'rgba(40,167,69,0.08)',
            borderLeft: '4px solid #28a745',
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
        resultadoMontoVerde: {
            fontWeight: 'bold',
            fontSize: '1.3rem',
            color: '#28a745',
        },
        resultadoBadge: {
            display: 'inline-block',
            backgroundColor: 'rgba(26,188,156,0.15)',
            color: '#1ABC9C',
            padding: '0.15rem 0.6rem',
            borderRadius: '12px',
            fontSize: '0.65rem',
            fontWeight: 'bold',
            marginTop: '0.2rem',
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
                <FaUmbrellaBeach style={styles.headerIcon} />
                <div>
                    <h3 style={styles.headerTitle}>Pago de Vacaciones</h3>
                    <div style={styles.headerSubtitle}>
                        <FaInfoCircle size={12} /> Incluye prima vacacional del 25%
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div style={styles.infoBox}>
                <FaInfoCircle style={{ color: '#1ABC9C', marginRight: '0.5rem' }} />
                El pago de vacaciones incluye el salario de los días de vacaciones más la prima vacacional 
                equivalente al 25% del salario correspondiente a esos días.
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
                            e.target.style.borderColor = '#1ABC9C';
                            e.target.style.boxShadow = '0 0 0 3px rgba(26,188,156,0.15)';
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
                            e.target.style.borderColor = '#1ABC9C';
                            e.target.style.boxShadow = '0 0 0 3px rgba(26,188,156,0.15)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = '#ddd';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                </div>
                <div style={{ ...styles.inputGroup, ...styles.inputFull }}>
                    <label style={styles.label}>
                        <FaCalendarAlt style={styles.labelIcon} /> Días de vacaciones
                    </label>
                    <select
                        style={styles.select}
                        value={diasVacaciones}
                        onChange={(e) => setDiasVacaciones(Number(e.target.value))}
                        onFocus={(e) => {
                            e.target.style.borderColor = '#1ABC9C';
                            e.target.style.boxShadow = '0 0 0 3px rgba(26,188,156,0.15)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = '#ddd';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        {opcionesDias.map(opt => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Botón Calcular */}
            <button 
                style={styles.button}
                onClick={calcular}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(26,188,156,0.3)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                }}
            >
                <FaCalculator /> Calcular Pago de Vacaciones
            </button>

            {/* Resultados */}
            {resultado && (
                <div style={styles.resultadoContainer}>
                    <div style={styles.resultadoTitle}>
                        <FaSun style={{ color: '#1ABC9C', marginRight: '0.5rem' }} />
                        Detalle del Pago de Vacaciones
                    </div>

                    <div style={{ ...styles.resultadoItem, ...styles.resultadoItemTotal }}>
                        <div>
                            <span style={styles.resultadoLabel}>Pago de vacaciones</span>
                            <span style={styles.resultadoLabelSmall}>
                                {resultado.dias} días × {formatter.format(resultado.valorDiario)}
                            </span>
                            <span style={styles.resultadoBadge}>Salario diario</span>
                        </div>
                        <span style={styles.resultadoMonto}>{formatter.format(resultado.total)}</span>
                    </div>

                    <div style={{ ...styles.resultadoItem, ...styles.resultadoItemPrima }}>
                        <div>
                            <span style={styles.resultadoLabel}>Prima vacacional</span>
                            <span style={styles.resultadoLabelSmall}>25% del salario de vacaciones</span>
                        </div>
                        <span style={styles.resultadoMontoVerde}>{formatter.format(resultado.prima)}</span>
                    </div>

                    <small style={styles.smallText}>
                        <FaCheckCircle style={{ color: '#1ABC9C', marginRight: '0.3rem' }} />
                        El pago total incluye el salario de los días de vacaciones más la prima vacacional del 25%.
                        Los días de vacaciones dependen de la antigüedad del trabajador.
                    </small>
                </div>
            )}
        </div>
    );
};

export default Vacaciones;