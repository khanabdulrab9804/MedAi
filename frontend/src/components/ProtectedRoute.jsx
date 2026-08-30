import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children, role }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    const loginPath =
      role === 'admin' ? '/login/admin' : role === 'doctor' ? '/login/doctor' : '/login/patient';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    const home =
      user.role === 'admin'
        ? '/admin/dashboard'
        : user.role === 'doctor'
          ? '/doctor'
          : '/patient';
    return <Navigate to={home} replace />;
  }

  return children;
}
