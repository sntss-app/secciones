import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    FaCar, FaFilePdf, FaUser, FaCalculator, FaCheckCircle, 
    FaExclamationTriangle, FaArrowLeft, FaInfoCircle, FaSync, 
    FaTimesCircle, FaClock, FaIdCard, FaBuilding, FaUserAlt,
    FaDownload, FaUpload
} from 'react-icons/fa';
import { apiUrl } from '../config';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const AutoCredito = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [usuario, setUsuario] = useState(null);
    const [registroExistente, setRegistroExistente] = useState(null);
    const [c02, setC02] = useState('');
    const [c11, setC11] = useState('');
    const [montoMaximo, setMontoMaximo] = useState(0);
    const [montoCalculado, setMontoCalculado] = useState(false);

    // Archivos
    const [tarjetonFile, setTarjetonFile] = useState(null);
    const [ineFrenteFile, setIneFrenteFile] = useState(null);
    const [ineReversoFile, setIneReversoFile] = useState(null);
    const [comprobanteFile, setComprobanteFile] = useState(null);

    const matricula = localStorage.getItem('matricula');

    const cargarDatos = useCallback(async () => {
        setLoading(true);
        try {
            // 1. Cargar perfil
            const resPerfil = await fetch(apiUrl(`/obtener_perfil.php?matricula=${matricula}`));
            const dataPerfil = await resPerfil.json();
            if (dataPerfil.success) {
                setUsuario(dataPerfil.usuario);
            }

            // 2. Cargar registro de auto si existe
            const resAuto = await fetch(apiUrl(`/obtener_auto.php?matricula=${matricula}`));
            const dataAuto = await resAuto.json();
            if (dataAuto.success && dataAuto.registro) {
                setRegistroExistente(dataAuto.registro);
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    }, [matricula]);

    useEffect(() => {
        if (!matricula) {
            navigate('/login');
            return;
        }
        cargarDatos();
    }, [matricula, navigate, cargarDatos]);

    const calcularMonto = () => {
        const c02Num = parseFloat(c02);
        const c11Num = parseFloat(c11);
        if (isNaN(c02Num) || isNaN(c11Num) || c02Num <= 0 || c11Num <= 0) {
            Swal.fire({
                title: '⚠️ Montos inválidos',
                text: 'Ingresa montos numéricos válidos mayores a cero para los conceptos 002 y 011.',
                icon: 'warning',
                confirmButtonColor: '#486DAA',
            });
            return;
        }
        const suma = c02Num + c11Num;
        const mensual = suma * 2;
        const integrado = mensual * 1.20;
        const total = integrado * 24;
        setMontoMaximo(total);
        setMontoCalculado(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!montoCalculado || montoMaximo <= 0) {
            Swal.fire({
                title: '⚠️ Calcula el monto',
                text: 'Por favor haz clic en "Calcular Monto Máximo" antes de enviar tu solicitud.',
                icon: 'warning',
                confirmButtonColor: '#486DAA',
            });
            return;
        }

        if (!tarjetonFile || !ineFrenteFile || !ineReversoFile || !comprobanteFile) {
            Swal.fire({
                title: '⚠️ Documentación incompleta',
                text: 'Debes adjuntar los 4 documentos solicitados en formato PDF.',
                icon: 'warning',
                confirmButtonColor: '#486DAA',
            });
            return;
        }

        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('matricula', matricula);
            formData.append('c02', c02);
            formData.append('c11', c11);
            formData.append('monto_maximo', montoMaximo);
            formData.append('idSeccion', usuario?.idSeccion || 1);
            formData.append('tarjeton', tarjetonFile);
            formData.append('ine_frente', ineFrenteFile);
            formData.append('ine_reverso', ineReversoFile);
            formData.append('comprobante', comprobanteFile);

            const response = await fetch(apiUrl('/registro_auto.php'), {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.success) {
                await Swal.fire({
                    title: '🎉 ¡Solicitud Registrada!',
                    text: 'Tu preregistro al crédito automotriz ha sido enviado a validación.',
                    icon: 'success',
                    confirmButtonColor: '#10B981',
                });
                cargarDatos();
            } else {
                throw new Error(data.message || 'Error al enviar la solicitud.');
            }
        } catch (error) {
            Swal.fire({
                title: '❌ Error',
                text: error.message,
                icon: 'error',
                confirmButtonColor: '#dc3545',
            });
        } finally {
            setSaving(false);
        }
    };

    const formatearMoneda = (cantidad) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(cantidad);
    };

    const statusBadge = (status) => {
        if (status === 'aprobado' || status === 1) {
            return <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold">✅ Aprobado</span>;
        }
        if (status === 'rechazado' || status === 2) {
            return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold">❌ Rechazado</span>;
        }
        return <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold">⏳ En Revisión</span>;
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
            
            {/* Header AutoCredito */}
            <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 ui-shadow border border-white mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <Link to="/dashboard" className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-[#486DAA] hover:text-white flex items-center justify-center transition text-decoration-none">
                        <FaArrowLeft />
                    </Link>
                    <div>
                        <span className="inline-block bg-[#486DAA]/10 text-[#486DAA] text-[10px] font-extrabold px-3 py-0.5 rounded-full mb-1 border border-[#486DAA]/20">
                            Prestaciones Sindicales
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black text-[#486DAA] tracking-tight m-0">
                            Preregistro Crédito Automotriz
                        </h2>
                    </div>
                </div>

                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white text-xl shadow-lg shadow-orange-500/30">
                    <FaCar />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-16 text-slate-400 font-medium text-xs">
                    Cargando expediente...
                </div>
            ) : registroExistente ? (
                /* Vista si ya tiene solicitud */
                <div className="bg-white rounded-[2.5rem] p-8 ui-shadow border border-white space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div>
                            <h3 className="text-lg font-black text-[#486DAA] m-0">Estado de tu Solicitud</h3>
                            <p className="text-xs text-slate-500 m-0">Folio: #{registroExistente.id || 'N/A'}</p>
                        </div>
                        <div>
                            {statusBadge(registroExistente.status)}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 text-xs">
                        <div>
                            <span className="font-bold text-slate-500 block">Concepto 002:</span>
                            <span className="font-bold text-slate-800 text-sm">{formatearMoneda(registroExistente.c02 || 0)}</span>
                        </div>
                        <div>
                            <span className="font-bold text-slate-500 block">Concepto 011:</span>
                            <span className="font-bold text-slate-800 text-sm">{formatearMoneda(registroExistente.c11 || 0)}</span>
                        </div>
                        <div>
                            <span className="font-bold text-slate-500 block">Monto Solicitado:</span>
                            <span className="font-bold text-[#486DAA] text-sm">{formatearMoneda(registroExistente.monto_maximo || 0)}</span>
                        </div>
                    </div>

                    {registroExistente.observaciones && (
                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-xs text-blue-900">
                            <strong>Observaciones del validador:</strong> {registroExistente.observaciones}
                        </div>
                    )}
                </div>
            ) : (
                /* Formulario de nueva solicitud */
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Tarjeta de Datos del Agremiado */}
                    <div className="bg-white rounded-[2.5rem] p-7 ui-shadow border border-white">
                        <h3 className="text-base font-black text-[#486DAA] mb-4 pb-2 border-b border-slate-100 flex items-center space-x-2">
                            <FaUser />
                            <span>Datos del Solicitante</span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-slate-600">
                            <div><span className="font-bold block text-slate-400">Nombre:</span> {usuario?.nombre}</div>
                            <div><span className="font-bold block text-slate-400">Matrícula:</span> {usuario?.matricula}</div>
                            <div><span className="font-bold block text-slate-400">Adscripción:</span> {usuario?.adscripcion || 'N/A'}</div>
                            <div><span className="font-bold block text-slate-400">Categoría:</span> {usuario?.categoria || 'N/A'}</div>
                        </div>
                    </div>

                    {/* Tarjeta de Cálculo de Capacidad */}
                    <div className="bg-white rounded-[2.5rem] p-7 ui-shadow border border-white">
                        <h3 className="text-base font-black text-[#486DAA] mb-4 pb-2 border-b border-slate-100 flex items-center space-x-2">
                            <FaCalculator />
                            <span>Cálculo de Capacidad Financiera</span>
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-full py-2.5 px-4 text-xs text-slate-700 outline-none focus:border-[#486DAA]"
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
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-full py-2.5 px-4 text-xs text-slate-700 outline-none focus:border-[#486DAA]"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                            <button 
                                type="button"
                                onClick={calcularMonto}
                                className="bg-[#486DAA] hover:bg-[#355386] text-white font-bold px-6 py-2.5 rounded-full text-xs transition duration-200 border-0 cursor-pointer shadow-md"
                            >
                                Calcular Monto Máximo
                            </button>

                            {montoCalculado && (
                                <div className="text-right">
                                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Monto Estimado:</span>
                                    <span className="text-lg font-black text-emerald-600">{formatearMoneda(montoMaximo)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tarjeta de Documentación PDF */}
                    <div className="bg-white rounded-[2.5rem] p-7 ui-shadow border border-white">
                        <h3 className="text-base font-black text-[#486DAA] mb-4 pb-2 border-b border-slate-100 flex items-center space-x-2">
                            <FaFilePdf className="text-red-500" />
                            <span>Documentación en PDF (Máx. 5MB c/u)</span>
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">1. Último Tarjetón de Pago</label>
                                <input type="file" accept=".pdf" onChange={(e) => setTarjetonFile(e.target.files[0])} required className="w-full text-xs text-slate-500" />
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">2. INE Frontal</label>
                                <input type="file" accept=".pdf" onChange={(e) => setIneFrenteFile(e.target.files[0])} required className="w-full text-xs text-slate-500" />
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">3. INE Reverso</label>
                                <input type="file" accept=".pdf" onChange={(e) => setIneReversoFile(e.target.files[0])} required className="w-full text-xs text-slate-500" />
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">4. Comprobante de Domicilio</label>
                                <input type="file" accept=".pdf" onChange={(e) => setComprobanteFile(e.target.files[0])} required className="w-full text-xs text-slate-500" />
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={saving}
                        className="w-full bg-gradient-to-r from-[#486DAA] to-[#355386] hover:from-[#3b598d] hover:to-[#2e4771] text-white font-bold py-3.5 px-6 rounded-full shadow-lg shadow-[#486DAA]/30 hover:scale-[1.01] transition duration-200 text-xs sm:text-sm flex items-center justify-center space-x-2 border-0 cursor-pointer"
                    >
                        <FaUpload />
                        <span>{saving ? 'Enviando trámite...' : 'Enviar Solicitud de Crédito Automotriz'}</span>
                    </button>

                </form>
            )}

        </div>
    );
};

export default AutoCredito;