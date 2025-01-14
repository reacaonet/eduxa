import { useState } from "react";
import { Course } from "@/types/course";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Search, Settings, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useCourses } from "@/hooks/useCourses";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CourseList() {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { courses, loading, error, hasMore, loadMore, updateCourse, filterCourses, totalCourses } = useCourses();
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    filterCourses(categoryFilter, statusFilter, searchTerm);
  };

  const handleUpdateCourse = async (e: React.FormEvent, courseId: string) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data: Partial<Course> = {};
    for (const [key, value] of formData) {
      data[key as keyof Course] = value as never;
    }

    try {
      await updateCourse(courseId, data);
      toast({
        title: "Curso atualizado",
        description: "As informações foram atualizadas com sucesso!",
      });
      setIsModalOpen(false); // Fecha o modal após sucesso
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar o curso.",
      });
    }
  };

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    if (date instanceof Date) {
      return date.toLocaleDateString("pt-BR");
    }
    if (date.seconds) {
      return new Date(date.seconds * 1000).toLocaleDateString("pt-BR");
    }
    return "Data inválida";
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  if (error) {
    return <div className="p-4">Erro ao carregar cursos: {error}</div>;
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Cursos</h1>
          <p className="text-muted-foreground">
            Total de {totalCourses} cursos cadastrados
          </p>
        </div>
        <Link to="/admin/courses/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Curso
          </Button>
        </Link>
      </div>

      <div className="bg-card rounded-lg p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por título ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="programming">Programação</SelectItem>
              <SelectItem value="design">Design</SelectItem>
              <SelectItem value="business">Negócios</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="published">Publicado</SelectItem>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="archived">Arquivado</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
        </form>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="bg-card rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Instrutor</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses?.map((course) => course && (
              <TableRow key={course.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="h-10 w-10 rounded-lg object-cover"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = "https://placehold.co/100x100?text=Sem+Imagem";
                      }}
                    />
                    <span>{course.title}</span>
                  </div>
                </TableCell>
                <TableCell>{course.instructor?.name || 'Sem instrutor'}</TableCell>
                <TableCell>
                  <Badge variant="outline">{course.category}</Badge>
                </TableCell>
                <TableCell>{formatPrice(course.price)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      course.status === "published"
                        ? "success"
                        : course.status === "draft"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {course.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(course.createdAt)}</TableCell>
                <TableCell>
                  <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedCourse(course);
                          setIsModalOpen(true);
                        }}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    {selectedCourse && (
                      <DialogContent 
                        className="max-w-3xl max-h-[90vh] overflow-y-auto"
                        onOpenAutoFocus={(e) => e.preventDefault()}
                        onCloseAutoFocus={(e) => e.preventDefault()}
                      >
                        <DialogHeader>
                          <DialogTitle>Editar Curso</DialogTitle>
                          <DialogDescription>
                            Faça as alterações necessárias no curso
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={(e) => handleUpdateCourse(e, selectedCourse.id)}>
                          <div className="grid gap-6 py-4">
                            <div className="grid gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="title">Título do Curso</Label>
                                <Input
                                  id="title"
                                  name="title"
                                  defaultValue={selectedCourse.title}
                                  required
                                />
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="shortDescription">Descrição Curta</Label>
                                  <Input
                                    id="shortDescription"
                                    name="shortDescription"
                                    defaultValue={selectedCourse.shortDescription}
                                    placeholder="Breve descrição para listagem"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="duration">Duração</Label>
                                  <Input
                                    id="duration"
                                    name="duration"
                                    defaultValue={selectedCourse.duration}
                                    placeholder="Ex: 10 horas"
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="description">Descrição Completa</Label>
                                <Textarea
                                  id="description"
                                  name="description"
                                  defaultValue={selectedCourse.description}
                                  className="min-h-[100px]"
                                  required
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="category">Categoria</Label>
                                  <Select
                                    name="category"
                                    defaultValue={selectedCourse.category}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
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
                                  <Label htmlFor="subcategory">Subcategoria</Label>
                                  <Input
                                    id="subcategory"
                                    name="subcategory"
                                    defaultValue={selectedCourse.subcategory}
                                    placeholder="Ex: React, JavaScript, etc."
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="level">Nível</Label>
                                  <Select
                                    name="level"
                                    defaultValue={selectedCourse.level || "beginner"}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="beginner">Iniciante</SelectItem>
                                      <SelectItem value="intermediate">Intermediário</SelectItem>
                                      <SelectItem value="advanced">Avançado</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="language">Idioma</Label>
                                  <Select
                                    name="language"
                                    defaultValue={selectedCourse.language || "pt-BR"}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pt-BR">Português</SelectItem>
                                      <SelectItem value="en">Inglês</SelectItem>
                                      <SelectItem value="es">Espanhol</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="price">Preço (R$)</Label>
                                  <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    defaultValue={selectedCourse.price}
                                    required
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="status">Status</Label>
                                  <Select name="status" defaultValue={selectedCourse.status}>
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

                              <div className="space-y-2">
                                <Label htmlFor="thumbnail">URL da Imagem</Label>
                                <Input
                                  id="thumbnail"
                                  name="thumbnail"
                                  type="url"
                                  defaultValue={selectedCourse.thumbnail}
                                  placeholder="https://exemplo.com/imagem.jpg"
                                  required
                                />
                                {selectedCourse.thumbnail && (
                                  <div className="mt-2">
                                    <img
                                      src={selectedCourse.thumbnail}
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
                                <Label htmlFor="supportEmail">Email de Suporte</Label>
                                <Input
                                  id="supportEmail"
                                  name="supportEmail"
                                  type="email"
                                  defaultValue={selectedCourse.supportEmail}
                                  placeholder="suporte@exemplo.com"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="prerequisites">Pré-requisitos</Label>
                                <Textarea
                                  id="prerequisites"
                                  name="prerequisites"
                                  defaultValue={selectedCourse.prerequisites?.join("\n")}
                                  placeholder="Um pré-requisito por linha"
                                  className="min-h-[80px]"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="learningObjectives">Objetivos de Aprendizagem</Label>
                                <Textarea
                                  id="learningObjectives"
                                  name="learningObjectives"
                                  defaultValue={selectedCourse.learningObjectives?.join("\n")}
                                  placeholder="Um objetivo por linha"
                                  className="min-h-[80px]"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="tags">Tags</Label>
                                <Input
                                  id="tags"
                                  name="tags"
                                  defaultValue={selectedCourse.tags?.join(", ")}
                                  placeholder="Separe as tags por vírgula"
                                />
                              </div>

                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="certificateAvailable"
                                  name="certificateAvailable"
                                  defaultChecked={selectedCourse.certificateAvailable}
                                />
                                <Label htmlFor="certificateAvailable">
                                  Certificado Disponível
                                </Label>
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit" disabled={loading}>
                              {loading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Salvando...
                                </>
                              ) : (
                                "Salvar alterações"
                              )}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    )}
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {loading && (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {hasMore && !loading && (
          <div className="p-4 text-center">
            <Button variant="outline" onClick={loadMore}>
              Carregar mais
            </Button>
          </div>
        )}

        {!loading && courses.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            Nenhum curso encontrado
          </div>
        )}
      </div>
    </div>
  );
}
