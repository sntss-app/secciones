import React, { useState } from 'react';
import { FaCalculator, FaUmbrellaBeach, FaMoneyBillWave, FaInfoCircle, FaCalendarAlt, FaSun, FaCheckCircle } from 'react-icons/fa';

// ✅ IMPORTAR CSS EXTERNO
import '../../css/Vacaciones.css';

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
        currency: 'MXN',
        minimumFractionDigits: 2
    });

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
        <div className="vacaciones-container">
            {/* Header */}
            <div className="vacaciones-header">
                <FaUmbrellaBeach className="vacaciones-header-icon" />
                <div>
                    <h3 className="vacaciones-header-title">Pago de Vacaciones</h3>
                    <div className="vacaciones-header-subtitle">
                        <FaInfoCircle size={12} /> Incluye prima vacacional del 25%
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div className="vacaciones-info-box">
                <FaInfoCircle />
                <span>
                    El pago de vacaciones incluye el salario de los días de vacaciones más la prima vacacional 
                    equivalente al 25% del salario correspondiente a esos días.
                </span>
            </div>

            {/* Formulario */}
            <div className="vacaciones-grid">
                <div className="vacaciones-input-group">
                    <label className="vacaciones-label">
                        <FaMoneyBillWave className="vacaciones-label-icon" /> Concepto 002
                    </label>
                    <input 
                        type="number" 
                        className="vacaciones-input" 
                        value={c02} 
                        onChange={(e) => setC02(e.target.value)} 
                        placeholder="Ej: 2437.73"
                    />
                </div>
                <div className="vacaciones-input-group">
                    <label className="vacaciones-label">
                        <FaMoneyBillWave className="vacaciones-label-icon" /> Concepto 011
                    </label>
                    <input 
                        type="number" 
                        className="vacaciones-input" 
                        value={c11} 
                        onChange={(e) => setC11(e.target.value)} 
                        placeholder="Ej: 2002.60"
                    />
                </div>
                <div className="vacaciones-input-group vacaciones-full-width">
                    <label className="vacaciones-label">
                        <FaCalendarAlt className="vacaciones-label-icon" /> Días de vacaciones
                    </label>
                    <select
                        className="vacaciones-select"
                        value={diasVacaciones}
                        onChange={(e) => setDiasVacaciones(Number(e.target.value))}
                    >
                        {opcionesDias.map(opt => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Botón Calcular */}
            <button 
                className="vacaciones-btn"
                onClick={calcular}
            >
                <FaCalculator /> Calcular Pago de Vacaciones
            </button>

            {/* Resultados */}
            {resultado && (
                <div className="vacaciones-resultado-container">
                    <div className="vacaciones-resultado-title">
                        <FaSun /> Detalle del Pago de Vacaciones
                    </div>

                    <div className="vacaciones-resultado-item vacaciones-resultado-item-total">
                        <div>
                            <span className="vacaciones-resultado-label">Pago de vacaciones</span>
                            <span className="vacaciones-resultado-label-small">
                                {resultado.dias} días × {formatter.format(resultado.valorDiario)}
                            </span>
                            <span className="vacaciones-badge">Salario diario</span>
                        </div>
                        <span className="vacaciones-resultado-monto">{formatter.format(resultado.total)}</span>
                    </div>

                    <div className="vacaciones-resultado-item vacaciones-resultado-item-prima">
                        <div>
                            <span className="vacaciones-resultado-label">Prima vacacional</span>
                            <span className="vacaciones-resultado-label-small">25% del salario de vacaciones</span>
                        </div>
                        <span className="vacaciones-resultado-monto-verde">{formatter.format(resultado.prima)}</span>
                    </div>

                    <small className="vacaciones-small-text">
                        <FaCheckCircle style={{ color: '#1ABC9C' }} />
                        El pago total incluye el salario de los días de vacaciones más la prima vacacional del 25%.
                        Los días de vacaciones dependen de la antigüedad del trabajador.
                    </small>
                </div>
            )}
        </div>
    );
};

export default Vacaciones;