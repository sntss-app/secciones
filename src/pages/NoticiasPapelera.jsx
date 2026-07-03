import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTrashRestore, FaTrash, FaNewspaper, FaTimes, FaEye } from 'react-icons/fa';
import { apiUrl } from '../config';

const NoticiasPapelera = () => {
    const [noticias, setNoticias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const cargarNoticiasEliminadas = async () => {
        setLoading(true);
        try {
            const response = await fetch(apiUrl('/listar_noticias_eliminadas.php'));
            const data = await response.json();
            if (data.success) {
                setNoticias(data.noticias || []);
            } else {
                setErrorMsg(data.message || 'Error al cargar noticias.');
            }
        } catch (error) {
            setErrorMsg('Error de conexión con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarNoticiasEliminadas();
    }, []);

    const restaurarNoticia = async (id) => {
        if (!window.confirm('¿Restaurar esta noticia? Volverá a estar visible en el panel de administración.')) return;
        try {
            const response = await fetch(apiUrl('/restaurar_noticia.php'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            const data = await response.json();
            if (data.success) {
                setSuccessMsg('Noticia restaurada correctamente.');
                cargarNoticiasEliminadas();
            } else {
                setErrorMsg(data.message || 'Error al restaurar.');
            }
        } catch (error) {
            setErrorMsg('Error de conexión.');
        }
    };

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-warning" role="status"></div>
                <p className="mt-3">Cargando papelera...</p>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0"><FaTrash className="me-2 text-danger" />Papelera de Noticias</h2>
                <Link to="/noticias/crear" className="btn btn-outline-secondary">
                    <FaTimes className="me-1" /> Volver
                </Link>
            </div>

            {errorMsg && (
                <div className="alert alert-danger alert-dismissible fade show">
                    {errorMsg}
                    <button type="button" className="btn-close" onClick={() => setErrorMsg('')}></button>
                </div>
            )}
            {successMsg && (
                <div className="alert alert-success alert-dismissible fade show">
                    {successMsg}
                    <button type="button" className="btn-close" onClick={() => setSuccessMsg('')}></button>
                </div>
            )}

            {noticias.length === 0 ? (
                <div className="text-center py-5">
                    <FaTrash className="display-1 text-muted" />
                    <p className="lead mt-3">La papelera está vacía</p>
                    <p className="text-muted">Las noticias que elimines aparecerán aquí.</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover">
                        <thead className="table-dark">
                            <tr>
                                <th>Título</th>
                                <th>Autor</th>
                                <th>Fecha</th>
                                <th className="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {noticias.map((noticia) => (
                                <tr key={noticia.id}>
                                    <td>{noticia.titulo}</td>
                                    <td>{noticia.autor}</td>
                                    <td>{noticia.fecha}</td>
                                    <td className="text-center">
                                        <button 
                                            className="btn btn-sm btn-success"
                                            onClick={() => restaurarNoticia(noticia.id)}
                                        >
                                            <FaTrashRestore /> Restaurar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default NoticiasPapelera;