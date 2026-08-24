import React, { useState } from 'react';
import { FaPiggyBank, FaInfoCircle, FaCheckCircle, FaCalculator } from 'react-icons/fa';

const FondoAhorro = () => {
    const [c02, setC02] = useState('');
    const [resultado, setResultado] = useState(null);

    const calcular = () => {
        const c02Num = parseFloat(c02);
        
        if (isNaN(c02Num) || c02Num <= 0) {
            alert('Por favor ingresa un monto válido para el concepto 002.');
            return;
        }

        const aportacionQuincenal = c02Num * 0.10;
        const aportacionPatronal = aportacionQuincenal * 2;
        const totalQuincenal = aportacionQuincenal + aportacionPatronal;
        const anualEstimado = totalQuincenal * 24;

        setResultado({
            quincenal: totalQuincenal,
            anual: anualEstimado
        });
    };

    const formatter = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-xl shadow-md shadow-emerald-500/30">
                    <FaPiggyBank />
                </div>
                <div>
                    <h3 className="text-lg font-black text-[#486DAA] m-0">Fondo de Ahorro (2 de Julio)</h3>
                    <p className="text-xs text-slate-500 m-0">Ahorro anual con aportación sindical y patronal</p>
                </div>
            </div>

            <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-start space-x-2.5">
                <FaInfoCircle className="text-base text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                    Estimación sobre el <strong>Concepto 002 (Sueldo Tabular)</strong> con aportación del trabajador y aportación institucional.
                </div>
            </div>

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

            <button 
                type="button"
                onClick={calcular}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-full shadow-md shadow-emerald-500/30 hover:scale-[1.01] transition duration-200 text-xs flex items-center justify-center space-x-2 border-0 cursor-pointer"
            >
                <FaCalculator />
                <span>Calcular Fondo de Ahorro</span>
            </button>

            {resultado && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                            Ahorro Quincenal Total
                        </span>
                        <span className="text-lg font-black text-slate-800 block">
                            {formatter.format(resultado.quincenal)}
                        </span>
                    </div>

                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
                        <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider block mb-1">
                            Entrega Anual Estimada
                        </span>
                        <span className="text-xl font-black text-emerald-600 block">
                            {formatter.format(resultado.anual)}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FondoAhorro;