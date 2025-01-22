import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LessonMaterial } from '@/types/course';
import { FileText, Video, Layout, Table, File } from 'lucide-react';

interface LessonMaterialsProps {
  materials: LessonMaterial[];
  onAddMaterial?: (material: Omit<LessonMaterial, 'id' | 'createdAt'>) => void;
  readOnly?: boolean;
}

const MATERIAL_TYPES = {
  document: { label: 'Documento', icon: FileText },
  video: { label: 'Vídeo', icon: Video },
  presentation: { label: 'Apresentação', icon: Layout },
  spreadsheet: { label: 'Planilha', icon: Table },
  other: { label: 'Outro', icon: File },
};

export function LessonMaterials({ materials, onAddMaterial, readOnly = false }: LessonMaterialsProps) {
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    type: 'document' as LessonMaterial['type'],
    url: '',
  });

  const handleAddMaterial = () => {
    if (!newMaterial.title || !newMaterial.url) return;

    // Extrair o ID do arquivo do Google Drive da URL
    const driveFileId = extractDriveFileId(newMaterial.url);
    
    onAddMaterial?.({
      ...newMaterial,
      driveFileId,
      thumbnailUrl: driveFileId ? `https://drive.google.com/thumbnail?id=${driveFileId}` : undefined,
    });

    // Limpar o formulário
    setNewMaterial({
      title: '',
      type: 'document',
      url: '',
    });
  };

  const extractDriveFileId = (url: string) => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('drive.google.com')) {
        // Formato: https://drive.google.com/file/d/FILE_ID/view
        const matches = url.match(/\/d\/([^/]+)/);
        if (matches) return matches[1];
        
        // Formato: https://drive.google.com/open?id=FILE_ID
        const searchParams = new URLSearchParams(urlObj.search);
        const fileId = searchParams.get('id');
        if (fileId) return fileId;
      }
      return undefined;
    } catch {
      return undefined;
    }
  };

  const getEmbedUrl = (material: LessonMaterial) => {
    if (!material.driveFileId) return material.url;

    switch (material.type) {
      case 'document':
        return `https://docs.google.com/document/d/${material.driveFileId}/preview`;
      case 'presentation':
        return `https://docs.google.com/presentation/d/${material.driveFileId}/preview`;
      case 'spreadsheet':
        return `https://docs.google.com/spreadsheets/d/${material.driveFileId}/preview`;
      case 'video':
        return `https://drive.google.com/file/d/${material.driveFileId}/preview`;
      default:
        return material.url;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Materiais Complementares</h3>
      
      {/* Lista de materiais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {materials.map((material) => {
          const MaterialIcon = MATERIAL_TYPES[material.type].icon;
          return (
            <a
              key={material.id}
              href={material.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <MaterialIcon className="h-6 w-6 text-primary" />
              <div>
                <p className="font-medium">{material.title}</p>
                <p className="text-sm text-gray-500">{MATERIAL_TYPES[material.type].label}</p>
              </div>
            </a>
          );
        })}
      </div>

      {/* Formulário para adicionar novo material */}
      {!readOnly && (
        <div className="space-y-4 p-4 border rounded-lg">
          <h4 className="font-medium">Adicionar Material</h4>
          
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={newMaterial.title}
              onChange={(e) => setNewMaterial(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Slides da Aula 1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={newMaterial.type}
              onValueChange={(value: LessonMaterial['type']) => 
                setNewMaterial(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MATERIAL_TYPES).map(([value, { label }]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Link do Google Drive</Label>
            <Input
              id="url"
              value={newMaterial.url}
              onChange={(e) => setNewMaterial(prev => ({ ...prev, url: e.target.value }))}
              placeholder="Cole o link de compartilhamento do Google Drive"
            />
          </div>

          <Button onClick={handleAddMaterial} disabled={!newMaterial.title || !newMaterial.url}>
            Adicionar Material
          </Button>
        </div>
      )}
    </div>
  );
}
