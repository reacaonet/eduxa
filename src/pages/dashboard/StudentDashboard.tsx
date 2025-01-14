import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { StudentProfile } from '@/types/user';
import { useEnrollment } from '@/hooks/useEnrollment';
import { useCourses } from '@/hooks/useCourses';
import { useProfile } from '@/hooks/useProfile';
import { Award, Calendar, BookOpen, Clock, Star, Trophy, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { getUserEnrollments } = useEnrollment();
  const { getCourseById } = useCourses();
  const { getProfile } = useProfile();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [nextDeadlines, setNextDeadlines] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadStudentData = async () => {
      if (user) {
        // Carregar perfil do estudante
        const userProfile = await getProfile(user.uid);
        setProfile(userProfile as StudentProfile);

        // Carregar matrículas
        const enrollments = await getUserEnrollments(user.uid);
        const coursesData = await Promise.all(
          enrollments.map(async (enrollment) => {
            const course = await getCourseById(enrollment.courseId);
            return {
              ...course,
              progress: enrollment.progress || 0,
              lastAccessed: enrollment.lastAccessed || null,
            };
          })
        );
        setEnrolledCourses(coursesData);

        // Simular atividades recentes (isso deve vir do backend posteriormente)
        setRecentActivities([
          { type: 'lesson_completed', courseTitle: 'React Fundamentals', date: new Date().toISOString() },
          { type: 'quiz_completed', courseTitle: 'TypeScript Basics', date: new Date().toISOString() },
          { type: 'course_started', courseTitle: 'Node.js Advanced', date: new Date().toISOString() },
        ]);

        // Simular conquistas (isso deve vir do backend posteriormente)
        setAchievements([
          { title: 'Primeira Aula', description: 'Completou sua primeira aula', icon: BookOpen },
          { title: 'Estudante Dedicado', description: '10 dias consecutivos de estudo', icon: Trophy },
          { title: 'Expert em React', description: 'Completou o curso de React', icon: Award },
        ]);

        // Simular próximos prazos
        setNextDeadlines([
          { title: 'Entrega do Projeto Final', course: 'React Fundamentals', date: '2024-01-20' },
          { title: 'Prova de TypeScript', course: 'TypeScript Basics', date: '2024-01-25' },
          { title: 'Apresentação', course: 'Node.js Advanced', date: '2024-01-30' },
        ]);
      }
    };

    loadStudentData();
  }, [user]);

  const calculateOverallProgress = () => {
    if (enrolledCourses.length === 0) return 0;
    const totalProgress = enrolledCourses.reduce((acc, course) => acc + course.progress, 0);
    return Math.round(totalProgress / enrolledCourses.length);
  };

  const getNextLessons = () => {
    return enrolledCourses
      .filter(course => course.progress < 100)
      .sort((a, b) => b.lastAccessed?.localeCompare(a.lastAccessed))
      .slice(0, 3);
  };

  if (!user) return null;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Olá, {profile?.displayName || 'Estudante'}</h1>
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
            <Trophy className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Conquistas</h2>
              <p className="text-3xl font-bold">{achievements.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Calendar className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Próximos Prazos</h2>
              <p className="text-3xl font-bold">{nextDeadlines.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Meus Cursos</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {enrolledCourses.map((course) => (
              <Card key={course.id} className="p-4">
                <img
                  src={course.thumbnail || '/placeholder.svg'}
                  alt={course.title}
                  className="w-full h-40 object-cover rounded-md mb-4"
                />
                <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
                <div className="space-y-2">
                  <Progress value={course.progress} className="h-2" />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{course.progress}% completo</span>
                    <span>{course.completedLessons || 0}/{course.totalLessons || 0} aulas</span>
                  </div>
                  <Button
                    className="w-full mt-2"
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    Continuar Curso
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Próximos Prazos</h2>
            <div className="space-y-4">
              {nextDeadlines.map((deadline, index) => (
                <div key={index} className="flex items-start gap-3 border-b pb-3">
                  <Calendar className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">{deadline.title}</p>
                    <p className="text-sm text-gray-600">{deadline.course}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(deadline.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Conquistas</h2>
            <div className="space-y-4">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-start gap-3 border-b pb-3">
                  <achievement.icon className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">{achievement.title}</p>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
