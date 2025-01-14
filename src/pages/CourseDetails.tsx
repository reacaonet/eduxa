import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useEnrollment } from "@/hooks/useEnrollment";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, BookOpen, Award, DollarSign, Play, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/components/ui/use-toast";
import { enrollUserInCourse } from "@/lib/enrollment";

interface Module {
  id: string;
  title: string;
  description: string;
  duration: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  duration: number;
  type: string;
  preview?: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructorId: string;
  instructorName: string;
  category: string;
  duration: number;
  level: string;
  price: number;
  status: string;
  tags: string[];
  modules: Module[];
  objectives: string[];
  requirements: string[];
  createdAt: any;
  updatedAt: any;
}

const CourseDetails = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const { isEnrolled } = useEnrollment(courseId || '');
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!courseId) {
          throw new Error("Course ID not provided");
        }

        const courseDoc = await getDoc(doc(db, "courses", courseId));
        
        if (!courseDoc.exists()) {
          throw new Error("Course not found");
        }

        setCourse({ id: courseDoc.id, ...courseDoc.data() } as Course);
      } catch (err) {
        console.error("Error fetching course:", err);
        setError(err instanceof Error ? err.message : "Failed to load course");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
  };

  const formatLevel = (level: string) => {
    const levels = {
      'beginner': 'Iniciante',
      'intermediate': 'Intermediário',
      'advanced': 'Avançado'
    };
    return levels[level as keyof typeof levels] || level;
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setEnrolling(true);
      await enrollUserInCourse(user.uid, courseId || '');
      toast({
        title: "Matrícula realizada com sucesso!",
        description: "Você já pode começar a assistir as aulas.",
      });
      navigate(`/course/${courseId}/learn`);
    } catch (err) {
      console.error('Error enrolling in course:', err);
      toast({
        title: "Erro ao realizar matrícula",
        description: "Por favor, tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Skeleton Loading */}
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-[300px] w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-[400px] w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">
            {error || "Curso não encontrado"}
          </h1>
          <Button onClick={() => window.history.back()}>Voltar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Conteúdo Principal */}
          <div className="lg:col-span-2">
            {/* Cabeçalho */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <Badge variant="outline">{course.category}</Badge>
                <span>•</span>
                <Badge variant="outline">{formatLevel(course.level)}</Badge>
                <span>•</span>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatDuration(course.duration)}
                </div>
              </div>
              <p className="text-muted-foreground">Por {course.instructorName}</p>
            </div>

            {/* Imagem do Curso */}
            <div className="relative aspect-video mb-8">
              <img 
                src={course.thumbnail} 
                alt={course.title}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-course.jpg';
                }}
              />
            </div>

            {/* Descrição */}
            <div className="prose prose-slate max-w-none mb-8">
              <h2 className="text-2xl font-semibold mb-4">Sobre o Curso</h2>
              <p className="text-muted-foreground">{course.description}</p>
            </div>

            {/* Objetivos */}
            {course.objectives && course.objectives.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">O que você vai aprender</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.objectives.map((objective, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <BookOpen className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <span>{objective}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requisitos */}
            {course.requirements && course.requirements.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Pré-requisitos</h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {course.requirements.map((requirement, index) => (
                    <li key={index}>{requirement}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Conteúdo do Curso */}
            {course.modules && course.modules.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Conteúdo do Curso</h2>
                <Accordion type="single" collapsible className="w-full">
                  {course.modules.map((module, index) => (
                    <AccordionItem key={module.id} value={`module-${index}`}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex justify-between items-center w-full pr-4">
                          <span className="font-medium">{module.title}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatDuration(module.duration)}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {module.lessons.map((lesson) => (
                            <div 
                              key={lesson.id}
                              className="flex items-center justify-between p-2 rounded-lg hover:bg-accent"
                            >
                              <div className="flex items-center gap-2">
                                <Play className="w-4 h-4 text-primary" />
                                <span className={lesson.preview ? 'text-primary' : ''}>
                                  {lesson.title}
                                </span>
                                {lesson.preview && (
                                  <Badge variant="secondary" className="text-xs">
                                    Preview
                                  </Badge>
                                )}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {formatDuration(lesson.duration)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <div className="mb-6">
                <div className="text-3xl font-bold mb-4">
                  {formatPrice(course.price)}
                </div>
                {isEnrolled ? (
                  <Button className="w-full mb-4" size="lg" asChild>
                    <Link to={`/course/${course.id}/learn`}>
                      <Play className="w-4 h-4 mr-2" />
                      Continuar Curso
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button 
                      className="w-full mb-4" 
                      size="lg"
                      onClick={handleEnroll}
                      disabled={enrolling}
                    >
                      {enrolling ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Matriculando...
                        </>
                      ) : (
                        <>
                          <DollarSign className="w-4 h-4 mr-2" />
                          Comprar Agora
                        </>
                      )}
                    </Button>
                    <Button variant="outline" className="w-full">
                      Adicionar ao Carrinho
                    </Button>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium">Duração Total</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDuration(course.duration)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium">Módulos</div>
                    <div className="text-sm text-muted-foreground">
                      {course.modules?.length || 0} módulos
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium">Nível</div>
                    <div className="text-sm text-muted-foreground">
                      {formatLevel(course.level)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;