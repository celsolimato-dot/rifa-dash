import { Navigate } from 'react-router-dom';
import { useRealAuth as useAuth, UserRole } from '@/contexts/RealAuthContext';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto animate-pulse">
            <span className="text-white font-bold text-lg">R</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-foreground-muted">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check role-based access
  if (requiredRole && user.role !== requiredRole) {
    // Redirect based on user's actual role
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/cliente" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;