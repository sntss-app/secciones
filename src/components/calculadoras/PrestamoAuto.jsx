import React, { useState } from 'react';
import { FaCar, FaInfoCircle, FaCheckCircle, FaCalculator } from 'react-icons/fa';

const PrestamoAuto = () => {
    const [c02, setC02] = useState('');
    const [c11, setC11] = useState('');
    const [resultado, setResultado] = useState(null);

    const calcular = () => {
        const c02Num = parseFloat(c02);
        const c11Num = parseFloat(c11);
        
        if (isNaN(c02Num) || isNaN(c11Num) || c02Num <= 0 || c11Num <= 0) {
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
        <div className="space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white text-xl shadow-md shadow-orange-500/30">
                    <FaCar />
                </div>
                <div>
                    <h3 className="text-lg font-black text-[#486DAA] m-0">Préstamo de Automóvil</h3>
                    <p className="text-xs text-slate-500 m-0">Financiamiento automotriz de hasta 24 meses de sueldo integrado</p>
                </div>
            </div>

            <div className="p-3.5 bg-orange-50/80 rounded-2xl border border-orange-200 text-xs text-orange-900 flex items-start space-x-2.5">
                <FaInfoCircle className="text-base text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                    Monto máximo calculado con la fórmula oficial: <strong>(C002 + C011) × 2 × 1.20 × 24</strong>.
                </div>
            </div>

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
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-full shadow-md shadow-orange-500/30 hover:scale-[1.01] transition duration-200 text-xs flex items-center justify-center space-x-2 border-0 cursor-pointer"
            >
                <FaCalculator />
                <span>Calcular Monto Máximo de Auto</span>
            </button>

            {resultado && (
                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-200 text-center pt-2">
                    <span className="text-[10px] font-extrabold text-orange-700 uppercase tracking-wider block mb-1">
                        Monto Máximo Autorizado
                    </span>
                    <span className="text-2xl font-black text-orange-600 block">
                        {formatter.format(resultado)}
                    </span>
                </div>
            )}
        </div>
    );
};

export default PrestamoAuto;