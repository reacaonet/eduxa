import { useEffect, useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LessonMaterial } from '@/types/course';
import { LessonMaterials } from './LessonMaterials';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '../ui/use-toast';

interface LessonContentProps {
  lessonId: string;
  content: string;
  videoUrl?: string;
  materials?: LessonMaterial[];
  isInstructor?: boolean;
}

export function LessonContent({ lessonId, content, videoUrl, materials = [], isInstructor = false }: LessonContentProps) {
  const [localMaterials, setLocalMaterials] = useState<LessonMaterial[]>(materials);
  const { toast } = useToast();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [activeTab, setActiveTab] = useState<string>(videoUrl ? "video" : "content");

  // Limpar iframe quando o componente for desmontado ou a URL mudar
  useEffect(() => {
    return () => {
      if (iframeRef.current) {
        iframeRef.current.src = 'about:blank';
      }
    };
  }, [videoUrl]);

  const handleAddMaterial = async (material: Omit<LessonMaterial, 'id' | 'createdAt'>) => {
    try {
      const newMaterial = {
        ...material,
        id: crypto.randomUUID(),
        createdAt: new Date()
      };

      // Atualizar no Firestore
      const lessonRef = doc(db, 'lessons', lessonId);
      await updateDoc(lessonRef, {
        materials: [...localMaterials, newMaterial]
      });

      // Atualizar estado local
      setLocalMaterials(prev => [...prev, newMaterial]);

      toast({
        title: "Material adicionado com sucesso!",
        description: "O material complementar foi adicionado à aula.",
      });
    } catch (error) {
      console.error('Error adding material:', error);
      toast({
        title: "Erro ao adicionar material",
        description: "Não foi possível adicionar o material. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList>
        {videoUrl && <TabsTrigger value="video">Vídeo</TabsTrigger>}
        <TabsTrigger value="content">Conteúdo</TabsTrigger>
        <TabsTrigger value="materials">Materiais Complementares</TabsTrigger>
      </TabsList>

      {videoUrl && (
        <TabsContent value="video" className="mt-4">
          <div className="aspect-video">
            {videoUrl.includes('drive.google.com') ? (
              <iframe
                ref={iframeRef}
                src={videoUrl.replace('/view', '/preview')}
                className="w-full h-full"
                frameBorder="0"
                allowFullScreen
              />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: videoUrl }} />
            )}
          </div>
        </TabsContent>
      )}

      <TabsContent value="content" className="mt-4">
        <div className="prose max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: content }} />
      </TabsContent>

      <TabsContent value="materials" className="mt-4">
        <LessonMaterials 
          materials={localMaterials}
          onAddMaterial={isInstructor ? handleAddMaterial : undefined}
          readOnly={!isInstructor}
        />
      </TabsContent>
    </Tabs>
  );
}
