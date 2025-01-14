import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 transition-all duration-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              EduXa
            </span>
          </Link>
          <div className="flex gap-6">
            <Link
              to="/"
              className="text-foreground/80 hover:text-foreground transition-colors text-sm font-medium"
            >
              Início
            </Link>
            <Link
              to="/courses"
              className="text-foreground/80 hover:text-foreground transition-colors text-sm font-medium"
            >
              Cursos
            </Link>
            <Link
              to="/login"
              className="text-foreground/80 hover:text-foreground transition-colors text-sm font-medium"
            >
              Entrar
            </Link>
            <Link
              to="/register"
              className="text-primary hover:text-primary-light transition-colors text-sm font-medium"
            >
              Criar Conta
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;