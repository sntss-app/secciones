import React, { useState } from 'react';
import { FaCalculator, FaClock, FaMoneyBillWave, FaInfoCircle, FaCheckCircle, FaRegClock } from 'react-icons/fa';

// ✅ IMPORTAR CSS EXTERNO
import '../../css/HorasExtras.css';

const HorasExtras = () => {
    const [smi, setSmi] = useState('');
    const [jornada, setJornada] = useState(8);
    const [horas, setHoras] = useState('');
    const [infecto, setInfecto] = useState(false);
    const [resultado, setResultado] = useState(null);

    const calcular = () => {
        const smiNum = parseFloat(smi);
        const horasNum = parseFloat(horas);
        
        if (isNaN(smiNum) || smiNum <= 0) {
            alert('Ingresa un Sueldo Mensual Integrado válido.');
            return;
        }
        if (isNaN(horasNum) || horasNum <= 0) {
            alert('Ingresa un número válido de horas extras.');
            return;
        }

        const jornadaEfectiva = (jornada === 12) ? 8 : jornada;
        const salarioDiario = smiNum / 30;
        const valorHoraNormal = salarioDiario / jornadaEfectiva;
        const valorHoraExtra = valorHoraNormal * 2;
        const pagoNormal = valorHoraExtra * horasNum;

        setResultado({
            normal: pagoNormal,
            con20: infecto ? pagoNormal * 1.20 : null
        });
    };

    const formatter = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2
    });

    const jornadas = [
        { value: 6.5, label: '6.5 horas' },
        { value: 8, label: '8 horas' },
        { value: 12, label: '12 horas (velada)' },
    ];

    return (
        <div className="horasextras-container">
            {/* Header */}
            <div className="horasextras-header">
                <FaClock className="horasextras-header-icon" />
                <div>
                    <h3 className="horasextras-header-title">Pago de Horas Extras</h3>
                    <div className="horasextras-header-subtitle">
                        <FaInfoCircle size={12} /> Las horas extras se pagan al doble
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div className="horasextras-info-box">
                <FaInfoCircle />
                <span>
                    El cálculo de horas extras se realiza con base en el Sueldo Mensual Integrado (SMI) 
                    y el tipo de jornada laboral. Las horas extras se pagan al doble del valor de la hora normal.
                </span>
            </div>

            {/* Formulario */}
            <div className="horasextras-grid">
                <div className="horasextras-input-group">
                    <label className="horasextras-label">
                        <FaMoneyBillWave className="horasextras-label-icon" /> Sueldo Mensual Integrado (SMI)
                    </label>
                    <input 
                        type="number" 
                        step="0.01"
                        className="horasextras-input" 
                        value={smi} 
                        onChange={(e) => setSmi(e.target.value)} 
                        placeholder="Ej: 11204.50"
                    />
                </div>
                <div className="horasextras-input-group">
                    <label className="horasextras-label">
                        <FaRegClock className="horasextras-label-icon" /> Jornada laboral
                    </label>
                    <select
                        className="horasextras-select"
                        value={jornada}
                        onChange={(e) => setJornada(Number(e.target.value))}
                    >
                        {jornadas.map((j) => (
                            <option key={j.value} value={j.value}>
                                {j.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="horasextras-input-group">
                <label className="horasextras-label">
                    <FaClock className="horasextras-label-icon" /> Horas extras laboradas
                </label>
                <input 
                    type="number" 
                    step="0.5"
                    className="horasextras-input" 
                    value={horas} 
                    onChange={(e) => setHoras(e.target.value)} 
                    placeholder="Ej: 8"
                />
            </div>

            {/* Checkbox Infectocontagiosidad */}
            <div className="horasextras-checkbox-container">
                <input 
                    type="checkbox" 
                    className="horasextras-checkbox" 
                    checked={infecto} 
                    onChange={(e) => setInfecto(e.target.checked)} 
                    id="infecto"
                />
                <label className="horasextras-checkbox-label" htmlFor="infecto">
                    <FaCheckCircle style={{ color: infecto ? '#28a745' : '#6c757d', marginRight: '0.3rem' }} />
                    Infectocontagiosidad (20% adicional)
                </label>
            </div>

            {/* Botón Calcular */}
            <button 
                className="horasextras-btn"
                onClick={calcular}
            >
                <FaCalculator /> Calcular Pago de Horas Extras
            </button>

            {/* Resultados */}
            {resultado && (
                <div className="horasextras-resultado-container">
                    <div className="horasextras-resultado-title">
                        <FaClock /> Pago Estimado de Horas Extras
                    </div>

                    <div className="horasextras-resultado-item horasextras-resultado-item-normal">
                        <div className="horasextras-resultado-item-content">
                            <div>
                                <span className="horasextras-resultado-label">Pago sin 20%</span>
                                <span className="horasextras-resultado-label-small">Horas extras al doble</span>
                            </div>
                            <span className="horasextras-resultado-monto">{formatter.format(resultado.normal)}</span>
                        </div>
                    </div>

                    {resultado.con20 && (
                        <div className="horasextras-resultado-item horasextras-resultado-item-infecto">
                            <div className="horasextras-resultado-item-content">
                                <div>
                                    <span className="horasextras-resultado-label">Pago con 20%</span>
                                    <span className="horasextras-resultado-label-small">Infectocontagiosidad</span>
                                </div>
                                <span className="horasextras-resultado-monto-verde">{formatter.format(resultado.con20)}</span>
                            </div>
                        </div>
                    )}

                    <div className="horasextras-info-extra">
                        <FaInfoCircle />
                        <span>Las horas extras se pagan al doble del valor de la hora normal.</span>
                    </div>

                    <small className="horasextras-small-text">
                        * Cálculo estimado basado en el SMI proporcionado. 
                        Puede variar según el tipo de jornada y las prestaciones adicionales.
                    </small>
                </div>
            )}
        </div>
    );
};

export default HorasExtras;