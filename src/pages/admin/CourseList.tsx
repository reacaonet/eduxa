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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Search, Settings, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useCourses } from "@/hooks/useCourses";

export default function CourseList() {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { courses, loading, error, hasMore, loadMore, updateCourse, filterCourses, totalCourses } = useCourses();
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    filterCourses(categoryFilter, statusFilter, searchTerm);
  };

  const handleUpdateCourse = async (courseId: string, data: Partial<Course>) => {
    try {
      await updateCourse(courseId, data);
      toast({
        title: "Curso atualizado",
        description: "As informações foram atualizadas com sucesso!",
      });
      setModalOpen(false);
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
    return new Date(date.seconds * 1000).toLocaleDateString("pt-BR");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

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
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium">{course.title}</TableCell>
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
                  <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedCourse(course);
                          setModalOpen(true);
                        }}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editar Curso</DialogTitle>
                      </DialogHeader>
                      {selectedCourse && (
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Status</label>
                            <Select
                              value={selectedCourse.status}
                              onValueChange={(value) =>
                                setSelectedCourse({
                                  ...selectedCourse,
                                  status: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="published">Publicado</SelectItem>
                                <SelectItem value="draft">Rascunho</SelectItem>
                                <SelectItem value="archived">Arquivado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Categoria</label>
                            <Select
                              value={selectedCourse.category}
                              onValueChange={(value) =>
                                setSelectedCourse({
                                  ...selectedCourse,
                                  category: value,
                                })
                              }
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
                          <Button
                            className="w-full"
                            onClick={() =>
                              handleUpdateCourse(selectedCourse.id, {
                                status: selectedCourse.status,
                                category: selectedCourse.category,
                              })
                            }
                          >
                            Salvar alterações
                          </Button>
                        </div>
                      )}
                    </DialogContent>
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
