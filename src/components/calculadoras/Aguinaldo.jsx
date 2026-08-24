import React, { useState } from 'react';
import { FaGift, FaInfoCircle, FaCalculator } from 'react-icons/fa';

const Aguinaldo = () => {
    const [c02, setC02] = useState('');
    const [c11, setC11] = useState('');
    const [dias, setDias] = useState(365);
    const [resultado, setResultado] = useState(null);

    const calcular = () => {
        const c02Num = parseFloat(c02);
        const c11Num = parseFloat(c11);
        
        if (isNaN(c02Num) || isNaN(c11Num) || c02Num <= 0 || c11Num <= 0) {
            alert('Ingresa montos válidos para los conceptos 002 y 011.');
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
        <div className="space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white text-xl shadow-md shadow-orange-500/30">
                    <FaGift />
                </div>
                <div>
                    <h3 className="text-lg font-black text-[#486DAA] m-0">Estimador de Gratificación Anual / Aguinaldo</h3>
                    <p className="text-xs text-slate-500 m-0">Cálculo de entregas (Enero, Agosto y Diciembre)</p>
                </div>
            </div>

            <div className="p-3.5 bg-orange-50/80 rounded-2xl border border-orange-200 text-xs text-orange-900 flex items-start space-x-2.5">
                <FaInfoCircle className="text-base text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                    Estimación proporcional de gratificación y aguinaldo según CCT y días laborados en el año.
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                    <label className="block text-xs font-bold text-[#486DAA] mb-1 pl-2">
                        Concepto 002
                    </label>
                    <input 
                        type="number"
                        step="0.01"
                        value={c02}
                        onChange={(e) => setC02(e.target.value)}
                        placeholder="Sueldo"
                        className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 px-3 text-xs font-medium text-slate-700 outline-none focus:border-[#486DAA]"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-[#486DAA] mb-1 pl-2">
                        Concepto 011
                    </label>
                    <input 
                        type="number"
                        step="0.01"
                        value={c11}
                        onChange={(e) => setC11(e.target.value)}
                        placeholder="Renta"
                        className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 px-3 text-xs font-medium text-slate-700 outline-none focus:border-[#486DAA]"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-[#486DAA] mb-1 pl-2">
                        Días Laborados
                    </label>
                    <input 
                        type="number"
                        value={dias}
                        onChange={(e) => setDias(e.target.value)}
                        placeholder="365"
                        className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 px-3 text-xs font-medium text-slate-700 outline-none focus:border-[#486DAA]"
                    />
                </div>
            </div>

            <button 
                type="button"
                onClick={calcular}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-full shadow-md shadow-orange-500/30 hover:scale-[1.01] transition duration-200 text-xs flex items-center justify-center space-x-2 border-0 cursor-pointer"
            >
                <FaCalculator />
                <span>Calcular Aguinaldo y Gratificaciones</span>
            </button>

            {resultado && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                        <span className="text-[9px] font-extrabold text-slate-500 uppercase block mb-1">Enero (15d)</span>
                        <span className="text-sm font-black text-slate-800 block">{formatter.format(resultado.enero)}</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                        <span className="text-[9px] font-extrabold text-slate-500 uppercase block mb-1">Agosto (30d)</span>
                        <span className="text-sm font-black text-slate-800 block">{formatter.format(resultado.agosto)}</span>
                    </div>

                    <div className="p-3 bg-orange-50 rounded-xl border border-orange-200 text-center">
                        <span className="text-[9px] font-extrabold text-orange-700 uppercase block mb-1">Dic c/anticipo</span>
                        <span className="text-sm font-black text-orange-600 block">{formatter.format(resultado.diciembreCon)}</span>
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                        <span className="text-[9px] font-extrabold text-emerald-700 uppercase block mb-1">Dic s/anticipo</span>
                        <span className="text-sm font-black text-emerald-600 block">{formatter.format(resultado.diciembreSin)}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Aguinaldo;