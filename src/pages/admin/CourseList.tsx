import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Plus, Pencil, Book, Settings, Loader2, Search, X, FolderPlus } from "lucide-react";
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

export default function CourseList() {
  const navigate = useNavigate();
  const { courses, loading: coursesLoading, filterCourses, updateCourse } = useCourses();
  const { categories, loading: categoriesLoading, addCategory, updateCategory } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<any | null>(null);

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

  const handleAddCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const data = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        slug: (formData.get("name") as string).toLowerCase().replace(/\s+/g, '-'),
        order: Number(formData.get("order")) || undefined,
        isActive: true
      };

      await addCategory(data);
      toast({
        title: "Sucesso",
        description: "Categoria adicionada com sucesso!",
      });
      setIsCategoryModalOpen(false);
      setSelectedCategoryForEdit(null);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar categoria.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCategoryForEdit) return;

    const formData = new FormData(e.currentTarget);
    
    try {
      const data = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        slug: (formData.get("name") as string).toLowerCase().replace(/\s+/g, '-'),
        order: Number(formData.get("order")) || undefined,
      };

      await updateCategory(selectedCategoryForEdit.id, data);
      toast({
        title: "Sucesso",
        description: "Categoria atualizada com sucesso!",
      });
      setIsCategoryModalOpen(false);
      setSelectedCategoryForEdit(null);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar categoria.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Cursos</CardTitle>
              <CardDescription>Gerencie seus cursos</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsCategoryModalOpen(true)}>
                <FolderPlus className="w-4 h-4 mr-2" />
                Categorias
              </Button>
              <Button onClick={() => navigate("/admin/courses/new")}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Curso
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar cursos..."
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
                  <SelectItem value="all">Todas as Categorias</SelectItem>
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
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="archived">Arquivado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtros Ativos */}
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Pesquisa: {searchTerm}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleSearch("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {selectedCategory !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Categoria: {getCategoryName(selectedCategory)}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleCategoryChange("all")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {selectedStatus !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Status: {selectedStatus}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleStatusChange("all")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {(searchTerm || selectedCategory !== "all" || selectedStatus !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7"
                  onClick={clearFilters}
                >
                  Limpar Filtros
                </Button>
              )}
            </div>
          </div>

          {coursesLoading || categoriesLoading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">
                        {course.title}
                      </TableCell>
                      <TableCell>{getCategoryName(course.category)}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            course.status === "published"
                              ? "bg-green-100 text-green-700"
                              : course.status === "draft"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {course.status === "published"
                            ? "Publicado"
                            : course.status === "draft"
                            ? "Rascunho"
                            : "Arquivado"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(course.price)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigate(`/admin/courses/${course.id}/modules`)}
                          >
                            <Book className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setSelectedCourse(course);
                              setIsModalOpen(true);
                            }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Categorias */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Gerenciar Categorias</DialogTitle>
            <DialogDescription>
              Gerencie as categorias dos cursos
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Formulário de Nova Categoria */}
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium mb-4">
                {selectedCategoryForEdit ? "Editar Categoria" : "Nova Categoria"}
              </h3>
              <form onSubmit={selectedCategoryForEdit ? handleUpdateCategory : handleAddCategory} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={selectedCategoryForEdit?.name}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      name="description"
                      defaultValue={selectedCategoryForEdit?.description}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  {selectedCategoryForEdit && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSelectedCategoryForEdit(null);
                      }}
                    >
                      Cancelar Edição
                    </Button>
                  )}
                  <Button type="submit">
                    {selectedCategoryForEdit ? "Salvar" : "Adicionar"}
                  </Button>
                </div>
              </form>
            </div>

            {/* Lista de Categorias */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{category.description}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedCategoryForEdit(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {categories.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        Nenhuma categoria cadastrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição do Curso */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Curso</DialogTitle>
            <DialogDescription>
              Faça as alterações necessárias no curso
            </DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <form onSubmit={(e) => handleUpdateCourse(e, selectedCourse.id)}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      name="title"
                      defaultValue={selectedCourse.title}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="shortDescription">Descrição Curta</Label>
                    <Input
                      id="shortDescription"
                      name="shortDescription"
                      defaultValue={selectedCourse.shortDescription}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      name="description"
                      defaultValue={selectedCourse.description}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Select name="category" defaultValue={selectedCourse.category}>
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
                  <div>
                    <Label htmlFor="subcategory">Subcategoria</Label>
                    <Input
                      id="subcategory"
                      name="subcategory"
                      defaultValue={selectedCourse.subcategory}
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Preço</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      defaultValue={selectedCourse.price}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" defaultValue={selectedCourse.status}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Rascunho</SelectItem>
                        <SelectItem value="published">Publicado</SelectItem>
                        <SelectItem value="archived">Arquivado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="duration">Duração (horas)</Label>
                    <Input
                      id="duration"
                      name="duration"
                      type="number"
                      defaultValue={selectedCourse.duration}
                    />
                  </div>
                  <div>
                    <Label htmlFor="level">Nível</Label>
                    <Select name="level" defaultValue={selectedCourse.level}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um nível" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Iniciante</SelectItem>
                        <SelectItem value="intermediate">Intermediário</SelectItem>
                        <SelectItem value="advanced">Avançado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="language">Idioma</Label>
                    <Select name="language" defaultValue={selectedCourse.language}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um idioma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">Português</SelectItem>
                        <SelectItem value="en">Inglês</SelectItem>
                        <SelectItem value="es">Espanhol</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="supportEmail">Email de Suporte</Label>
                    <Input
                      id="supportEmail"
                      name="supportEmail"
                      type="email"
                      defaultValue={selectedCourse.supportEmail}
                    />
                  </div>
                  <div>
                    <Label htmlFor="prerequisites">Pré-requisitos</Label>
                    <Input
                      id="prerequisites"
                      name="prerequisites"
                      defaultValue={selectedCourse.prerequisites}
                    />
                  </div>
                  <div>
                    <Label htmlFor="learningObjectives">Objetivos de Aprendizagem</Label>
                    <Textarea
                      id="learningObjectives"
                      name="learningObjectives"
                      defaultValue={selectedCourse.learningObjectives}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      name="tags"
                      defaultValue={selectedCourse.tags}
                    />
                  </div>
                  <div>
                    <Label htmlFor="thumbnail">URL da Thumbnail</Label>
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
                    <Label htmlFor="certificateAvailable">Certificado Disponível</Label>
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="submit">Salvar Alterações</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
