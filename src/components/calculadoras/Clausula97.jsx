import React, { useState } from 'react';
import { 
    FaCalculator, FaFileContract, FaMoneyBillWave, FaInfoCircle, 
    FaCalendarAlt, FaCheckCircle, FaRegClock
} from 'react-icons/fa';

const Clausula97 = () => {
    const [c02, setC02] = useState('');
    const [c11, setC11] = useState('');
    const [resultado, setResultado] = useState(null);
    const [mostrarResultados, setMostrarResultados] = useState(false);

    const calcular = () => {
        const c02Num = parseFloat(c02);
        const c11Num = parseFloat(c11);
        
        if (isNaN(c02Num) || isNaN(c11Num)) {
            alert('Por favor ingresa ambos conceptos (002 y 011).');
            return;
        }

        // 🔥 CORRECCIÓN: Calcular base mensual como en PHP
        const baseMensual = (c02Num + c11Num) * 2;

        setResultado({
            baseMensual: baseMensual,
            monto1: baseMensual * 1,  // 1 mes
            monto2: baseMensual * 2,  // 2 meses
            monto3: baseMensual * 3,  // 3 meses
            monto4: baseMensual * 4   // 4 meses
        });
        setMostrarResultados(true);
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
            color: '#0A0F1E',
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
        resultadoGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.5rem',
        },
        resultadoItem: {
            padding: '0.8rem 1rem',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #e9ecef',
            backgroundColor: 'white',
        },
        resultadoItemTitle: {
            fontSize: '0.8rem',
            color: '#6c757d',
            fontWeight: '600',
        },
        resultadoMonto: {
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#003c82',
        },
        resultadoPlazo: {
            fontSize: '0.7rem',
            color: '#28a745',
            fontWeight: '500',
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
            resultadoGrid: {
                gridTemplateColumns: '1fr',
            },
        },
    };

    // 🔥 Info de plazos
    const plazos = [
        { meses: 1, quincenas: 10, label: '1 mes' },
        { meses: 2, quincenas: 20, label: '2 meses' },
        { meses: 3, quincenas: 30, label: '3 meses' },
        { meses: 4, quincenas: 40, label: '4 meses' },
    ];

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
                <strong>Anticipo de sueldo</strong>
                <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.85rem' }}>
                    Permite solicitar un anticipo de hasta cuatro meses de sueldo, una vez al año.
                    El trabajador de base puede ejercer este derecho en una sola exhibición o de forma fraccionada.
                    <strong style={{ display: 'block', marginTop: '0.3rem' }}>Estos anticipos no generan intereses.</strong>
                </p>
            </div>

            {/* Formulario */}
            <div style={styles.grid}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>
                        <FaMoneyBillWave style={styles.labelIcon} /> Concepto 002
                    </label>
                    <input 
                        type="number" 
                        step="0.01"
                        style={styles.input} 
                        value={c02} 
                        onChange={(e) => setC02(e.target.value)} 
                        placeholder="Ej: 2437.73"
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
                        <FaMoneyBillWave style={styles.labelIcon} /> Concepto 011
                    </label>
                    <input 
                        type="number" 
                        step="0.01"
                        style={styles.input} 
                        value={c11} 
                        onChange={(e) => setC11(e.target.value)} 
                        placeholder="Ej: 2002.60"
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
                <FaCalculator /> Calcular Préstamos
            </button>

            {/* Resultados */}
            {mostrarResultados && resultado && (
                <div style={styles.resultadoContainer}>
                    <div style={styles.resultadoTitle}>
                        <FaFileContract style={{ color: '#8E44AD', marginRight: '0.5rem' }} />
                        Montos del Préstamo
                    </div>

                    <div style={styles.resultadoGrid}>
                        {plazos.map((plazo, index) => {
                            const montos = [resultado.monto1, resultado.monto2, resultado.monto3, resultado.monto4];
                            return (
                                <div key={index} style={styles.resultadoItem}>
                                    <div style={styles.resultadoItemTitle}>
                                        <FaCalendarAlt style={{ marginRight: '0.3rem', fontSize: '0.7rem' }} />
                                        {plazo.label}
                                    </div>
                                    <div style={styles.resultadoMonto}>
                                        {formatter.format(montos[index])}
                                    </div>
                                    <div style={styles.resultadoPlazo}>
                                        <FaRegClock style={{ marginRight: '0.2rem', fontSize: '0.6rem' }} />
                                        Pagar a {plazo.quincenas} quincenas
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <small style={styles.smallText}>
                        * Los descuentos se realizan de forma quincenal según el plazo elegido.
                        No generan intereses.
                    </small>
                </div>
            )}
        </div>
    );
};

export default Clausula97;