import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, BarChart2, BookOpen, Users, Rocket, Shield, Clock, Globe } from "lucide-react";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Initial Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                A melhor plataforma para você vender seus cursos online
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Crie sua escola online e comece a vender seus cursos hoje mesmo. 
                Tenha acesso a ferramentas poderosas de marketing, área de membros 
                profissional e suporte especializado.
              </p>
              <div className="space-y-4">
                <Button asChild size="lg" className="w-full md:w-auto">
                  <Link to="/register">Cadastre-se Agora Mesmo</Link>
                </Button>
                <p className="text-sm text-muted-foreground">
                  Mais de 10.000 criadores já estão usando nossa plataforma
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
              <img
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop"
                alt="Dashboard Preview"
                className="relative w-full h-auto rounded-lg shadow-2xl border border-border object-cover"
              />
              <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Transforme seu conhecimento em uma fonte de renda
            </h1>
            <p className="text-xl mb-8">
              Crie, venda e gerencie seus cursos online com uma plataforma completa e intuitiva
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link to="/register">Comece Gratuitamente</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">+10k</div>
              <div className="text-muted-foreground">Criadores de conteúdo</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">+100k</div>
              <div className="text-muted-foreground">Alunos impactados</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">+1M</div>
              <div className="text-muted-foreground">Vendas realizadas</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Tudo que você precisa para vender cursos online
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-primary mb-4">
                  <BookOpen size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Área de Membros</h3>
                <p className="text-muted-foreground">
                  Hospede seus cursos em uma plataforma segura e profissional
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-primary mb-4">
                  <BarChart2 size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Analytics</h3>
                <p className="text-muted-foreground">
                  Acompanhe métricas e resultados em tempo real
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-primary mb-4">
                  <Users size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Comunidade</h3>
                <p className="text-muted-foreground">
                  Interaja com seus alunos e crie uma comunidade engajada
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-primary mb-4">
                  <Rocket size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Marketing</h3>
                <p className="text-muted-foreground">
                  Ferramentas de marketing para impulsionar suas vendas
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Por que escolher nossa plataforma?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <div className="text-primary">
                <Shield size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Segurança Garantida</h3>
                <p className="text-muted-foreground">
                  Proteção total do seu conteúdo e dados dos seus alunos
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="text-primary">
                <Clock size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Suporte 24/7</h3>
                <p className="text-muted-foreground">
                  Equipe dedicada para ajudar você a qualquer momento
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="text-primary">
                <Globe size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Alcance Global</h3>
                <p className="text-muted-foreground">
                  Venda seus cursos para alunos em qualquer lugar do mundo
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="text-primary">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Zero Comissão</h3>
                <p className="text-muted-foreground">
                  Fique com 100% do valor das suas vendas
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            O que dizem nossos criadores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">
                  "A melhor decisão que tomei foi migrar meus cursos para esta plataforma. 
                  O suporte é incrível e as ferramentas são muito intuitivas."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-primary/20 mr-4"></div>
                  <div>
                    <div className="font-semibold">Ana Silva</div>
                    <div className="text-sm text-muted-foreground">Designer UX</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">
                  "Minhas vendas aumentaram 300% depois que comecei a usar as ferramentas 
                  de marketing da plataforma. Simplesmente fantástico!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-primary/20 mr-4"></div>
                  <div>
                    <div className="font-semibold">Pedro Santos</div>
                    <div className="text-sm text-muted-foreground">Marketing Digital</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">
                  "A área de membros é muito profissional e meus alunos adoram a 
                  experiência de aprendizado. Recomendo muito!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-primary/20 mr-4"></div>
                  <div>
                    <div className="font-semibold">Carla Oliveira</div>
                    <div className="text-sm text-muted-foreground">Coach de Carreira</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Comece sua jornada como criador de conteúdo
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de criadores que já estão transformando seu conhecimento 
            em um negócio lucrativo
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link to="/register">Criar Minha Conta Grátis</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;