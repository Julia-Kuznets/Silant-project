import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MachineDetails from './pages/MachineDetails';


function App() {
  // Проверяем наличие токена прямо при рендере
  // (В реальном проекте используют Context или Redux, но для диплома так проще и надежнее)
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Header />

        <main className="flex-grow-1 py-4">
            <Routes>
                {/* Умная Главная страница */}
                <Route
                    path="/"
                    element={isAuthenticated ? <Dashboard /> : <Home />}
                />

                <Route path="/login" element={<Login />} />

                {/* Если пользователь введет /dashboard вручную */}
                <Route
                    path="/dashboard"
                    element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
                />

                {/* Страница детального просмотра машины (доступна только авторизованным) */}
                <Route
                    path="/machine/:id"
                    element={isAuthenticated ? <MachineDetails /> : <Navigate to="/login" />}
                />
            </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;