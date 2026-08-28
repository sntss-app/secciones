import React, { useState } from 'react';
import { FaCalculator, FaPiggyBank, FaMoneyBillWave, FaInfoCircle, FaCalendarAlt, FaChartLine } from 'react-icons/fa';

// ✅ IMPORTAR CSS EXTERNO
import '../../css/FondoAhorro.css';

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
        currency: 'MXN',
        minimumFractionDigits: 2
    });

    return (
        <div className="fondoahorro-container">
            {/* Header */}
            <div className="fondoahorro-header">
                <FaPiggyBank className="fondoahorro-header-icon" />
                <div>
                    <h3 className="fondoahorro-header-title">Fondo de Ahorro (2° de Julio)</h3>
                    <div className="fondoahorro-header-subtitle">
                        <FaInfoCircle size={12} /> Ahorro anual para los trabajadores
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div className="fondoahorro-info-box">
                <FaInfoCircle />
                <span>
                    El Fondo de Ahorro 2 de Julio se calcula con base en tu sueldo base.
                    Se utiliza el promedio de los conceptos 002 y 011 para determinar el ahorro.
                </span>
            </div>

            {/* Formulario */}
            <div className="fondoahorro-grid">
                <div className="fondoahorro-input-group">
                    <label className="fondoahorro-label">
                        <FaMoneyBillWave className="fondoahorro-label-icon" /> Concepto 002
                    </label>
                    <input 
                        type="number" 
                        className="fondoahorro-input" 
                        value={c02} 
                        onChange={(e) => setC02(e.target.value)} 
                        placeholder="Ej: 2437.73"
                    />
                </div>
                <div className="fondoahorro-input-group">
                    <label className="fondoahorro-label">
                        <FaMoneyBillWave className="fondoahorro-label-icon" /> Concepto 011
                    </label>
                    <input 
                        type="number" 
                        className="fondoahorro-input" 
                        value={c11} 
                        onChange={(e) => setC11(e.target.value)} 
                        placeholder="Ej: 2002.60"
                    />
                </div>
            </div>

            {/* Botón Calcular */}
            <button 
                className="fondoahorro-btn"
                onClick={calcular}
            >
                <FaCalculator /> Calcular Fondo de Ahorro
            </button>

            {/* Resultados */}
            {resultado && (
                <div className="fondoahorro-resultado-container">
                    <div className="fondoahorro-resultado-title">
                        <FaPiggyBank /> Fondo de Ahorro Estimado
                    </div>

                    <div className="fondoahorro-resultado-item">
                        <div>
                            <span className="fondoahorro-resultado-label">Total del fondo</span>
                            <span className="fondoahorro-resultado-label-small">46 días tabulares</span>
                        </div>
                        <span className="fondoahorro-resultado-monto">{formatter.format(resultado)}</span>
                    </div>

                    <div className="fondoahorro-resultado-detalle">
                        <div className="fondoahorro-detalle-item">
                            <span>Base de cálculo</span>
                            <span>Conceptos 002 + 011</span>
                        </div>
                        <div className="fondoahorro-detalle-item">
                            <span>Días considerados</span>
                            <span>46 días</span>
                        </div>
                        <div className="fondoahorro-detalle-item">
                            <span>Periodo</span>
                            <span>Anual (2 de Julio)</span>
                        </div>
                    </div>

                    <small className="fondoahorro-small-text">
                        <FaCalendarAlt />
                        El fondo se entrega el 2 de julio de cada año. 
                        El monto puede variar según incidencias del periodo.
                    </small>
                </div>
            )}
        </div>
    );
};

export default FondoAhorro;