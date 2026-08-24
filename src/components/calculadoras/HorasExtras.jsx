import React, { useState } from 'react';
import { FaClock, FaInfoCircle, FaCalculator } from 'react-icons/fa';

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

    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white text-xl shadow-md shadow-orange-500/30">
                    <FaClock />
                </div>
                <div>
                    <h3 className="text-lg font-black text-[#486DAA] m-0">Calculadora de Horas Extras</h3>
                    <p className="text-xs text-slate-500 m-0">Pago doble según jornada laboral e infectocontagiosidad</p>
                </div>
            </div>

            <div className="p-3.5 bg-orange-50/80 rounded-2xl border border-orange-200 text-xs text-orange-900 flex items-start space-x-2.5">
                <FaInfoCircle className="text-base text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                    Cálculo basado en salario diario y valor por hora doble según el turno laboral.
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                    <label className="block text-xs font-bold text-[#486DAA] mb-1 pl-2">
                        Sueldo Mensual (SMI)
                    </label>
                    <input 
                        type="number"
                        step="0.01"
                        value={smi}
                        onChange={(e) => setSmi(e.target.value)}
                        placeholder="Ej. 18000.00"
                        className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 px-3 text-xs font-medium text-slate-700 outline-none focus:border-[#486DAA]"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-[#486DAA] mb-1 pl-2">
                        Jornada Laboral
                    </label>
                    <select 
                        value={jornada} 
                        onChange={(e) => setJornada(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 px-3 text-xs font-medium text-slate-700 outline-none focus:border-[#486DAA]"
                    >
                        <option value={8}>8 Horas (Matutino / Vespertino)</option>
                        <option value={6.5}>6.5 Horas (Nocturno)</option>
                        <option value={12}>12 Horas (Jornada Acumulada)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-[#486DAA] mb-1 pl-2">
                        Horas Extras
                    </label>
                    <input 
                        type="number"
                        value={horas}
                        onChange={(e) => setHoras(e.target.value)}
                        placeholder="Ej. 5"
                        className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 px-3 text-xs font-medium text-slate-700 outline-none focus:border-[#486DAA]"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-2 pl-2">
                <input 
                    type="checkbox" 
                    id="infecto" 
                    checked={infecto} 
                    onChange={(e) => setInfecto(e.target.checked)} 
                    className="w-4 h-4 text-[#486DAA] rounded focus:ring-0 cursor-pointer"
                />
                <label htmlFor="infecto" className="text-xs font-bold text-slate-700 cursor-pointer">
                    Aplica concepto 021 (Infectocontagiosidad +20%)
                </label>
            </div>

            <button 
                type="button"
                onClick={calcular}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-full shadow-md shadow-orange-500/30 hover:scale-[1.01] transition duration-200 text-xs flex items-center justify-center space-x-2 border-0 cursor-pointer"
            >
                <FaCalculator />
                <span>Calcular Pago de Horas Extras</span>
            </button>

            {resultado && (
                <div className={`grid gap-3 pt-2 ${resultado.con20 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">
                            Pago Ordinario de Horas Extras
                        </span>
                        <span className="text-xl font-black text-slate-800 block">
                            {formatter.format(resultado.normal)}
                        </span>
                    </div>

                    {resultado.con20 && (
                        <div className="p-4 bg-orange-50 rounded-2xl border border-orange-200 text-center">
                            <span className="text-[10px] font-extrabold text-orange-700 uppercase block mb-1">
                                Con Infectocontagiosidad (+20%)
                            </span>
                            <span className="text-xl font-black text-orange-600 block">
                                {formatter.format(resultado.con20)}
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default HorasExtras;