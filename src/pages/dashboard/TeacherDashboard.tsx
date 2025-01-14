import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { TeacherProfile } from '@/types/user';
import { useCourses } from '@/hooks/useCourses';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, Star, DollarSign } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { getTeacherCourses } = useCourses();
  const [courses, setCourses] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    averageRating: 0,
    totalRevenue: 0,
    activeStudents: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const loadTeacherData = async () => {
      if (user) {
        const teacherCourses = await getTeacherCourses(user.uid);
        setCourses(teacherCourses);
        
        // Calculate stats
        const totalStudents = teacherCourses.reduce(
          (acc, course) => acc + (course.enrolledStudents?.length || 0),
          0
        );
        
        const activeStudents = teacherCourses.reduce(
          (acc, course) => acc + (course.activeStudents?.length || 0),
          0
        );

        const totalRevenue = teacherCourses.reduce(
          (acc, course) => acc + (course.revenue || 0),
          0
        );
        
        setStats({
          totalStudents,
          totalCourses: teacherCourses.length,
          averageRating: 4.5, // This should be calculated from actual ratings
          totalRevenue,
          activeStudents,
        });
      }
    };

    loadTeacherData();
  }, [user]);

  if (!user) return null;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard do Professor</h1>
        <Button onClick={() => navigate('/course/create')}>
          <Plus className="mr-2 h-4 w-4" /> Criar Novo Curso
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-lg font-semibold">Total de Alunos</h2>
              <p className="text-2xl font-bold">{stats.totalStudents}</p>
              <p className="text-sm text-gray-600">{stats.activeStudents} ativos</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-lg font-semibold">Cursos Publicados</h2>
              <p className="text-2xl font-bold">{stats.totalCourses}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Star className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-lg font-semibold">Avaliação Média</h2>
              <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <DollarSign className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-lg font-semibold">Receita Total</h2>
              <p className="text-2xl font-bold">R$ {stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Meus Cursos</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {courses.map((course) => (
              <Card key={course.id} className="p-4">
                <img
                  src={course.thumbnail || '/placeholder.svg'}
                  alt={course.title}
                  className="w-full h-40 object-cover rounded-md mb-4"
                />
                <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{course.enrolledStudents?.length || 0} alunos</span>
                    <span>{course.lessons?.length || 0} aulas</span>
                  </div>
                  <Progress value={course.completionRate || 0} className="h-2" />
                  <div className="flex justify-between items-center mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/course/${course.id}`)}
                    >
                      Visualizar
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => navigate(`/course/${course.id}/edit`)}
                    >
                      Editar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Atividade Recente</h2>
            <div className="space-y-4">
              {courses.slice(0, 5).map((course) => (
                <div key={course.id} className="flex items-center gap-3 border-b pb-3">
                  <div className="w-12 h-12">
                    <img
                      src={course.thumbnail || '/placeholder.svg'}
                      alt={course.title}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{course.title}</p>
                    <p className="text-sm text-gray-600">
                      {course.enrolledStudents?.length || 0} alunos matriculados
                    </p>
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
