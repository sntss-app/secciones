import React, { useState } from 'react';
import { FaCalculator, FaFileContract, FaMoneyBillWave, FaInfoCircle, FaCalendarAlt } from 'react-icons/fa';

const Clausula97 = () => {
    const [sueldoMensual, setSueldoMensual] = useState('');
    const [meses, setMeses] = useState(4);
    const [resultado, setResultado] = useState(null);

    const calcular = () => {
        const sueldo = parseFloat(sueldoMensual);
        
        if (isNaN(sueldo) || sueldo <= 0) {
            alert('Ingresa un sueldo mensual válido.');
            return;
        }

        const monto = sueldo * meses;
        setResultado({
            sueldo: sueldo,
            meses: meses,
            monto: monto,
            pagoMensual: monto / 12 // Suponiendo 12 meses de plazo
        });
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
            borderBottom: '3px solid #8E44AD',
        },
        headerIcon: {
            fontSize: '2rem',
            color: '#8E44AD',
        },
        headerTitle: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #0A0F1E, #8E44AD)',
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
            backgroundColor: 'rgba(142,68,173,0.08)',
            borderLeft: '4px solid #8E44AD',
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
            color: '#8E44AD',
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
        inputFull: {
            gridColumn: '1 / -1',
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
        button: {
            backgroundColor: '#8E44AD',
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
            padding: '0.6rem 1rem',
            borderBottom: '1px solid #e9ecef',
            alignItems: 'center',
        },
        resultadoItemLast: {
            borderBottom: 'none',
        },
        resultadoLabel: {
            color: '#495057',
            fontSize: '0.9rem',
        },
        resultadoMonto: {
            fontWeight: 'bold',
            fontSize: '1.1rem',
            color: '#003c82',
        },
        resultadoMontoVerde: {
            fontWeight: 'bold',
            fontSize: '1.1rem',
            color: '#28a745',
        },
        resultadoTotal: {
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0.8rem 1rem',
            backgroundColor: 'rgba(142,68,173,0.08)',
            borderRadius: '8px',
            marginTop: '0.5rem',
            alignItems: 'center',
        },
        resultadoTotalLabel: {
            fontWeight: 'bold',
            color: '#0A0F1E',
            fontSize: '1rem',
        },
        resultadoTotalMonto: {
            fontWeight: 'bold',
            fontSize: '1.2rem',
            color: '#8E44AD',
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
                <FaFileContract style={styles.headerIcon} />
                <div>
                    <h3 style={styles.headerTitle}>Cláusula 97 CCT</h3>
                    <div style={styles.headerSubtitle}>
                        <FaInfoCircle size={12} /> Préstamo de hasta 4 meses de sueldo
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div style={styles.infoBox}>
                <FaInfoCircle style={{ color: '#8E44AD', marginRight: '0.5rem' }} />
                La Cláusula 97 del Contrato Colectivo de Trabajo permite solicitar 
                un préstamo de hasta 4 meses de sueldo, con descuentos quincenales.
            </div>

            {/* Formulario */}
            <div style={styles.grid}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>
                        <FaMoneyBillWave style={styles.labelIcon} /> Sueldo mensual
                    </label>
                    <input 
                        type="number" 
                        style={styles.input} 
                        value={sueldoMensual} 
                        onChange={(e) => setSueldoMensual(e.target.value)} 
                        placeholder="Ej: 15000.00"
                        onFocus={(e) => {
                            e.target.style.borderColor = '#8E44AD';
                            e.target.style.boxShadow = '0 0 0 3px rgba(142,68,173,0.15)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = '#ddd';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>
                        <FaCalendarAlt style={styles.labelIcon} /> Meses a solicitar
                    </label>
                    <select
                        style={styles.select}
                        value={meses}
                        onChange={(e) => setMeses(Number(e.target.value))}
                        onFocus={(e) => {
                            e.target.style.borderColor = '#8E44AD';
                            e.target.style.boxShadow = '0 0 0 3px rgba(142,68,173,0.15)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = '#ddd';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        <option value={1}>1 mes</option>
                        <option value={2}>2 meses</option>
                        <option value={3}>3 meses</option>
                        <option value={4}>4 meses</option>
                    </select>
                </div>
            </div>

            {/* Botón Calcular */}
            <button 
                style={styles.button}
                onClick={calcular}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(142,68,173,0.3)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                }}
            >
                <FaCalculator /> Calcular Préstamo
            </button>

            {/* Resultados */}
            {resultado && (
                <div style={styles.resultadoContainer}>
                    <div style={styles.resultadoTitle}>
                        <FaFileContract style={{ color: '#8E44AD', marginRight: '0.5rem' }} />
                        Detalles del Préstamo
                    </div>

                    <div style={styles.resultadoItem}>
                        <span style={styles.resultadoLabel}>Sueldo mensual</span>
                        <span style={styles.resultadoMonto}>{formatter.format(resultado.sueldo)}</span>
                    </div>

                    <div style={styles.resultadoItem}>
                        <span style={styles.resultadoLabel}>Meses solicitados</span>
                        <span style={styles.resultadoMonto}>{resultado.meses}</span>
                    </div>

                    <div style={{ ...styles.resultadoItem, ...styles.resultadoItemLast }}>
                        <span style={styles.resultadoLabel}>Monto del préstamo</span>
                        <span style={styles.resultadoMontoVerde}>{formatter.format(resultado.monto)}</span>
                    </div>

                    <div style={styles.resultadoTotal}>
                        <span style={styles.resultadoTotalLabel}>Pago mensual estimado (12 meses)</span>
                        <span style={styles.resultadoTotalMonto}>
                            {formatter.format(resultado.pagoMensual)}
                        </span>
                    </div>

                    <small style={styles.smallText}>
                        * El pago mensual es estimado. Los descuentos se realizan de forma quincenal 
                        y pueden variar según las tasas de interés vigentes.
                    </small>
                </div>
            )}
        </div>
    );
};

export default Clausula97;