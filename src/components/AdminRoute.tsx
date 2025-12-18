import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AdminRouteProps {
  children: ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isAuthenticated, loading, user } = useAuth();

  // Debug logging
  console.log('🔐 AdminRoute Check:', {
    isAuthenticated,
    loading,
    userRol: user?.rol,
    userEmail: user?.email,
    isAdmin: user?.rol === 'admin',
  });

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('❌ No autenticado, redirigiendo a login');
    return <Navigate to="/login" replace />;
  }

  // Redirect to dashboard if not admin
  if (user?.rol !== 'admin') {
    console.log('❌ Usuario no es admin, redirigiendo a dashboard. Rol actual:', user?.rol);
    return <Navigate to="/dashboard" replace />;
  }

  console.log('✅ Acceso permitido a ruta de admin');
  return <>{children}</>;
};
