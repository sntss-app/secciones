import React, { useState } from 'react';
import { FaCalculator, FaGift, FaCalendarAlt, FaMoneyBillWave, FaInfoCircle } from 'react-icons/fa';

const Aguinaldo = () => {
    const [c02, setC02] = useState('');
    const [c11, setC11] = useState('');
    const [dias, setDias] = useState(365);
    const [resultado, setResultado] = useState(null);

    const calcular = () => {
        const c02Num = parseFloat(c02);
        const c11Num = parseFloat(c11);
        
        if (isNaN(c02Num) || isNaN(c11Num)) {
            alert('Ingresa los conceptos 002 y 011.');
            return;
        }

        const factor = dias / 365;
        const baseQuincenal = (c02Num + (c11Num * 2)) * 0.8215;
        const baseMensual = baseQuincenal * 2;
        const valorDiario = baseMensual / 30;

        setResultado({
            enero: valorDiario * 15 * factor,
            agosto: valorDiario * 30 * factor,
            diciembreCon: valorDiario * 45 * factor,
            diciembreSin: valorDiario * 75 * factor
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
            borderBottom: '3px solid #3EAEF4',
        },
        headerIcon: {
            fontSize: '2rem',
            color: '#3EAEF4',
        },
        headerTitle: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #0A0F1E, #3EAEF4)',
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
            backgroundColor: 'rgba(62,174,244,0.08)',
            borderLeft: '4px solid #3EAEF4',
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
            color: '#3EAEF4',
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
        button: {
            backgroundColor: '#3EAEF4',
            color: '#0A0F1E',
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
            backgroundColor: 'rgba(62,174,244,0.08)',
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
        // Responsive
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
                <FaGift style={styles.headerIcon} />
                <div>
                    <h3 style={styles.headerTitle}>Aguinaldo</h3>
                    <div style={styles.headerSubtitle}>
                        <FaInfoCircle size={12} /> Concepto 049 - 90 días de sueldo proporcional
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div style={styles.infoBox}>
                <FaInfoCircle style={{ color: '#3EAEF4', marginRight: '0.5rem' }} />
                El aguinaldo se calcula con base en el sueldo diario integrado. 
                Incluye concepto 002 + 011 (el 011 se multiplica por 2 por ser bono quincenal).
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
                            e.target.style.borderColor = '#3EAEF4';
                            e.target.style.boxShadow = '0 0 0 3px rgba(62,174,244,0.15)';
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
                            e.target.style.borderColor = '#3EAEF4';
                            e.target.style.boxShadow = '0 0 0 3px rgba(62,174,244,0.15)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = '#ddd';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                </div>
                <div style={{ ...styles.inputGroup, ...styles.inputFull }}>
                    <label style={styles.label}>
                        <FaCalendarAlt style={styles.labelIcon} /> Días trabajados
                    </label>
                    <input 
                        type="number" 
                        style={styles.input} 
                        value={dias} 
                        onChange={(e) => setDias(Number(e.target.value))}
                        onFocus={(e) => {
                            e.target.style.borderColor = '#3EAEF4';
                            e.target.style.boxShadow = '0 0 0 3px rgba(62,174,244,0.15)';
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
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(62,174,244,0.3)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                }}
            >
                <FaCalculator /> Calcular Aguinaldo
            </button>

            {/* Resultados */}
            {resultado && (
                <div style={styles.resultadoContainer}>
                    <div style={styles.resultadoTitle}>
                        <FaGift style={{ color: '#3EAEF4', marginRight: '0.5rem' }} />
                        Montos estimados
                    </div>

                    <div style={styles.resultadoItem}>
                        <span style={styles.resultadoLabel}>Anticipo enero (15 días)</span>
                        <span style={styles.resultadoMonto}>{formatter.format(resultado.enero)}</span>
                    </div>

                    <div style={styles.resultadoItem}>
                        <span style={styles.resultadoLabel}>Adelanto agosto (30 días)</span>
                        <span style={styles.resultadoMonto}>{formatter.format(resultado.agosto)}</span>
                    </div>

                    <div style={styles.resultadoItem}>
                        <span style={styles.resultadoLabel}>Diciembre (con adelanto)</span>
                        <span style={styles.resultadoMonto}>{formatter.format(resultado.diciembreCon)}</span>
                    </div>

                    <div style={{ ...styles.resultadoItem, ...styles.resultadoItemLast }}>
                        <span style={styles.resultadoLabel}>Diciembre (sin adelanto)</span>
                        <span style={styles.resultadoMontoVerde}>{formatter.format(resultado.diciembreSin)}</span>
                    </div>

                    <div style={styles.resultadoTotal}>
                        <span style={styles.resultadoTotalLabel}>Total estimado</span>
                        <span style={styles.resultadoTotalMonto}>
                            {formatter.format(resultado.diciembreSin)}
                        </span>
                    </div>

                    <small style={styles.smallText}>
                        * Cálculo estimado basado en los datos proporcionados. 
                        Puede variar según incidencias y prestaciones adicionales.
                    </small>
                </div>
            )}
        </div>
    );
};

export default Aguinaldo;