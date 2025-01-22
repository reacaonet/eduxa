import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LessonMaterial } from '@/types/course';
import { FileText, Video, Layout, Table, File, ExternalLink } from 'lucide-react';
import { getGoogleDrivePreviewUrl, isGoogleDriveUrl, getGoogleDriveFileType } from '@/lib/googleDrive';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
    type: 'document',
    url: ''
  });
  const [selectedMaterial, setSelectedMaterial] = useState<LessonMaterial | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddMaterial) {
      onAddMaterial(newMaterial);
      setNewMaterial({ title: '', type: 'document', url: '' });
    }
  };

  const renderMaterialContent = (material: LessonMaterial) => {
    if (!isGoogleDriveUrl(material.url)) {
      return (
        <a 
          href={material.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-3 hover:bg-accent rounded-lg transition-colors"
        >
          {MATERIAL_TYPES[material.type as keyof typeof MATERIAL_TYPES]?.icon({ className: "w-5 h-5" })}
          <span>{material.title}</span>
          <ExternalLink className="w-4 h-4 ml-auto" />
        </a>
      );
    }

    const previewUrl = getGoogleDrivePreviewUrl(material.url);
    if (!previewUrl) return null;

    return (
      <Dialog>
        <DialogTrigger asChild>
          <button className="flex items-center gap-2 p-3 hover:bg-accent rounded-lg transition-colors w-full text-left">
            {MATERIAL_TYPES[material.type as keyof typeof MATERIAL_TYPES]?.icon({ className: "w-5 h-5" })}
            <span>{material.title}</span>
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>{material.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            <iframe
              src={previewUrl}
              className="w-full h-full rounded-md"
              allow="autoplay"
              allowFullScreen
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-4">
      {/* Lista de materiais */}
      <div className="space-y-2">
        {materials.map((material) => (
          <div key={material.id}>
            {renderMaterialContent(material)}
          </div>
        ))}
        {materials.length === 0 && (
          <p className="text-muted-foreground text-center py-4">
            Nenhum material complementar disponível.
          </p>
        )}
      </div>

      {/* Formulário para adicionar novo material */}
      {!readOnly && onAddMaterial && (
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={newMaterial.title}
              onChange={(e) => setNewMaterial(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Digite o título do material"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={newMaterial.type}
              onValueChange={(value) => setNewMaterial(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MATERIAL_TYPES).map(([value, { label }]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              value={newMaterial.url}
              onChange={(e) => setNewMaterial(prev => ({ ...prev, type: getGoogleDriveFileType(e.target.value) || prev.type, url: e.target.value }))}
              placeholder="Cole a URL do material"
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Adicionar Material
          </Button>
        </form>
      )}
    </div>
  );
}
