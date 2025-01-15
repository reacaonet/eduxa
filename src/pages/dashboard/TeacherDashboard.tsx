import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCourses } from "@/hooks/useCourses";
import { useCategories } from "@/hooks/useCategories";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Pencil, Book, Settings, Loader2, Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Course } from "@/types/course";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { courses, loading: coursesLoading, filterCourses, updateCourse, createCourse } = useCourses();
  const { categories, loading: categoriesLoading } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    if (user?.uid) {
      filterCourses(selectedCategory, selectedStatus, searchTerm);
    }
  }, [user, filterCourses, selectedCategory, selectedStatus, searchTerm]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    filterCourses(value, selectedStatus, searchTerm);
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    filterCourses(selectedCategory, value, searchTerm);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    filterCourses(selectedCategory, selectedStatus, value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    filterCourses("all", "all", "");
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || categoryId;
  };

  const handleUpdateCourse = async (e: React.FormEvent<HTMLFormElement>, courseId: string) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const data = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        shortDescription: formData.get("shortDescription") as string,
        category: formData.get("category") as string,
        subcategory: formData.get("subcategory") as string,
        price: formData.get("price") as string,
        status: formData.get("status") as string,
        duration: formData.get("duration") as string,
        level: formData.get("level") as string,
        language: formData.get("language") as string,
        supportEmail: formData.get("supportEmail") as string,
        prerequisites: formData.get("prerequisites") as string,
        learningObjectives: formData.get("learningObjectives") as string,
        tags: formData.get("tags") as string,
        certificateAvailable: formData.get("certificateAvailable") === "on",
        thumbnail: formData.get("thumbnail") as string,
      };

      await updateCourse(courseId, data);

      toast({
        title: "Sucesso",
        description: "Curso atualizado com sucesso!",
      });

      setIsModalOpen(false);
      filterCourses(selectedCategory, selectedStatus, searchTerm);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar curso. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Meus Cursos</CardTitle>
              <CardDescription>Gerencie seus cursos</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => navigate("/teacher/courses/new")}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Curso
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar cursos..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="published">Publicado</SelectItem>
                <SelectItem value="archived">Arquivado</SelectItem>
              </SelectContent>
            </Select>
            {(selectedCategory !== "all" ||
              selectedStatus !== "all" ||
              searchTerm) && (
              <Button variant="outline" onClick={clearFilters}>
                Limpar
                <X className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>

          {coursesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : courses.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Módulos</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">
                        {course.title}
                      </TableCell>
                      <TableCell>
                        {course.category ? (
                          <Badge variant="secondary">
                            {getCategoryName(course.category)}
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            course.status === "published"
                              ? "default"
                              : course.status === "draft"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {course.status === "published"
                            ? "Publicado"
                            : course.status === "draft"
                            ? "Rascunho"
                            : "Arquivado"}
                        </Badge>
                      </TableCell>
                      <TableCell>{course.modules?.length || 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
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
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              navigate(`/teacher/courses/${course.id}/modules`)
                            }
                          >
                            <Book className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedCategory !== "all" || selectedStatus !== "all"
                  ? "Nenhum curso encontrado com os filtros selecionados."
                  : "Você ainda não tem nenhum curso. Crie um novo curso para começar!"}
              </p>
              <Button onClick={() => navigate("/teacher/courses/new")}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Curso
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Editar Curso</DialogTitle>
            <DialogDescription>
              Atualize as informações do curso
            </DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <form
              onSubmit={(e) => handleUpdateCourse(e, selectedCourse.id)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={selectedCourse.title}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    name="category"
                    defaultValue={selectedCourse.category || ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategoria</Label>
                  <Input
                    id="subcategory"
                    name="subcategory"
                    defaultValue={selectedCourse.subcategory}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={selectedCourse.status || "draft"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Rascunho</SelectItem>
                      <SelectItem value="published">Publicado</SelectItem>
                      <SelectItem value="archived">Arquivado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Preço</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    defaultValue={selectedCourse.price}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duração (horas)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    defaultValue={selectedCourse.duration}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Nível</Label>
                  <Select name="level" defaultValue={selectedCourse.level || "beginner"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o nível" />
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
                      <SelectValue placeholder="Selecione o idioma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português</SelectItem>
                      <SelectItem value="en">Inglês</SelectItem>
                      <SelectItem value="es">Espanhol</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shortDescription">Descrição Curta</Label>
                <Textarea
                  id="shortDescription"
                  name="shortDescription"
                  defaultValue={selectedCourse.shortDescription}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição Completa</Label>
                <Textarea
                  id="description"
                  name="description"
                  className="h-32"
                  defaultValue={selectedCourse.description}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="learningObjectives">Objetivos de Aprendizagem</Label>
                <Textarea
                  id="learningObjectives"
                  name="learningObjectives"
                  defaultValue={selectedCourse.learningObjectives}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prerequisites">Pré-requisitos</Label>
                <Textarea
                  id="prerequisites"
                  name="prerequisites"
                  defaultValue={selectedCourse.prerequisites}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Email de Suporte</Label>
                <Input
                  id="supportEmail"
                  name="supportEmail"
                  type="email"
                  defaultValue={selectedCourse.supportEmail}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                <Input
                  id="tags"
                  name="tags"
                  defaultValue={selectedCourse.tags}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thumbnail">URL da Imagem</Label>
                <Input
                  id="thumbnail"
                  name="thumbnail"
                  defaultValue={selectedCourse.thumbnail}
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
              <DialogFooter>
                <Button type="submit">Salvar Alterações</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
