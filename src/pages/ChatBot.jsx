import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaArrowLeft, FaPaperPlane, FaRobot, FaUser, 
    FaSpinner, FaInfoCircle, FaLightbulb, FaTimes,
    FaCopy, FaCheck, FaArrowRight, FaThumbsUp, FaThumbsDown
} from 'react-icons/fa';
import { apiUrl } from '../config';
import '../css/ChatBot.css';

const ChatBot = () => {
    const [mensajes, setMensajes] = useState([
        {
            id: 1,
            tipo: 'bot',
            texto: '👋 ¡Hola! Soy **DeleBot**, tu delegado virtual del SNTSS.\n\nPuedo ayudarte a consultar los **Estatutos del Sindicato**. Pregúntame sobre:\n\n📜 **Derechos** de los agremiados\n⚖️ **Obligaciones** como miembro\n🏛️ **Estructura** sindical\n📋 **Elecciones** y procesos\n💰 **Cuotas** sindicales\n\n¿Qué deseas saber?',
            esPreguntaSugerida: false
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [cargando, setCargando] = useState(false);
    const [fuenteSeleccionada, setFuenteSeleccionada] = useState('estatutos');
    
    // Cambiamos las queries para que sean más cortas y directas (palabras clave que el buscador SÍ encuentra)
    const [preguntasSugeridas, setPreguntasSugeridas] = useState([
        { label: '📜 ¿Qué es el SNTSS?', query: 'SNTSS' },
        { label: '🏛️ ¿Cuál es el objeto del Sindicato?', query: 'objeto' },
        { label: '👤 ¿Quiénes son miembros activos?', query: 'miembros activos' },
        { label: '📋 ¿Cuáles son las obligaciones de los miembros?', query: 'obligaciones' },
        { label: '⚖️ ¿Cómo se elige al Secretario General?', query: 'elecciones' },
        { label: '💰 ¿Cuánto pago de cuota sindical?', query: 'cuota sindical' },
    ]);

    const [copiado, setCopiado] = useState(false);
    const [mensajeCopiadoId, setMensajeCopiadoId] = useState(null);
    const [votos, setVotos] = useState({}); // Estado para votos: { idMensaje: 'positivo' | 'negativo' }
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [mensajes]);

    // Enfocar el input cuando termine de cargar la respuesta (dejar de estar disabled)
    useEffect(() => {
        if (!cargando) {
            inputRef.current?.focus();
        }
    }, [cargando]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // 📌 NUEVA FUNCIÓN DE FORMATEO CON LISTAS PERFECTAS
    const formatearTexto = (texto) => {
        if (!texto) return '';

        let html = texto.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        const lineas = html.split('\n');

        const esLista = lineas.some(linea => /^\s*(\d+\.|I\.|II\.|III\.|IV\.|V\.|VI\.|VII\.|VIII\.|IX\.|X\.|[-•*])/.test(linea));

        if (esLista) {
            let enLista = false;
            let htmlFinal = '';

            lineas.forEach((linea) => {
                const esItemLista = /^\s*(\d+\.|I\.|II\.|III\.|IV\.|V\.|VI\.|VII\.|VIII\.|IX\.|X\.|[-•*])/.test(linea);

                if (esItemLista && !enLista) {
                    htmlFinal += '<ol style="padding-left: 20px; margin: 10px 0;">';
                    enLista = true;
                } else if (!esItemLista && enLista) {
                    htmlFinal += '</ol>';
                    enLista = false;
                }

                if (esItemLista) {
                    const contenido = linea.replace(/^\s*(\d+\.|I\.|II\.|III\.|IV\.|V\.|VI\.|VII\.|VIII\.|IX\.|X\.|[-•*])\s*/, '');
                    htmlFinal += `<li>${contenido}</li>`;
                } else {
                    htmlFinal += linea + '<br />';
                }
            });

            if (enLista) htmlFinal += '</ol>';
            return htmlFinal;
        }

        return html.replace(/\n/g, '<br />');
    };

    const enviarMensaje = async (texto) => {
        if (!texto || !texto.trim()) return;

        const mensajeUsuario = {
            id: Date.now(),
            tipo: 'user',
            texto: texto.trim()
        };
        setMensajes(prev => [...prev, mensajeUsuario]);
        setInputValue('');
        setCargando(true);

        try {
            // ⚠️ OBTENER LA MATRÍCULA DEL USUARIO (Cámbiala si tu sesión usa otra variable)
            // Esto es lo que hace que se guarde en la tabla chatbot_historial
            const matriculaUsuario = localStorage.getItem('matricula');

            // Construir la URL con matrícula si existe
            let url = `https://sntss-secciones.org/api/chatbot_rag.php?q=${encodeURIComponent(texto.trim())}`;
            if (matriculaUsuario) {
                url += `&matricula=${encodeURIComponent(matriculaUsuario)}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            let respuestaBot = '';
            let colorCapitulo = null;

            if (data.error) {
                respuestaBot = `❌ ${data.error}`;
            } else if (data.success) {
                colorCapitulo = data.color || '#486DAA';
                respuestaBot = data.respuesta;

                if (data.articulos_referencia && data.articulos_referencia.length > 0) {
                    respuestaBot += `\n\n📚 **Fuentes consultadas:**\n`;
                    data.articulos_referencia.forEach((ref, i) => {
                        respuestaBot += `${i + 1}. ${ref}\n`;
                    });
                }
            } else {
                respuestaBot = '🔍 No encontré información sobre eso en los Estatutos. Prueba con otras palabras clave.\n\n💡 **Sugerencia:** Intenta preguntar sobre "derechos", "obligaciones", "elecciones" o "cuotas sindicales".';
            }

            const mensajeBot = {
                id: Date.now() + 1,
                tipo: 'bot',
                texto: respuestaBot,
                color: colorCapitulo,
                esPreguntaSugerida: false,
                fuente: data.fuente || 'estatutos',
                documento: 'Estatutos SNTSS'
            };
            setMensajes(prev => [...prev, mensajeBot]);

        } catch (error) {
            console.error('Error en el chat:', error);
            const mensajeError = {
                id: Date.now() + 1,
                tipo: 'bot',
                texto: '❌ Lo siento, hubo un error al procesar tu pregunta. Por favor, intenta de nuevo más tarde.',
                esPreguntaSugerida: false
            };
            setMensajes(prev => [...prev, mensajeError]);
        } finally {
            setCargando(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        enviarMensaje(inputValue);
    };

    const handlePreguntaSugerida = (query) => {
        enviarMensaje(query);
    };

    const copiarMensaje = (texto, id) => {
        navigator.clipboard.writeText(texto.replace(/\*\*/g, '').replace(/\n/g, ' '));
        setCopiado(true);
        setMensajeCopiadoId(id);
        setTimeout(() => {
            setCopiado(false);
            setMensajeCopiadoId(null);
        }, 2000);
    };

    // Función para votar la respuesta del bot
    const votarRespuesta = (idMensaje, tipoVoto) => {
        if (votos[idMensaje]) return; // Evitar doble voto

        setVotos(prev => ({ ...prev, [idMensaje]: tipoVoto }));

        // 🔮 Aquí irá el fetch para guardar el voto en la base de datos
        // Ejemplo: fetch(`https://sntss-secciones.org/api/votar.php?id=${idMensaje}&voto=${tipoVoto}`)
        console.log(`Votaste ${tipoVoto} al mensaje con ID: ${idMensaje}`);
    };

    const limpiarChat = () => {
        setMensajes([
            {
                id: 1,
                tipo: 'bot',
                texto: '👋 ¡Hola! Soy **Dele-Bot**, tu asistente virtual del SNTSS.\n\nPuedo ayudarte a consultar los **Estatutos del Sindicato**. Pregúntame sobre:\n\n📜 **Derechos** de los agremiados\n⚖️ **Obligaciones** como miembro\n🏛️ **Estructura** sindical\n📋 **Elecciones** y procesos\n💰 **Cuotas** sindicales\n\n¿Qué deseas saber?',
                esPreguntaSugerida: false
            }
        ]);
        setVotos({}); // Limpiar votos al reiniciar chat
    };

    return (
        <div className="chatbot-wrapper">
            <div className="chatbot-header">
                <div className="chatbot-header-content">
                    <div className="chatbot-header-left">
                        <Link to="/dashboard" className="chatbot-back-btn">
                            <FaArrowLeft /> Volver
                        </Link>
                        <div className="chatbot-header-info">
                            <div className="chatbot-header-avatar">
                                <FaRobot />
                            </div>
                            <div>
                                <h1 className="chatbot-header-title">Dele-Bot</h1>
                                <p className="chatbot-header-subtitle">Asistente virtual del SNTSS</p>
                            </div>
                        </div>
                    </div>
                    <button className="chatbot-clear-btn" onClick={limpiarChat} title="Limpiar conversación">
                        <FaTimes /> Nuevo chat
                    </button>
                </div>
            </div>

            <div className="chatbot-source-selector">
                <div className="chatbot-source-pills">
                    <button 
                        className={`chatbot-source-pill ${fuenteSeleccionada === 'estatutos' ? 'chatbot-source-pill-active' : ''}`}
                        onClick={() => setFuenteSeleccionada('estatutos')}
                    >
                        📜 Estatutos SNTSS
                    </button>
                    <button 
                        className={`chatbot-source-pill ${fuenteSeleccionada === 'cct' ? 'chatbot-source-pill-active' : ''}`}
                        onClick={() => setFuenteSeleccionada('cct')}
                        disabled
                    >
                        📋 CCT (Próximamente)
                    </button>
                </div>
                <span className="chatbot-source-badge">
                    <FaInfoCircle /> Consultando: <strong>Estatutos SNTSS</strong>
                </span>
            </div>

            <div className="chatbot-messages-area">
                <div className="chatbot-messages-container">
                    {mensajes.map((msg, index) => (
                        <div 
                            key={msg.id} 
                            className={`chatbot-message-wrapper ${msg.tipo === 'user' ? 'chatbot-message-user-wrapper' : 'chatbot-message-bot-wrapper'}`}
                        >
                            <div className={`chatbot-message-avatar ${msg.tipo === 'user' ? 'chatbot-avatar-user' : 'chatbot-avatar-bot'}`}>
                                {msg.tipo === 'user' ? <FaUser /> : <FaRobot />}
                            </div>
                            <div className={`chatbot-message-bubble ${msg.tipo === 'user' ? 'chatbot-bubble-user' : 'chatbot-bubble-bot'}`}>
                                <div 
                                    className="chatbot-message-text"
                                    dangerouslySetInnerHTML={{ __html: formatearTexto(msg.texto) }}
                                />
                                {msg.tipo === 'bot' && msg.color && (
                                    <div className="chatbot-message-color-indicator" style={{ backgroundColor: msg.color }} />
                                )}
                                {msg.tipo === 'bot' && msg.documento && (
                                    <div className="chatbot-message-source">
                                        📄 {msg.documento}
                                    </div>
                                )}
                                <div className="chatbot-message-actions">
                                    <button 
                                        className="chatbot-copy-btn"
                                        onClick={() => copiarMensaje(msg.texto, msg.id)}
                                        title="Copiar mensaje"
                                    >
                                        {copiado && mensajeCopiadoId === msg.id ? <FaCheck /> : <FaCopy />}
                                    </button>
                                    
                                    {/* Botones de Votación (Solo para respuestas del bot) */}
                                    {msg.tipo === 'bot' && (
                                        <div className="chatbot-vote-buttons">
                                            <button 
                                                className={`chatbot-vote-btn ${votos[msg.id] === 'positivo' ? 'chatbot-vote-active' : ''}`}
                                                onClick={() => votarRespuesta(msg.id, 'positivo')}
                                                title="Me gustó la respuesta"
                                            >
                                                <FaThumbsUp size={12} />
                                            </button>
                                            <button 
                                                className={`chatbot-vote-btn ${votos[msg.id] === 'negativo' ? 'chatbot-vote-active' : ''}`}
                                                onClick={() => votarRespuesta(msg.id, 'negativo')}
                                                title="No me gustó la respuesta"
                                            >
                                                <FaThumbsDown size={12} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {cargando && (
                        <div className="chatbot-message-wrapper chatbot-message-bot-wrapper">
                            <div className="chatbot-message-avatar chatbot-avatar-bot">
                                <FaRobot />
                            </div>
                            <div className="chatbot-message-bubble chatbot-bubble-bot">
                                <div className="chatbot-typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {mensajes.length <= 2 && !cargando && (
                    <div className="chatbot-suggested-questions">
                        <div className="chatbot-suggested-header">
                            <FaLightbulb /> Preguntas sugeridas
                        </div>
                        <div className="chatbot-suggested-grid">
                            {preguntasSugeridas.map((p, idx) => (
                                <button 
                                    key={idx}
                                    className="chatbot-suggested-btn"
                                    onClick={() => handlePreguntaSugerida(p.query)}
                                >
                                    {p.label}
                                    <FaArrowRight size={10} />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="chatbot-input-area">
                <form className="chatbot-input-form" onSubmit={handleSubmit}>
                    <input
                        ref={inputRef}
                        type="text"
                        className="chatbot-input"
                        placeholder="Escribe tu pregunta sobre los Estatutos..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        // disabled={cargando}
                    />
                    <button 
                        type="submit" 
                        className="chatbot-send-btn"
                        disabled={!inputValue.trim() || cargando}
                    >
                        {cargando ? <FaSpinner className="chatbot-spinner" /> : <FaPaperPlane />}
                    </button>
                </form>
                <p className="chatbot-footer-note">
                    <FaInfoCircle /> Dele-Bot responde basándose en los Estatutos del SNTSS. 
                    Para dudas específicas, contacta a tu representante sindical.
                </p>
            </div>
        </div>
    );
};

export default ChatBot;