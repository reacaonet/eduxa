import { useProfile } from "@/hooks/useProfile";
import { TeacherUser } from "@/types/user";
import { Card } from "@/components/ui/card";
import ProfileForm from "@/components/ProfileForm";
import { Loader2 } from "lucide-react";

export default function TeacherProfile() {
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p>Erro ao carregar perfil. Tente novamente mais tarde.</p>
      </div>
    );
  }

  const teacherProfile = profile as TeacherUser;

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Meu Perfil</h1>
          <p className="text-muted-foreground">
            Gerencie suas informações profissionais
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-primary/10 rounded-lg">
              <h3 className="font-medium mb-2">Cursos</h3>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Cursos criados</p>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg">
              <h3 className="font-medium mb-2">Alunos</h3>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Alunos matriculados</p>
            </div>
          </div>

          <ProfileForm user={teacherProfile} />
        </div>
      </Card>
    </div>
  );
}
