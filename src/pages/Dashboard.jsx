import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaCar, FaNewspaper, FaInfoCircle, FaCalculator, FaSignInAlt, 
    FaGift, FaShieldAlt, FaChartLine, FaCheckCircle, FaUser,
    FaThumbtack, FaEye, FaCalendarAlt, FaTools, FaStar, FaRocket,
    FaBuilding, FaHouseUser, FaPiggyBank, FaFileContract, FaClock,
    FaUmbrellaBeach, FaClipboardList, FaFilePdf, FaExternalLinkAlt, FaFileAlt,
    FaQrcode, FaChartPie, FaArrowRight,
    FaCity
} from 'react-icons/fa';
import { apiUrl } from '../config';
import { Modal } from 'react-bootstrap';
import { getStoredRoleIds } from '../utils/roles';
import { getSectionAssets } from '../utils/sectionAssets';

// ===== IMPORTAR COMPONENTES DE CALCULADORAS =====
import CreditoHipotecario from '../components/calculadoras/CreditoHipotecario';
import CreditoMedianoPlazo from '../components/calculadoras/CreditoMedianoPlazo';
import PrestamoAuto from '../components/calculadoras/PrestamoAuto';
import FondoAhorro from '../components/calculadoras/FondoAhorro';
import Aguinaldo from '../components/calculadoras/Aguinaldo';
import Clausula97 from '../components/calculadoras/Clausula97';
import HorasExtras from '../components/calculadoras/HorasExtras';

const Dashboard = () => {
    // ===== ESTADOS =====
    const [isLoggedIn] = useState(() => Boolean(localStorage.getItem('matricula')));
    const [userName] = useState(() => localStorage.getItem('nombre') || localStorage.getItem('matricula') || '');
    
    // Obtener sección del usuario desde localStorage
    const [seccionUsuario, setSeccionUsuario] = useState(() => {
        try {
            const seccionData = localStorage.getItem('seccionUsuario');
            if (seccionData) {
                return JSON.parse(seccionData);
            }
            return null;
        } catch {
            return null;
        }
    });
    
    const [noticias, setNoticias] = useState([]);
    const [loadingNoticias, setLoadingNoticias] = useState(true);
    const [tabActiva, setTabActiva] = useState('calculadoras'); // 'calculadoras', 'proceso', 'cen'
    
    const [hasAutoValidatorRole, setHasAutoValidatorRole] = useState(() => {
        const roleIds = getStoredRoleIds();
        return roleIds.includes(1);
    });
    const [hasNewsValidatorRole, setHasNewsValidatorRole] = useState(() => {
        const roleIds = getStoredRoleIds();
        return roleIds.includes(2);
    });
    const [hasClausula79BisValidatorRole, setHasClausula79BisValidatorRole] = useState(() => {
        const roleIds = getStoredRoleIds();
        return roleIds.includes(3);
    });
    
    const [showModal, setShowModal] = useState(false);
    const [calculadoraActiva, setCalculadoraActiva] = useState(null);

    // ===== EFECTOS =====
    useEffect(() => {
        const matricula = localStorage.getItem('matricula');
        if (!matricula) return;

        const cargarRolesPerfil = async () => {
            try {
                const response = await fetch(apiUrl(`/obtener_perfil.php?matricula=${encodeURIComponent(matricula)}`));
                const data = await response.json();

                if (response.ok && data.success && data.usuario) {
                    const roleIds = data.usuario?.roleIds || [];
                    localStorage.setItem('roleIds', JSON.stringify(roleIds));
                    localStorage.setItem('roleNames', JSON.stringify(data.usuario?.roleNames || []));
                    
                    setHasAutoValidatorRole(roleIds.includes(1));
                    setHasNewsValidatorRole(roleIds.includes(2));
                    setHasClausula79BisValidatorRole(roleIds.includes(3));
                    
                    if (data.usuario.idSeccion) {
                        let seccionGuardada = null;
                        try {
                            seccionGuardada = JSON.parse(localStorage.getItem('seccionUsuario'));
                        } catch {
                            seccionGuardada = null;
                        }
                        
                        const assets = getSectionAssets(data.usuario.idSeccion);
                        const seccionData = {
                            id: data.usuario.idSeccion,
                            romano: data.usuario.seccion_romano || seccionGuardada?.romano || 'N/A',
                            nombre: data.usuario.seccion_nombre || seccionGuardada?.nombre || 'Sin sección',
                            slogan: data.usuario.seccion_slogan || seccionGuardada?.slogan || null,
                            direccion: data.usuario.seccion_direccion || seccionGuardada?.direccion || null,
                            color: data.usuario.seccion_color || seccionGuardada?.color || '#486DAA',
                            logo: data.usuario.seccion_logo || assets.logo,
                            banner: data.usuario.seccion_banner || assets.banner,
                            redes: data.usuario.redes_sociales ?? seccionGuardada?.redes ?? seccionGuardada?.redes_sociales ?? {}
                        };
                        localStorage.setItem('seccionUsuario', JSON.stringify(seccionData));
                        setSeccionUsuario(seccionData);
                    }
                }
            } catch (error) {
                console.error('Error cargando roles del perfil:', error);
            }
        };

        cargarRolesPerfil();
    }, []);

    useEffect(() => {
        const cargarNoticias = async () => {
            try {
                const response = await fetch(apiUrl('/listar_noticias.php?includeHidden=0'));
                const data = await response.json();
                if (data.success && data.noticias) {
                    setNoticias(data.noticias.slice(0, 3));
                }
            } catch (error) {
                console.error('Error cargando noticias:', error);
            } finally {
                setLoadingNoticias(false);
            }
        };
        cargarNoticias();
    }, []);

    // ===== CALCULADORAS DISPONIBLES =====
    const calculadoras = [
        { 
            id: 'hipotecario', 
            icon: <FaCity />, 
            titulo: 'Crédito Hipotecario', 
            descripcion: 'Calcula tu crédito para vivienda', 
            theme: 'blue', 
            iconBg: 'bg-[#486DAA]', 
            btnBorder: 'border-[#486DAA]', 
            btnColor: 'text-[#486DAA]', 
            btnHover: 'hover:bg-[#486DAA]' 
        },
        { 
            id: 'mediano-plazo', 
            icon: <FaHouseUser />, 
            titulo: 'Crédito a Mediano Plazo', 
            descripcion: 'Financiamiento para remodelación', 
            theme: 'emerald', 
            iconBg: 'bg-emerald-500', 
            btnBorder: 'border-emerald-500', 
            btnColor: 'text-emerald-500', 
            btnHover: 'hover:bg-emerald-500' 
        },
        { 
            id: 'auto', 
            icon: <FaCar />, 
            titulo: 'Crédito Automotriz', 
            descripcion: 'Calcula tu crédito para auto', 
            theme: 'orange', 
            iconBg: 'bg-orange-500', 
            btnBorder: 'border-orange-500', 
            btnColor: 'text-orange-500', 
            btnHover: 'hover:bg-orange-500' 
        },
        { 
            id: 'clausula97', 
            icon: <FaFileContract />, 
            titulo: 'Crédito Personal (Cl. 97)', 
            descripcion: 'Obtén un crédito para lo que necesites', 
            theme: 'blue', 
            iconBg: 'bg-[#486DAA]', 
            btnBorder: 'border-[#486DAA]', 
            btnColor: 'text-[#486DAA]', 
            btnHover: 'hover:bg-[#486DAA]' 
        },
        { 
            id: 'fondo-ahorro', 
            icon: <FaPiggyBank />, 
            titulo: 'Fondo de Ahorro', 
            descripcion: '2do de Julio - Invierte en tu futuro', 
            theme: 'emerald', 
            iconBg: 'bg-emerald-500', 
            btnBorder: 'border-emerald-500', 
            btnColor: 'text-emerald-500', 
            btnHover: 'hover:bg-emerald-500' 
        },
        { 
            id: 'aguinaldo', 
            icon: <FaGift />, 
            titulo: 'Aguinaldo Contractual', 
            descripcion: 'Calcula el monto de tu aguinaldo anual', 
            theme: 'orange', 
            iconBg: 'bg-orange-500', 
            btnBorder: 'border-orange-500', 
            btnColor: 'text-orange-500', 
            btnHover: 'hover:bg-orange-500' 
        },
        { 
            id: 'horas-extras', 
            icon: <FaClock />, 
            titulo: 'Horas Extras', 
            descripcion: 'Calcula el pago de horas extraordinarias', 
            theme: 'blue', 
            iconBg: 'bg-[#486DAA]', 
            btnBorder: 'border-[#486DAA]', 
            btnColor: 'text-[#486DAA]', 
            btnHover: 'hover:bg-[#486DAA]' 
        },
    ];

    // ===== RECURSOS Y DOCUMENTOS =====
    const recursos = [
        { 
            id: 'tarjeton-activo', 
            icon: <FaFilePdf className="text-red-500" />, 
            titulo: 'Tarjetón Activo', 
            descripcion: 'Descarga tu tarjetón de pago IMSS', 
            link: 'https://rh.imss.gob.mx/Personal/TarjetonDigital/',
            externo: true
        },
        { 
            id: 'tarjeton-jubilado', 
            icon: <FaFilePdf className="text-red-500" />, 
            titulo: 'Tarjetón Jubilado', 
            descripcion: 'Descarga tu tarjetón de jubilado IMSS', 
            link: 'https://rh.imss.gob.mx/Personal/tarjetonjubilados/(S(nhc3ujvy5iov2kxgmtpzwbe4))/default.aspx',
            externo: true
        },
        { 
            id: 'contrato-colectivo', 
            icon: <FaFileAlt className="text-[#486DAA]" />, 
            titulo: 'Contrato Colectivo', 
            descripcion: 'Descarga el CCT completo vigente', 
            link: '/recursos/Cct.pdf',
            externo: true
        },
        { 
            id: 'estatutos', 
            icon: <FaFileAlt className="text-emerald-500" />, 
            titulo: 'Estatutos SNTSS', 
            descripcion: 'Descarga los Estatutos del SNTSS', 
            link: '/recursos/Estatutos.pdf',
            externo: true
        },
        { 
            id: 'conceptos', 
            icon: <FaFileContract className="text-orange-500" />, 
            titulo: 'Conceptos del Tarjetón', 
            descripcion: 'Explicación detallada de percepciones y deducciones', 
            link: '/conceptos',
            externo: false
        },
    ];

    const abrirCalculadora = (tipo) => {
        setCalculadoraActiva(tipo);
        setShowModal(true);
    };

    const cerrarCalculadora = () => {
        setShowModal(false);
        setCalculadoraActiva(null);
    };

    const renderCalculadora = () => {
        switch(calculadoraActiva) {
            case 'hipotecario': return <CreditoHipotecario />;
            case 'mediano-plazo': return <CreditoMedianoPlazo />;
            case 'auto': return <PrestamoAuto />;
            case 'fondo-ahorro': return <FondoAhorro />;
            case 'aguinaldo': return <Aguinaldo />;
            case 'clausula97': return <Clausula97 />;
            case 'horas-extras': return <HorasExtras />;
            default: return null;
        }
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http://') || path.startsWith('https://')) return path;
        if (path.startsWith('/api')) return apiUrl(path.replace('/api', ''));
        return apiUrl(path);
    };

    const bannerImg = seccionUsuario?.banner || '/images/seccionesBanner/bannerD.jpg';

    return (
        <div className="relative min-h-screen">
            
            {/* ================= ONDAS Y FORMAS DECORATIVAS DE FONDO ================= */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
                {/* Onda azul superior derecha */}
                <svg className="absolute -top-10 -right-10 w-[600px] opacity-35 text-[#486DAA]/30" viewBox="0 0 500 500" fill="currentColor">
                    <path d="M150,0 C300,150 400,50 500,200 L500,0 Z"></path>
                </svg>

                {/* Puntos decorativos esparcidos */}
                <div className="absolute top-8 left-6 w-32 h-64 dot-matrix opacity-40"></div>
                <div className="absolute top-[45%] left-2 w-20 h-40 dot-matrix opacity-50"></div>
                <div className="absolute bottom-28 right-4 w-28 h-40 dot-matrix opacity-40"></div>

                {/* Onda verde esmeralda inferior izquierda */}
                <svg className="absolute -bottom-20 -left-20 w-[700px] opacity-25 text-emerald-400" viewBox="0 0 500 500" fill="currentColor">
                    <path d="M0,500 C150,350 300,450 500,300 L500,500 Z"></path>
                </svg>
            </div>

            {/* ================= CONTENEDOR PRINCIPAL ================= */}
            <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-12">

                {/* ================= BANNER TOP (2 CARDS: CTA + IMAGEN SECCIÓN) ================= */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
                    
                    {/* Card Izquierda: Ingresar al Portal / Bienvenida */}
                    <div className="lg:col-span-5 bg-white rounded-[2.5rem] p-7 sm:p-8 flex flex-col justify-between relative overflow-hidden ui-shadow border border-white min-h-[260px] group">
                        {/* Puntos decorativos integrados */}
                        <div className="absolute top-4 right-4 w-24 h-24 dot-matrix opacity-30 pointer-events-none"></div>
                        
                        <div className="relative z-10">
                            <span className="inline-block bg-[#486DAA]/10 text-[#486DAA] text-[10px] font-extrabold px-3 py-1 rounded-full mb-3 border border-[#486DAA]/20">
                                {seccionUsuario?.nombre ? `Sección ${seccionUsuario.romano}` : 'Sección Sindical'}
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-black text-[#486DAA] tracking-tight m-0">
                                {seccionUsuario?.romano ? `SNTSS ${seccionUsuario.romano}` : 'SNTSS'}
                            </h2>
                            <p className="text-slate-600 font-medium text-xs sm:text-sm mt-2 leading-relaxed m-0">
                                {seccionUsuario?.slogan || 'Comité Ejecutivo Seccional al Servicio de los trabajadores'}
                            </p>
                        </div>

                        <div className="mt-6 relative z-10">
                            {!isLoggedIn ? (
                                <Link 
                                    to="/login" 
                                    className="inline-flex items-center space-x-2.5 bg-gradient-to-r from-[#486DAA] to-[#355386] hover:from-[#3b598d] hover:to-[#2e4771] text-white font-bold px-6 py-2.5 rounded-full shadow-lg shadow-[#486DAA]/30 hover:scale-105 transition duration-300 text-xs sm:text-sm text-decoration-none"
                                >
                                    <FaSignInAlt className="text-xs" />
                                    <span>Ingresar al Portal</span>
                                </Link>
                            ) : (
                                <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 font-bold px-4 py-2 rounded-full border border-emerald-200 text-xs">
                                    <FaCheckCircle className="text-emerald-500" />
                                    <span>Sesión activa: {userName}</span>
                                </div>
                            )}
                        </div>

                        {/* Matriz de puntitos decorativa inferior (4 azules + 4 verdes) */}
                        <div className="absolute bottom-4 right-4 grid grid-cols-4 gap-1.5 opacity-40 pointer-events-none">
                            <span className="w-1.5 h-1.5 bg-[#486DAA] rounded-full"></span>
                            <span className="w-1.5 h-1.5 bg-[#486DAA] rounded-full"></span>
                            <span className="w-1.5 h-1.5 bg-[#486DAA] rounded-full"></span>
                            <span className="w-1.5 h-1.5 bg-[#486DAA] rounded-full"></span>
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                        </div>
                    </div>

                    {/* Card Derecha: Imagen Banner Dinámico */}
                    <div className="lg:col-span-7 rounded-[2.5rem] overflow-hidden bg-white relative min-h-[260px] ui-shadow border border-white group">
                        <img 
                            src={bannerImg} 
                            alt="Banner Seccional SNTSS" 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            onError={(e) => {
                                e.target.src = '/images/seccionesBanner/bannerD.jpg';
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/35 via-transparent to-transparent pointer-events-none"></div>
                    </div>

                </section>

                {/* ================= SELECTOR CENTRAL DE PESTAÑAS (Pills Sección 3/5) ================= */}
                <div className="flex justify-center mb-10">
                    <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-full flex flex-wrap justify-center gap-1.5 sm:gap-2 ui-shadow border border-white">
                        <button 
                            onClick={() => setTabActiva('calculadoras')}
                            className={`flex items-center space-x-2 px-6 sm:px-8 py-2.5 rounded-full font-bold text-xs transition duration-200 border-0 cursor-pointer ${
                                tabActiva === 'calculadoras'
                                    ? 'bg-[#486DAA] text-white shadow-md shadow-[#486DAA]/30'
                                    : 'bg-transparent text-slate-600 hover:text-[#486DAA]'
                            }`}
                        >
                            <FaCalculator className="text-xs" />
                            <span>Calculadoras</span>
                        </button>
                        
                        <button 
                            onClick={() => setTabActiva('proceso')}
                            className={`flex items-center space-x-2 px-6 sm:px-8 py-2.5 rounded-full font-bold text-xs transition duration-200 border-0 cursor-pointer ${
                                tabActiva === 'proceso'
                                    ? 'bg-[#486DAA] text-white shadow-md shadow-[#486DAA]/30'
                                    : 'bg-transparent text-slate-600 hover:text-[#486DAA]'
                            }`}
                        >
                            <FaNewspaper className="text-xs" />
                            <span>Proceso y Noticias</span>
                        </button>

                        <button 
                            onClick={() => setTabActiva('cen')}
                            className={`flex items-center space-x-2 px-6 sm:px-8 py-2.5 rounded-full font-bold text-xs transition duration-200 border-0 cursor-pointer ${
                                tabActiva === 'cen'
                                    ? 'bg-[#486DAA] text-white shadow-md shadow-[#486DAA]/30'
                                    : 'bg-transparent text-slate-600 hover:text-[#486DAA]'
                            }`}
                        >
                            <FaBuilding className="text-xs" />
                            <span>Comité Nacional (CEN)</span>
                        </button>
                    </div>
                </div>

                {/* ================= CONTENIDO DE PESTAÑA: CALCULADORAS ================= */}
                {tabActiva === 'calculadoras' && (
                    <div>
                        {/* Encabezado con Icono, Barra Esmeralda y Puntos */}
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="w-9 h-9 rounded-xl bg-[#486DAA] text-white flex items-center justify-center text-sm shadow-md shadow-[#486DAA]/30">
                                <FaCalculator />
                            </div>
                            <h3 className="text-xl font-black text-[#486DAA] m-0">Calculadoras Financieras</h3>
                            <div className="w-10 h-1 bg-emerald-500 rounded-full"></div>
                            <div className="w-16 h-4 dot-matrix opacity-60"></div>
                        </div>

                        {/* Grid de Tarjetas Blancas con Círculos de Color (Estilo Sección 5) */}
                        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                            {calculadoras.map((calc) => (
                                <div 
                                    key={calc.id}
                                    onClick={() => abrirCalculadora(calc.id)}
                                    className="bg-white rounded-[2rem] p-7 flex flex-col items-center text-center relative ui-shadow ui-shadow-hover border border-slate-50 cursor-pointer group"
                                >
                                    {/* Patrón de puntos inferior izquierdo */}
                                    <div className="absolute bottom-5 left-5 w-12 h-12 dot-matrix opacity-30 pointer-events-none"></div>
                                    
                                    {/* Círculo central con color dinámico */}
                                    <div className={`w-16 h-16 ${calc.iconBg} rounded-full flex items-center justify-center text-white text-2xl mb-4 shadow-lg shadow-${calc.theme}-500/30 transition-transform group-hover:scale-110 duration-300`}>
                                        {calc.icon}
                                    </div>
                                    
                                    <h4 className="font-extrabold text-[#486DAA] text-sm m-0">{calc.titulo}</h4>
                                    <p className="text-xs text-slate-400 mt-1.5 font-medium leading-relaxed mb-6">
                                        {calc.descripcion}
                                    </p>
                                    
                                    {/* Botón circular con flecha inferior derecho */}
                                    <button 
                                        type="button"
                                        className={`absolute bottom-5 right-5 w-9 h-9 rounded-full border-2 ${calc.btnBorder} ${calc.btnColor} ${calc.btnHover} hover:text-white flex items-center justify-center transition duration-200 bg-transparent cursor-pointer`}
                                        aria-label={calc.titulo}
                                    >
                                        <FaArrowRight className="text-xs" />
                                    </button>
                                </div>
                            ))}
                        </section>

                        {/* Encabezado Recursos y Documentos */}
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center text-sm shadow-md shadow-red-500/30">
                                <FaFilePdf />
                            </div>
                            <h3 className="text-xl font-black text-[#486DAA] m-0">Recursos y Documentos Oficiales</h3>
                            <div className="w-10 h-1 bg-emerald-500 rounded-full"></div>
                        </div>

                        {/* Grid de Recursos */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recursos.map((rec) => (
                                <a
                                    key={rec.id}
                                    href={rec.link}
                                    target={rec.externo ? '_blank' : '_self'}
                                    rel={rec.externo ? 'noopener noreferrer' : ''}
                                    className="bg-white rounded-[2rem] p-6 flex flex-col justify-between relative ui-shadow ui-shadow-hover border border-slate-50 text-decoration-none group"
                                >
                                    <div>
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl mb-3 group-hover:scale-105 transition">
                                            {rec.icon}
                                        </div>
                                        <h4 className="font-extrabold text-[#486DAA] text-sm mb-1">{rec.titulo}</h4>
                                        <p className="text-xs text-slate-500 font-medium m-0">{rec.descripcion}</p>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#486DAA] font-bold">
                                        <span>{rec.externo ? 'Abrir recurso' : 'Consultar'}</span>
                                        <FaArrowRight className="text-xs transition-transform group-hover:translate-x-1" />
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* ================= CONTENIDO DE PESTAÑA: PROCESO Y NOTICIAS ================= */}
                {tabActiva === 'proceso' && (
                    <div>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            
                            {/* Columna Noticias Seccionales */}
                            <div className="lg:col-span-7">
                                <div className="bg-white rounded-[2.5rem] p-7 ui-shadow border border-white">
                                    <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                                        <div className="flex items-center space-x-2.5">
                                            <div className="w-8 h-8 rounded-xl bg-[#486DAA] text-white flex items-center justify-center text-xs">
                                                <FaNewspaper />
                                            </div>
                                            <h3 className="text-base font-black text-[#486DAA] m-0">Avisos y Noticias de tu Sección</h3>
                                        </div>
                                        <Link to="/noticias" className="text-xs font-bold text-[#486DAA] hover:underline text-decoration-none">
                                            Ver todas →
                                        </Link>
                                    </div>

                                    {loadingNoticias ? (
                                        <div className="text-center py-8 text-slate-400 text-xs font-medium">
                                            Cargando comunicados...
                                        </div>
                                    ) : noticias.length > 0 ? (
                                        <div className="space-y-4">
                                            {noticias.map((noticia, idx) => (
                                                <div key={idx} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-slate-100/80 transition flex flex-col sm:flex-row gap-4">
                                                    {noticia.imagen && (
                                                        <img 
                                                            src={getImageUrl(noticia.imagen)} 
                                                            alt={noticia.titulo} 
                                                            className="w-full sm:w-28 h-24 object-cover rounded-xl flex-shrink-0"
                                                            onError={(e) => { e.target.style.display = 'none'; }}
                                                        />
                                                    )}
                                                    <div className="flex-1 flex flex-col justify-between">
                                                        <div>
                                                            <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-bold mb-1">
                                                                <span><FaCalendarAlt className="inline mr-1" />{noticia.fecha}</span>
                                                                <span>•</span>
                                                                <span><FaEye className="inline mr-1" />{noticia.vistas || 0}</span>
                                                                {noticia.fijada && (
                                                                    <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[9px]">
                                                                        📌 Fijada
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <h5 className="font-bold text-[#486DAA] text-xs sm:text-sm m-0 leading-snug">
                                                                {noticia.titulo}
                                                            </h5>
                                                            <p className="text-xs text-slate-600 mt-1 line-clamp-2 m-0">
                                                                {noticia.resumen}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-slate-400 text-xs font-medium">
                                            No hay noticias recientes para esta sección.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Columna Convocatorias y Requisitos */}
                            <div className="lg:col-span-5">
                                <div className="bg-white rounded-[2.5rem] p-7 ui-shadow border border-white">
                                    <div className="flex items-center space-x-2.5 mb-4">
                                        <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-xs">
                                            <FaInfoCircle />
                                        </div>
                                        <h3 className="text-base font-black text-[#486DAA] m-0">Convocatorias y Procesos</h3>
                                    </div>
                                    
                                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                                        Consulta los requisitos y calendarios para participar en los procesos sindicales activos de tu sección.
                                    </p>

                                    <div className="space-y-3">
                                        {[
                                            { titulo: 'Crédito hipotecario 2026-1', desc: 'Próxima convocatoria' },
                                            { titulo: 'Festejo Cláusula 78 - Enfermería', desc: 'Registro en preparación' },
                                            { titulo: 'Rifa de Propuestas 2026', desc: 'Próximamente' }
                                        ].map((item, i) => (
                                            <div key={i} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                                <div>
                                                    <div className="font-bold text-xs text-slate-800">{item.titulo}</div>
                                                    <div className="text-[10px] text-slate-500">{item.desc}</div>
                                                </div>
                                                <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-[9px] font-bold">
                                                    Próximo
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Cómo participar */}
                                    <div className="mt-6 pt-4 border-t border-slate-100">
                                        <div className="font-bold text-xs text-[#486DAA] mb-2 flex items-center space-x-1.5">
                                            <FaShieldAlt className="text-emerald-500" />
                                            <span>Requisitos generales:</span>
                                        </div>
                                        <ul className="text-xs text-slate-600 space-y-1.5 pl-4 m-0">
                                            <li>Ser trabajador agremiado de base.</li>
                                            <li>Antigüedad sujeta a los términos de la convocatoria.</li>
                                            <li>Estar al corriente con tus cuotas sindicales.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Tarjetas de Acciones Rápidas y Roles */}
                        <div className="mt-8">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-8 h-8 rounded-xl bg-[#486DAA] text-white flex items-center justify-center text-xs">
                                    <FaRocket />
                                </div>
                                <h3 className="text-lg font-black text-[#486DAA] m-0">Trámites y Accesos Rápidos</h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Crédito Auto */}
                                <Link to="/registro-auto" className="bg-white rounded-[2rem] p-6 ui-shadow ui-shadow-hover border border-slate-50 text-decoration-none group">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#486DAA] flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">
                                        <FaCar />
                                    </div>
                                    <h4 className="font-extrabold text-[#486DAA] text-sm mb-1">Preregistro Rifa de Auto</h4>
                                    <p className="text-xs text-slate-500 m-0">Participa en la rifa para obtener tu crédito automotriz.</p>
                                </Link>

                                {/* Noticias */}
                                <Link to="/noticias" className="bg-white rounded-[2rem] p-6 ui-shadow ui-shadow-hover border border-slate-50 text-decoration-none group">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">
                                        <FaNewspaper />
                                    </div>
                                    <h4 className="font-extrabold text-[#486DAA] text-sm mb-1">Noticias y Avisos</h4>
                                    <p className="text-xs text-slate-500 m-0">Mantente al tanto de comunicados oficiales.</p>
                                </Link>

                                {/* Cláusula 79Bis */}
                                <Link to="/clausula79bis" className="bg-white rounded-[2rem] p-6 ui-shadow ui-shadow-hover border border-slate-50 text-decoration-none group">
                                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">
                                        <FaGift />
                                    </div>
                                    <h4 className="font-extrabold text-[#486DAA] text-sm mb-1">Cláusula 79Bis</h4>
                                    <p className="text-xs text-slate-500 m-0">Registro al festejo de Intendencia y Limpieza.</p>
                                </Link>

                                {/* Validador Auto (Rol 1) */}
                                {hasAutoValidatorRole && (
                                    <Link to="/validador-auto" className="bg-white rounded-[2rem] p-6 ui-shadow ui-shadow-hover border border-amber-200 text-decoration-none group">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">
                                            <FaCheckCircle />
                                        </div>
                                        <h4 className="font-extrabold text-amber-700 text-sm mb-1">Validador Auto</h4>
                                        <p className="text-xs text-slate-500 m-0">Panel de revisión y dictamen de solicitudes.</p>
                                    </Link>
                                )}

                                {/* Editor de Noticias (Rol 2) */}
                                {hasNewsValidatorRole && (
                                    <Link to="/noticias/crear" className="bg-white rounded-[2rem] p-6 ui-shadow ui-shadow-hover border border-emerald-200 text-decoration-none group">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">
                                            <FaNewspaper />
                                        </div>
                                        <h4 className="font-extrabold text-emerald-700 text-sm mb-1">Crear Noticia</h4>
                                        <p className="text-xs text-slate-500 m-0">Publicar comunicados para tu sección.</p>
                                    </Link>
                                )}

                                {/* Validador 79Bis (Rol 3) */}
                                {hasClausula79BisValidatorRole && (
                                    <>
                                        <Link to="/clausula79bis/validador" className="bg-white rounded-[2rem] p-6 ui-shadow ui-shadow-hover border border-purple-200 text-decoration-none group">
                                            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">
                                                <FaShieldAlt />
                                            </div>
                                            <h4 className="font-extrabold text-purple-700 text-sm mb-1">Validador 79Bis</h4>
                                            <p className="text-xs text-slate-500 m-0">Gestión de registros del festejo.</p>
                                        </Link>

                                        <Link to="/clausula79bis/entrada" className="bg-white rounded-[2rem] p-6 ui-shadow ui-shadow-hover border border-blue-200 text-decoration-none group">
                                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#486DAA] flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">
                                                <FaQrcode />
                                            </div>
                                            <h4 className="font-extrabold text-[#486DAA] text-sm mb-1">Entrada 79Bis</h4>
                                            <p className="text-xs text-slate-500 m-0">Lector y control de acceso con código QR.</p>
                                        </Link>

                                        <Link to="/clausula79bis/estadisticas" className="bg-white rounded-[2rem] p-6 ui-shadow ui-shadow-hover border border-emerald-200 text-decoration-none group">
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">
                                                <FaChartPie />
                                            </div>
                                            <h4 className="font-extrabold text-emerald-700 text-sm mb-1">Estadísticas 79Bis</h4>
                                            <p className="text-xs text-slate-500 m-0">Métricas y gráficas de asistencia.</p>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ================= CONTENIDO DE PESTAÑA: CEN ================= */}
                {tabActiva === 'cen' && (
                    <div className="bg-white rounded-[2.5rem] p-8 ui-shadow border border-white">
                        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
                            <div className="w-10 h-10 rounded-2xl bg-red-500 text-white flex items-center justify-center text-base">
                                <FaBuilding />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-[#486DAA] m-0">Comité Ejecutivo Nacional (CEN)</h3>
                                <p className="text-xs text-slate-500 m-0">Información, circulares y comunicados de carácter nacional.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                                <FaRocket className="text-2xl text-[#486DAA] mb-3" />
                                <h4 className="font-bold text-sm text-[#486DAA] mb-2">Próximos Eventos Nacionales</h4>
                                <p className="text-xs text-slate-600 mb-0">Mantente al tanto de asambleas y reuniones nacionales del SNTSS.</p>
                            </div>

                            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                                <FaShieldAlt className="text-2xl text-red-500 mb-3" />
                                <h4 className="font-bold text-sm text-[#486DAA] mb-2">Comunicados Oficiales</h4>
                                <p className="text-xs text-slate-600 mb-0">Circulares emitidas por la dirigencia nacional sindical.</p>
                            </div>

                            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                                <FaFileContract className="text-2xl text-emerald-500 mb-3" />
                                <h4 className="font-bold text-sm text-[#486DAA] mb-2">Convocatorias Nacionales</h4>
                                <p className="text-xs text-slate-600 mb-0">Procesos electorales y comisiones a nivel federal.</p>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* ================= MODAL DE CALCULADORAS ================= */}
            <Modal 
                show={showModal} 
                onHide={cerrarCalculadora} 
                size="lg" 
                centered
                dialogClassName="custom-calculator-modal"
            >
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="font-bold text-[#486DAA] text-lg flex items-center space-x-2">
                        <FaCalculator className="text-[#486DAA]" />
                        <span>Calculadora Sindical</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-2">
                    {renderCalculadora()}
                </Modal.Body>
            </Modal>

        </div>
    );
};

export default Dashboard;