import React, { useState } from 'react';

const FondoAhorro = () => {
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

        setResultado((c02Num + c11Num) * 2 * 46 / 30);
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
        monto: { fontSize: '1.5rem', fontWeight: 'bold', color: '#003c82' },
    };

    return (
        <div style={styles.container}>
            <h3>Fondo de Ahorro (2° de Julio)</h3>
            <p className="text-muted">El fondo de ahorro 2 de Julio se calcula en función de tu sueldo base.</p>
            
            <div style={styles.inputGroup}>
                <label style={styles.label}>Concepto 002</label>
                <input type="number" style={styles.input} value={c02} onChange={(e) => setC02(e.target.value)} placeholder="Ej: 2437.73" />
            </div>
            <div style={styles.inputGroup}>
                <label style={styles.label}>Concepto 011</label>
                <input type="number" style={styles.input} value={c11} onChange={(e) => setC11(e.target.value)} placeholder="Ej: 2002.60" />
            </div>
            
            <button style={styles.button} onClick={calcular}>Calcular Fondo</button>
            
            {resultado && (
                <div style={styles.resultado}>
                    <p className="fw-bold">Fondo de ahorro total:</p>
                    <div className="bg-light p-2 rounded border">
                        <span className="d-block text-success">46 días tabulares</span>
                        <span style={styles.monto}>{formatter.format(resultado)}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FondoAhorro;