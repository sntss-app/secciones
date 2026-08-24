import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { FaShieldAlt, FaCheckCircle, FaCopy, FaKey, FaArrowLeft } from 'react-icons/fa';
import { apiUrl } from '../config';
import { storeUserSession } from '../utils/roles';

const Verificar2FA = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState('configurar');
    const [codigo, setCodigo] = useState('');
    const [loading, setLoading] = useState(false);
    const [qrUrl, setQrUrl] = useState('');
    const [secret, setSecret] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const cargarConfiguracion = useCallback(async () => {
        setLoading(true);
        try {
            const matricula = sessionStorage.getItem('matricula') || sessionStorage.getItem('temp_matricula');
            const response = await fetch(apiUrl(`/mail-configurar_2fa.php?matricula=${matricula}`), {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            
            if (data.success) {
                setQrUrl(data.qrUrl);
                setSecret(data.secret);
                setStep('configurar');
            } else {
                setErrorMsg(data.message || 'Error al configurar 2FA');
            }
        } catch (error) {
            setErrorMsg('Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const loadTimer = setTimeout(cargarConfiguracion, 0);
        return () => clearTimeout(loadTimer);
    }, [cargarConfiguracion]);

    const handleVerificar = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        const matricula = sessionStorage.getItem('matricula') || sessionStorage.getItem('temp_matricula') || localStorage.getItem('matricula');

        try {
            const response = await fetch(apiUrl('/mail-verificar_2fa.php'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matricula, codigo })
            });
            const data = await response.json();

            if (data.success) {
                const tempUsuario = {
                    matricula: sessionStorage.getItem('matricula'),
                    nombre: sessionStorage.getItem('nombre'),
                    correo: sessionStorage.getItem('correo'),
                    idRol: sessionStorage.getItem('idRol'),
                    roleName: sessionStorage.getItem('roleName'),
                    roles: JSON.parse(sessionStorage.getItem('roles') || '[]'),
                    roleNames: JSON.parse(sessionStorage.getItem('roleNames') || '[]')
                };
                
                if (tempUsuario.matricula) {
                    storeUserSession(localStorage, tempUsuario);
                    sessionStorage.clear();
                }
                
                setSuccessMsg('Verificación exitosa. Redirigiendo...');
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1500);
            } else {
                setErrorMsg(data.message || 'Código incorrecto');
            }
        } catch {
            setErrorMsg('Error al verificar el código');
        } finally {
            setLoading(false);
        }
    };

    const copiarSecret = () => {
        navigator.clipboard.writeText(secret);
        alert('Código copiado al portapapeles');
    };

    return (
        <div className="relative min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-10">
            <div className="relative z-10 w-full max-w-md bg-white rounded-[2.5rem] p-8 sm:p-10 ui-shadow border border-white text-center">
                
                <div className="w-16 h-16 bg-[#486DAA] rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg shadow-[#486DAA]/30">
                    <FaShieldAlt />
                </div>
                
                <span className="inline-block bg-[#486DAA]/10 text-[#486DAA] text-[10px] font-extrabold px-3 py-1 rounded-full mb-2 border border-[#486DAA]/20">
                    Seguridad Sindical
                </span>
                
                <h2 className="text-2xl font-black text-[#486DAA] tracking-tight m-0">
                    Verificación en Dos Pasos (2FA)
                </h2>
                
                <p className="text-xs text-slate-500 mt-1 mb-6 font-medium">
                    Escanea el código QR con Google Authenticator o Authy
                </p>

                {errorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-600 mb-4">
                        {errorMsg}
                    </div>
                )}

                {successMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-600 mb-4 flex items-center justify-center space-x-2">
                        <FaCheckCircle />
                        <span>{successMsg}</span>
                    </div>
                )}

                {qrUrl && (
                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200 inline-block mb-4">
                        <QRCodeSVG value={qrUrl} size={180} className="mx-auto" />
                    </div>
                )}

                {secret && (
                    <div className="mb-5 text-left">
                        <label className="block text-[11px] font-bold text-slate-500 mb-1 pl-2">
                            O ingresa esta clave manual:
                        </label>
                        <div className="flex items-center space-x-2">
                            <input 
                                type="text" 
                                value={secret} 
                                readOnly 
                                className="w-full bg-slate-100 border border-slate-200 rounded-full py-2 px-4 text-xs font-mono text-slate-700 outline-none"
                            />
                            <button 
                                type="button" 
                                onClick={copiarSecret}
                                className="bg-slate-200 hover:bg-slate-300 text-slate-700 p-2.5 rounded-full border-0 cursor-pointer"
                                title="Copiar código"
                            >
                                <FaCopy className="text-xs" />
                            </button>
                        </div>
                    </div>
                )}

                <form onSubmit={handleVerificar} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-[#486DAA] mb-1.5 pl-2 text-left">
                            Código de 6 dígitos
                        </label>
                        <div className="relative flex items-center">
                            <span className="absolute left-4 text-slate-400 text-sm"><FaKey /></span>
                            <input 
                                type="text"
                                value={codigo}
                                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="000000"
                                maxLength={6}
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-full py-3 pl-11 pr-4 text-center tracking-widest font-mono text-base font-bold text-slate-700 outline-none focus:border-[#486DAA]"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading || codigo.length < 6}
                        className="w-full bg-gradient-to-r from-[#486DAA] to-[#355386] hover:from-[#3b598d] hover:to-[#2e4771] text-white font-bold py-3.5 px-6 rounded-full shadow-lg shadow-[#486DAA]/30 hover:scale-[1.02] transition duration-200 text-xs sm:text-sm border-0 cursor-pointer"
                    >
                        {loading ? 'Verificando...' : 'Verificar y Entrar'}
                    </button>
                </form>

                <div className="mt-6 pt-4 border-t border-slate-100">
                    <Link to="/login" className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#486DAA] hover:underline text-decoration-none">
                        <FaArrowLeft />
                        <span>Volver al inicio de sesión</span>
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default Verificar2FA;
