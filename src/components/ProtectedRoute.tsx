import { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { UserRole } from '@/types/user';
import { Spinner } from '@/components/ui/spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user } = useAuth();
  const { profile, loading } = useProfile();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login', { state: { from: location } });
      } else if (!profile && location.pathname !== '/complete-profile') {
        navigate('/complete-profile');
      } else if (profile && requiredRole && profile.role !== requiredRole) {
        // Redirecionar para o dashboard apropriado se tentar acessar uma rota não autorizada
        switch (profile.role) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'teacher':
            navigate('/teacher/dashboard');
            break;
          case 'student':
            navigate('/student/dashboard');
            break;
          default:
            navigate('/complete-profile');
        }
      }
    }
  }, [user, profile, loading, location, navigate, requiredRole]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
