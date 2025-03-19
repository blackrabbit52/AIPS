import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Analysis from './pages/Analysis';
import BackOffice from './pages/BackOffice';
import Unauthorized from './pages/Unauthorized';

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Routes publiques */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />

                    {/* Routes protégées */}
                    <Route
                        path="/analysis"
                        element={
                            <ProtectedRoute>
                                <Analysis />
                            </ProtectedRoute>
                        }
                    />

                    {/* Route BackOffice (admin uniquement) */}
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute requiredRole="ROLE_ADMIN">
                                <BackOffice />
                            </ProtectedRoute>
                        }
                    />

                    {/* Redirection par défaut */}
                    <Route path="/" element={<Navigate to="/login" />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App; 