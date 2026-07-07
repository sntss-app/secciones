import React, { useState } from 'react';

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
        currency: 'MXN'
    });

    const styles = {
        container: { padding: '1rem' },
        inputGroup: { marginBottom: '1rem' },
        label: { display: 'block', fontWeight: 'bold', marginBottom: '0.3rem' },
        input: { width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd' },
        button: { backgroundColor: '#3EAEF4', color: '#0A0F1E', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
        resultado: { marginTop: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' },
        monto: { fontSize: '1.2rem', fontWeight: 'bold', color: '#003c82' },
    };

    return (
        <div style={styles.container}>
            <h3>Aguinaldo</h3>
            <p className="text-muted">Concepto 049 - 90 días de sueldo proporcional.</p>
            
            <div style={styles.inputGroup}>
                <label style={styles.label}>Concepto 002</label>
                <input type="number" style={styles.input} value={c02} onChange={(e) => setC02(e.target.value)} placeholder="Ej: 2437.73" />
            </div>
            <div style={styles.inputGroup}>
                <label style={styles.label}>Concepto 011</label>
                <input type="number" style={styles.input} value={c11} onChange={(e) => setC11(e.target.value)} placeholder="Ej: 2002.60" />
            </div>
            <div style={styles.inputGroup}>
                <label style={styles.label}>Días trabajados</label>
                <input type="number" style={styles.input} value={dias} onChange={(e) => setDias(Number(e.target.value))} />
            </div>
            
            <button style={styles.button} onClick={calcular}>Calcular</button>
            
            {resultado && (
                <div style={styles.resultado}>
                    <p className="fw-bold text-center">Montos estimados:</p>
                    <div className="d-flex justify-content-between p-2 border rounded mb-2">
                        <span>Anticipo enero (15 días)</span>
                        <span style={styles.monto}>{formatter.format(resultado.enero)}</span>
                    </div>
                    <div className="d-flex justify-content-between p-2 border rounded mb-2">
                        <span>Adelanto agosto (30 días)</span>
                        <span style={styles.monto}>{formatter.format(resultado.agosto)}</span>
                    </div>
                    <div className="d-flex justify-content-between p-2 border rounded mb-2">
                        <span>Diciembre (con adelanto)</span>
                        <span style={styles.monto}>{formatter.format(resultado.diciembreCon)}</span>
                    </div>
                    <div className="d-flex justify-content-between p-2 border rounded mb-2">
                        <span>Diciembre (sin adelanto)</span>
                        <span style={styles.monto}>{formatter.format(resultado.diciembreSin)}</span>
                    </div>
                    <small className="text-muted">* Cálculo estimado, puede variar según incidencias.</small>
                </div>
            )}
        </div>
    );
};

export default Aguinaldo;