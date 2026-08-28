import React, { useState } from 'react';
import { FaCalculator, FaCar, FaMoneyBillWave, FaInfoCircle, FaChartLine, FaCheckCircle } from 'react-icons/fa';

// ✅ IMPORTAR CSS EXTERNO
import '../../css/PrestamoAuto.css';

const PrestamoAuto = () => {
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
        const mensualIntegrado = mensualBase * 1.20;
        setResultado(mensualIntegrado * 24);
    };

    const formatter = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2
    });

    return (
        <div className="prestamoauto-container">
            {/* Header */}
            <div className="prestamoauto-header">
                <FaCar className="prestamoauto-header-icon" />
                <div>
                    <h3 className="prestamoauto-header-title">Préstamo de Auto</h3>
                    <div className="prestamoauto-header-subtitle">
                        <FaInfoCircle size={12} /> Financiamiento para la compra de tu vehículo
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div className="prestamoauto-info-box">
                <FaInfoCircle />
                <span>
                    El préstamo para auto se calcula con base en el Salario Mensual Integrado 
                    (Sueldo Base + 20% de prestaciones). Se puede financiar hasta 24 veces el salario.
                </span>
            </div>

            {/* Formulario */}
            <div className="prestamoauto-grid">
                <div className="prestamoauto-input-group">
                    <label className="prestamoauto-label">
                        <FaMoneyBillWave className="prestamoauto-label-icon" /> Concepto 002 (quincenal)
                    </label>
                    <input 
                        type="number" 
                        step="0.01"
                        className="prestamoauto-input" 
                        value={c02} 
                        onChange={(e) => setC02(e.target.value)} 
                        placeholder="Ej: 2437.73"
                    />
                </div>
                <div className="prestamoauto-input-group">
                    <label className="prestamoauto-label">
                        <FaMoneyBillWave className="prestamoauto-label-icon" /> Concepto 011 (quincenal)
                    </label>
                    <input 
                        type="number" 
                        step="0.01"
                        className="prestamoauto-input" 
                        value={c11} 
                        onChange={(e) => setC11(e.target.value)} 
                        placeholder="Ej: 2002.60"
                    />
                </div>
            </div>

            {/* Botón Calcular */}
            <button 
                className="prestamoauto-btn"
                onClick={calcular}
            >
                <FaCalculator /> Calcular Préstamo para Auto
            </button>

            {/* Resultados */}
            {resultado && (
                <div className="prestamoauto-resultado-container">
                    <div className="prestamoauto-resultado-title">
                        <FaCar /> Monto del Préstamo para Auto
                    </div>

                    <div className="prestamoauto-resultado-item">
                        <div>
                            <span className="prestamoauto-resultado-label">Por 24 veces el sueldo mensual integrado</span>
                            <span className="prestamoauto-resultado-label-small">Incluye 20% de prestaciones</span>
                            <span className="prestamoauto-badge">
                                <FaCheckCircle style={{ marginRight: '0.2rem' }} /> Financiamiento
                            </span>
                        </div>
                        <span className="prestamoauto-resultado-monto">{formatter.format(resultado)}</span>
                    </div>

                    <div className="prestamoauto-resultado-detalle">
                        <div className="prestamoauto-detalle-item">
                            <span>Concepto 002 (quincenal)</span>
                            <span>{formatter.format(parseFloat(c02) || 0)}</span>
                        </div>
                        <div className="prestamoauto-detalle-item">
                            <span>Concepto 011 (quincenal)</span>
                            <span>{formatter.format(parseFloat(c11) || 0)}</span>
                        </div>
                        <div className="prestamoauto-detalle-item">
                            <span>Prestaciones (20%)</span>
                            <span>Incluidas</span>
                        </div>
                        <div className="prestamoauto-detalle-item">
                            <span>Plazo de pago</span>
                            <span>24 meses</span>
                        </div>
                    </div>

                    <small className="prestamoauto-small-text">
                        <FaChartLine />
                        El monto final depende de la evaluación crediticia y disponibilidad de recursos.
                        Plazo de pago: hasta 24 meses.
                    </small>
                </div>
            )}
        </div>
    );
};

export default PrestamoAuto;