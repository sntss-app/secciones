import React, { useState } from 'react';

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
        currency: 'MXN'
    });

    const styles = {
        container: { padding: '1rem' },
        inputGroup: { marginBottom: '1rem' },
        label: { display: 'block', fontWeight: 'bold', marginBottom: '0.3rem' },
        input: { width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd' },
        select: { width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd' },
        checkbox: { marginRight: '0.5rem' },
        button: { backgroundColor: '#3EAEF4', color: '#0A0F1E', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
        resultado: { marginTop: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' },
        monto: { fontSize: '1.5rem', fontWeight: 'bold', color: '#003c82' },
    };

    return (
        <div style={styles.container}>
            <h3>Pago de Horas Extras</h3>
            
            <div style={styles.inputGroup}>
                <label style={styles.label}>Sueldo Mensual Integrado (SMI)</label>
                <input type="number" step="0.01" style={styles.input} value={smi} onChange={(e) => setSmi(e.target.value)} placeholder="Ej: 11204.50" />
            </div>
            <div style={styles.inputGroup}>
                <label style={styles.label}>Jornada laboral</label>
                <select style={styles.select} value={jornada} onChange={(e) => setJornada(Number(e.target.value))}>
                    <option value={6.5}>6.5 horas</option>
                    <option value={8}>8 horas</option>
                    <option value={12}>12 horas (velada)</option>
                </select>
            </div>
            <div style={styles.inputGroup}>
                <label style={styles.label}>Horas extras laboradas</label>
                <input type="number" step="0.5" style={styles.input} value={horas} onChange={(e) => setHoras(e.target.value)} placeholder="Ej: 8" />
            </div>
            <div style={styles.inputGroup}>
                <input type="checkbox" style={styles.checkbox} checked={infecto} onChange={(e) => setInfecto(e.target.checked)} />
                <label>Infectocontagiosidad (20% adicional)</label>
            </div>
            
            <button style={styles.button} onClick={calcular}>Calcular Pago</button>
            
            {resultado && (
                <div style={styles.resultado}>
                    <div className="bg-light p-2 rounded border mb-2">
                        <span className="d-block text-secondary">Pago sin 20%</span>
                        <span style={styles.monto}>{formatter.format(resultado.normal)}</span>
                    </div>
                    {resultado.con20 && (
                        <div className="bg-light p-2 rounded border">
                            <span className="d-block text-success">Pago con 20% (infectocontagiosidad)</span>
                            <span style={styles.monto}>{formatter.format(resultado.con20)}</span>
                        </div>
                    )}
                    <small className="text-muted">* Las horas extras se pagan al doble del valor de la hora normal.</small>
                </div>
            )}
        </div>
    );
};

export default HorasExtras;