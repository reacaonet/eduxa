import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { createUserProfile } from '@/utils/createUserProfiles';
import { getAuth } from 'firebase/auth';

export default function ManageUsers() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const auth = getAuth();

  const createInitialUsers = async () => {
    setIsLoading(true);
    try {
      // Buscar usuários por email
      const adminEmail = 'admin@eduxa.com';
      const teacherEmail = 'teacher@eduxa.com';
      const studentEmail = 'student@eduxa.com';

      // Função para buscar usuário por email
      const getUserByEmail = async (email: string) => {
        try {
          const users = await auth.fetchSignInMethodsForEmail(email);
          if (users.length > 0) {
            const userRecord = (await auth.signInWithEmailAndPassword(email, 'temp-password')).user;
            return userRecord.uid;
          }
          return null;
        } catch (error) {
          console.error(`Error fetching user for email ${email}:`, error);
          return null;
        }
      };

      // Buscar UIDs
      const adminUid = await getUserByEmail(adminEmail);
      const teacherUid = await getUserByEmail(teacherEmail);
      const studentUid = await getUserByEmail(studentEmail);

      if (!adminUid || !teacherUid || !studentUid) {
        throw new Error('Não foi possível encontrar todos os usuários. Verifique se eles foram criados corretamente.');
      }

      // Criar perfis
      await Promise.all([
        createUserProfile(adminUid, adminEmail, 'admin'),
        createUserProfile(teacherUid, teacherEmail, 'teacher'),
        createUserProfile(studentUid, studentEmail, 'student'),
      ]);

      toast({
        title: "Perfis criados com sucesso!",
        description: "Os perfis dos usuários foram criados no Firestore.",
      });
    } catch (error: any) {
      console.error('Error creating user profiles:', error);
      toast({
        variant: "destructive",
        title: "Erro ao criar perfis",
        description: error.message || "Ocorreu um erro ao criar os perfis dos usuários.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Gerenciar Usuários</h1>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Criar Perfis Iniciais</h2>
        <p className="text-gray-600 mb-4">
          Este processo irá criar automaticamente os perfis para:
          <ul className="list-disc ml-6 mt-2">
            <li>Admin (admin@eduxa.com)</li>
            <li>Professor (teacher@eduxa.com)</li>
            <li>Aluno (student@eduxa.com)</li>
          </ul>
        </p>
        <Button 
          onClick={createInitialUsers}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Criando perfis..." : "Criar Perfis"}
        </Button>
      </Card>
    </div>
  );
}
