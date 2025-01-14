import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getProfileLink = () => {
    switch (userRole) {
      case 'admin':
        return '/admin/profile';
      case 'teacher':
        return '/teacher/profile';
      case 'student':
        return '/student/profile';
      default:
        return '/complete-profile';
    }
  };

  const getDashboardLink = () => {
    switch (userRole) {
      case 'admin':
        return '/admin/dashboard';
      case 'teacher':
        return '/teacher/dashboard';
      case 'student':
        return '/student/dashboard';
      default:
        return '/complete-profile';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
      <nav className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span>Eduxa</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/courses" className="text-sm font-medium hover:text-primary">
              Cursos
            </Link>
            
            {user ? (
              <>
                <Link to={getDashboardLink()} className="text-sm font-medium hover:text-primary">
                  Dashboard
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={getProfileLink()}>Perfil</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Entrar</Button>
                </Link>
                <Link to="/register">
                  <Button>Criar Conta</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}