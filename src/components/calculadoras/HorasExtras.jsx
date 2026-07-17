import React, { useState } from 'react';
import { FaCalculator, FaClock, FaMoneyBillWave, FaInfoCircle, FaCheckCircle, FaRegClock } from 'react-icons/fa';

const HorasExtras = () => {
    const [smi, setSmi] = useState('');
    const [jornada, setJornada] = useState(8);
    const [horas, setHoras] = useState('');
    const [infecto, setInfecto] = useState(false);
    const [resultado, setResultado] = useState(null);

    const calcular = () => {
        const smiNum = parseFloat(smi);
        const horasNum = parseFloat(horas);
        
        if (isNaN(smiNum) || smiNum <= 0) {
            alert('Ingresa un Sueldo Mensual Integrado válido.');
            return;
        }
        if (isNaN(horasNum) || horasNum <= 0) {
            alert('Ingresa un número válido de horas extras.');
            return;
        }

        const jornadaEfectiva = (jornada === 12) ? 8 : jornada;
        const salarioDiario = smiNum / 30;
        const valorHoraNormal = salarioDiario / jornadaEfectiva;
        const valorHoraExtra = valorHoraNormal * 2;
        const pagoNormal = valorHoraExtra * horasNum;

        setResultado({
            normal: pagoNormal,
            con20: infecto ? pagoNormal * 1.20 : null
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
            borderBottom: '3px solid #E67E22',
        },
        headerIcon: {
            fontSize: '2rem',
            color: '#E67E22',
        },
        headerTitle: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #0A0F1E, #E67E22)',
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
            backgroundColor: 'rgba(230,126,34,0.08)',
            borderLeft: '4px solid #E67E22',
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
            color: '#E67E22',
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
        checkboxContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 0',
            cursor: 'pointer',
        },
        checkbox: {
            width: '18px',
            height: '18px',
            accentColor: '#E67E22',
            cursor: 'pointer',
        },
        checkboxLabel: {
            fontWeight: '600',
            fontSize: '0.9rem',
            color: '#0A0F1E',
            cursor: 'pointer',
        },
        button: {
            backgroundColor: '#E67E22',
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
            padding: '0.8rem 1rem',
            borderRadius: '8px',
            marginBottom: '0.5rem',
        },
        resultadoItemNormal: {
            backgroundColor: 'rgba(108,117,125,0.08)',
            borderLeft: '4px solid #6c757d',
        },
        resultadoItemInfecto: {
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
        smallText: {
            display: 'block',
            textAlign: 'center',
            color: '#6c757d',
            fontSize: '0.75rem',
            marginTop: '0.8rem',
            fontStyle: 'italic',
        },
        infoExtra: {
            marginTop: '0.5rem',
            padding: '0.6rem 1rem',
            backgroundColor: 'rgba(230,126,34,0.05)',
            borderRadius: '8px',
            fontSize: '0.8rem',
            color: '#6c757d',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
        },
        '@media (max-width: 480px)': {
            grid: {
                gridTemplateColumns: '1fr',
            },
        },
    };

    const jornadas = [
        { value: 6.5, label: '6.5 horas' },
        { value: 8, label: '8 horas' },
        { value: 12, label: '12 horas (velada)' },
    ];

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <FaClock style={styles.headerIcon} />
                <div>
                    <h3 style={styles.headerTitle}>Pago de Horas Extras</h3>
                    <div style={styles.headerSubtitle}>
                        <FaInfoCircle size={12} /> Las horas extras se pagan al doble
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div style={styles.infoBox}>
                <FaInfoCircle style={{ color: '#E67E22', marginRight: '0.5rem' }} />
                El cálculo de horas extras se realiza con base en el Sueldo Mensual Integrado (SMI) 
                y el tipo de jornada laboral. Las horas extras se pagan al doble del valor de la hora normal.
            </div>

            {/* Formulario */}
            <div style={styles.grid}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>
                        <FaMoneyBillWave style={styles.labelIcon} /> Sueldo Mensual Integrado (SMI)
                    </label>
                    <input 
                        type="number" 
                        step="0.01"
                        style={styles.input} 
                        value={smi} 
                        onChange={(e) => setSmi(e.target.value)} 
                        placeholder="Ej: 11204.50"
                        onFocus={(e) => {
                            e.target.style.borderColor = '#E67E22';
                            e.target.style.boxShadow = '0 0 0 3px rgba(230,126,34,0.15)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = '#ddd';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>
                        <FaRegClock style={styles.labelIcon} /> Jornada laboral
                    </label>
                    <select
                        style={styles.select}
                        value={jornada}
                        onChange={(e) => setJornada(Number(e.target.value))}
                        onFocus={(e) => {
                            e.target.style.borderColor = '#E67E22';
                            e.target.style.boxShadow = '0 0 0 3px rgba(230,126,34,0.15)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = '#ddd';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        {jornadas.map((j) => (
                            <option key={j.value} value={j.value}>
                                {j.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div style={styles.inputGroup}>
                <label style={styles.label}>
                    <FaClock style={styles.labelIcon} /> Horas extras laboradas
                </label>
                <input 
                    type="number" 
                    step="0.5"
                    style={styles.input} 
                    value={horas} 
                    onChange={(e) => setHoras(e.target.value)} 
                    placeholder="Ej: 8"
                    onFocus={(e) => {
                        e.target.style.borderColor = '#E67E22';
                        e.target.style.boxShadow = '0 0 0 3px rgba(230,126,34,0.15)';
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = '#ddd';
                        e.target.style.boxShadow = 'none';
                    }}
                />
            </div>

            {/* Checkbox Infectocontagiosidad */}
            <div style={styles.checkboxContainer}>
                <input 
                    type="checkbox" 
                    style={styles.checkbox} 
                    checked={infecto} 
                    onChange={(e) => setInfecto(e.target.checked)} 
                    id="infecto"
                />
                <label style={styles.checkboxLabel} htmlFor="infecto">
                    <FaCheckCircle style={{ color: infecto ? '#28a745' : '#6c757d', marginRight: '0.3rem' }} />
                    Infectocontagiosidad (20% adicional)
                </label>
            </div>

            {/* Botón Calcular */}
            <button 
                style={styles.button}
                onClick={calcular}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(230,126,34,0.3)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                }}
            >
                <FaCalculator /> Calcular Pago de Horas Extras
            </button>

            {/* Resultados */}
            {resultado && (
                <div style={styles.resultadoContainer}>
                    <div style={styles.resultadoTitle}>
                        <FaClock style={{ color: '#E67E22', marginRight: '0.5rem' }} />
                        Pago Estimado de Horas Extras
                    </div>

                    <div style={{ ...styles.resultadoItem, ...styles.resultadoItemNormal }}>
                        <div>
                            <span style={styles.resultadoLabel}>Pago sin 20%</span>
                            <span style={styles.resultadoLabelSmall}>Horas extras al doble</span>
                        </div>
                        <span style={styles.resultadoMonto}>{formatter.format(resultado.normal)}</span>
                    </div>

                    {resultado.con20 && (
                        <div style={{ ...styles.resultadoItem, ...styles.resultadoItemInfecto }}>
                            <div>
                                <span style={styles.resultadoLabel}>Pago con 20%</span>
                                <span style={styles.resultadoLabelSmall}>Infectocontagiosidad</span>
                            </div>
                            <span style={styles.resultadoMontoVerde}>{formatter.format(resultado.con20)}</span>
                        </div>
                    )}

                    <div style={styles.infoExtra}>
                        <FaInfoCircle style={{ color: '#E67E22' }} />
                        <span>Las horas extras se pagan al doble del valor de la hora normal.</span>
                    </div>

                    <small style={styles.smallText}>
                        * Cálculo estimado basado en el SMI proporcionado. 
                        Puede variar según el tipo de jornada y las prestaciones adicionales.
                    </small>
                </div>
            )}
        </div>
    );
};

export default HorasExtras;