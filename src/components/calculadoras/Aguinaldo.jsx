import React, { useState } from 'react';
import { FaCalculator, FaGift, FaCalendarAlt, FaMoneyBillWave, FaInfoCircle } from 'react-icons/fa';

// ✅ IMPORTAR CSS EXTERNO
import '../../css/Aguinaldo.css';

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
        currency: 'MXN',
        minimumFractionDigits: 2
    });

    return (
        <div className="aguinaldo-container">
            {/* Header */}
            <div className="aguinaldo-header">
                <FaGift className="aguinaldo-header-icon" />
                <div>
                    <h3 className="aguinaldo-header-title">Aguinaldo</h3>
                    <div className="aguinaldo-header-subtitle">
                        <FaInfoCircle size={12} /> Concepto 049 - 90 días de sueldo proporcional
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div className="aguinaldo-info-box">
                <FaInfoCircle />
                <span>
                    El aguinaldo se calcula con base en el sueldo diario integrado. 
                    Incluye concepto 002 + 011 (el 011 se multiplica por 2 por ser bono quincenal).
                </span>
            </div>

            {/* Formulario */}
            <div className="aguinaldo-grid">
                <div className="aguinaldo-input-group">
                    <label className="aguinaldo-label">
                        <FaMoneyBillWave className="aguinaldo-label-icon" /> Concepto 002
                    </label>
                    <input 
                        type="number" 
                        className="aguinaldo-input" 
                        value={c02} 
                        onChange={(e) => setC02(e.target.value)} 
                        placeholder="Ej: 2437.73"
                    />
                </div>
                <div className="aguinaldo-input-group">
                    <label className="aguinaldo-label">
                        <FaMoneyBillWave className="aguinaldo-label-icon" /> Concepto 011
                    </label>
                    <input 
                        type="number" 
                        className="aguinaldo-input" 
                        value={c11} 
                        onChange={(e) => setC11(e.target.value)} 
                        placeholder="Ej: 2002.60"
                    />
                </div>
                <div className="aguinaldo-input-group aguinaldo-full-width">
                    <label className="aguinaldo-label">
                        <FaCalendarAlt className="aguinaldo-label-icon" /> Días trabajados
                    </label>
                    <input 
                        type="number" 
                        className="aguinaldo-input" 
                        value={dias} 
                        onChange={(e) => setDias(Number(e.target.value))}
                    />
                </div>
            </div>

            {/* Botón Calcular */}
            <button 
                className="aguinaldo-btn"
                onClick={calcular}
            >
                <FaCalculator /> Calcular Aguinaldo
            </button>

            {/* Resultados */}
            {resultado && (
                <div className="aguinaldo-resultado-container">
                    <div className="aguinaldo-resultado-title">
                        <FaGift /> Montos estimados
                    </div>

                    <div className="aguinaldo-resultado-item">
                        <span className="aguinaldo-resultado-label">Anticipo enero (15 días)</span>
                        <span className="aguinaldo-resultado-monto">{formatter.format(resultado.enero)}</span>
                    </div>

                    <div className="aguinaldo-resultado-item">
                        <span className="aguinaldo-resultado-label">Adelanto agosto (30 días)</span>
                        <span className="aguinaldo-resultado-monto">{formatter.format(resultado.agosto)}</span>
                    </div>

                    <div className="aguinaldo-resultado-item">
                        <span className="aguinaldo-resultado-label">Diciembre (con adelanto)</span>
                        <span className="aguinaldo-resultado-monto">{formatter.format(resultado.diciembreCon)}</span>
                    </div>

                    <div className="aguinaldo-resultado-item">
                        <span className="aguinaldo-resultado-label">Diciembre (sin adelanto)</span>
                        <span className="aguinaldo-resultado-monto-verde">{formatter.format(resultado.diciembreSin)}</span>
                    </div>

                    <div className="aguinaldo-resultado-total">
                        <span className="aguinaldo-resultado-total-label">Total estimado</span>
                        <span className="aguinaldo-resultado-total-monto">
                            {formatter.format(resultado.diciembreSin)}
                        </span>
                    </div>

                    <small className="aguinaldo-small-text">
                        * Cálculo estimado basado en los datos proporcionados. 
                        Puede variar según incidencias y prestaciones adicionales.
                    </small>
                </div>
            )}
        </div>
    );
};

export default Aguinaldo;