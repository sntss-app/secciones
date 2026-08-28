import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { FaShieldAlt, FaCheckCircle, FaCopy, FaKey } from 'react-icons/fa';
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
            console.log('Matrícula para configurar 2FA:', matricula);
            
            const response = await fetch(apiUrl(`/mail-configurar_2fa.php?matricula=${matricula}`), {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            console.log('Respuesta configurar 2FA:', data);
            
            if (data.success) {
                setQrUrl(data.qrUrl);
                setSecret(data.secret);
                setStep('configurar');
            } else {
                setErrorMsg(data.message || 'Error al configurar 2FA');
            }
        } catch (error) {
            console.error('Error:', error);
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
                    sessionStorage.removeItem('matricula');
                    sessionStorage.removeItem('nombre');
                    sessionStorage.removeItem('correo');
                    sessionStorage.removeItem('idRol');
                    sessionStorage.removeItem('roleName');
                    sessionStorage.removeItem('roles');
                    sessionStorage.removeItem('roleNames');
                    sessionStorage.removeItem('temp_matricula');
                    sessionStorage.removeItem('temp_nombre');
                    sessionStorage.removeItem('temp_correo');
                }
                
                setSuccessMsg('Verificación exitosa. Redirigiendo...');
                setTimeout(() => {
                    navigate('/dashboard');
                }, 2000);
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
        alert('Secret copiado al portapapeles');
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border" style={{ color: '#3EAEF4' }} role="status"></div>
                <p className="mt-3">Cargando...</p>
            </div>
        );
    }

    return (
        <div className="container py-5" style={{ maxWidth: '600px' }}>
            <div className="card ui-shadow" style={{ borderRadius: '2.2rem', overflow: 'hidden', border: '1px solid rgba(241, 245, 249, 0.9)' }}>
                <div className="card-header bg-white text-center py-4 border-0 position-relative">
                    {/* <span style={{ display: 'inline-block', background: 'rgba(16, 185, 129, 0.12)', color: '#065F46', fontSize: '0.7rem', fontWeight: 800, padding: '0.25rem 0.8rem', borderRadius: '9999px', marginBottom: '0.5rem' }}>
                        Seguridad de Doble Factor
                    </span> */}
                    <h3 style={{ color: '#486DAA', fontWeight: 900, margin: 0 }}>
                        <FaShieldAlt className="me-2" /> Verificación 2FA
                    </h3>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '0.35rem 0 0 0', fontWeight: 600 }}>
                        Protege tu cuenta con autenticación segura
                    </p>
                </div>
                <div className="card-body p-4 pt-2">
                    {errorMsg && (
                        <div className="alert alert-danger" style={{ borderRadius: '1rem', fontWeight: 600 }}>{errorMsg}</div>
                    )}
                    {successMsg && (
                        <div className="alert alert-success d-flex align-items-center" style={{ borderRadius: '1rem', fontWeight: 600 }}>
                            <FaCheckCircle className="me-2" /> {successMsg}
                        </div>
                    )}

                    {step === 'configurar' && (
                        <>
                            <p style={{ color: '#334155', fontWeight: 600, fontSize: '0.9rem' }}>
                                Escanea el código QR con <strong>Google Authenticator</strong> o <strong>Authy</strong>:
                            </p>
                            <div className="text-center my-4 p-3 bg-light rounded-4">
                                {qrUrl && (
                                    <QRCodeSVG value={qrUrl} size={180} className="mx-auto" />
                                )}
                            </div>
                            <p className="text-muted small mb-2">O ingresa este código manualmente:</p>
                            <div className="input-group mb-4">
                                <input type="text" className="form-control font-monospace text-center fw-bold" value={secret} readOnly style={{ borderRadius: '12px 0 0 12px', background: '#f8fafc' }} />
                                <button className="btn btn-outline-secondary fw-bold" onClick={copiarSecret} style={{ borderRadius: '0 12px 12px 0' }}>
                                    <FaCopy /> Copiar
                                </button>
                            </div>
                            <button 
                                className="btn w-100 py-2 fw-bold text-white" 
                                style={{ background: 'linear-gradient(135deg, #486DAA, #3b5998)', borderRadius: '9999px', boxShadow: '0 8px 18px -4px rgba(72, 109, 170, 0.4)' }}
                                onClick={() => setStep('verificar')}
                            >
                                Continuar a Verificación
                            </button>
                        </>
                    )}

                    {step === 'verificar' && (
                        <form onSubmit={handleVerificar}>
                            <p style={{ color: '#334155', fontWeight: 600, fontSize: '0.9rem' }}>
                                Ingresa el código de 6 dígitos de tu app de autenticación:
                            </p>
                            <div className="mb-4">
                                <label className="form-label text-muted small fw-bold">
                                    <FaKey className="me-1" style={{ color: '#486DAA' }} /> Código Temporal
                                </label>
                                <input
                                    type="text"
                                    className="form-control form-control-lg text-center font-monospace fw-bold"
                                    placeholder="000000"
                                    maxLength="6"
                                    value={codigo}
                                    onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                                    style={{ letterSpacing: '8px', fontSize: '1.8rem', borderRadius: '1rem' }}
                                    required
                                />
                            </div>
                            <button 
                                type="submit" 
                                className="btn w-100 py-2 fw-bold text-white" 
                                style={{ background: 'linear-gradient(135deg, #10B981, #059669)', borderRadius: '9999px', boxShadow: '0 8px 18px -4px rgba(16, 185, 129, 0.4)' }}
                                disabled={loading}
                            >
                                {loading ? 'Verificando...' : 'Verificar y Activar'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Verificar2FA;
