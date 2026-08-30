import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import DoctorLoginPage from './pages/DoctorLoginPage';
import PatientLoginPage from './pages/PatientLoginPage';
import DoctorDashboardPage from './pages/DoctorDashboardPage';
import PatientDashboardPage from './pages/PatientDashboardPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import HelpPage from './pages/HelpPage';
import IntegrationsPage from './pages/IntegrationsPage';
import { useAuth } from './context/AuthContext';

function LoginRedirect({ role }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated && user?.role === role) {
    const dest =
      role === 'admin' ? '/admin/dashboard' : role === 'doctor' ? '/doctor' : '/patient';
    return <Navigate to={dest} replace />;
  }
  if (role === 'admin') return <AdminLoginPage />;
  return role === 'doctor' ? <DoctorLoginPage /> : <PatientLoginPage />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login/doctor" element={<LoginRedirect role="doctor" />} />
      <Route path="/login/patient" element={<LoginRedirect role="patient" />} />
      <Route path="/doctor" element={<DoctorDashboardPage />} />
      <Route path="/patient" element={<PatientDashboardPage />} />
      <Route path="/login/admin" element={<LoginRedirect role="admin" />} />
      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/help" element={<HelpPage />} />
      <Route path="/integrations" element={<IntegrationsPage />} />
    </Routes>
  );
}
