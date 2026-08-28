import React, { useState } from 'react';
import { FaCalculator, FaBuilding, FaMoneyBillWave, FaInfoCircle, FaHome, FaChartLine } from 'react-icons/fa';

// ✅ IMPORTAR CSS EXTERNO
import '../../css/CreditoHipotecario.css';

const CreditoHipotecario = () => {
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

        const sumaQuincenal = c02Num + c11Num;
        const mensualBase = sumaQuincenal * 2;
        const prestaciones = mensualBase * 0.20;
        const totalMensual = mensualBase + prestaciones;

        setResultado({
            monto75: totalMensual * 75,
            monto90: totalMensual * 90
        });
    };

    const formatter = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2
    });

    return (
        <div className="creditohipotecario-container">
            {/* Header */}
            <div className="creditohipotecario-header">
                <FaHome className="creditohipotecario-header-icon" />
                <div>
                    <h3 className="creditohipotecario-header-title">Crédito Hipotecario</h3>
                    <div className="creditohipotecario-header-subtitle">
                        <FaInfoCircle size={12} /> Trámite gestionado por la Secretaría de Fomento a la Habitación
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div className="creditohipotecario-info-box">
                <FaInfoCircle />
                <span>
                    El crédito hipotecario se calcula con base en el Salario Mensual Integrado 
                    (Sueldo Base + 20% de prestaciones). Se pueden solicitar hasta 90 veces el salario.
                </span>
            </div>

            {/* Formulario */}
            <div className="creditohipotecario-grid">
                <div className="creditohipotecario-input-group">
                    <label className="creditohipotecario-label">
                        <FaMoneyBillWave className="creditohipotecario-label-icon" /> Concepto 002 (quincenal)
                    </label>
                    <input 
                        type="number" 
                        step="0.01"
                        className="creditohipotecario-input" 
                        value={c02} 
                        onChange={(e) => setC02(e.target.value)} 
                        placeholder="Ej: 2437.73"
                    />
                </div>
                <div className="creditohipotecario-input-group">
                    <label className="creditohipotecario-label">
                        <FaMoneyBillWave className="creditohipotecario-label-icon" /> Concepto 011 (quincenal)
                    </label>
                    <input 
                        type="number" 
                        step="0.01"
                        className="creditohipotecario-input" 
                        value={c11} 
                        onChange={(e) => setC11(e.target.value)} 
                        placeholder="Ej: 2002.60"
                    />
                </div>
            </div>

            {/* Botón Calcular */}
            <button 
                className="creditohipotecario-btn"
                onClick={calcular}
            >
                <FaCalculator /> Calcular Crédito Hipotecario
            </button>

            {/* Resultados */}
            {resultado && (
                <div className="creditohipotecario-resultado-container">
                    <div className="creditohipotecario-resultado-title">
                        <FaBuilding /> Montos del Crédito Hipotecario
                    </div>

                    <div className="creditohipotecario-resultado-item creditohipotecario-resultado-item-azul">
                        <div>
                            <span className="creditohipotecario-resultado-label">Por 75 veces el Salario Mensual Integrado</span>
                            <span className="creditohipotecario-resultado-label-small">Opción de menor monto</span>
                        </div>
                        <span className="creditohipotecario-resultado-monto">{formatter.format(resultado.monto75)}</span>
                    </div>

                    <div className="creditohipotecario-resultado-item creditohipotecario-resultado-item-verde">
                        <div>
                            <span className="creditohipotecario-resultado-label">Por 90 veces el Salario Mensual Integrado</span>
                            <span className="creditohipotecario-resultado-label-small">Opción de mayor monto</span>
                        </div>
                        <span className="creditohipotecario-resultado-monto-verde">{formatter.format(resultado.monto90)}</span>
                    </div>

                    <small className="creditohipotecario-small-text">
                        <FaChartLine />
                        El monto final depende de la liquidez del trabajador.
                    </small>
                </div>
            )}
        </div>
    );
};

export default CreditoHipotecario;