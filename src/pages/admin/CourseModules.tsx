import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, GripVertical, Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Course, Module, Lesson } from "@/types/course";
import { useCourses } from "@/hooks/useCourses";
import { useToast } from "@/components/ui/use-toast";

export default function CourseModules() {
  const { courseId } = useParams<{ courseId: string }>();
  const { toast } = useToast();
  const {
    getCourseById,
    addModule,
    updateModule,
    deleteModule,
    addLesson,
    updateLesson,
    deleteLesson,
    reorderModules,
    reorderLessons,
  } = useCourses();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [isEditModuleOpen, setIsEditModuleOpen] = useState(false);
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [isEditLessonOpen, setIsEditLessonOpen] = useState(false);
  const [selectedModuleIndex, setSelectedModuleIndex] = useState<number | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isDeleteModuleDialogOpen, setIsDeleteModuleDialogOpen] = useState(false);
  const [isDeleteLessonDialogOpen, setIsDeleteLessonDialogOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState<string | null>(null);
  const [lessonToDelete, setLessonToDelete] = useState<{moduleId: string, lessonId: string} | null>(null);
  
  const [newModule, setNewModule] = useState({ title: "", description: "" });
  const [editingModule, setEditingModule] = useState({ title: "", description: "" });
  const [newLesson, setNewLesson] = useState({
    title: "",
    description: "",
    duration: "",
    type: "video",
    content: "",
  });
  const [editingLesson, setEditingLesson] = useState({
    title: "",
    description: "",
    duration: "",
    type: "video",
    content: "",
  });

  useEffect(() => {
    const loadCourse = async () => {
      if (courseId) {
        const courseData = await getCourseById(courseId);
        if (courseData) {
          setCourse(courseData);
          setModules(courseData.modules || []);
        }
      }
    };
    loadCourse();
  }, [courseId, getCourseById]);

  const handleEditModule = async () => {
    if (!course || !selectedModule || !editingModule.title) {
      toast({
        title: "Erro",
        description: "O título do módulo é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await updateModule(course.id, selectedModule.id, editingModule);
      if (success) {
        setModules(prev => prev.map(mod => 
          mod.id === selectedModule.id ? { ...mod, ...editingModule } : mod
        ));
        setIsEditModuleOpen(false);
        toast({
          title: "Sucesso",
          description: "Módulo atualizado com sucesso!",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar módulo",
        variant: "destructive",
      });
    }
  };

  const handleEditLesson = async () => {
    if (!course || !selectedModule || !selectedLesson || !editingLesson.title) {
      toast({
        title: "Erro",
        description: "O título da aula é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await updateLesson(course.id, selectedModule.id, selectedLesson.id, {
        ...editingLesson,
        duration: parseInt(editingLesson.duration) || 0,
      });

      if (success) {
        const updatedCourse = await getCourseById(course.id);
        if (updatedCourse) {
          setModules(updatedCourse.modules || []);
        }
        setIsEditLessonOpen(false);
        toast({
          title: "Sucesso",
          description: "Aula atualizada com sucesso!",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar aula",
        variant: "destructive",
      });
    }
  };

  const handleAddLesson = async () => {
    if (!course || selectedModuleIndex === null || !newLesson.title) {
      toast({
        title: "Erro",
        description: "O título da aula é obrigatório",
        variant: "destructive",
      });
      return;
    }

    const moduleId = modules[selectedModuleIndex].id;

    try {
      const success = await addLesson(course.id, moduleId, {
        ...newLesson,
        duration: parseInt(newLesson.duration) || 0,
      });

      if (success) {
        const updatedCourse = await getCourseById(course.id);
        if (updatedCourse) {
          setModules(updatedCourse.modules || []);
        }
        setIsAddLessonOpen(false);
        setNewLesson({
          title: "",
          description: "",
          duration: "",
          type: "video",
          content: "",
        });
        toast({
          title: "Sucesso",
          description: "Aula adicionada com sucesso!",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar aula",
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

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Módulos do Curso</h1>
        <Button onClick={() => setIsAddModuleOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Módulo
        </Button>
      </div>

      {/* Dialog de Adicionar Módulo */}
      <Dialog open={isAddModuleOpen} onOpenChange={setIsAddModuleOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Módulo</DialogTitle>
            <DialogDescription>
              Preencha as informações do novo módulo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="module-title">Título</Label>
              <Input
                id="module-title"
                value={newModule.title}
                onChange={(e) =>
                  setNewModule({ ...newModule, title: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="module-description">Descrição</Label>
              <Textarea
                id="module-description"
                value={newModule.description}
                onChange={(e) =>
                  setNewModule({ ...newModule, description: e.target.value })
                }
              />
            </div>
            <Button onClick={async () => {
              if (!course || !newModule.title) {
                toast({
                  title: "Erro",
                  description: "O título do módulo é obrigatório",
                  variant: "destructive",
                });
                return;
              }

              try {
                const success = await addModule(course.id, newModule);
                if (success) {
                  const updatedCourse = await getCourseById(course.id);
                  if (updatedCourse) {
                    setModules(updatedCourse.modules || []);
                  }
                  setIsAddModuleOpen(false);
                  setNewModule({ title: "", description: "" });
                  toast({
                    title: "Sucesso",
                    description: "Módulo adicionado com sucesso!",
                  });
                }
              } catch (error) {
                toast({
                  title: "Erro",
                  description: "Erro ao adicionar módulo",
                  variant: "destructive",
                });
              }
            }}>
              Adicionar Módulo
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="modules" type="module">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {modules.map((module, moduleIndex) => (
                <Draggable
                  key={module.id}
                  draggableId={module.id}
                  index={moduleIndex}
                >
                  {(provided) => (
                    <Card
                      className="mb-4 p-4"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div
                            {...provided.dragHandleProps}
                            className="mr-2 cursor-move"
                          >
                            <GripVertical className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">
                              {module.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {module.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setSelectedModule(module);
                              setEditingModule({
                                title: module.title,
                                description: module.description || "",
                              });
                              setIsEditModuleOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setModuleToDelete(module.id);
                              setIsDeleteModuleDialogOpen(true);
                            }}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <Droppable
                        droppableId={`lessons-${moduleIndex}`}
                        type={`lesson-${moduleIndex}`}
                      >
                        {(provided) => (
                          <div
                            className="space-y-2"
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            {module.lessons?.map((lesson, lessonIndex) => (
                              <Draggable
                                key={lesson.id}
                                draggableId={lesson.id}
                                index={lessonIndex}
                              >
                                {(provided) => (
                                  <div
                                    className="bg-muted p-3 rounded-lg"
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center">
                                        <div
                                          {...provided.dragHandleProps}
                                          className="mr-2 cursor-move"
                                        >
                                          <GripVertical className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <div>
                                          <h4 className="font-medium">
                                            {lesson.title}
                                          </h4>
                                          <p className="text-sm text-gray-500">
                                            {lesson.description}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => {
                                            setSelectedModule(module);
                                            setSelectedLesson(lesson);
                                            setEditingLesson({
                                              title: lesson.title,
                                              description: lesson.description || "",
                                              duration: lesson.duration?.toString() || "",
                                              type: lesson.type || "video",
                                              content: lesson.content || "",
                                            });
                                            setIsEditLessonOpen(true);
                                          }}
                                        >
                                          <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => {
                                            setLessonToDelete({
                                              moduleId: module.id,
                                              lessonId: lesson.id,
                                            });
                                            setIsDeleteLessonDialogOpen(true);
                                          }}
                                        >
                                          <Trash className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                            <Button
                              variant="outline"
                              className="w-full mt-2"
                              onClick={() => {
                                setSelectedModuleIndex(moduleIndex);
                                setIsAddLessonOpen(true);
                              }}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Adicionar Aula
                            </Button>
                          </div>
                        )}
                      </Droppable>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Dialog de Adicionar Aula */}
      <Dialog open={isAddLessonOpen} onOpenChange={setIsAddLessonOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Adicionar Nova Aula</DialogTitle>
            <DialogDescription>
              Preencha as informações da nova aula
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={newLesson.title}
                onChange={(e) =>
                  setNewLesson({ ...newLesson, title: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={newLesson.description}
                onChange={(e) =>
                  setNewLesson({ ...newLesson, description: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="duration">Duração (minutos)</Label>
              <Input
                id="duration"
                type="number"
                value={newLesson.duration}
                onChange={(e) =>
                  setNewLesson({ ...newLesson, duration: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={newLesson.type}
                onValueChange={(value) =>
                  setNewLesson({ ...newLesson, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Vídeo</SelectItem>
                  <SelectItem value="text">Texto</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="content">Conteúdo</Label>
              <RichTextEditor
                content={newLesson.content}
                onChange={(content) =>
                  setNewLesson({ ...newLesson, content })
                }
              />
            </div>
            <Button onClick={handleAddLesson}>Adicionar Aula</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição de Módulo */}
      <Dialog open={isEditModuleOpen} onOpenChange={setIsEditModuleOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Módulo</DialogTitle>
            <DialogDescription>
              Edite as informações do módulo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-module-title">Título</Label>
              <Input
                id="edit-module-title"
                value={editingModule.title}
                onChange={(e) =>
                  setEditingModule({ ...editingModule, title: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-module-description">Descrição</Label>
              <Textarea
                id="edit-module-description"
                value={editingModule.description}
                onChange={(e) =>
                  setEditingModule({ ...editingModule, description: e.target.value })
                }
              />
            </div>
            <Button onClick={handleEditModule}>Salvar Alterações</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição de Aula */}
      <Dialog open={isEditLessonOpen} onOpenChange={setIsEditLessonOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Editar Aula</DialogTitle>
            <DialogDescription>
              Edite as informações da aula
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-lesson-title">Título</Label>
              <Input
                id="edit-lesson-title"
                value={editingLesson.title}
                onChange={(e) =>
                  setEditingLesson({ ...editingLesson, title: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-lesson-description">Descrição</Label>
              <Textarea
                id="edit-lesson-description"
                value={editingLesson.description}
                onChange={(e) =>
                  setEditingLesson({ ...editingLesson, description: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-lesson-duration">Duração (minutos)</Label>
              <Input
                id="edit-lesson-duration"
                type="number"
                value={editingLesson.duration}
                onChange={(e) =>
                  setEditingLesson({ ...editingLesson, duration: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-lesson-type">Tipo</Label>
              <Select
                value={editingLesson.type}
                onValueChange={(value) =>
                  setEditingLesson({ ...editingLesson, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Vídeo</SelectItem>
                  <SelectItem value="text">Texto</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-lesson-content">Conteúdo</Label>
              <RichTextEditor
                content={editingLesson.content}
                onChange={(content) =>
                  setEditingLesson({ ...editingLesson, content })
                }
              />
            </div>
            <Button onClick={handleEditLesson}>Salvar Alterações</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmação de Exclusão de Módulo */}
      <AlertDialog open={isDeleteModuleDialogOpen} onOpenChange={setIsDeleteModuleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este módulo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (moduleToDelete) {
                handleDeleteModule(moduleToDelete);
                setIsDeleteModuleDialogOpen(false);
              }
            }}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de Confirmação de Exclusão de Aula */}
      <AlertDialog open={isDeleteLessonDialogOpen} onOpenChange={setIsDeleteLessonDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta aula? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (lessonToDelete) {
                handleDeleteLesson(lessonToDelete.moduleId, lessonToDelete.lessonId);
                setIsDeleteLessonDialogOpen(false);
              }
            }}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
