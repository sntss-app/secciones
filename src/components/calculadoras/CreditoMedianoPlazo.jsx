import React, { useState } from 'react';
import { FaCalculator, FaHouseUser, FaMoneyBillWave, FaInfoCircle, FaHome, FaChartLine } from 'react-icons/fa';

// ✅ IMPORTAR CSS EXTERNO
import '../../css/CreditoMedianoPlazo.css';

const CreditoMedianoPlazo = () => {
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

        setResultado(totalMensual * 35);
    };

    const formatter = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2
    });

    return (
        <div className="creditomedianoplazo-container">
            {/* Header */}
            <div className="creditomedianoplazo-header">
                <FaHouseUser className="creditomedianoplazo-header-icon" />
                <div>
                    <h3 className="creditomedianoplazo-header-title">Crédito a Mediano Plazo</h3>
                    <div className="creditomedianoplazo-header-subtitle">
                        <FaInfoCircle size={12} /> Trámite gestionado por la Secretaría de Fomento a la Habitación
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div className="creditomedianoplazo-info-box">
                <FaInfoCircle />
                <span>
                    El crédito a mediano plazo se calcula con base en el Salario Mensual Integrado 
                    (Sueldo Base + 20% de prestaciones). Permite financiar hasta 35 veces el salario.
                </span>
            </div>

            {/* Formulario */}
            <div className="creditomedianoplazo-grid">
                <div className="creditomedianoplazo-input-group">
                    <label className="creditomedianoplazo-label">
                        <FaMoneyBillWave className="creditomedianoplazo-label-icon" /> Concepto 002 (quincenal)
                    </label>
                    <input 
                        type="number" 
                        step="0.01"
                        className="creditomedianoplazo-input" 
                        value={c02} 
                        onChange={(e) => setC02(e.target.value)} 
                        placeholder="Ej: 2437.73"
                    />
                </div>
                <div className="creditomedianoplazo-input-group">
                    <label className="creditomedianoplazo-label">
                        <FaMoneyBillWave className="creditomedianoplazo-label-icon" /> Concepto 011 (quincenal)
                    </label>
                    <input 
                        type="number" 
                        step="0.01"
                        className="creditomedianoplazo-input" 
                        value={c11} 
                        onChange={(e) => setC11(e.target.value)} 
                        placeholder="Ej: 2002.60"
                    />
                </div>
            </div>

            {/* Botón Calcular */}
            <button 
                className="creditomedianoplazo-btn"
                onClick={calcular}
            >
                <FaCalculator /> Calcular Crédito a Mediano Plazo
            </button>

            {/* Resultados */}
            {resultado && (
                <div className="creditomedianoplazo-resultado-container">
                    <div className="creditomedianoplazo-resultado-title">
                        <FaHome /> Monto del Crédito a Mediano Plazo
                    </div>

                    <div className="creditomedianoplazo-resultado-item">
                        <div>
                            <span className="creditomedianoplazo-resultado-label">Por 35 veces el Salario Mensual Integrado</span>
                            <span className="creditomedianoplazo-resultado-label-small">Financiamiento para remodelación o mejora de vivienda</span>
                        </div>
                        <span className="creditomedianoplazo-resultado-monto">{formatter.format(resultado)}</span>
                    </div>

                    <small className="creditomedianoplazo-small-text">
                        <FaChartLine />
                        El monto final depende de la evaluación crediticia y disponibilidad de recursos.
                    </small>
                </div>
            )}
        </div>
    );
};

export default CreditoMedianoPlazo;