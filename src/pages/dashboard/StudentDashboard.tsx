import { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { StudentProfile } from '@/types/user';
import { useEnrollment } from '@/hooks/useEnrollment';
import { useCourses } from '@/hooks/useCourses';
import { useProfile } from '@/hooks/useProfile';
import { BookOpen, Clock, Star, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EnrolledCourse {
  id: string;
  title: string;
  thumbnail: string;
  progress: number;
  totalHours: number;
  completedLessons: string[];
  totalLessons: number;
  enrollmentId: string;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const { getUserEnrollments } = useEnrollment('');
  const { getCourseById } = useCourses();
  const { profile } = useProfile();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [totalHoursStudied, setTotalHoursStudied] = useState(0);
  const [totalCertificates, setTotalCertificates] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadStudentData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Carregar matrículas
      const enrollments = await getUserEnrollments(user.uid);
      
      // Carregar dados dos cursos para cada matrícula
      const coursesPromises = enrollments.map(async (enrollment) => {
        const course = await getCourseById(enrollment.courseId);
        if (!course) return null;

        // Calcular total de aulas do curso
        const totalLessons = course.modules?.reduce((total, module) => 
          total + (module.lessons?.length || 0), 0) || 0;

        // Calcular progresso com base nas aulas completadas
        const completedLessons = enrollment.progress?.completedLessons || [];
        const progress = totalLessons > 0 
          ? Math.round((completedLessons.length / totalLessons) * 100) 
          : 0;

        // Calcular total de horas do curso (assumindo média de 1 hora por aula)
        const totalHours = totalLessons;

        return {
          id: course.id,
          title: course.title,
          thumbnail: course.thumbnail,
          progress,
          totalHours,
          completedLessons,
          totalLessons,
          enrollmentId: enrollment.id
        };
      });

      const coursesData = (await Promise.all(coursesPromises)).filter((course): course is EnrolledCourse => course !== null);
      
      // Atualizar estados em lote para evitar múltiplas re-renderizações
      setEnrolledCourses(coursesData);
      setTotalHoursStudied(coursesData.reduce((total, course) => total + course.completedLessons.length, 0));
      setTotalCertificates(coursesData.filter(course => course.progress === 100).length);

    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, getUserEnrollments, getCourseById]); // Dependências corretas e estáveis

  useEffect(() => {
    loadStudentData();
  }, [loadStudentData]); // loadStudentData é estável devido ao useCallback

  const calculateOverallProgress = useCallback(() => {
    if (enrolledCourses.length === 0) return 0;
    const totalProgress = enrolledCourses.reduce((acc, course) => acc + course.progress, 0);
    return Math.round(totalProgress / enrolledCourses.length);
  }, [enrolledCourses]); // Memoize a função que depende de enrolledCourses

  if (!user || loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Olá, {profile?.name || 'Estudante'}</h1>
          <p className="text-gray-600">Bem-vindo(a) de volta ao seu painel de estudos</p>
        </div>
        <Button onClick={() => navigate('/courses')}>Explorar Cursos</Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Cursos Ativos</h2>
              <p className="text-3xl font-bold">{enrolledCourses.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Target className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Progresso Geral</h2>
              <div className="mt-2">
                <Progress value={calculateOverallProgress()} className="h-2" />
                <p className="text-sm text-gray-600 mt-1">{calculateOverallProgress()}% completo</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Clock className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Horas Estudadas</h2>
              <p className="text-3xl font-bold">{totalHoursStudied}h</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Star className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Certificados</h2>
              <p className="text-3xl font-bold">{totalCertificates}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Meus Cursos</h2>
          {enrolledCourses.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-600 mb-4">Você ainda não está matriculado em nenhum curso.</p>
              <Button onClick={() => navigate('/courses')}>Explorar Cursos</Button>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {enrolledCourses.map((course) => (
                <Card key={`${course.id}-${course.enrollmentId}`} className="overflow-hidden">
                  <img
                    src={course.thumbnail || '/placeholder.jpg'}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">{course.title}</h3>
                    <Progress value={course.progress} className="h-2 mb-2" />
                    <div className="text-sm text-gray-600 mb-4 space-y-1">
                      <p>{course.progress}% completo</p>
                      <p>{course.completedLessons.length}/{course.totalLessons} aulas concluídas</p>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => navigate(`/course/${course.id}/learn`)}
                    >
                      Continuar
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
