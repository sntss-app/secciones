import React, { useState } from 'react';
import { FaBuilding, FaInfoCircle, FaHome, FaCheckCircle, FaCalculator } from 'react-icons/fa';

const CreditoHipotecario = () => {
    const [c02, setC02] = useState('');
    const [c11, setC11] = useState('');
    const [resultado, setResultado] = useState(null);

    const calcular = () => {
        const c02Num = parseFloat(c02);
        const c11Num = parseFloat(c11);
        
        if (isNaN(c02Num) || isNaN(c11Num) || c02Num <= 0 || c11Num <= 0) {
            alert('Por favor ingresa montos numéricos válidos para los conceptos 002 y 011.');
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
        <div className="space-y-4">
            {/* Header del Modal */}
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                <div className="w-12 h-12 bg-[#486DAA] rounded-2xl flex items-center justify-center text-white text-xl shadow-md shadow-[#486DAA]/30">
                    <FaHome />
                </div>
                <div>
                    <h3 className="text-lg font-black text-[#486DAA] m-0">Crédito Hipotecario Sindical</h3>
                    <p className="text-xs text-slate-500 m-0">Financiamiento para adquisición y construcción de vivienda</p>
                </div>
            </div>

            {/* Cuadro de Información */}
            <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200 text-xs text-blue-900 flex items-start space-x-2.5">
                <FaInfoCircle className="text-base text-[#486DAA] flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                    Cálculo estimado sobre 75 y 90 mensualidades integradas según los conceptos <strong>002 (Sueldo)</strong> y <strong>011 (Ayuda de Renta)</strong>.
                </div>
            </div>

            {/* Inputs de Conceptos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-[#486DAA] mb-1 pl-2">
                        Concepto 002 (Sueldo Quincenal)
                    </label>
                    <input 
                        type="number"
                        step="0.01"
                        value={c02}
                        onChange={(e) => setC02(e.target.value)}
                        placeholder="Ej. 4500.50"
                        className="w-full bg-slate-50 border border-slate-200 rounded-full py-2.5 px-4 text-xs font-medium text-slate-700 outline-none focus:border-[#486DAA] focus:bg-white transition"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-[#486DAA] mb-1 pl-2">
                        Concepto 011 (Ayuda de Renta)
                    </label>
                    <input 
                        type="number"
                        step="0.01"
                        value={c11}
                        onChange={(e) => setC11(e.target.value)}
                        placeholder="Ej. 1200.00"
                        className="w-full bg-slate-50 border border-slate-200 rounded-full py-2.5 px-4 text-xs font-medium text-slate-700 outline-none focus:border-[#486DAA] focus:bg-white transition"
                    />
                </div>
            </div>

            <button 
                type="button"
                onClick={calcular}
                className="w-full bg-gradient-to-r from-[#486DAA] to-[#355386] hover:from-[#3b598d] hover:to-[#2e4771] text-white font-bold py-3 px-6 rounded-full shadow-md shadow-[#486DAA]/30 hover:scale-[1.01] transition duration-200 text-xs flex items-center justify-center space-x-2 border-0 cursor-pointer"
            >
                <FaCalculator />
                <span>Calcular Crédito Hipotecario</span>
            </button>

            {/* Resultados */}
            {resultado && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
                        <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider block mb-1">
                            Capacidad (75 Meses)
                        </span>
                        <span className="text-xl font-black text-emerald-600 block">
                            {formatter.format(resultado.monto75)}
                        </span>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-center">
                        <span className="text-[10px] font-extrabold text-[#486DAA] uppercase tracking-wider block mb-1">
                            Capacidad Máxima (90 Meses)
                        </span>
                        <span className="text-xl font-black text-[#486DAA] block">
                            {formatter.format(resultado.monto90)}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreditoHipotecario;