import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaArrowLeft, FaSearch, FaPlusCircle, FaMinusCircle, 
    FaFileAlt, FaInfoCircle, FaFileContract, FaTag, FaArrowRight
} from 'react-icons/fa';
import { apiUrl } from '../config';
import { Modal } from 'react-bootstrap';

const Conceptos = () => {
    const [conceptos, setConceptos] = useState([]);
    const [conceptosFiltrados, setConceptosFiltrados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [conceptoSeleccionado, setConceptoSeleccionado] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filtroCategoria, setFiltroCategoria] = useState('todos'); // 'todos', 'aportacion', 'descuento'

    const cargarConceptos = async () => {
        setLoading(true);
        try {
            const response = await fetch(apiUrl('/api_conceptos.php'));
            const data = await response.json();
            if (data.success) {
                setConceptos(data.conceptos || []);
                setConceptosFiltrados(data.conceptos || []);
            }
        } catch (error) {
            console.error('Error cargando conceptos:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarConceptos();
    }, []);

    useEffect(() => {
        let filtrados = conceptos;
        if (filtroCategoria !== 'todos') {
            filtrados = filtrados.filter(c => c.categoria === filtroCategoria);
        }
        if (searchTerm.trim()) {
            const term = searchTerm.trim().toLowerCase();
            filtrados = filtrados.filter(c => 
                c.numero.toLowerCase().includes(term) ||
                c.titulo.toLowerCase().includes(term) ||
                (c.descripcion && c.descripcion.toLowerCase().includes(term))
            );
        }
        setConceptosFiltrados(filtrados);
    }, [searchTerm, filtroCategoria, conceptos]);

    const abrirDetalle = (concepto) => {
        setConceptoSeleccionado(concepto);
        setShowModal(true);
    };

    const cerrarDetalle = () => {
        setShowModal(false);
        setConceptoSeleccionado(null);
    };

    return (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
            
            {/* Header Conceptos */}
            <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 ui-shadow border border-white mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <Link to="/dashboard" className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-[#486DAA] hover:text-white flex items-center justify-center transition text-decoration-none">
                        <FaArrowLeft />
                    </Link>
                    <div>
                        <span className="inline-block bg-[#486DAA]/10 text-[#486DAA] text-[10px] font-extrabold px-3 py-0.5 rounded-full mb-1 border border-[#486DAA]/20">
                            Tarjetón de Pago
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black text-[#486DAA] tracking-tight m-0">
                            Catálogo de Conceptos IMSS
                        </h2>
                    </div>
                </div>

                {/* Buscador */}
                <div className="w-full md:w-72 relative flex items-center">
                    <span className="absolute left-4 text-slate-400 text-sm"><FaSearch /></span>
                    <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por clave o nombre..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-full py-2.5 pl-10 pr-4 text-xs font-medium text-slate-700 outline-none focus:border-[#486DAA] focus:bg-white transition"
                    />
                </div>
            </div>

            {/* Filtros de Categoría */}
            <div className="flex justify-center mb-8">
                <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-full flex gap-1.5 ui-shadow border border-white">
                    <button
                        onClick={() => setFiltroCategoria('todos')}
                        className={`px-5 py-2 rounded-full font-bold text-xs border-0 cursor-pointer transition ${
                            filtroCategoria === 'todos'
                                ? 'bg-[#486DAA] text-white shadow-md shadow-[#486DAA]/30'
                                : 'bg-transparent text-slate-600 hover:text-[#486DAA]'
                        }`}
                    >
                        Todos ({conceptos.length})
                    </button>

                    <button
                        onClick={() => setFiltroCategoria('aportacion')}
                        className={`flex items-center space-x-1.5 px-5 py-2 rounded-full font-bold text-xs border-0 cursor-pointer transition ${
                            filtroCategoria === 'aportacion'
                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                                : 'bg-transparent text-slate-600 hover:text-emerald-600'
                        }`}
                    >
                        <FaPlusCircle className="text-xs" />
                        <span>Percepciones</span>
                    </button>

                    <button
                        onClick={() => setFiltroCategoria('descuento')}
                        className={`flex items-center space-x-1.5 px-5 py-2 rounded-full font-bold text-xs border-0 cursor-pointer transition ${
                            filtroCategoria === 'descuento'
                                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                                : 'bg-transparent text-slate-600 hover:text-orange-600'
                        }`}
                    >
                        <FaMinusCircle className="text-xs" />
                        <span>Deducciones</span>
                    </button>
                </div>
            </div>

            {/* Grid de Conceptos */}
            {loading ? (
                <div className="text-center py-16 text-slate-400 font-medium text-xs">
                    Cargando conceptos del tarjetón...
                </div>
            ) : conceptosFiltrados.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {conceptosFiltrados.map((concepto) => {
                        const esPercepcion = concepto.categoria === 'aportacion';
                        return (
                            <div 
                                key={concepto.id || concepto.numero}
                                onClick={() => abrirDetalle(concepto)}
                                className="bg-white rounded-[2rem] p-6 flex flex-col justify-between relative ui-shadow ui-shadow-hover border border-slate-50 cursor-pointer group"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`w-10 h-10 rounded-2xl flex items-center justify-center font-mono font-black text-xs ${
                                            esPercepcion 
                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                                                : 'bg-orange-50 text-orange-600 border border-orange-200'
                                        }`}>
                                            {concepto.numero}
                                        </span>
                                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                            esPercepcion ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'
                                        }`}>
                                            {esPercepcion ? 'Percepción' : 'Deducción'}
                                        </span>
                                    </div>
                                    <h4 className="font-extrabold text-[#486DAA] text-sm mb-2">{concepto.titulo}</h4>
                                    <p className="text-xs text-slate-500 font-medium line-clamp-3 m-0">
                                        {concepto.descripcion}
                                    </p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#486DAA] font-bold">
                                    <span>Ver fundamento y detalle</span>
                                    <FaArrowRight className="text-xs transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-[2.5rem] ui-shadow p-8 text-slate-400 font-medium text-xs">
                    No se encontraron conceptos que coincidan con la búsqueda.
                </div>
            )}

            {/* Modal Detalle de Concepto */}
            <Modal show={showModal} onHide={cerrarDetalle} centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="font-bold text-[#486DAA] text-base flex items-center space-x-2">
                        <FaFileContract />
                        <span>Detalle de Concepto ({conceptoSeleccionado?.numero})</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-2 space-y-4">
                    {conceptoSeleccionado && (
                        <>
                            <div>
                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                    conceptoSeleccionado.categoria === 'aportacion' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'
                                }`}>
                                    {conceptoSeleccionado.categoria === 'aportacion' ? 'Percepción / Aportación' : 'Deducción / Descuento'}
                                </span>
                                <h3 className="text-base font-black text-[#486DAA] mt-2 mb-1">
                                    {conceptoSeleccionado.titulo}
                                </h3>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                                {conceptoSeleccionado.descripcion}
                            </div>

                            {conceptoSeleccionado.fundamento && (
                                <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 text-xs text-blue-900">
                                    <strong>Fundamento CCT:</strong> {conceptoSeleccionado.fundamento}
                                </div>
                            )}
                        </>
                    )}
                </Modal.Body>
            </Modal>

        </div>
    );
};

export default Conceptos;