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
import { Play, CheckCircle, Lock, Menu, Loader2, Circle, Award } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { updateLessonProgress } from "@/lib/enrollment";
import { Certificate } from "@/components/Certificate";
import { useCertificates } from "@/hooks/useCertificates";
import { LessonContent } from "@/components/lessons/LessonContent";

interface Lesson {
  id: string;
  title: string;
  duration: number;
  type: string;
  videoUrl?: string;
  content?: string;
  preview?: boolean;
  materials?: LessonMaterial[];
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
  const [progress, setProgress] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const { toast } = useToast();
  const { generateCertificate, getCertificate } = useCertificates();
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificate, setCertificate] = useState<any>(null);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);

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

        const rawData = courseDoc.data();
        console.log("Raw lesson data:", rawData.modules?.map((m: any) => m.lessons));

        const courseData = { 
          id: courseDoc.id, 
          ...rawData,
          modules: rawData.modules?.map((module: any) => ({

            ...module,
            lessons: module.lessons?.map((lesson: any) => ({
              ...lesson,
              // Não precisamos mais converter o conteúdo, apenas passar como está
              content: lesson.content || ''
            }))
          }))
        } as Course;

        console.log("Processed lesson data:", courseData.modules?.map(m => m.lessons));

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

  useEffect(() => {
    if (enrollment?.progress?.completedLessons) {
      setCompletedLessons(enrollment.progress.completedLessons);
      const totalLessons = course?.modules.reduce((total, module) => 
        total + module.lessons.length, 0) || 0;
      setProgress(Math.round((enrollment.progress.completedLessons.length / totalLessons) * 100));
    }
  }, [enrollment, course]);

  useEffect(() => {
    const checkCertificate = async () => {
      if (course && user) {
        const cert = await getCertificate(user.uid, course.id);
        if (cert) {
          setCertificate(cert);
        }
      }
    };
    
    checkCertificate();
  }, [course, user, getCertificate]);

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

  const handleLessonComplete = async () => {
    if (!enrollment || !currentLesson) return;

    try {
      setUpdatingProgress(true);
      const isCompleted = completedLessons.includes(currentLesson.id);
      const newCompletedLessons = isCompleted
        ? completedLessons.filter(id => id !== currentLesson.id)
        : [...completedLessons, currentLesson.id];

      await updateLessonProgress(enrollment.id, currentLesson.id, !isCompleted);
      
      // Atualizar estado local imediatamente
      setCompletedLessons(newCompletedLessons);
      const totalLessons = course?.modules.reduce((total, module) => 
        total + module.lessons.length, 0) || 0;
      setProgress(Math.round((newCompletedLessons.length / totalLessons) * 100));
      
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

  const handleGenerateCertificate = async () => {
    if (!course || !user) return;
    
    try {
      setIsGeneratingCertificate(true);
      const cert = await generateCertificate(user.uid, course.id);
      
      if (cert) {
        setCertificate(cert);
        setShowCertificate(true);
        toast({
          title: "Certificado gerado com sucesso!",
          description: "Parabéns pela conclusão do curso!",
        });
      } else {
        toast({
          title: "Erro ao gerar certificado",
          description: "Tente novamente mais tarde.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao gerar certificado",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingCertificate(false);
    }
  };

  const Sidebar = () => (
    <div className="w-full h-full bg-background">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-2">{course.title}</h2>
        <Progress value={progress} className="mb-4" />
        <p className="text-sm text-muted-foreground">
          {progress}% completo
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
                    {completedLessons.includes(lesson.id) ? (
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
        {/* Sidebar para desktop */}
        <div className="hidden md:block w-80 border-r">
          <Sidebar />
        </div>

        {/* Conteúdo principal */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-80">
                  <SheetHeader className="px-4 py-2">
                    <SheetTitle>Conteúdo do Curso</SheetTitle>
                  </SheetHeader>
                  <Sidebar />
                </SheetContent>
              </Sheet>
              <div>
                <h1 className="font-semibold">{currentModule?.title}</h1>
                <p className="text-sm text-muted-foreground">{currentLesson?.title}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLessonComplete}
              disabled={updatingProgress}
            >
              {updatingProgress ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : completedLessons.includes(currentLesson?.id || '') ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <Circle className="h-4 w-4 mr-2" />
              )}
              {completedLessons.includes(currentLesson?.id || '')
                ? "Concluída"
                : "Marcar como concluída"}
            </Button>
            {progress === 100 && (
              <Button
                onClick={handleGenerateCertificate}
                disabled={isGeneratingCertificate}
                className="ml-4"
              >
                {isGeneratingCertificate ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : certificate ? (
                  <>
                    <Award className="mr-2 h-4 w-4" />
                    Ver Certificado
                  </>
                ) : (
                  <>
                    <Award className="mr-2 h-4 w-4" />
                    Gerar Certificado
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Área do conteúdo */}
          <div className="flex-1 p-6 overflow-auto">
            {currentLesson && (
              <div className="max-w-4xl mx-auto">
                <LessonContent
                  lessonId={currentLesson.id}
                  content={currentLesson.content || ''}
                  videoUrl={currentLesson.videoUrl}
                  materials={currentLesson.materials || []}
                  isInstructor={course.instructor?.id === user?.uid}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      {certificate && (
        <Certificate
          certificate={certificate}
          open={showCertificate}
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  );
};

export default CourseLearn;
