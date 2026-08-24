import React, { useState } from 'react';
import { FaFileContract, FaInfoCircle, FaCalculator } from 'react-icons/fa';

const Clausula97 = () => {
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

        const baseMensual = (c02Num + c11Num) * 2;

        setResultado({
            baseMensual: baseMensual,
            monto1: baseMensual * 1,
            monto2: baseMensual * 2,
            monto3: baseMensual * 3,
            monto4: baseMensual * 4
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
                <div className="w-12 h-12 bg-[#486DAA] rounded-2xl flex items-center justify-center text-white text-xl shadow-md shadow-[#486DAA]/30">
                    <FaFileContract />
                </div>
                <div>
                    <h3 className="text-lg font-black text-[#486DAA] m-0">Préstamo Personal (Cláusula 97)</h3>
                    <p className="text-xs text-slate-500 m-0">Financiamiento de 1 hasta 4 meses de sueldo tabular</p>
                </div>
            </div>

            <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200 text-xs text-blue-900 flex items-start space-x-2.5">
                <FaInfoCircle className="text-base text-[#486DAA] flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                    Préstamo a cuenta de sueldo según el CCT vigente. Base mensual: <strong>(C002 + C011) × 2</strong>.
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
                className="w-full bg-gradient-to-r from-[#486DAA] to-[#355386] hover:from-[#3b598d] hover:to-[#2e4771] text-white font-bold py-3 px-6 rounded-full shadow-md shadow-[#486DAA]/30 hover:scale-[1.01] transition duration-200 text-xs flex items-center justify-center space-x-2 border-0 cursor-pointer"
            >
                <FaCalculator />
                <span>Calcular Préstamo Cláusula 97</span>
            </button>

            {resultado && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                        <span className="text-[9px] font-extrabold text-slate-500 uppercase block mb-1">1 Mes</span>
                        <span className="text-sm font-black text-slate-800 block">{formatter.format(resultado.monto1)}</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                        <span className="text-[9px] font-extrabold text-slate-500 uppercase block mb-1">2 Meses</span>
                        <span className="text-sm font-black text-slate-800 block">{formatter.format(resultado.monto2)}</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                        <span className="text-[9px] font-extrabold text-slate-500 uppercase block mb-1">3 Meses</span>
                        <span className="text-sm font-black text-slate-800 block">{formatter.format(resultado.monto3)}</span>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-center">
                        <span className="text-[9px] font-extrabold text-[#486DAA] uppercase block mb-1">4 Meses (Máx)</span>
                        <span className="text-sm font-black text-[#486DAA] block">{formatter.format(resultado.monto4)}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clausula97;