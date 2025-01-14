import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";

interface CourseFormData {
  title: string;
  description: string;
  category: string;
  price: string;
  thumbnail: string;
  status: "draft" | "published";
}

export default function CreateCourse() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    description: "",
    category: "",
    price: "",
    thumbnail: "",
    status: "draft",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);

      // Validações
      if (!formData.title.trim()) {
        throw new Error("O título é obrigatório");
      }
      if (!formData.description.trim()) {
        throw new Error("A descrição é obrigatória");
      }
      if (!formData.category) {
        throw new Error("Selecione uma categoria");
      }
      if (!formData.price) {
        throw new Error("O preço é obrigatório");
      }
      if (!formData.thumbnail) {
        throw new Error("A URL da imagem é obrigatória");
      }

      // Validar se a URL é válida
      try {
        new URL(formData.thumbnail);
      } catch {
        throw new Error("URL da imagem inválida");
      }

      // Criar o curso
      const courseData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        thumbnail: formData.thumbnail,
        status: formData.status,
        instructor: {
          id: user.uid,
          name: user.displayName || "Instrutor",
          email: user.email,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        modules: [],
        enrolledStudents: 0,
        rating: 0,
        reviews: [],
      };

      await addDoc(collection(db, "courses"), courseData);

      toast({
        title: "Curso criado",
        description: "O curso foi criado com sucesso!",
      });

      navigate("/admin/courses");
    } catch (error) {
      console.error("Error creating course:", error);
      toast({
        variant: "destructive",
        title: "Erro ao criar curso",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao criar o curso",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Criar Novo Curso</h1>
          <p className="text-muted-foreground">
            Preencha as informações do curso
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Curso</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Ex: Curso Completo de React"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descreva o conteúdo do curso..."
                required
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="programming">Programação</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="business">Negócios</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Preço (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="99.90"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail">URL da Imagem</Label>
              <Input
                id="thumbnail"
                name="thumbnail"
                type="url"
                defaultValue={formData.thumbnail}
                onChange={(e) =>
                  setFormData({ ...formData, thumbnail: e.target.value })
                }
                placeholder="https://exemplo.com/imagem.jpg"
                required
              />
              {formData.thumbnail && (
                <div className="mt-2">
                  <img
                    src={formData.thumbnail}
                    alt="Preview"
                    className="max-w-full h-auto rounded-lg"
                    style={{ maxHeight: "200px" }}
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.src = "https://placehold.co/600x400?text=Imagem+Inválida";
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "draft" | "published") =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/courses")}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              "Criar Curso"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
