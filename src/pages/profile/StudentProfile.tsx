import { useProfile } from "@/hooks/useProfile";
import { StudentUser } from "@/types/user";
import { Card } from "@/components/ui/card";
import ProfileForm from "@/components/ProfileForm";
import { Loader2 } from "lucide-react";

export default function StudentProfile() {
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

  const studentProfile = profile as StudentUser;

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Meu Perfil</h1>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais
          </p>
        </div>

        <div className="space-y-6">
          <div className="p-4 bg-primary/10 rounded-lg">
            <p className="text-sm font-medium">Status da conta: {studentProfile.status}</p>
          </div>

          <ProfileForm user={studentProfile} />
        </div>
      </Card>
    </div>
  );
}
