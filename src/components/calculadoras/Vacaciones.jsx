import React, { useState } from 'react';

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
        currency: 'MXN'
    });

    const styles = {
        container: { padding: '1rem' },
        inputGroup: { marginBottom: '1rem' },
        label: { display: 'block', fontWeight: 'bold', marginBottom: '0.3rem' },
        input: { width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd' },
        select: { width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd' },
        button: { backgroundColor: '#3EAEF4', color: '#0A0F1E', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
        resultado: { marginTop: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' },
        monto: { fontSize: '1.5rem', fontWeight: 'bold', color: '#003c82' },
    };

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

    return (
        <div style={styles.container}>
            <h3>Pago de Vacaciones</h3>
            <p className="text-muted">Incluye prima vacacional del 25%.</p>
            
            <div style={styles.inputGroup}>
                <label style={styles.label}>Concepto 002</label>
                <input type="number" style={styles.input} value={c02} onChange={(e) => setC02(e.target.value)} placeholder="Ej: 2437.73" />
            </div>
            <div style={styles.inputGroup}>
                <label style={styles.label}>Concepto 011</label>
                <input type="number" style={styles.input} value={c11} onChange={(e) => setC11(e.target.value)} placeholder="Ej: 2002.60" />
            </div>
            <div style={styles.inputGroup}>
                <label style={styles.label}>Días de vacaciones</label>
                <select style={styles.select} value={diasVacaciones} onChange={(e) => setDiasVacaciones(Number(e.target.value))}>
                    {opcionesDias.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
            
            <button style={styles.button} onClick={calcular}>Calcular</button>
            
            {resultado && (
                <div style={styles.resultado}>
                    <div className="bg-light p-2 rounded border mb-2">
                        <span className="d-block text-primary">Pago de vacaciones ({resultado.dias} días)</span>
                        <span style={styles.monto}>{formatter.format(resultado.total)}</span>
                    </div>
                    <div className="bg-light p-2 rounded border">
                        <span className="d-block text-success">Prima vacacional (25%)</span>
                        <span style={styles.monto}>{formatter.format(resultado.prima)}</span>
                    </div>
                    <small className="text-muted">* Valor diario: {formatter.format(resultado.valorDiario)}</small>
                </div>
            )}
        </div>
    );
};

export default Vacaciones;