import { useState, useRef, useEffect } from 'react';
import { FaUsers, FaHeart } from 'react-icons/fa';
import { apiUrl } from '../config';

const DetallesUsuarios = ({ 
    noticiaId, 
    tipo,
    children, 
    total 
}) => {
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [mostrarTooltip, setMostrarTooltip] = useState(false);
    const [cargado, setCargado] = useState(false);
    const timeoutRef = useRef(null);
    const tooltipRef = useRef(null);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

    const cargarUsuarios = async () => {
    console.log('🔄 INICIANDO cargarUsuarios');
    console.log('📌 noticiaId:', noticiaId);
    console.log('📌 tipo:', tipo);
    
    if (cargado || cargando) {
        console.log('⚠️ Ya cargado o cargando, saltando...');
        return;
    }
    
    setCargando(true);
        try {
            const endpoint = tipo === 'vistas' 
                ? `/obtener_usuarios_vistas.php?noticia_id=${noticiaId}`
                : `/obtener_usuarios_likes.php?noticia_id=${noticiaId}`;
            
            console.log('🔍 Consultando endpoint:', endpoint);
            
            const response = await fetch(apiUrl(endpoint));
            const data = await response.json();
            
            console.log('📦 Datos completos:', JSON.stringify(data, null, 2));
            console.log('📦 data.success:', data.success);
            console.log('📦 data.usuarios:', data.usuarios);
            console.log('📦 data.total:', data.total);
            console.log('📦 Tipo de data.usuarios:', typeof data.usuarios);
            console.log('📦 ¿Es array?', Array.isArray(data.usuarios));
            console.log('📦 Longitud:', data.usuarios?.length);
            
            if (data.success) {
                console.log('✅ Usuarios encontrados:', data.usuarios);
                setUsuarios(data.usuarios);
                setCargado(true);
            } else {
                console.warn('⚠️ No se pudieron cargar usuarios:', data.message);
            }
        } catch (error) {
            console.error('❌ Error cargando usuarios:', error);
        } finally {
            setCargando(false);
            console.log('🏁 FIN cargarUsuarios');
        }
    };

    const handleMouseEnter = (e) => {
        clearTimeout(timeoutRef.current);
        
        // Calcular posición del tooltip
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipPosition({
            top: rect.top - 10,  // Arriba del elemento
            left: rect.left + rect.width / 2,  // Centrado
        });
        
        setMostrarTooltip(true);
        cargarUsuarios();
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setMostrarTooltip(false);
        }, 300);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
                setMostrarTooltip(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const icono = tipo === 'vistas' ? <FaUsers /> : <FaHeart style={{ color: '#1877f2' }} />;
    const titulo = tipo === 'vistas' ? '👁️ Usuarios que vieron' : '❤️ Usuarios que dieron like';

    return (
        <div 
            ref={tooltipRef}
            style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            
            {mostrarTooltip && (
                <div style={{
                    position: 'fixed',
                    top: `${tooltipPosition.top - 200}px`,
                    left: `${tooltipPosition.left}px`,
                    transform: 'translateX(-50%)',
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(241, 245, 249, 0.9)',
                    borderRadius: '16px',
                    padding: '8px 0',
                    minWidth: '240px',
                    maxWidth: '300px',
                    maxHeight: '260px',
                    overflowY: 'auto',
                    boxShadow: '0 16px 36px -4px rgba(72, 109, 170, 0.18)',
                    zIndex: 99999,
                    fontSize: '0.85rem',
                    pointerEvents: 'auto',
                }}>
                    {/* Flecha */}
                    <div style={{
                        position: 'absolute',
                        bottom: '-8px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '0',
                        height: '0',
                        borderLeft: '8px solid transparent',
                        borderRight: '8px solid transparent',
                        borderTop: '8px solid #ffffff',
                        filter: 'drop-shadow(0 2px 2px rgba(72, 109, 170, 0.1))',
                    }} />
                    
                    <div style={{
                        padding: '4px 14px 8px 14px',
                        borderBottom: '1px solid #F1F5F9',
                        fontWeight: '800',
                        color: '#1E293B',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.82rem',
                    }}>
                        {icono}
                        {titulo}
                        <span style={{ 
                            backgroundColor: 'rgba(72, 109, 170, 0.1)', 
                            padding: '2px 8px', 
                            borderRadius: '9999px',
                            fontSize: '0.7rem',
                            fontWeight: '800',
                            color: '#486DAA',
                            marginLeft: 'auto'
                        }}>
                            {total}
                        </span>
                    </div>

                    {cargando ? (
                        <div style={{ padding: '16px', textAlign: 'center', color: '#64748B' }}>
                            <div className="spinner-border spinner-border-sm" style={{ color: '#486DAA' }} role="status" />
                        </div>
                    ) : usuarios.length === 0 ? (
                        <div style={{ padding: '16px', textAlign: 'center', color: '#94A3B8', fontSize: '0.8rem', fontWeight: '500' }}>
                            No hay usuarios registrados
                        </div>
                    ) : (
                        <div>
                            {usuarios.map((usuario, idx) => (
                                <div key={idx} style={{
                                    padding: '8px 14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    borderBottom: idx < usuarios.length - 1 ? '1px solid #F8FAFC' : 'none',
                                    transition: 'background 0.2s ease',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <span style={{
                                        display: 'inline-block',
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #486DAA, #3b5998)',
                                        color: 'white',
                                        textAlign: 'center',
                                        lineHeight: '32px',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold',
                                        flexShrink: 0,
                                    }}>
                                        {usuario.nombre?.charAt(0).toUpperCase() || 'U'}
                                    </span>
                                    <span style={{ flex: 1, color: '#1E293B', fontWeight: '600', fontSize: '0.82rem' }}>
                                        {usuario.nombre?.replace(/\//g, ' ') || usuario.matricula}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DetallesUsuarios;