import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// Importar páginas
import Registro from './pages/Registro';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RecuperarContraseña from './pages/RecuperarContraseña';
import Verificar2FA from './pages/Verificar2FA';
import Perfil from './pages/Perfil';
import AutoCredito from './pages/AutoCredito';
import AutoValidador from './pages/AutoValidador';
import NoticiasCrear from './pages/NoticiasCrear';
import Noticias from './pages/Noticias';
import NoticiasPapelera from './pages/NoticiasPapelera';
import Conceptos from './pages/Conceptos';
import Clausula79Bis from './pages/Clausula79Bis';
import Clausula79BisValidador from './pages/Clausula79BisValidador';
import Clausula79BisEntrada from './pages/Clausula79BisEntrada';
import Clausula79BisEstadisticas from './pages/Clausula79BisEstadisticas';

// Importar componentes
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Componente para rutas protegidas
const RutaProtegida = ({ children }) => {
    const matricula = localStorage.getItem('matricula');
    if (!matricula) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

function App() {
    return (
        <BrowserRouter>
            <div className="d-flex flex-column min-vh-100">
                <Navbar />
                <main className="flex-grow-1">
                    <Routes>
                        <Route path="/registro" element={<Registro />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/RecuperarContraseña" element={<RecuperarContraseña />} />
                        <Route path="/verificar-2fa" element={<Verificar2FA />} />
                        <Route path="/perfil" element={<RutaProtegida><Perfil /></RutaProtegida>} />
                        <Route path="/registro-auto" element={<RutaProtegida><AutoCredito /></RutaProtegida>} />
                        {/* 👇 Agrega esta línea para el validador */}
                        <Route path="/validador-auto" element={<RutaProtegida><AutoValidador /></RutaProtegida>} />
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/noticias/crear" element={<RutaProtegida><NoticiasCrear /></RutaProtegida>} />
                        <Route path="/noticias" element={<Noticias />} />
                        <Route path="/noticias/papelera" element={<RutaProtegida><NoticiasPapelera /></RutaProtegida>} />
                        <Route path="/conceptos" element={<Conceptos />} />
                        <Route path="/clausula79bis" element={<Clausula79Bis />} />
                        <Route path="/clausula79bis/validador" element={<Clausula79BisValidador />} />
                        <Route path="/clausula79bis/entrada" element={<Clausula79BisEntrada />} />
                        <Route path="/clausula79bis/estadisticas" element={<Clausula79BisEstadisticas />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </BrowserRouter>
    );
}

export default App;