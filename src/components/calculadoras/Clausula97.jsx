import React, { useState } from 'react';

const Clausula97 = () => {
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

        const baseMensual = (c02Num + c11Num) * 2;
        setResultado({
            mes1: baseMensual * 1,
            mes2: baseMensual * 2,
            mes3: baseMensual * 3,
            mes4: baseMensual * 4
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
            <h3>Cláusula 97 CCT</h3>
            <p className="text-muted">Anticipo de sueldo de hasta 4 meses, sin intereses.</p>
            
            <div style={styles.inputGroup}>
                <label style={styles.label}>Concepto 002</label>
                <input type="number" style={styles.input} value={c02} onChange={(e) => setC02(e.target.value)} placeholder="Ej: 2437.73" />
            </div>
            <div style={styles.inputGroup}>
                <label style={styles.label}>Concepto 011</label>
                <input type="number" style={styles.input} value={c11} onChange={(e) => setC11(e.target.value)} placeholder="Ej: 2002.60" />
            </div>
            
            <button style={styles.button} onClick={calcular}>Calcular Préstamos</button>
            
            {resultado && (
                <div style={styles.resultado}>
                    <div className="bg-light p-2 rounded text-center border mb-2">
                        <span className="d-block text-primary fw-bold">1 mes</span>
                        <span style={styles.monto}>{formatter.format(resultado.mes1)}</span>
                        <span className="d-block text-primary">Pagar a 10 quincenas</span>
                    </div>
                    <div className="bg-light p-2 rounded text-center border mb-2">
                        <span className="d-block text-primary fw-bold">2 meses</span>
                        <span style={styles.monto}>{formatter.format(resultado.mes2)}</span>
                        <span className="d-block text-primary">Pagar a 20 quincenas</span>
                    </div>
                    <div className="bg-light p-2 rounded text-center border mb-2">
                        <span className="d-block text-primary fw-bold">3 meses</span>
                        <span style={styles.monto}>{formatter.format(resultado.mes3)}</span>
                        <span className="d-block text-primary">Pagar a 30 quincenas</span>
                    </div>
                    <div className="bg-light p-2 rounded text-center border">
                        <span className="d-block text-primary fw-bold">4 meses</span>
                        <span style={styles.monto}>{formatter.format(resultado.mes4)}</span>
                        <span className="d-block text-primary">Pagar a 40 quincenas</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clausula97;