import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUserAlt, FaEnvelope, FaPaperPlane, FaCheckCircle, FaExclamationTriangle, FaArrowLeft, FaKey } from 'react-icons/fa';
import { apiUrl } from '../config';

const RecuperarContraseña = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    
    const [formData, setFormData] = useState({
        matricula: '',
        correo: ''
    });

    const validarMatricula = (matricula) => /^\d{8,9}$/.test(matricula);
    const validarCorreo = (correo) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setLoading(true);

        const matricula = formData.matricula.trim();
        const correo = formData.correo.trim().toLowerCase();

        if (!validarMatricula(matricula)) {
            setErrorMsg('La matrícula debe tener entre 8 y 9 dígitos numéricos.');
            setLoading(false);
            return;
        }

        if (!validarCorreo(correo)) {
            setErrorMsg('Ingresa un correo electrónico válido.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(apiUrl('/recuperar_contraseña.php'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matricula, correo })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Error al procesar la solicitud.');
            }

            setSuccessMsg(data.message || 'Se ha enviado un correo con tu contraseña temporal.');
            setFormData({ matricula: '', correo: '' });
            
            setTimeout(() => {
                navigate('/login');
            }, 4000);
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-10">
            <div className="relative z-10 w-full max-w-md bg-white rounded-[2.5rem] p-8 sm:p-10 ui-shadow border border-white text-center">
                
                <div className="w-16 h-16 bg-[#486DAA] rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg shadow-[#486DAA]/30">
                    <FaKey />
                </div>
                
                <span className="inline-block bg-[#486DAA]/10 text-[#486DAA] text-[10px] font-extrabold px-3 py-1 rounded-full mb-2 border border-[#486DAA]/20">
                    Restablecer Credenciales
                </span>
                
                <h2 className="text-2xl font-black text-[#486DAA] tracking-tight m-0">
                    Recuperar Contraseña
                </h2>
                
                <p className="text-xs text-slate-500 mt-1 mb-6 font-medium">
                    Ingresa tu matrícula y correo registrado para enviarte una clave temporal
                </p>

                {errorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-600 mb-4 text-center">
                        {errorMsg}
                    </div>
                )}

                {successMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-700 mb-4 flex items-center justify-center space-x-2 text-center">
                        <FaCheckCircle className="flex-shrink-0" />
                        <span>{successMsg}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                    <div>
                        <label className="block text-xs font-bold text-[#486DAA] mb-1.5 pl-2">
                            Matrícula Institucional
                        </label>
                        <div className="relative flex items-center">
                            <span className="absolute left-4 text-slate-400 text-sm"><FaUserAlt /></span>
                            <input 
                                type="text"
                                value={formData.matricula}
                                onChange={(e) => setFormData({ ...formData, matricula: e.target.value.replace(/\D/g, '').slice(0, 9) })}
                                placeholder="Ej. 97158643"
                                maxLength={9}
                                required
                                disabled={loading}
                                className="w-full bg-slate-50 border border-slate-200 rounded-full py-3 pl-11 pr-4 text-xs font-medium text-slate-700 outline-none focus:border-[#486DAA]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[#486DAA] mb-1.5 pl-2">
                            Correo Electrónico Registrado
                        </label>
                        <div className="relative flex items-center">
                            <span className="absolute left-4 text-slate-400 text-sm"><FaEnvelope /></span>
                            <input 
                                type="email"
                                value={formData.correo}
                                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                                placeholder="tu_correo@dominio.com"
                                required
                                disabled={loading}
                                className="w-full bg-slate-50 border border-slate-200 rounded-full py-3 pl-11 pr-4 text-xs font-medium text-slate-700 outline-none focus:border-[#486DAA]"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-[#486DAA] to-[#355386] hover:from-[#3b598d] hover:to-[#2e4771] text-white font-bold py-3.5 px-6 rounded-full shadow-lg shadow-[#486DAA]/30 hover:scale-[1.02] transition duration-200 text-xs sm:text-sm flex items-center justify-center space-x-2 border-0 cursor-pointer mt-4"
                    >
                        <FaPaperPlane />
                        <span>{loading ? 'Enviando correo...' : 'Enviar Instrucciones'}</span>
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100">
                    <Link to="/login" className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#486DAA] hover:underline text-decoration-none">
                        <FaArrowLeft />
                        <span>Regresar a Iniciar Sesión</span>
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default RecuperarContraseña;