import React, { useState } from 'react';
import { 
    FaCalculator, FaFileContract, FaMoneyBillWave, FaInfoCircle, 
    FaCalendarAlt, FaCheckCircle, FaRegClock
} from 'react-icons/fa';

// ✅ IMPORTAR CSS EXTERNO
import '../../css/Clausula97.css';

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

        const baseMensual = (c02Num + c11Num) * 2;

        setResultado({
            baseMensual: baseMensual,
            monto1: baseMensual * 1,
            monto2: baseMensual * 2,
            monto3: baseMensual * 3,
            monto4: baseMensual * 4
        });
        setMostrarResultados(true);
    };

    const formatter = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2
    });

    const plazos = [
        { meses: 1, quincenas: 10, label: '1 mes' },
        { meses: 2, quincenas: 20, label: '2 meses' },
        { meses: 3, quincenas: 30, label: '3 meses' },
        { meses: 4, quincenas: 40, label: '4 meses' },
    ];

    return (
        <div className="clausula97-container">
            {/* Header */}
            <div className="clausula97-header">
                <FaFileContract className="clausula97-header-icon" />
                <div>
                    <h3 className="clausula97-header-title">Cláusula 97 CCT</h3>
                    <div className="clausula97-header-subtitle">
                        <FaInfoCircle size={12} /> Préstamo de hasta 4 meses de sueldo
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div className="clausula97-info-box">
                <FaInfoCircle />
                <strong>Anticipo de sueldo</strong>
                <p>
                    Permite solicitar un anticipo de hasta cuatro meses de sueldo, una vez al año.
                    El trabajador de base puede ejercer este derecho en una sola exhibición o de forma fraccionada.
                </p>
                <strong>Estos anticipos no generan intereses.</strong>
            </div>

            {/* Formulario */}
            <div className="clausula97-grid">
                <div className="clausula97-input-group">
                    <label className="clausula97-label">
                        <FaMoneyBillWave className="clausula97-label-icon" /> Concepto 002
                    </label>
                    <input 
                        type="number" 
                        step="0.01"
                        className="clausula97-input" 
                        value={c02} 
                        onChange={(e) => setC02(e.target.value)} 
                        placeholder="Ej: 2437.73"
                    />
                </div>
                <div className="clausula97-input-group">
                    <label className="clausula97-label">
                        <FaMoneyBillWave className="clausula97-label-icon" /> Concepto 011
                    </label>
                    <input 
                        type="number" 
                        step="0.01"
                        className="clausula97-input" 
                        value={c11} 
                        onChange={(e) => setC11(e.target.value)} 
                        placeholder="Ej: 2002.60"
                    />
                </div>
            </div>

            {/* Botón Calcular */}
            <button 
                className="clausula97-btn"
                onClick={calcular}
            >
                <FaCalculator /> Calcular Préstamos
            </button>

            {/* Resultados */}
            {mostrarResultados && resultado && (
                <div className="clausula97-resultado-container">
                    <div className="clausula97-resultado-title">
                        <FaFileContract /> Montos del Préstamo
                    </div>

                    <div className="clausula97-resultado-grid">
                        {plazos.map((plazo, index) => {
                            const montos = [resultado.monto1, resultado.monto2, resultado.monto3, resultado.monto4];
                            return (
                                <div key={index} className="clausula97-resultado-item">
                                    <div className="clausula97-resultado-item-title">
                                        <FaCalendarAlt />
                                        {plazo.label}
                                    </div>
                                    <div className="clausula97-resultado-monto">
                                        {formatter.format(montos[index])}
                                    </div>
                                    <div className="clausula97-resultado-plazo">
                                        <FaRegClock />
                                        Pagar a {plazo.quincenas} quincenas
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <small className="clausula97-small-text">
                        * Los descuentos se realizan de forma quincenal según el plazo elegido.
                        No generan intereses.
                    </small>
                </div>
            )}
        </div>
    );
};

export default Clausula97;