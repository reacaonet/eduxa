import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { Grip, MoreVertical, Plus, Trash } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCourses } from "@/hooks/useCourses";
import { Course, Lesson, Module } from "@/types/course";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import RichTextEditor from "@/components/RichTextEditor";

const moduleFormSchema = z.object({
  title: z.string().min(1, "O título é obrigatório"),
  description: z.string().min(1, "A descrição é obrigatória"),
});

const lessonFormSchema = z.object({
  title: z.string().min(1, "O título é obrigatório"),
  type: z.enum(["text", "video", "quiz"]),
  content: z.string().min(1, "O conteúdo é obrigatório"),
  duration: z.number().min(0, "A duração deve ser maior que 0"),
});

export default function CourseModules() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    getCourseById,
    updateModule,
    deleteModule,
    addModule,
    addLesson,
    updateLesson,
    deleteLesson,
    reorderModules,
    reorderLessons,
  } = useCourses();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const moduleForm = useForm<z.infer<typeof moduleFormSchema>>({
    resolver: zodResolver(moduleFormSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const lessonForm = useForm<z.infer<typeof lessonFormSchema>>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      title: "",
      type: "text",
      content: "",
      duration: 0,
    },
  });

  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) return;

      try {
        setLoading(true);
        const courseData = await getCourseById(courseId);
        if (courseData) {
          setCourse(courseData);
          setModules(courseData.modules || []);
        }
      } catch (error) {
        console.error("Error loading course:", error);
        toast({
          title: "Erro ao carregar curso",
          description: "Por favor, tente novamente mais tarde.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId]);

  const onModuleSubmit = async (values: z.infer<typeof moduleFormSchema>) => {
    if (!courseId) return;

    try {
      if (selectedModule) {
        // Atualizar módulo existente
        const success = await updateModule(courseId, selectedModule.id, values);
        if (success) {
          toast({
            title: "Módulo atualizado com sucesso!",
          });
          const updatedModules = modules.map((m) =>
            m.id === selectedModule.id ? { ...m, ...values } : m
          );
          setModules(updatedModules);
        }
      } else {
        // Criar novo módulo
        const moduleData = {
          ...values,
          lessons: [],
          order: modules.length,
        };
        const success = await addModule(courseId, moduleData);
        if (success) {
          toast({
            title: "Módulo criado com sucesso!",
          });
          const courseData = await getCourseById(courseId);
          if (courseData) {
            setModules(courseData.modules || []);
          }
        }
      }
      setModuleDialogOpen(false);
      moduleForm.reset();
    } catch (error) {
      console.error("Error submitting module:", error);
      toast({
        title: "Erro ao salvar módulo",
        description: "Por favor, tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const onLessonSubmit = async (values: z.infer<typeof lessonFormSchema>) => {
    if (!courseId || !selectedModule) return;

    try {
      if (selectedLesson) {
        // Atualizar aula existente
        const success = await updateLesson(
          courseId,
          selectedModule.id,
          selectedLesson.id,
          values
        );
        if (success) {
          toast({
            title: "Aula atualizada com sucesso!",
          });
          const updatedModules = modules.map((m) =>
            m.id === selectedModule.id
              ? {
                  ...m,
                  lessons: m.lessons.map((l) =>
                    l.id === selectedLesson.id ? { ...l, ...values } : l
                  ),
                }
              : m
          );
          setModules(updatedModules);
        }
      } else {
        // Criar nova aula
        const lessonData = {
          ...values,
          order: selectedModule.lessons?.length || 0,
        };
        const success = await addLesson(courseId, selectedModule.id, lessonData);
        if (success) {
          toast({
            title: "Aula criada com sucesso!",
          });
          const courseData = await getCourseById(courseId);
          if (courseData) {
            setModules(courseData.modules || []);
          }
        }
      }
      setLessonDialogOpen(false);
      lessonForm.reset();
    } catch (error) {
      console.error("Error submitting lesson:", error);
      toast({
        title: "Erro ao salvar aula",
        description: "Por favor, tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!courseId) return;

    try {
      const success = await deleteModule(courseId, moduleId);
      if (success) {
        toast({
          title: "Módulo excluído com sucesso!",
        });
        setModules(modules.filter((m) => m.id !== moduleId));
      }
    } catch (error) {
      console.error("Error deleting module:", error);
      toast({
        title: "Erro ao excluir módulo",
        description: "Por favor, tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
    if (!courseId) return;

    try {
      const success = await deleteLesson(courseId, moduleId, lessonId);
      if (success) {
        toast({
          title: "Aula excluída com sucesso!",
        });
        const updatedModules = modules.map((m) =>
          m.id === moduleId
            ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }
            : m
        );
        setModules(updatedModules);
      }
    } catch (error) {
      console.error("Error deleting lesson:", error);
      toast({
        title: "Erro ao excluir aula",
        description: "Por favor, tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination || !course) return;

    const { source, destination, type } = result;

    // Se arrastando um módulo
    if (type === "module") {
      const newModules = Array.from(modules);
      const [removed] = newModules.splice(source.index, 1);
      newModules.splice(destination.index, 0, removed);

      setModules(newModules);
      await reorderModules(course.id, newModules);
      return;
    }

    // Se arrastando uma aula dentro de um módulo
    const moduleIndex = parseInt(source.droppableId.split("-")[1]);
    const newModules = [...modules];
    const moduleToUpdate = { ...newModules[moduleIndex] };
    const lessons = Array.from(moduleToUpdate.lessons || []);

    const [removed] = lessons.splice(source.index, 1);
    lessons.splice(destination.index, 0, removed);

    moduleToUpdate.lessons = lessons;
    newModules[moduleIndex] = moduleToUpdate;
    setModules(newModules);

    // Atualizar a ordem das aulas no backend
    await reorderLessons(course.id, moduleToUpdate.id, lessons);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {course?.title || "Carregando..."}
          </h1>
          <p className="text-muted-foreground">
            Gerencie os módulos e aulas do curso
          </p>
        </div>
        <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedModule(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Módulo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedModule ? "Editar Módulo" : "Criar Novo Módulo"}
              </DialogTitle>
              <DialogDescription>
                {selectedModule
                  ? "Edite as informações do módulo"
                  : "Preencha as informações do novo módulo"}
              </DialogDescription>
            </DialogHeader>
            <Form {...moduleForm}>
              <form
                onSubmit={moduleForm.handleSubmit(onModuleSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={moduleForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título do Módulo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Introdução" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={moduleForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva o conteúdo do módulo..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">
                    {selectedModule ? "Salvar Módulo" : "Criar Módulo"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="p-4 rounded-lg border">
              <Skeleton className="h-8 w-1/3 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="modules" type="module">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {modules.map((module, moduleIndex) => (
                  <Draggable
                    key={module.id}
                    draggableId={module.id}
                    index={moduleIndex}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="p-4 rounded-lg border bg-card"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div {...provided.dragHandleProps}>
                              <Grip className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold">
                                {module.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {module.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Dialog
                              open={lessonDialogOpen}
                              onOpenChange={setLessonDialogOpen}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedModule(module);
                                    setSelectedLesson(null);
                                  }}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Nova Aula
                                </Button>
                              </DialogTrigger>
                            </Dialog>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedModule(module);
                                    moduleForm.reset({
                                      title: module.title,
                                      description: module.description,
                                    });
                                    setModuleDialogOpen(true);
                                  }}
                                >
                                  Editar Módulo
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteModule(module.id)}
                                >
                                  Excluir Módulo
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        <Droppable
                          droppableId={`lessons-${moduleIndex}`}
                          type="lesson"
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className="space-y-2"
                            >
                              {module.lessons?.map((lesson, lessonIndex) => (
                                <Draggable
                                  key={lesson.id}
                                  draggableId={lesson.id}
                                  index={lessonIndex}
                                >
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className="flex items-center justify-between p-3 rounded-md bg-background"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div {...provided.dragHandleProps}>
                                          <Grip className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium">
                                              {lesson.title}
                                            </span>
                                            <Badge variant="outline">
                                              {lesson.type}
                                            </Badge>
                                          </div>
                                          <span className="text-sm text-muted-foreground">
                                            {lesson.duration} min
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setSelectedModule(module);
                                            setSelectedLesson(lesson);
                                            lessonForm.reset({
                                              title: lesson.title,
                                              type: lesson.type,
                                              content: lesson.content,
                                              duration: lesson.duration,
                                            });
                                            setLessonDialogOpen(true);
                                          }}
                                        >
                                          Editar
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleDeleteLesson(
                                              module.id,
                                              lesson.id
                                            )
                                          }
                                        >
                                          <Trash className="h-4 w-4 text-destructive" />
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedLesson ? "Editar Aula" : "Nova Aula"}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações da aula
            </DialogDescription>
          </DialogHeader>
          <Form {...lessonForm}>
            <form onSubmit={lessonForm.handleSubmit(onLessonSubmit)} className="space-y-4">
              <FormField
                control={lessonForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={lessonForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Texto</SelectItem>
                        <SelectItem value="video">Vídeo</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={lessonForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conteúdo</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        content={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={lessonForm.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração (minutos)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">
                  {selectedLesson ? "Salvar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
