import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// Importar páginas
import Registro from './pages/Registro';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RecuperarContraseña from './pages/RecuperarContraseña';
import Verificar2FA from './pages/Verificar2FA';  // ← Importa el componente

// Importar componentes
import Navbar from './components/Navbar';
import Footer from './components/Footer';

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
                        <Route path="/verificar-2fa" element={<Verificar2FA />} />  {/* ← Ruta para 2FA */}
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </BrowserRouter>
    );
}

export default App;