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
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow">
                        <div className="card-header bg-dark text-white text-center">
                            <h4><FaShieldAlt className="me-2" />Verificación en dos pasos</h4>
                        </div>
                        <div className="card-body">
                            {errorMsg && (
                                <div className="alert alert-danger">{errorMsg}</div>
                            )}
                            {successMsg && (
                                <div className="alert alert-success d-flex align-items-center">
                                    <FaCheckCircle className="me-2" /> {successMsg}
                                </div>
                            )}

                            {step === 'configurar' && (
                                <>
                                    <p>Escanea el código QR con <strong>Google Authenticator</strong> o <strong>Authy</strong>:</p>
                                    <div className="text-center my-4">
                                        {qrUrl && (
                                            <QRCodeSVG value={qrUrl} size={200} className="mx-auto" />
                                        )}
                                    </div>
                                    <p className="text-muted small">O ingresa este código manualmente:</p>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control font-monospace bg-dark text-white" value={secret} readOnly />
                                        <button className="btn btn-outline-secondary" onClick={copiarSecret}>
                                            <FaCopy /> Copiar
                                        </button>
                                    </div>
                                    <button className="btn btn-primary w-100" onClick={() => setStep('verificar')}>
                                        Continuar
                                    </button>
                                </>
                            )}

                            {step === 'verificar' && (
                                <form onSubmit={handleVerificar}>
                                    <p>Ingresa el código de 6 dígitos de tu app de autenticación:</p>
                                    <div className="mb-3">
                                        <label className="form-label">
                                            <FaKey className="me-1" /> Código
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control form-control-lg text-center font-monospace"
                                            placeholder="000000"
                                            maxLength="6"
                                            value={codigo}
                                            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-success w-100" disabled={loading}>
                                        {loading ? 'Verificando...' : 'Verificar y activar'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Verificar2FA;
