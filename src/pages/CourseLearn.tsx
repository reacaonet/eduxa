import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useEnrollment } from "@/hooks/useEnrollment";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, CheckCircle, Lock, Menu, Loader2, Circle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { updateLessonProgress } from "@/lib/enrollment";

interface Lesson {
  id: string;
  title: string;
  duration: number;
  type: string;
  videoUrl?: string;
  content?: string;
  preview?: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string;
  duration: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructorName: string;
  modules: Module[];
}

const CourseLearn = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const { isEnrolled, enrollment, loading: loadingEnrollment } = useEnrollment(courseId || '');
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;

      try {
        setLoading(true);
        setError(null);

        const courseDoc = await getDoc(doc(db, "courses", courseId));
        
        if (!courseDoc.exists()) {
          throw new Error("Course not found");
        }

        const courseData = { id: courseDoc.id, ...courseDoc.data() } as Course;
        setCourse(courseData);

        // Set initial lesson if enrollment exists
        if (enrollment?.progress?.lastAccessedLesson) {
          for (const module of courseData.modules) {
            const lesson = module.lessons.find(l => l.id === enrollment.progress.lastAccessedLesson);
            if (lesson) {
              setCurrentLesson(lesson);
              setCurrentModule(module);
              break;
            }
          }
        } else if (courseData.modules[0]?.lessons[0]) {
          setCurrentLesson(courseData.modules[0].lessons[0]);
          setCurrentModule(courseData.modules[0]);
        }
      } catch (err) {
        console.error("Error fetching course:", err);
        setError(err instanceof Error ? err.message : "Failed to load course");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, enrollment]);

  // Redirect if not logged in or not enrolled
  if (!user) {
    return <Navigate to={`/course/${courseId}`} />;
  }

  if (!loadingEnrollment && !isEnrolled) {
    return <Navigate to={`/course/${courseId}`} />;
  }

  if (loading || loadingEnrollment) {
    return (
      <div className="min-h-screen pt-16">
        <div className="flex h-[calc(100vh-4rem)]">
          <div className="flex-1">
            <Skeleton className="w-full h-full" />
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

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
  };

  const calculateProgress = () => {
    if (!enrollment) return 0;
    
    const totalLessons = course.modules.reduce((total, module) => 
      total + module.lessons.length, 0);
    
    return Math.round((enrollment.progress.completedLessons.length / totalLessons) * 100);
  };

  const handleLessonComplete = async () => {
    if (!enrollment || !currentLesson) return;

    try {
      setUpdatingProgress(true);
      const isCompleted = enrollment.progress.completedLessons.includes(currentLesson.id);
      await updateLessonProgress(enrollment.id, currentLesson.id, !isCompleted);
      
      toast({
        title: isCompleted ? "Aula marcada como incompleta" : "Aula concluída!",
        description: isCompleted ? 
          "Seu progresso foi atualizado" : 
          "Continue assistindo para concluir o curso",
      });
    } catch (err) {
      console.error('Error updating lesson progress:', err);
      toast({
        title: "Erro ao atualizar progresso",
        description: "Por favor, tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setUpdatingProgress(false);
    }
  };

  const Sidebar = () => (
    <div className="w-full h-full bg-background">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-2">{course.title}</h2>
        <Progress value={calculateProgress()} className="mb-4" />
        <p className="text-sm text-muted-foreground">
          {calculateProgress()}% completo
        </p>
      </div>
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="p-4">
          {course.modules.map((module) => (
            <div key={module.id} className="mb-6">
              <h3 className="font-medium mb-2">{module.title}</h3>
              <div className="space-y-1">
                {module.lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      setCurrentLesson(lesson);
                      setCurrentModule(module);
                      setSidebarOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg flex items-center gap-2 hover:bg-accent ${
                      currentLesson?.id === lesson.id ? 'bg-accent' : ''
                    }`}
                  >
                    {enrollment?.progress.completedLessons.includes(lesson.id) ? (
                      <CheckCircle className="w-4 h-4 text-primary" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    <span className="flex-1 text-sm">{lesson.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDuration(lesson.duration)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="min-h-screen pt-16">
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar para telas grandes */}
        <div className="hidden lg:block w-80 border-r">
          <Sidebar />
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1">
          {/* Barra superior */}
          <div className="h-14 border-b flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-80">
                  <Sidebar />
                </SheetContent>
              </Sheet>
              {currentModule && (
                <div>
                  <h2 className="font-medium">{currentModule.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {currentLesson?.title}
                  </p>
                </div>
              )}
            </div>
            <Progress 
              value={calculateProgress()} 
              className="w-32"
            />
          </div>

          {/* Área do Conteúdo */}
          <div className="p-4">
            {currentLesson ? (
              <div>
                {currentLesson.videoUrl ? (
                  <div className="aspect-video mb-4">
                    <iframe
                      src={currentLesson.videoUrl}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="aspect-video mb-4 bg-accent flex items-center justify-center">
                    <p>Conteúdo não disponível</p>
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold">{currentLesson.title}</h2>
                  <Button
                    variant={enrollment?.progress.completedLessons.includes(currentLesson.id) ? "outline" : "default"}
                    onClick={handleLessonComplete}
                    disabled={updatingProgress}
                  >
                    {updatingProgress ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : enrollment?.progress.completedLessons.includes(currentLesson.id) ? (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    ) : (
                      <Circle className="w-4 h-4 mr-2" />
                    )}
                    {enrollment?.progress.completedLessons.includes(currentLesson.id) 
                      ? "Marcar como incompleta" 
                      : "Marcar como concluída"}
                  </Button>
                </div>

                {currentLesson.content && (
                  <div className="prose prose-slate max-w-none">
                    {currentLesson.content}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p>Selecione uma aula para começar</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLearn;
