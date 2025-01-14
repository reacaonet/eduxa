import { GraduationCap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Eduxa</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Transformando a educação através da tecnologia
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Plataforma</h3>
            <ul className="space-y-2">
              <li>
                <a href="/courses" className="text-sm text-muted-foreground hover:text-primary">
                  Cursos
                </a>
              </li>
              <li>
                <a href="/teachers" className="text-sm text-muted-foreground hover:text-primary">
                  Professores
                </a>
              </li>
              <li>
                <a href="/about" className="text-sm text-muted-foreground hover:text-primary">
                  Sobre nós
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Suporte</h3>
            <ul className="space-y-2">
              <li>
                <a href="/help" className="text-sm text-muted-foreground hover:text-primary">
                  Central de Ajuda
                </a>
              </li>
              <li>
                <a href="/contact" className="text-sm text-muted-foreground hover:text-primary">
                  Contato
                </a>
              </li>
              <li>
                <a href="/faq" className="text-sm text-muted-foreground hover:text-primary">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
                  Privacidade
                </a>
              </li>
              <li>
                <a href="/terms" className="text-sm text-muted-foreground hover:text-primary">
                  Termos de Uso
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Eduxa. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}